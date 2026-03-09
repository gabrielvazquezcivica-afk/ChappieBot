import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'

export const handler = async (m, { sock, from, args, reply, isAdmin }) => {

  const botName = sock.user?.name || 'ChappieBot'

  /* 🔒 MODO ADMIN */
  const modoadminPath = './data/modoadmin.json'
  let groupSettings = { enabled: false }

  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }

  if (groupSettings.enabled && !isAdmin) return

  const text = args.join(' ').trim()

  if (!text) {
    return reply(`🎧 Uso: .play <canción>`)
  }

  try {

    /* 🔎 Buscar video */
    const search = await yts(text)

    if (!search.videos.length) {
      return reply('❌ No encontré resultados')
    }

    const video = search.videos[0]

    const { title, url, thumbnail, timestamp, views, author } = video

    /* 🎶 Reacción */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* 📊 Enviar info */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╭─❖ 「 🎧 ${botName} 」 ❖─╮
│ 🎵 Título: ${title}
│ 👤 Canal: ${author.name}
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views.toLocaleString()}
╰────────────────

⏳ Descargando audio...`
    }, { quoted: m })

    const file = `./tmp/${Date.now()}.mp3`

    /* 📥 Descargar */
    const ytdlp = spawn('yt-dlp', [
      '-x',
      '--audio-format',
      'mp3',
      '-o',
      file,
      url
    ])

    ytdlp.on('close', async (code) => {

      if (code !== 0) {
        return reply('❌ Error descargando audio')
      }

      /* 🎵 Enviar audio */
      await sock.sendMessage(from, {
        audio: { url: file },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })

      fs.unlinkSync(file)

      /* ✅ Reacción final */
      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })

    })

  } catch (e) {

    console.log('PLAY ERROR:', e)
    reply('❌ Error al procesar la canción')

  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
