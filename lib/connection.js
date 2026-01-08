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

const question = (q) =>
  new Promise(resolve => rl.question(q, resolve))

// ───── CONEXIÓN ─────
export async function connectBot () {
  const SESSION_DIR = './auth'
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  console.log(
    chalk.cyan('📡 Usando Baileys v'),
    chalk.white(version.join('.'))
  )

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  })

  // ───── GUARDAR SESIÓN ─────
  sock.ev.on('creds.update', saveCreds)

  // ───── OPCIÓN DE LOGIN ─────
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

      const code = await sock.requestPairingCode(number.trim())
      console.log(
        chalk.green('\n🔢 Código de emparejamiento:\n'),
        chalk.white.bold(code),
        '\n\n👉 Escríbelo en WhatsApp > Vincular dispositivo'
      )

    // ───── QR ─────
    } else {
      sock.ev.on('connection.update', ({ qr }) => {
        if (qr) {
          console.log(chalk.green('\n📷 Escanea este QR:\n'))
          import('qrcode-terminal').then(qr =>
            qr.generate(qr, { small: true })
          )
        }
      })
    }
  }

  // ───── ESTADO CONEXIÓN ─────
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('\n✅ WhatsApp conectado correctamente\n'))
      rl.close()
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('❌ Conexión cerrada:'), reason)

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('⚠️ Sesión cerrada, elimina la carpeta auth'))
        process.exit(1)
      }
    }
  })

  return sock
        }
