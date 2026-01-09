// lib/connection.js
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'

export async function connectBot () {
  const authFolder = './auth_info'
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'fatal' }),

    // 🔑 IMPORTANTE
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false
  })

  // ───── CONEXIÓN ─────
  sock.ev.on('connection.update', update => {
    const { connection, qr, pairingCode, lastDisconnect } = update

    // 📱 QR CLÁSICO
    if (qr) {
      console.clear()
      console.log(chalk.yellowBright('\n📱 Escanea el QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    // 🔐 CÓDIGO
    if (pairingCode) {
      console.clear()
      console.log(chalk.greenBright('\n🔐 CÓDIGO DE VINCULACIÓN\n'))
      console.log(
        chalk.whiteBright(
          pairingCode
            .toString()
            .match(/.{1,4}/g)
            .join('-')
        )
      )
      console.log(
        chalk.gray('\n📲 WhatsApp > Dispositivos vinculados')
      )
    }

    if (connection === 'open') {
      console.log(chalk.greenBright('\n✅ WhatsApp conectado\n'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('❌ Sesión cerrada'),
          chalk.gray('Elimina auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      console.log(
        chalk.yellow('🔄 Conexión perdida, reconectando...')
      )

      setTimeout(() => {
        connectBot()
      }, 3000)
    }
  })

  // ───── GUARDAR SESIÓN ─────
  sock.ev.on('creds.update', saveCreds)

  return sock
}
