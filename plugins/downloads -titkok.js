import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

/* ───── PATH MODOADMIN ───── */
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

/* ───── TIKTOK API ───── */
const tiktokDownload = async (url) => {
  const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  const res = await fetch(api)
  const json = await res.json()
  if (!json.data) return null
  return json.data
}

/* ───── HANDLER ───── */
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

      // 🚫 bloqueo silencioso
      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ─────────────────────────────────── */

  if (!args[0]) {
    return reply(`
╭──〔 🎵 TIKTOK DOWNLOADER 〕──╮
│ 📌 Uso:
│ .tiktok <link>
│
│ 🔗 Ejemplo:
│ .tiktok https://vm.tiktok.com/xxxx
╰──〔 🤖 ChappieBot 〕──╯
`.trim())
  }

  const link = args[0]
  if (!/tiktok\.com|vm\.tiktok\.com/.test(link)) {
    return reply('❌ Ese no es un link válido de TikTok')
  }

  /* ⏳ REACCIÓN */
  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  let data
  try {
    data = await tiktokDownload(link)
  } catch {
    return reply('❌ TikTok bloqueó temporalmente la descarga')
  }

  if (!data?.play) return reply('❌ No se pudo obtener el video')

  const caption = `
╭──〔 🎬 TIKTOK 〕──╮
│ 🎵 ${data.title || 'Sin título'}
│ 👤 @${data.author?.unique_id || 'Desconocido'}
│ ❤️ ${data.digg_count || 0}
│ 💬 ${data.comment_count || 0}
│ 🔁 ${data.share_count || 0}
╰──〔 🤖 ChappieBot 〕──╯
`.trim()

  /* 📤 ENVIAR VIDEO */
  await sock.sendMessage(
    from,
    {
      video: { url: data.play },
      caption
    },
    { quoted: m }
  )

  /* ✅ FINAL */
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

/* ───── CONFIG ───── */
handler.command = ['tiktok']
handler.tags = ['descargas']
handler.menu = true
handler.group = false

export default handler
