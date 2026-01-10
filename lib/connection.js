import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import qrcode from 'qrcode-terminal'
import chalk from 'chalk'

let sock

export async function connectBot ({
  usePairingCode = false,
  phoneNumber = null,
  onMessage = () => {}
} = {}) {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: !usePairingCode,
    logger: pino({ level: 'silent' }),
    browser: ['JoshiBot', 'Chrome', '1.0.0']
  })

  // 💾 Guardar sesión
  sock.ev.on('creds.update', saveCreds)

  // 🔗 QR o CÓDIGO
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr && !usePairingCode) {
      console.log(chalk.green('\n📲 Escanea el QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (
      usePairingCode &&
      !sock.authState.creds.registered &&
      phoneNumber
    ) {
      const code = await sock.requestPairingCode(phoneNumber)
      console.log(
        chalk.cyan('\n🔑 CÓDIGO DE EMPAREJAMIENTO:\n'),
        chalk.bold(code)
      )
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado'))
    }

    if (connection === 'close') {
      const reason =
        lastDisconnect?.error?.output?.statusCode

      console.log(chalk.red('❌ Conexión cerrada:', reason))

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reintentando conexión...'))
        connectBot({ usePairingCode, phoneNumber, onMessage })
      } else {
        console.log(
          chalk.red('🚫 Sesión cerrada. Borra /session y vuelve a vincular')
        )
      }
    }
  })

  // 📩 MENSAJES (comandos siguen funcionando tras reinicio)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message) return

    try {
      await onMessage(sock, msg)
    } catch (e) {
      console.error('❌ Error en mensaje:', e)
    }
  })

  return sock
}
