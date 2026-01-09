import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import fs from 'fs'
import chalk from 'chalk'
import pino from 'pino'
import readline from 'readline'

// ───── INPUT TERMINAL ─────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = q => new Promise(res => rl.question(q, res))

export async function connectBot () {
  const SESSION_DIR = './auth'
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  // ───── LOGIN ─────
  if (!state.creds.registered) {
    console.log(chalk.yellow('\n🔐 Método de inicio de sesión'))
    console.log(chalk.cyan('1️⃣  Código de emparejamiento'))
    console.log(chalk.magenta('2️⃣  QR clásico\n'))

    const opt = await question('👉 Elige una opción (1 / 2): ')

    // ───── PAIRING CODE (SEGURO) ─────
    if (opt === '1') {
      const number = await question(
        '📱 Ingresa tu número (ej: 521XXXXXXXXXX): '
      )

      console.log(chalk.yellow('\n⏳ Esperando conexión segura...'))

      sock.ev.once('connection.update', async ({ connection }) => {
        if (connection === 'open') {
          try {
            const code = await sock.requestPairingCode(number.trim())
            console.log(
              chalk.green('\n🔢 Código de emparejamiento:\n'),
              chalk.white.bold(code),
              '\n\n👉 WhatsApp → Dispositivos vinculados'
            )
            rl.close()
          } catch (e) {
            console.log(chalk.red('❌ Error generando código'))
            console.log(e)
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

  // ───── ESTADO ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('\n✅ WhatsApp conectado\n'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Sesión cerrada, borra /auth'))
        process.exit(1)
      }
    }
  })

  return sock
}
