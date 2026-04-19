import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

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
  if (!text) return reply('❌ *Ingresa el nombre de la canción que quieres descargar*')

  await sock.sendMessage(from, {
    react: { text: '🎧', key: m.key }
  })

  try {

    /* 🔎 BUSCAR */
    const search = await yts(text)
    if (!search.videos.length) {
      return reply('❌ *No se encontraron resultados para tu búsqueda*')
    }

    const video = search.videos[0]
    const { title, url, thumbnail, timestamp, views, author } = video

    /* 🖼️ TARJETA BONITA - DISEÑO MEJORADO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`┌─────────────────────────┐
│  🎵  *CANCIÓN ENCONTRADA*  🎵  │
├─────────────────────────┤
│ 🎶 *Título:*
│ ${title}
│
│ 👤 *Artista:*
│ ${author.name}
│
│ ⏱ *Duración:*
│ ${timestamp}
│
│ 👁 *Reproducciones:*
│ ${views.toLocaleString()}
└─────────────────────────┘

⬇️ *Descargando tu audio...*`
    }, { quoted: m })

    /* 📁 ARCHIVO */
    const file = path.join('./tmp', `${Date.now()}.m4a`)

    /* ⚡ DESCARGAR AUDIO */
    const ytdlp = spawn('yt-dlp', [
      '-f', 'bestaudio[ext=m4a]',
      '--no-playlist',
      '--quiet',
      '-o', file,
      url
    ])

    ytdlp.on('close', async (code) => {

      if (code !== 0) {
        return reply('❌ *Ocurrió un error al descargar el audio, intenta más tarde*')
      }

      /* 🎧 ENVIAR AUDIO */
      await sock.sendMessage(from, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mp4',
        fileName: `${title}.m4a`,
        caption: `✅ *Descarga completada:*\n${title}`
      }, { quoted: m })

      fs.unlinkSync(file)

      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })

    })

  } catch (e) {
    console.log('SPOTIFY ERROR:', e)
    reply('❌ *Error al procesar la solicitud, intenta nuevamente*')
  }
}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <canción>']
handler.menu = true

export default handler
