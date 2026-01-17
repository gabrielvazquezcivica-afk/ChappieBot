import util from 'util'
import chalk from 'chalk'
import figlet from 'figlet'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { DisconnectReason } from '@whiskeysockets/baileys'

import { connectBot } from './lib/connection.js'
import config from './config.js'

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

// ───── HANDLERS ─────
const handlers = new Map()

async function loadHandlers () {
  const dir = path.join(__dirname, 'handlers')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const handler = await import(`./handlers/${file}`)
    if (!handler.command || !handler.run) continue

    const commands = Array.isArray(handler.command)
      ? handler.command
      : [handler.command]

    for (const cmd of commands) {
      handlers.set(cmd.toLowerCase(), handler)
    }
  }

  console.log(chalk.green(`🧩 ${handlers.size} handlers cargados`))
}

// ───── BANNER ─────
function showBanner () {
  console.clear()
  const banner = figlet.textSync('CHAPPIE BOT', { font: 'Slant' })
  console.log(chalk.redBright(banner))
  console.log(chalk.green('🤖 Bot iniciado | Esperando conexión...\n'))
}

// ───── START BOT ─────
let sock

async function startBot () {
  showBanner()
  await loadHandlers()
  sock = await connectBot()

  // ───── MENSAJES ─────
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return

    const body =
      m.message.conversation ||
      m.message.extendedTextMessage?.text

    if (!body || !body.startsWith(global.prefix)) return

    const args = body.slice(global.prefix.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()

    const handler = handlers.get(cmd)
    if (!handler) return

    try {
      await handler.run(sock, m, args)
    } catch (e) {
      console.error(chalk.red('❌ Error en handler:'), e)
    }
  })

  // ───── RECONEXIÓN ÚNICA ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔁 Reintentando en 3s...'))
        setTimeout(startBot, 3000)
      }
    }

    if (connection === 'open') {
      console.log(chalk.cyan('✅ Conectado | Comandos activos'))
    }
  })
}

// ───── INIT ─────
startBot()
