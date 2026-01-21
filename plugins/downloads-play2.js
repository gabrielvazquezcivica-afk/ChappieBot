import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'
import { google } from 'googleapis'

const YT_API_KEY = 'AIzaSyBDC1a2MaAyr2DE2qDnN9IVInwkWFZB348'

export const handler = async (m, { sock, from, args, reply, isGroup, owner }) => {
  const sender = m.key.participant
  const text = args.join(' ').trim()

  if (!text) return reply(
`╭─❖ 「 🎬 JOSHI VIDEO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play2 dopamina
╰─────────────────────────╯`
  )

  try {
    /* ───── 🔍 BUSCAR VIDEO YT API ───── */
    const youtube = google.youtube({ version: 'v3', auth: YT_API_KEY })
    const res = await youtube.search.list({
      part: 'snippet',
      q: text,
      maxResults: 5,
      type: 'video'
    })

    if (!res.data.items?.length) return reply('❌ No encontré resultados')

    const videoId = res.data.items[0].id.videoId
    const { title, channelTitle, thumbnails } = res.data.items[0].snippet
    const url = `https://www.youtube.com/watch?v=${videoId}`
    const thumbnail = thumbnails.high?.url || thumbnails.default?.url

    /* 🎬 Reacción de búsqueda */
    await sock.sendMessage(from, { react: { text: '🎬', key: m.key } })

    /* ⬇️ DESCARGA TEMPORAL CON yt-dlp */
    const tmpPath = path.join(os.tmpdir(), `${Date.now()}.mp4`)
    await new Promise((resolve, reject) => {
      const yt = spawn(
        'yt-dlp',
        [
          '-f', 'bv*[height<=720]+ba/b[height<=720]',
          '--merge-output-format', 'mp4',
          '--no-playlist',
          '--no-warnings',
          '--quiet',
          '-o', tmpPath,
          url
        ],
        { stdio: 'ignore' }
      )
      yt.on('close', code => code === 0 ? resolve() : reject(new Error('yt-dlp falló')))
      yt.on('error', reject)
    })

    /* 📊 INFORMACIÓN DEL VIDEO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔════════════════════════════╗
║   🎬 JOSHI VIDEO SYSTEM   ║
╠════════════════════════════╣
║ 🎥 Título   : ${title}
║ 👤 Canal    : ${channelTitle}
╚════════════════════════════╝

⏳ Enviando video...`
    }, { quoted: m })

    /* 📤 ENVIAR VIDEO */
    const video = fs.readFileSync(tmpPath)
    fs.unlinkSync(tmpPath)
    await sock.sendMessage(from, {
      video,
      mimetype: 'video/mp4',
      caption: `🎬 ${title}`
    }, { quoted: m })

    /* ✅ REACCIÓN FINAL */
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('PLAY2 ERROR:', e)
    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo enviar el video
│ 🔁 Intenta otro nombre
╰──────────────────╯`
    )
  }
}

handler.command = ['play2']
handler.tags = ['descargas']
handler.help = ['play2 <video>']
handler.menu = true
handler.group = false

export default handler
