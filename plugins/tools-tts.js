import fetch from 'node-fetch'
import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (isGroup && groupSettings.enabled) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  const texto = args.join(' ')
  if (!texto) {
    return reply(
`🗣️ *TEXT TO SPEECH*

📌 Uso:
.tts <texto>

✏️ Ejemplo:
.tts Hola, soy ChappieBot`
    )
  }

  // 🔊 reacción inicio
  await sock.sendMessage(from, {
    react: { text: '🔊', key: m.key }
  })

  try {
    const url =
      'https://translate.google.com/translate_tts' +
      '?ie=UTF-8' +
      '&q=' + encodeURIComponent(texto) +
      '&tl=es' +
      '&client=tw-ob'

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) throw new Error('TTS error')

    const buffer = Buffer.from(await res.arrayBuffer())

    await sock.sendMessage(
      from,
      {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: true
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (err) {
    console.error('TTS ERROR:', err)
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ No pude generar el audio, intenta con otro texto')
  }
}

/* ───── CONFIG ───── */
handler.command = ['tts']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
