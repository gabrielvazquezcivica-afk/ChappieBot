import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import readline from 'readline'

// ───── TERMINAL INPUT ─────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = q => new Promise(res => rl.question(q, res))

export async function connectBot () {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true
  })

  sock.ev.on('creds.update', saveCreds)

  // ───── LOGIN SOLO SI NO HAY SESIÓN ─────
  if (!state.creds.registered) {
    console.log(chalk.yellow('\n🔐 Método de inicio de sesión'))
    console.log(chalk.cyan('1️⃣  Código de emparejamiento'))
    console.log(chalk.magenta('2️⃣  QR clásico\n'))

    const opt = await question('👉 Elige una opción (1 / 2): ')

    // ───── PAIRING CODE ─────
    if (opt === '1') {
      const number = await question(
        '📱 Ingresa tu número (ej: 521XXXXXXXXXX): '
      )

      console.log(chalk.yellow('\n⏳ Esperando conexión segura...'))

      let requested = false

      sock.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open' && !requested) {
          requested = true
          try {
            const code = await sock.requestPairingCode(number.trim())
            console.log(
              chalk.green('\n🔢 Código de emparejamiento:\n'),
              chalk.white.bold(code),
              '\n\n👉 WhatsApp → Dispositivos vinculados'
            )
            rl.close()
          } catch (err) {
            console.log(chalk.red('❌ Error generando código'))
            console.error(err)
            process.exit(1)
          }
        }
      })
    }

    // ───── QR ─────
    if (opt === '2') {
      sock.ev.on('connection.update', ({ qr }) => {
        if (qr) {
          console.log(chalk.green('\n📷 Escanea este QR:\n'))
          import('qrcode-terminal').then(q =>
            q.generate(qr, { small: true })
          )
        }
      })
    }
  }

  // ───── CONEXIÓN / RECONEXIÓN ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('\n✅ WhatsApp conectado'))
      console.log(chalk.cyan('🤖 Bot listo para leer comandos\n'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      console.log(chalk.yellow('⚠️ Conexión cerrada, reconectando...'))

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Sesión cerrada, elimina /auth'))
        process.exit(1)
      }
    }
  })

  return sock
}
