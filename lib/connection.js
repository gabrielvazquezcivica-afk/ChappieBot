import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'

import fs from 'fs'
import chalk from 'chalk'
import pino from 'pino'
import readline from 'readline'

const AUTH_FOLDER = './auth'

function question (q) {
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

export async function connectBot () {
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
    printQRInTerminal: option === '1',
    generateHighQualityLinkPreview: true,
    browser: ['ChappieBot', 'Chrome', '1.0.0']
  })

  // 💾 Guardar sesión
  sock.ev.on('creds.update', saveCreds)

  // 🔗 Código de vinculación
  if (option === '2' && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(global.owner.replace(/@.+/, ''))
        console.log(
          chalk.green('\n🔑 Código de vinculación:\n'),
          chalk.white.bold(code),
          '\n'
        )
      } catch (e) {
        console.log(chalk.red('❌ Error generando código:'), e)
      }
    }, 1500)
  }

  // 🔁 Reconexión automática
  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('✅ WhatsApp conectado correctamente'))
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
