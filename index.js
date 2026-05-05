import util from 'util'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { DisconnectReason } from '@whiskeysockets/baileys'

import { connectBot } from './lib/connection.js'
import config from './config.js'
import { muteWatcher } from './lib/muteWatcher.js'
import { autoAdminOwnerEvent } from './lib/autoAdminOwner.js'
import { isBanned } from './middleware/ban.js'

// ───── CONFIG GLOBAL ─────
util.inspect.defaultOptions.depth = 0
util.inspect.defaultOptions.colors = false
process.env.NODE_NO_WARNINGS = '1'

// 🔥 GLOBALS
global.config = config
global.prefix = config.bot.prefix
global.adminCache = {}
global.autoRead = true
global.lastSave = 0

// 📊 DB PATH
const dbPath = './data/msgcount.json'

// 📊 DB FUNCIONES
function loadDB() {
  try {
    if (!fs.existsSync(dbPath)) return {}
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch (e) {
    console.log(chalk.red('❌ Error leyendo DB:'), e)
    return {}
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.log(chalk.red('❌ Error guardando DB:'), e)
  }
}

// 🔥 DB GLOBAL
global.db = loadDB()

// ───── ERRORES GLOBALES ─────
process.on('uncaughtException', err => {
  if (String(err).includes('Bad MAC')) return
  console.error(chalk.red('❌ uncaughtException:'), err)
})

process.on('unhandledRejection', err => {
  if (String(err).includes('Bad MAC')) return
  console.error(chalk.red('❌ unhandledRejection:'), err)
})

// ───── PATHS ─────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ───── BANNER ─────
function showBanner () {
  console.clear()
  const banner = figlet.textSync('CHAPPIE BOT', { font: 'Slant' })
  console.log(chalk.cyan(banner))
  console.log(chalk.green('🤖 Bot iniciado | Esperando comandos...\n'))
}

// ───── PLUGINS ─────
let plugins = []

async function loadPlugins () {
  const dir = path.join(__dirname, 'plugins')
  plugins = []

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    try {
      const plugin = await import(
        pathToFileURL(path.join(dir, file)).href + `?v=${Date.now()}`
      )
      plugins.push(plugin.default ?? plugin)
    } catch (e) {
      console.log(chalk.red('❌ Error plugin:'), file, e)
    }
  }

  console.log(chalk.yellow(`🧩 Plugins cargados: ${plugins.length}`))
}

// ───── UTILS ─────
const getText = m =>
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  ''

// ───── START BOT ─────
async function startBot () {
  showBanner()
  await loadPlugins()

  const sock = await connectBot()

  // EVENTOS
  sock.ev.on('group-participants.update', async update => {
    await autoAdminOwnerEvent(sock, update)
  })

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('✅ Conectado | Comandos activos'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('⚠️ Conexión cerrada:'), reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔁 Reintentando en 3s...'))
        setTimeout(startBot, 3000)
      }
    }
  })

  // ───── MENSAJES ─────
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    const from = m.key.remoteJid
    if (!from) return

    const isGroup = from.endsWith('@g.us')

    let sender = isGroup ? m.key.participant : from
    if (sender) sender = sender.split(':')[0]

    const pushName = m.pushName || 'Usuario'

    // BEFORE
    for (const p of plugins) {
      try {
        if (typeof p.before === 'function') {
          p.before(m, { sock, from, sender, isGroup, pushName }).catch(()=>{})
        }
      } catch {}
    }

    // 📊 CONTADOR
    try {
      const db = global.db
      if (!db[from]) db[from] = {}

      const type = Object.keys(m.message || {})[0]
      const valid = ['conversation','extendedTextMessage','imageMessage','videoMessage']

      if (type && valid.includes(type)) {
        db[from][sender] = (db[from][sender] || 0) + 1

        if (Date.now() - global.lastSave > 5000) {
          saveDB(db)
          global.lastSave = Date.now()
        }
      }
    } catch {}

    // MUTE
    const isMuted = await muteWatcher(sock, m)
    if (isMuted) return

    // AUTOREAD
    if (global.autoRead) {
      try {
        if (!m.key.fromMe && m.key.remoteJid !== 'status@broadcast') {
          sock.readMessages([m.key]).catch(()=>{})
        }
      } catch {}
    }

    let isOwner = false

    let cleanSender = sender
    if (cleanSender) cleanSender = cleanSender.split(':')[0]
    if (isBanned(cleanSender) && !isOwner) return

    const text = getText(m)

    // ───── SALUDO ─────
    global.cooldownHola = global.cooldownHola || {}

    if (text) {
      const msg = text.toLowerCase().trim()

      if (msg === 'hola') {
        const now = Date.now()
        const cooldown = 20000
        const last = global.cooldownHola[sender] || 0
        if (now - last < cooldown) return

        global.cooldownHola[sender] = now

        const hora = new Date().getHours()
        let saludo = 'Hola'
        if (hora >= 6 && hora < 12) saludo = 'Buenos días'
        else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes'
        else saludo = 'Buenas noches'

        sock.sendMessage(from, {
          text: `👋 ${saludo} ${pushName}

🤖 Soy *ChappieBot*

Usa *${global.prefix}menu* para ver mis comandos.`
        }, { quoted: m }).catch(()=>{})
        return
      }
    }

    if (!text || !text.startsWith(global.prefix)) return

    // ADMIN
    let isAdmin = false

    if (isGroup && sender) {
      try {
        const cleanSender = sender.split(':')[0]

        if (!global.adminCache[from]) {
          global.adminCache[from] = { admins: [], time: 0 }
        }

        let cache = global.adminCache[from]

        if (Date.now() - cache.time > 120000) {
          sock.groupMetadata(from).then(metadata => {
            global.adminCache[from] = {
              admins: metadata.participants
                .filter(p => p.admin)
                .map(p => p.id.split(':')[0]),
              time: Date.now()
            }
          }).catch(()=>{})
        }

        isAdmin = cache.admins.includes(cleanSender)

      } catch {
        isAdmin = false
      }
    }

    // 🔥 OWNER FIX
    const ownerNumbers = global.config.owner?.numbers || []

    let senderNumber = ''
    if (sender) {
      senderNumber = sender
        .split('@')[0]
        .split(':')[0]
        .replace(/^521/, '')
        .replace(/^52/, '')
    }

    isOwner = ownerNumbers.some(num =>
      senderNumber.endsWith(num) || num.endsWith(senderNumber)
    )

    const args = text.slice(global.prefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    let groupName = 'Privado'
    if (isGroup) groupName = global.adminCache[from]?.name || 'Grupo'

    console.log(
      chalk.blue('\n📩 COMANDO'),
      '\n👤 Usuario:', pushName,
      '\n👥 Chat:', groupName,
      '\n⚡ Comando:', command,
      '\n👑 Owner:', isOwner
    )

    for (const p of plugins) {
      const h = p.handler ?? p
      if (!h?.command) continue

      const cmds = Array.isArray(h.command) ? h.command : [h.command]
      if (!cmds.includes(command)) continue

      h(m, {
        sock,
        from,
        sender,
        pushName,
        isGroup,
        isAdmin,
        isOwner,
        args,
        command,
        plugins,
        reply: txt => sock.sendMessage(from, { text: txt }, { quoted: m }).catch(()=>{})
      }).catch(e => {
        console.log(chalk.red('❌ Error comando:'), e)
      })

      break
    }
  })
}

// ───── INIT ─────
startBot()
