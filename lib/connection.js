import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import chalk from 'chalk'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import readline from 'readline'

const AUTH_FOLDER = './auth'

function question(q) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => rl.question(q, ans => {
    rl.close()
    resolve(ans.trim())
  }))
}

export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)
  const { version } = await fetchLatestBaileysVersion()

  console.log(
    chalk.cyan('\n📲 Método de vinculación'),
    '\n',
    chalk.green('1️⃣  Escanear QR'),
    '\n',
    chalk.yellow('2️⃣  Código de vinculación\n')
  )

  const option = await question(chalk.white('👉 Elige una opción (1 o 2): '))

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    generateHighQualityLinkPreview: true,
    browser: ['ChappieBot', 'Chrome', '1.0.0']
  })

  // 💾 Guardar credenciales automáticamente
  sock.ev.on('creds.update', saveCreds)

  // 🔁 Reconexión automática y QR
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // Mostrar QR si hay
    if (qr) {
      console.log(chalk.yellow('\n📲 Escanea este QR con WhatsApp:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))

      // Opción Código
      if (option === '2' && !state.creds.registered) {
        try {
          const number = await question(
            chalk.yellow('📱 Ingresa el número donde se conectará el bot (sin + ni espacios): ')
          )
          const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`
          const code = await sock.requestPairingCode(jid)
          console.log(
            chalk.green('\n🔑 Código de vinculación generado:\n'),
            chalk.white.bold(code),
            '\n'
          )
        } catch (e) {
          console.log(chalk.red('❌ Error generando código:'), e)
        }
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('⚠️ Desconectado:'), reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔁 Reconectando automáticamente...'))
        setTimeout(() => connectBot(), 3000)
      } else {
        console.log(
          chalk.red('❌ Sesión cerrada'),
          chalk.white('→ borra la carpeta auth y vuelve a vincular')
        )
      }
    }
  })

  return sock
}
