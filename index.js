import util from 'util'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { DisconnectReason } from '@whiskeysockets/baileys'

import { connectBot } from './lib/connection.js'
import config from './config.js'

// EVENTS
import { welcomeEvent } from './plugins/welcome.js'
import { antiLinkEvent } from './plugins/gc-antilink.js'
import { autoAdminOwnerEvent } from './plugins/owner-autoadmin.js'
import { initAutoDetect } from './plugins/_autodetec.js'

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
global.bot = config.bot
global.owner = config.owner
global.prefix = config.bot.prefix

// ───── DB ─────
const DATA = './data'
const GROUP_DB = `${DATA}/groups.json`
const USERS_DB = `${DATA}/users.json`
const MUTE_DB = `${DATA}/mutes.json`

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true })
for (const f of [GROUP_DB, USERS_DB, MUTE_DB]) {
  if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify({}))
}

global.db = {
  groups: JSON.parse(fs.readFileSync(GROUP_DB)),
  users: JSON.parse(fs.readFileSync(USERS_DB))
}

const getMutes = () => JSON.parse(fs.readFileSync(MUTE_DB))

global.saveDB = () => {
  fs.writeFileSync(GROUP_DB, JSON.stringify(global.db.groups, null, 2))
  fs.writeFileSync(USERS_DB, JSON.stringify(global.db.users, null, 2))
}

// ───── BANNER CHAPPIE ─────
function showBanner () {
  console.clear()
  const banner = figlet.textSync('CHAPPIE BOT', { font: 'Slant' })
  console.log(chalk.redBright(banner))
  console.log(chalk.yellow('════════════════════════════════════'))
  console.log(chalk.green('🤖 Bot iniciado correctamente'), chalk.cyan('| WhatsApp Online'))
  console.log(chalk.magenta('════════════════════════════════════\n'))
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
      if (plugin?.handler) plugins.push(plugin)
    } catch {}
  }

  global.plugins = plugins
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
  initAutoDetect(sock)

  // ───── Ignorar mensajes viejos ─────
  const botStartTime = Math.floor(Date.now() / 1000)

  // ───── EVENTOS DE GRUPO ─────
  sock.ev.on('group-participants.update', async update => {
    await welcomeEvent(sock, update)
    await autoAdminOwnerEvent(sock, update, global.owner)
  })

  // ───── RECONEXIÓN ─────
  sock.ev.on('connection.update', async update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('✅ Bot reconectado'))
      await loadPlugins()
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('⚠️ Conexión cerrada:'), reason)
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔁 Reintentando conexión en 3s...'))
        setTimeout(startBot, 3000)
      } else {
        console.log(chalk.red('❌ Sesión cerrada, elimina la carpeta auth'))
      }
    }
  })

  // ───── MENSAJES ─────
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    // ❌ Ignorar mensajes anteriores al inicio del bot
    if (Number(m.messageTimestamp) < botStartTime) return

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? m.key.participant : from
    const pushName = m.pushName || 'Sin nombre'
    const text = getText(m)
    if (!text) return

    // MUTE
    if (isGroup && getMutes()[from]?.includes(sender)) {
      return sock.sendMessage(from, { delete: m.key })
    }

    if (!text.startsWith(global.prefix)) return

    const args = text.slice(global.prefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    let chatName = 'Privado'
    if (isGroup) {
      try {
        const meta = await sock.groupMetadata(from)
        chatName = meta.subject
      } catch {}
    }

    // 📟 LOG SOLO DE COMANDOS
    console.log(
      chalk.blueBright('\n══════════ 📩 COMANDO ══════════'),
      '\n',
      chalk.green('👤 Usuario:'), chalk.white(pushName),
      '\n',
      chalk.yellow('📍 Chat:'), isGroup
        ? chalk.cyan(`Grupo → ${chatName}`)
        : chalk.magenta('Privado'),
      '\n',
      chalk.red('⚡ Comando:'), chalk.white(global.prefix + command),
      '\n',
      chalk.blueBright('════════════════════════════════')
    )

    await antiLinkEvent(sock, m)

    for (const p of plugins) {
      if (!p.handler?.command?.includes(command)) continue
      try {
        await p.handler(m, {
          sock,
          from,
          sender,
          isGroup,
          args,
          command,
          reply: txt =>
            sock.sendMessage(from, { text: txt }, { quoted: m })
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
