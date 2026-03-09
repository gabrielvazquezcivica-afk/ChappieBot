import yts from 'yt-search'
import fetch from 'node-fetch'
import fs from 'fs'

export const handler = async (m, { sock, from, args, reply, isAdmin }) => {

  const botName = sock.user?.name || 'ChappieBot'

  /* 🔒 MODO ADMIN */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }

  if (groupSettings.enabled && !isAdmin) {
    return
  }
  /* ───────────── */

  const text = args.join(' ').trim()

  if (!text) {
    return reply(
`╭─❖ 「 🎧 ${botName} 」 ❖─╮
│ ✍️ Uso: .play <canción>
│ 🎵 Ejemplo: .play bad bunny
╰─────────────────────────╯`)
  }

  try {

    /* 🔎 BUSCAR VIDEO */
    const search = await yts(text)

    if (!search.videos.length) {
      return reply('❌ No encontré resultados')
    }

    const v = search.videos[0]

    const { title, url, thumbnail, timestamp, views, author } = v

    /* 🎶 REACCIÓN */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* 📊 INFO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔══════ 🎧 ${botName} 🎧 ══════╗
║ 🎵 Título : ${title}
║ 👤 Canal : ${author.name}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas : ${views.toLocaleString()}
╚══════════════════════════════╝

⏳ Descargando audio...`
    }, { quoted: m })

    /* 📥 API DESCARGA */
    const api = `https://api.dorratz.com/ytmp3?url=${url}`

    const res = await fetch(api)
    const json = await res.json()

    if (!json.data?.download) {
      throw new Error('No se pudo obtener el audio')
    }

    const audioUrl = json.data.download

    /* 📤 ENVIAR AUDIO */
    await sock.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    /* ✅ REACCIÓN FINAL */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.log('PLAY ERROR:', e)

    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo descargar
│ 🔁 Intenta otra canción
╰─────────────────╯`)
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true
handler.group = false

export default handler
