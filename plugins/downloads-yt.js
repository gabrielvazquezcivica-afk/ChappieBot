import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

/* ───── PATH MODOADMIN ───── */
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

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

      // 🚫 bloqueo silencioso
      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ─────────────────────────────────────────────── */

  if (!args.length) {
    return reply(`
╭──〔 🔎 YOUTUBE SEARCH 〕──╮
│ 📌 Uso:
│ .yts <búsqueda>
│
│ 🧪 Ejemplo:
│ .yts one piece opening
╰──〔 🤖 ChappieBot 〕──╯
`.trim())
  }

  const query = args.join(' ')

  // 🔎 reacción inicial
  await sock.sendMessage(from, {
    react: { text: '🔎', key: m.key }
  })

  let res
  try {
    res = await yts(query)
  } catch (e) {
    console.error(e)
    return reply('❌ Error buscando en YouTube')
  }

  const videos = res.videos.slice(0, 5)
  if (!videos.length) return reply('❌ No se encontraron resultados')

  let text = `
╭──〔 🎬 RESULTADOS YOUTUBE 〕──╮
🔍 Búsqueda: *${query}*
`.trim()

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i]
    text += `

${i + 1}. 🎥 *${v.title}*
⏱️ Duración: ${v.timestamp}
👤 Canal: ${v.author?.name || 'Desconocido'}
👀 Vistas: ${v.views?.toLocaleString() || 'N/A'}
🔗 Link: ${v.url}
`
  }

  text += `\n╰──〔 🤖 ChappieBot 〕──╯`

  await reply(text)

  // ✅ reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

/* ───── CONFIG ───── */
handler.command = ['yts']
handler.tags = ['descargas']
handler.help = ['yts <texto>']
handler.menu = true
handler.group = true

export default handler
