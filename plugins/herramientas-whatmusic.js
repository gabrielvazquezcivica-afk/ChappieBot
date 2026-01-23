import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

const API_URL = 'https://api.ananta.qzz.io/api/whatmusic'
const API_KEY = 'ant2wpyf85ga6' // ponla luego en config.js si quieres

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
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {}
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      isAdmin = metadata.participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}

    if (!isAdmin) return
  }
  /* ─────────────────────────────────────────────── */

  const quoted = m.quoted
  if (!quoted || !quoted.mimetype?.startsWith('audio')) {
    return reply('🎧 Responde a un *audio* para identificar la canción')
  }

  await sock.sendMessage(from, {
    react: { text: '🎵', key: m.key }
  })

  // 📥 Descargar audio
  const buffer = await quoted.download()
  const tempPath = path.join(process.cwd(), 'tmp_audio.mp3')
  fs.writeFileSync(tempPath, buffer)

  // 📦 FormData
  const form = new FormData()
  form.append('media', fs.createReadStream(tempPath))

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY
      },
      body: form
    })

    const json = await res.json()
    fs.unlinkSync(tempPath)

    if (!json?.result) {
      return reply('❌ No pude identificar la canción')
    }

    const r = json.result

    const text = `
╭─〔 🎶 CANCIÓN IDENTIFICADA 〕
│ 🎵 Título : ${r.title || 'Desconocido'}
│ 👤 Artista: ${r.artist || 'Desconocido'}
│
│ ▶️ YouTube:
│ ${r.youtube || 'No disponible'}
╰─〔 🤖 ChappieBot 〕
`.trim()

    await reply(text)

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al analizar el audio')
  }
}

handler.command = ['whatmusic']
handler.tags = ['herramientas']
handler.menu = true
handler.group = false

export default handler
