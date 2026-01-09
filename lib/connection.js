import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import chalk from 'chalk'
import pino from 'pino'
import readline from 'readline'
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

    // 🔴 ESTO ES CLAVE PARA PAIRING
    mobile: true,

    browser: ['ChappieBot', 'Android', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // ───── SOLO SI NO HAY SESIÓN ─────
  if (!fs.existsSync('./auth/creds.json')) {
    const number = await question(
      '\n📱 Ingresa tu número (ej: 521XXXXXXXXXX): '
    )

    console.log(
      chalk.yellow('\n⏳ Preparando emparejamiento seguro...\n')
    )

    // ⏱️ ESPERA OBLIGATORIA (CRÍTICA)
    await new Promise(res => setTimeout(res, 3500))

    try {
      const code = await sock.requestPairingCode(number.trim())

      console.log(
        chalk.green('\n🔢 Código de emparejamiento:\n'),
        chalk.white.bold(code),
        '\n\n📲 WhatsApp → Dispositivos vinculados → Vincular con código'
      )

      rl.close()
    } catch (err) {
      console.log(chalk.red('\n❌ WhatsApp rechazó el emparejamiento'))
      console.error(err)
      process.exit(1)
    }
  }

  // ───── CONEXIÓN ─────
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(
        chalk.green('\n🤖 Chappie Bot conectado correctamente\n')
      )
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason !== DisconnectReason.loggedOut) {
        console.log(
          chalk.yellow('🔄 Reconectando…')
        )
        connectBot()
      } else {
        console.log(
          chalk.red('❌ Sesión inválida, elimina /auth y vuelve a intentar')
        )
      }
    }
  })

  return sock
}
