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
  return new Promise(resolve =>
    rl.question(q, ans => {
      rl.close()
      resolve(ans.trim())
    })
  )
}

export async function connectBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)
  const { version } = await fetchLatestBaileysVersion()

  let method = null

  // 🔒 SOLO preguntar si NO está registrado
  if (!state.creds.registered) {
    console.log(
      chalk.cyan('\n📲 Método de vinculación'),
      '\n',
      chalk.green('1️⃣  Escanear QR'),
      '\n',
      chalk.yellow('2️⃣  Código de vinculación\n')
    )

    method = await question('👉 Elige una opción (1 o 2): ')
  }

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: 'silent' })
      )
    },
    logger: pino({ level: 'silent' }),
    browser: ['ChappieBot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    // ✅ Mostrar QR SOLO si eligió QR y no está registrado
    if (qr && method === '1' && !state.creds.registered) {
      console.log(chalk.yellow('\n📲 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))

      // 🔐 Código de vinculación
      if (method === '2' && !state.creds.registered) {
        try {
          const number = await question(
            '📱 Ingresa el número donde se conectará el bot (sin + ni espacios): '
          )
          const code = await sock.requestPairingCode(
            number + '@s.whatsapp.net'
          )
          console.log(
            chalk.green('\n🔑 Código de vinculación:\n'),
            chalk.white.bold(code),
            '\n'
          )
        } catch (e) {
          console.log(chalk.red('❌ Error generando código'), e)
        }
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(chalk.red('⚠️ Conexión cerrada:'), reason)

      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔁 Reconectando...'))
        setTimeout(connectBot, 3000)
      } else {
        console.log(
          chalk.red('❌ Sesión cerrada'),
          '→ borra la carpeta auth y vuelve a vincular'
        )
      }
    }
  })

  return sock
                        }
