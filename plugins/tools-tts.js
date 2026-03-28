import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
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

    if (!isAdmin) return
  }
  /* ─────────────────────────────────── */

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

    // 🔥 archivos temporales
    const input = `./tts_${Date.now()}.mp3`
    const output = `./tts_${Date.now()}.ogg`

    fs.writeFileSync(input, buffer)

    // 🔥 convertir a OGG OPUS
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${input} -c:a libopus -b:a 64k ${output}`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const audioBuffer = fs.readFileSync(output)

    // 🔥 enviar audio CORRECTO
    await sock.sendMessage(
      from,
      {
        audio: audioBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      },
      { quoted: m }
    )

    // limpiar archivos
    fs.unlinkSync(input)
    fs.unlinkSync(output)

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
