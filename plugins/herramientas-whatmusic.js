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

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
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
  /* ─────────────────────────────────────────────── */


  /* ───── 🎧 VALIDAR AUDIO RESPONDIDO ───── */
  if (!m.quoted) {
    return reply('🎧 Responde a una *nota de voz o audio*')
  }

  const qMsg = m.quoted.message
  const audio =
    qMsg?.audioMessage

  if (!audio) {
    return reply('❌ El mensaje respondido no es un audio')
  }

  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })


  /* ───── ⬇️ DESCARGA REAL DEL AUDIO ───── */
  let buffer = Buffer.from([])

  try {
    const stream = await downloadContentFromMessage(audio, 'audio')
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
  } catch (e) {
    console.error(e)
    return reply('❌ No pude descargar el audio')
  }

  if (!buffer.length) {
    return reply('❌ Audio vacío o corrupto')
  }


  /* ───── 🔍 IDENTIFICAR CANCIÓN ───── */
  try {
    const res = await fetch('https://api.audd.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: 'test', // pon tu API real si tienes
        audio: buffer.toString('base64'),
        return: 'spotify,apple_music'
      })
    })

    const json = await res.json()

    if (!json.result) {
      return reply('❌ No se pudo identificar la canción')
    }

    const s = json.result

    const text = `
╭─〔 🎵 CANCIÓN IDENTIFICADA 〕
│ 🎶 ${s.title}
│ 👤 ${s.artist}
│ 💽 ${s.album || 'Desconocido'}
╰─〔 🤖 ChappieBot 〕
`.trim()

    await reply(text)

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
