import fs from 'fs'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  isGroup
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {}
  }

  if (groupSettings.enabled && isGroup) {
    const metadata = await sock.groupMetadata(from)
    const isAdmin = metadata.participants.some(
      p => p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return
  }
  /* ───────────────────────────────── */


  /* ───── 🎧 OBTENER AUDIO REAL ───── */
  let audioMessage = null

  // Caso 1: m.quoted existe
  if (m.quoted?.message?.audioMessage) {
    audioMessage = m.quoted.message.audioMessage
  }

  // Caso 2: quoted viene en contextInfo
  if (!audioMessage) {
    const quoted =
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage

    if (quoted?.audioMessage) {
      audioMessage = quoted.audioMessage
    }
  }

  if (!audioMessage) {
    return reply('🎧 Responde a una *nota de voz o audio*')
  }

  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })


  /* ───── ⬇️ DESCARGAR AUDIO ───── */
  let buffer = Buffer.from([])

  try {
    const stream = await downloadContentFromMessage(audioMessage, 'audio')
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
  } catch (e) {
    console.error(e)
    return reply('❌ No pude descargar el audio')
  }

  if (!buffer.length) {
    return reply('❌ El audio está vacío')
  }


  /* ───── 🔍 IDENTIFICAR CANCIÓN ───── */
  try {
    const res = await fetch('https://api.audd.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: 'test', // pon tu API real
        audio: buffer.toString('base64'),
        return: 'spotify,apple_music'
      })
    })

    const json = await res.json()

    if (!json.result) {
      return reply('❌ No se pudo identificar la canción')
    }

    const r = json.result

    await reply(`
╭─〔 🎵 CANCIÓN IDENTIFICADA 〕
│ 🎶 ${r.title}
│ 👤 ${r.artist}
│ 💽 ${r.album || 'Desconocido'}
╰─〔 🤖 ChappieBot 〕
`.trim())

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al identificar el audio')
  }
}

handler.command = ['whatmusic']
handler.tags = ['audio']
handler.menu = true

export default handler
