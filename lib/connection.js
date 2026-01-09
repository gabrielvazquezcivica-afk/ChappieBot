import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'

import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import { muteWatcher } from './muteWatcher.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (q) =>
  new Promise(resolve => rl.question(q, resolve))

export async function connectBot () {
  const authFolder = './auth_info'
  const { state, saveCreds } = await useMultiFileAuthState(authFolder)
  const { version } = await fetchLatestBaileysVersion()

  console.log(chalk.cyan('\n🔐 Método de inicio de sesión'))
  console.log(chalk.yellow('1️⃣  Código de emparejamiento'))
  console.log(chalk.yellow('2️⃣  QR clásico'))

  const option = await question(
    chalk.green('\n👉 Elige una opción (1 / 2): ')
  )

  let pairingCode = false
  let phoneNumber = null

  if (option === '1') {
    pairingCode = true
    phoneNumber = await question(
      chalk.green('📱 Ingresa tu número (ej: 521XXXXXXXXXX): ')
    )
  }

  rl.close()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'fatal' }),
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    browser: ['ChappieBot', 'Chrome', '120']
  })

  // 🔐 CÓDIGO DE EMPAREJAMIENTO (FUNCIONAL)
  if (pairingCode && !sock.authState.creds.registered) {
    try {
      const code = await sock.requestPairingCode(phoneNumber.trim())
      console.log(
        chalk.bgGreen.black('\n CÓDIGO DE VINCULACIÓN \n'),
        chalk.greenBright(code)
      )
      console.log(chalk.gray('📲 WhatsApp > Dispositivos vinculados'))
    } catch (e) {
      console.log(chalk.red('❌ Error al generar código'))
      process.exit(1)
    }
  }

  // 📡 CONEXIÓN
  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr && !pairingCode) {
      console.log(chalk.yellow('\n📱 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(
          chalk.red('❌ Sesión cerrada'),
          chalk.gray('Borra auth_info y vuelve a iniciar')
        )
        process.exit(1)
      }

      console.log(chalk.yellow('🔄 Conexión perdida, reconectando...'))
      setTimeout(connectBot, 3000)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // 🔇 MUTE WATCHER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    await muteWatcher(sock, m)
  })

  return sock
      }
