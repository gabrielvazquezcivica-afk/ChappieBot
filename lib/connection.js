import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline'

// 🔇 MUTE WATCHER
import { muteWatcher } from './muteWatcher.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = q =>
  new Promise(resolve => rl.question(q, resolve))

export async function connectBot () {
  const authFolder = './auth_info'
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'fatal' }),

    // 🔴 NO QR
    printQRInTerminal: false,

    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    browser: ['ChappieBot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // ───── PAIRING CODE SOLO SI NO HAY SESIÓN ─────
  if (!fs.existsSync(`${authFolder}/creds.json`)) {
    const number = await question(
      '\n📱 Ingresa tu número (ej: 521XXXXXXXXXX): '
    )

    console.log(
      chalk.yellow('\n⏳ Generando código de emparejamiento...\n')
    )

    try {
      const code = await sock.requestPairingCode(number.trim())

      console.log(
        chalk.green('🔢 Código de emparejamiento:\n'),
        chalk.white.bold(code),
        '\n\n📲 WhatsApp → Dispositivos vinculados → Vincular con código'
      )

      rl.close()
    } catch (err) {
      console.log(
        chalk.red('❌ WhatsApp rechazó el emparejamiento')
      )
      console.error(err)
      process.exit(1)
    }
  }

  // ───── CONEXIÓN / RECONEXIÓN ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(
        chalk.green('\n✅ WhatsApp conectado correctamente\n')
      )
    }

    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada'),
          chalk.gray('Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      console.log(
        chalk.yellow('🔄 Conexión perdida, reconectando...')
      )

      setTimeout(connectBot, 3000)
    }
  })

  // 🔇 MUTE WATCHER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    await muteWatcher(sock, m)
  })

  return sock
}
