import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import fs from 'fs'

// 🔇 MUTE WATCHER
import { muteWatcher } from './muteWatcher.js'

export async function connectBot () {
  const authFolder = './auth_info'

  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,

    // 🔇 LOGS LIMPIOS
    logger: pino({ level: 'fatal' }),

    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    browser: ['ChappieBot', 'Chrome', '1.0']
  })

  // ───── CONEXIÓN + QR ─────
  sock.ev.on('connection.update', update => {
    const { connection, qr, lastDisconnect } = update

    // 📱 QR SOLO SI NO HAY SESIÓN
    if (qr && !state.creds.registered) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // ✅ CONECTADO
    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    // ❌ CERRADO (SIN REINTENTAR AQUÍ)
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('🚫 Sesión cerrada'),
          chalk.gray('→ Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      console.log(chalk.yellow('⚠️ Conexión cerrada'))
    }
  })

  // 💾 GUARDAR SESIÓN
  sock.ev.on('creds.update', saveCreds)

  // 🔇 MUTE WATCHER GLOBAL
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    await muteWatcher(sock, m)
  })

  return sock
}
