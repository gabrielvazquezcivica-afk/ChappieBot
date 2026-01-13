import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys'

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = q => new Promise(r => rl.question(q, r))

export async function connectBot () {
  const authDir = './auth'
  const { state, saveCreds } = await useMultiFileAuthState(authDir)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['ChappieBot', 'Chrome', '1.0']
  })

  console.log(chalk.cyan('\nMétodo de vinculación'))
  console.log('1️⃣  Escanear QR')
  console.log('2️⃣  Código de vinculación\n')

  const method = await question('👉 Elige una opción (1 o 2): ')

  // 🔹 QR SOLO UNA VEZ
  sock.ev.on('connection.update', update => {
    const { connection, qr, lastDisconnect } = update

    if (qr && method === '1' && !state.creds.registered) {
      console.log(chalk.yellow('\n📲 Escanea este QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('\n✅ WhatsApp conectado\n'))
      rl.close()
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode

      if (code === DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Sesión cerrada → borra la carpeta auth'))
        process.exit(1)
      }

      console.log(chalk.yellow('⚠️ Conexión cerrada, reintentando...'))
    }
  })

  // 🔹 CÓDIGO DE VINCULACIÓN (ANTES DE CONECTAR)
  if (method === '2' && !state.creds.registered) {
    const number = await question(
      '📱 Ingresa el número donde se conectará el bot (sin + ni espacios): '
    )

    try {
      const code = await sock.requestPairingCode(number)
      console.log(
        chalk.green('\n🔑 Código de vinculación:\n'),
        chalk.white.bold(code),
        '\n'
      )
    } catch (e) {
      console.log(chalk.red('❌ Error generando código'))
      process.exit(1)
    }
  }

  sock.ev.on('creds.update', saveCreds)
  return sock
}
