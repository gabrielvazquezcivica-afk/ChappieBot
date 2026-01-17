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

// ───── PLUGINS ─────
const plugins = new Map()
const pluginsPath = path.join(__dirname, 'plugins')

// ───── BANNER ─────
function showBanner () {
  console.clear()
  const banner = figlet.textSync('CHAPPIE BOT', { font: 'Slant' })
  console.log(chalk.redBright(banner))
  console.log(chalk.green('🤖 Bot iniciado | Esperando conexión...\n'))
}

// ───── CARGAR PLUGINS ─────
async function loadPlugins () {
  plugins.clear()

  if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath)
  }

  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const plugin = await import(
        `./plugins/${file}?update=${Date.now()}`
      )

      if (!plugin.command || !plugin.run) continue

      const commands = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      for (const cmd of commands) {
        plugins.set(cmd.toLowerCase(), plugin)
      }
    } catch (e) {
      console.log(chalk.red(`❌ Error cargando ${file}`))
      console.error(e)
    }
  }

  console.log(chalk.green(`🧩 Plugins cargados: ${plugins.size}`))
}

// ───── START BOT ─────
let sock
let reconnecting = false

async function startBot () {
  showBanner()
  await loadPlugins()
  sock = await connectBot()

  // ───── RECONEXIÓN ÚNICA ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada → Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      if (!reconnecting) {
        reconnecting = true
        console.log(chalk.yellow('🔁 Reintentando en 3s...'))
        setTimeout(() => {
          reconnecting = false
          startBot()
        }, 3000)
      }
    }

    if (connection === 'open') {
      console.log(chalk.cyan('✅ Conectado | Comandos activos'))
    }
  })

  // ───── LECTOR DE MENSAJES ─────
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text

    if (!text || !text.startsWith(global.prefix)) return

    const args = text
      .slice(global.prefix.length)
      .trim()
      .split(/ +/)

    const command = args.shift()?.toLowerCase()
    const plugin = plugins.get(command)
    if (!plugin) return

    try {
      await plugin.run(sock, m, args)
    } catch (e) {
      console.error(chalk.red('❌ Error en plugin:'), e)
    }
  })
}

// ───── INIT ─────
startBot()
