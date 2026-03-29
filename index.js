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

// 📊 DB PATH
const dbPath = './data/msgcount.json'

// 📊 DB FUNCIONES (FIX)
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

// (opcional pero recomendado)
global.loadDB = loadDB
global.saveDB = saveDB

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
    const sender = isGroup ? m.key.participant : from
    const pushName = m.pushName || 'Usuario'

    /* 📊 CONTADOR REAL (FIX FINAL) */
    const db = loadDB()
    if (!db[from]) db[from] = {}

    const type = Object.keys(m.message)[0]

    const valid = [
      'conversation',
      'extendedTextMessage',
      'imageMessage',
      'videoMessage'
    ]

    if (valid.includes(type)) {
      db[from][sender] = (db[from][sender] || 0) + 1
      saveDB(db)
    }

        // 🔥 BLOQUEO INSTANTÁNEO (ANTES DE TODO)
    const isMuted = await muteWatcher(sock, m)
    if (isMuted) return

    // 👀 LEER MENSAJE GLOBAL
    if (global.autoRead) {
      try {
        if (!m.key.fromMe && m.key.remoteJid !== 'status@broadcast') {
          await sock.readMessages([m.key])
        }
      } catch {}
    }

    let isOwner = false

    // BAN GLOBAL
    let cleanSender = sender
    if (cleanSender) cleanSender = cleanSender.split(':')[0]
    if (isBanned(cleanSender) && !isOwner) return

    await muteWatcher(sock, m)

    const text = getText(m)

    // SALUDO
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

        await sock.sendMessage(from, {
          text: `👋 ${saludo} ${pushName}

🤖 Soy *ChappieBot*

Usa *${global.prefix}menu* para ver mis comandos.`
        }, { quoted: m })
      }
    }

    if (!text || !text.startsWith(global.prefix)) return

    // ADMIN + CACHE
    let isAdmin = false
    if (isGroup && sender) {
      try {
        if (!global.adminCache[from]) {
          const metadata = await sock.groupMetadata(from)
          global.adminCache[from] = {
            admins: metadata.participants
              .filter(p => p.admin)
              .map(p => p.id),
            name: metadata.subject
          }
        }
        isAdmin = global.adminCache[from].admins.includes(sender)
      } catch {
        isAdmin = false
      }
    }

    // OWNER
    const ownerNumbers = global.config.owner?.numbers || []
    const ownerJids = global.config.owner?.jid || []

    let senderNumber = ''
    if (sender) senderNumber = sender.split('@')[0].split(':')[0]

    if (senderNumber && ownerNumbers.includes(senderNumber)) isOwner = true
    if (sender && ownerJids.includes(sender)) isOwner = true

    const args = text.slice(global.prefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    // LOG PRO
    let groupName = 'Privado'
    if (isGroup) groupName = global.adminCache[from]?.name || 'Grupo'

    console.log(
      chalk.blue('\n📩 COMANDO'),
      '\n👤', pushName,
      '\n👥', groupName,
      '\n⚡', command
    )

    // COMANDOS
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
        reply: txt => sock.sendMessage(from, { text: txt }, { quoted: m })
      }).catch(e => {
        console.log(chalk.red('❌ Error comando:'), e)
      })

      break
    }
  })
}

// ───── INIT ─────
startBot()
