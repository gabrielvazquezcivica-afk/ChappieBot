import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

/* ───── PATH MODOADMIN ───── */
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

const ytv = async (url) => {
  const api = `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&key=proyectsV2`
  const res = await fetch(api)
  const json = await res.json()
  if (!json?.data?.dl) return null
  return json.data
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (CHAPPIEBOT · SILENCIOSO) ───── */
  if (isGroup && fs.existsSync(modoadminPath)) {
    let modoadmin = {}
    try {
      modoadmin = JSON.parse(fs.readFileSync(modoadminPath))
    } catch {}

    if (modoadmin[from]?.enabled) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      const ownerJids = owner?.jid || []
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ─────────────────────────────────────────────── */

  if (!args[0]) {
    return reply(`
╭──〔 🎥 YOUTUBE VIDEO 〕──╮
│ 📌 Uso:
│ .ytv <link>
│
│ 🔗 Ejemplo:
│ .ytv https://youtu.be/xxxxx
╰──〔 🤖 ChappieBot 〕──╯
`.trim())
  }

  const link = args[0]
  if (!/youtu\.be|youtube\.com/.test(link)) {
    return reply('❌ Ese no es un link válido de YouTube')
  }

  // ⏳ reacción inicial
  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  let data
  try {
    data = await ytv(link)
  } catch (e) {
    console.error(e)
    return reply('❌ Error descargando el video')
  }

  if (!data) return reply('❌ No se pudo obtener el video')

  const caption = `
╭──〔 🎬 YOUTUBE VIDEO 〕──╮
│ 🎥 ${data.title}
│ ⏱ Duración: ${data.duration}
│ 👀 Vistas: ${data.views?.toLocaleString() || 'N/A'}
│ 📦 Calidad: MP4
╰──〔 🤖 ChappieBot 〕──╯
`.trim()

  // 🎬 enviar video
  await sock.sendMessage(from, {
    video: { url: data.dl },
    caption
  }, { quoted: m })

  // ✅ reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

/* ───── CONFIG ───── */
handler.command = ['ytv']
handler.tags = ['descargas']
handler.help = ['ytv <link youtube>']
handler.menu = true
handler.group = true

export default handler
