import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

const ytmp4 = async (url) => {
  const api = `https://api.yanzbotz.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
  const res = await fetch(api)
  const json = await res.json()
  if (!json?.result?.download) return null
  return json.result
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

  /* ───── 👑 MODO ADMIN (CHAPPIEBOT) ───── */
  if (isGroup && fs.existsSync(modoadminPath)) {
    let data = {}
    try {
      data = JSON.parse(fs.readFileSync(modoadminPath))
    } catch {}

    if (data[from]?.enabled) {
      const meta = await sock.groupMetadata(from)
      const isAdmin = meta.participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      const ownerJids = owner?.jid || []
      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ─────────────────────────────────── */

  if (!args[0]) {
    return reply(`
╭──〔 🎥 YOUTUBE VIDEO 〕──╮
│ 📌 Uso:
│ .ytv <link>
╰──〔 🤖 ChappieBot 〕──╯
`.trim())
  }

  const link = args[0]
  if (!/youtube\.com|youtu\.be/.test(link)) {
    return reply('❌ Link de YouTube inválido')
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  let data
  try {
    data = await ytmp4(link)
  } catch (e) {
    console.error(e)
    return reply('❌ Error descargando el video')
  }

  if (!data) return reply('❌ No se pudo obtener el video')

  const caption = `
╭──〔 🎬 YOUTUBE 〕──╮
│ 🎥 ${data.title}
│ ⏱ ${data.duration}
│ 📦 MP4
╰──〔 🤖 ChappieBot 〕──╯
`.trim()

  await sock.sendMessage(from, {
    video: { url: data.download },
    caption
  }, { quoted: m })

  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['ytv']
handler.tags = ['descargas']
handler.menu = true
handler.group = true

export default handler
