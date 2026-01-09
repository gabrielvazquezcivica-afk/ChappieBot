import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import chalk from 'chalk'
import readline from 'readline'
import pino from 'pino'
import fs from 'fs'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = q =>
  new Promise(resolve => rl.question(q, resolve))

export async function connectBot () {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['ChappieBot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // ───── LOGIN SI NO HAY SESIÓN ─────
  if (!fs.existsSync('./auth/creds.json')) {
    console.log(chalk.cyan('\n🔐 Método de inicio de sesión'))
    console.log(chalk.yellow('1️⃣  Código de emparejamiento'))
    console.log(chalk.yellow('2️⃣  QR clásico\n'))

    const opt = await question('👉 Elige una opción (1 / 2): ')

    // ───── PAIRING CODE ─────
    if (opt.trim() === '1') {
      const number = await question(
        '📱 Ingresa tu número (ej: 521XXXXXXXXXX): '
      )

      console.log(
        chalk.yellow('\n⏳ Generando código de emparejamiento...\n')
      )

      try {
        const code = await sock.requestPairingCode(number.trim())

        console.log(
          chalk.green('🔢 Código de emparejamiento:\n'),
          chalk.white.bold(code),
          '\n\n👉 WhatsApp → Dispositivos vinculados'
        )

        rl.close()
      } catch (err) {
        console.log(chalk.red('❌ Error generando el código'))
        console.error(err)
        process.exit(1)
      }
    }

    // ───── QR ─────
    if (opt.trim() === '2') {
      sock.ev.on('connection.update', update => {
        const { qr } = update
        if (qr) {
          console.log(
            chalk.green('\n📲 Escanea el QR desde WhatsApp\n')
          )
        }
      })
      rl.close()
    }
  }

  // ───── ESTADO DE CONEXIÓN ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('\n🤖 Chappie Bot conectado a WhatsApp\n'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) {
        console.log(
          chalk.yellow('🔄 Conexión caída, reconectando...')
        )
        connectBot()
      } else {
        console.log(
          chalk.red('❌ Sesión cerrada, elimina /auth y vuelve a iniciar')
        )
      }
    }
  })

  return sock
    }
