import yts from 'yt-search'
import fs from 'fs'

const modoadminPath = './data/modoadmin.json'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN ───── */
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
  /* ───────────────────── */

  const text = args.join(' ').trim()
  if (!text) return reply('❌ Escribe el nombre de la canción')

  await sock.sendMessage(from, {
    react: { text: '🎧', key: m.key }
  })

  try {

    const search = await yts(text)
    if (!search.videos.length) return reply('❌ No encontré resultados')

    const video = search.videos[0]
    const { title, thumbnail, timestamp, views, author } = video

    /* 🖼️ TARJETA BONITA */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╭─❖ 「 🎧 SPOTIFY 」 ❖─╮
│ 🎵 ${title}
│ 👤 ${author.name}
│ ⏱ ${timestamp}
│ 👁 ${views.toLocaleString()} vistas
╰────────────────

📌 Selecciona una opción abajo 👇`
    }, { quoted: m })

    /* 💎 MENÚ FAKE PREMIUM */
    await sock.sendMessage(from, {
      text:
`🎧 *Elige formato de descarga*

↩️ *Audio*
↩️ *Video*`
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    reply('❌ Error al procesar')
  }
}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <canción>']
handler.menu = true

export default handler
