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

// ───── CONTROL DE CARGA ─────
global.processing = new Set()
global.adminCache = {}

// ───── ERRORES ─────
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

// ───── GLOBAL ─────
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

// ───── START ─────
async function startBot () {
  showBanner()
  await loadPlugins()

  const sock = await connectBot()

  // BEFORE
  for (const p of plugins) {
    const h = p.handler ?? p
    if (typeof h?.before === 'function') {
      try {
        await h.before(null, { sock })
      } catch {}
    }
  }

  // EVENTOS
  sock.ev.on('group-participants.update', async update => {
    await autoAdminOwnerEvent(sock, update)
  })

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('✅ Conectado'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('⚠️ Cerrado:'), reason)

      if (reason !== DisconnectReason.loggedOut) {
        setTimeout(startBot, 3000)
      }
    }
  })

  // MENSAJES
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    const from = m.key.remoteJid
    if (!from) return

    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from
    const pushName = m.pushName || 'Usuario'

    // 🚫 ANTI-SPAM PROCESO
    if (global.processing.has(sender)) return
    global.processing.add(sender)

    try {
      // 👀 leer mensajes ligero
      if (Math.random() < 0.1) {
        await sock.readMessages([m.key])
      }

      const text = getText(m)

      // 🚀 SOLO COMANDOS
      if (!text || !text.startsWith(global.prefix)) return

      // BAN
      let cleanSender = sender?.split(':')[0]
      if (isBanned(cleanSender)) return

      // MUTE
      await muteWatcher(sock, m)

      // ADMIN CACHE
      let isAdmin = false
      if (isGroup && sender) {
        try {
          if (!global.adminCache[from] || Date.now() - global.adminCache[from].time > 60000) {
            const metadata = await sock.groupMetadata(from)
            global.adminCache[from] = {
              admins: metadata.participants.filter(p => p.admin).map(p => p.id),
              time: Date.now()
            }
          }

          isAdmin = global.adminCache[from].admins.includes(sender)
        } catch {}
      }

      // OWNER
      let isOwner = false
      const ownerNumbers = global.config.owner?.numbers || []
      const senderNumber = sender?.split('@')[0]?.split(':')[0]

      if (ownerNumbers.includes(senderNumber)) {
        isOwner = true
      }

      const args = text.slice(global.prefix.length).trim().split(/\s+/)
      const command = args.shift().toLowerCase()

          // ───── LOG LIMPIO ─────
    let groupName = 'Privado'
    if (isGroup) {
      groupName = global.adminCache[from]?.name || 'Grupo'
    }

    console.log(
      chalk.blue('\n📩 COMANDO'),
      '\n👤', pushName,
      '\n👥', groupName,
      '\n⚡', command
    )

      // EJECUTAR
      for (const p of plugins) {
        const h = p.handler ?? p
        if (!h?.command) continue

        const cmds = Array.isArray(h.command) ? h.command : [h.command]
        if (!cmds.includes(command)) continue

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
        }).catch(() => {})

        break
      }

    } finally {
      // 🔓 LIBERAR PROCESO
      global.processing.delete(sender)
    }
  })
}

// INIT
startBot()
