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

const question = q => new Promise(r => rl.question(q, r))

export async function connectBot () {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  console.log(chalk.cyan('\n🔐 Método de inicio de sesión'))
  console.log(chalk.yellow('1️⃣ Código de emparejamiento'))
  console.log(chalk.yellow('2️⃣ QR clásico'))

  const option = await question('\n👉 Elige (1 / 2): ')
  const useCode = option === '1'
  let phoneNumber = null

  if (useCode) {
    phoneNumber = await question('📱 Número (521XXXXXXXXXX): ')
  }
  rl.close()

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['ChappieBot', 'Chrome', '120']
  })

  // 🔐 CÓDIGO DE EMPAREJAMIENTO (TIMING CORRECTO)
  if (useCode && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(
          phoneNumber.replace(/[^0-9]/g, '')
        )
        console.log(
          chalk.bgGreen.black('\n CÓDIGO DE VINCULACIÓN \n'),
          chalk.greenBright(code)
        )
        console.log('📲 WhatsApp > Dispositivos vinculados')
      } catch (err) {
        console.log(chalk.red('❌ No se pudo generar el código'))
      }
    }, 1500)
  }

  sock.ev.on('connection.update', update => {
    const { connection, qr, lastDisconnect } = update

    if (qr && !useCode) {
      console.log('\n📱 Escanea el QR\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Sesión cerrada, elimina auth_info'))
        process.exit(1)
      }

      console.log(chalk.yellow('🔄 Reconectando...'))
      setTimeout(connectBot, 3000)
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message) return
    await muteWatcher(sock, m)
  })


  return sock
}
