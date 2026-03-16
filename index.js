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
import { isBanned } from './middleware/ban.js' // ✅ IMPORTAR BAN GLOBAL

// ───── CONFIG GLOBAL ─────
util.inspect.defaultOptions.depth = 0
util.inspect.defaultOptions.colors = false
process.env.NODE_NO_WARNINGS = '1'

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

// ───── VARIABLES GLOBALES ─────
global.config = config
global.prefix = config.bot.prefix

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

  // 🔹 EJECUTAR handler.before (AUTODETECT, WATCHERS, ETC)
  for (const p of plugins) {
    const h = p.handler ?? p
    if (typeof h?.before === 'function') {
      try {
        await h.before(null, { sock })
      } catch (e) {
        console.log(chalk.red('❌ Error before plugin:'), e)
      }
    }
  }

  // ✅ AUTO-ADMIN OWNER (EVENTO)
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

    let isOwner = false

    // 🔹 BLOQUEO GLOBAL POR BAN
let cleanSender = sender

if (cleanSender) {
  cleanSender = cleanSender.split(':')[0]
}

if (isBanned(cleanSender) && !isOwner) return

    // 🔹 BORRAR MENSAJES DE USUARIOS SILENCIADOS
    await muteWatcher(sock, m)

    const text = getText(m)

    // ───── SALUDO AUTOMÁTICO ─────
global.cooldownHola = global.cooldownHola || {}

const now = Date.now()
const cooldown = 20000 // 20 segundos
const last = global.cooldownHola[sender] || 0

if (!text.startsWith(global.prefix)) {

  if (text.toLowerCase() === 'hola','holi','ola','oli','buenas') {

    if (now - last < cooldown) return

    global.cooldownHola[sender] = now

    const hora = new Date().getHours()

    let saludo = 'Hola'

    if (hora >= 6 && hora < 12) saludo = 'Buenos días'
    else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes'
    else saludo = 'Buenas noches'

    await sock.sendMessage(from, {
      text: `👋 ${saludo} ${pushName}\n\nSoy *ChappieBot* 🤖\nEstoy aquí para ayudarte.\n\nUsa *${global.prefix}menu* para ver mis comandos.`
    }, { quoted: m })

  }

  return
}
    
    if (!text || !text.startsWith(global.prefix)) return

    // 🔹 CALCULAR SI ES ADMIN
    let isAdmin = false
    if (isGroup && sender) {
      try {
        const metadata = await sock.groupMetadata(from)
        const admins = metadata.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id)
        isAdmin = admins.includes(sender)
      } catch {
        isAdmin = false
      }
    }

    // 🔹 CALCULAR SI ES OWNER
 isOwner = false

const ownerNumbers = global.config.owner?.numbers || []
const ownerJids = global.config.owner?.jid || []

let senderNumber = ''
if (sender) {
  senderNumber = sender.split('@')[0].split(':')[0]
}

// comprobar por número
if (senderNumber && ownerNumbers.includes(senderNumber)) {
  isOwner = true
}
  
// comprobar por JID (LID o normal)
if (sender && ownerJids.includes(sender)) {
  isOwner = true
  }

    const args = text.slice(global.prefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    // 📟 LOG DE CONSOLA
    console.log(
      chalk.blue('\n📩 COMANDO'),
      '\n👤', pushName,
      '\n📍', isGroup ? 'Grupo' : 'Privado',
      '\n⚡', command
    )

    // 🔹 Ejecutar plugin
    for (const p of plugins) {
      const h = p.handler ?? p
      if (!h?.command) continue

      const cmds = Array.isArray(h.command) ? h.command : [h.command]
      if (!cmds.includes(command)) continue

      try {
        await h(m, {
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
        })
      } catch (e) {
        console.log(chalk.red('❌ Error comando:'), e)
      }
      break
    }
  })
}

// ───── INIT ─────
startBot()
