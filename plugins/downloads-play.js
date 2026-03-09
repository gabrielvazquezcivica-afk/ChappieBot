import yts from 'yt-search'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, args, reply, isAdmin }) => {
  const botName = sock.user?.name || 'ChappieBot'

  /* 🔒 MODO ADMIN SILENCIOSO */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }

  if (groupSettings.enabled && !isAdmin) return
  /* ───────────────────── */

  const text = args.join(' ').trim()

  if (!text) {
    return reply(
`╭─❖ 「 🎧 ${botName} 」 ❖─╮
│ ✍️ Uso: .play <canción>
│ 🎵 Ejemplo: .play bad bunny
╰─────────────────────────╯`
    )
  }

  try {

    /* 🔍 BUSCAR EN YOUTUBE */
    const search = await yts(text)

    if (!search.all.length) {
      return reply('❌ No encontré resultados')
    }

    const v = search.all.find(v => v.seconds) || search.all[0]

    const { title, url, thumbnail, author, timestamp, views, ago } = v

    /* 🎶 REACCIÓN */
    await sock.sendMessage(from, {
      react: { text: '🎶', key: m.key }
    })

    /* 📁 ARCHIVO TEMPORAL */
    const base = path.join(os.tmpdir(), `${Date.now()}`)
    const file = `${base}.m4a`

    /* ⬇️ DESCARGAR AUDIO */
    const download = new Promise((resolve, reject) => {

      const yt = spawn(
        'yt-dlp',
        [
          '-f', 'bestaudio',
          '--extract-audio',
          '--audio-format', 'm4a',
          '--audio-quality', '0',
          '--no-playlist',
          '--geo-bypass',
          '--user-agent', 'Mozilla/5.0',
          '--no-warnings',
          '--quiet',
          '-o', `${base}.%(ext)s`,
          url
        ],
        { stdio: 'ignore' }
      )

      yt.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error('yt-dlp falló'))
      })

      yt.on('error', reject)

    })

    /* 📊 MENSAJE INFO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔══════ 🎧 ${botName} 🎧 ══════╗
║ 🎵 Título   : ${title}
║ 👤 Canal    : ${author?.name || 'Desconocido'}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas   : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido   : ${ago || 'N/A'}
╚══════════════════════════════╝

⏳ Descargando audio...`
    }, { quoted: m })

    /* ⏳ ESPERAR DESCARGA */
    await download

    if (!fs.existsSync(file)) {
      throw new Error('Archivo no generado')
    }

    const audio = fs.readFileSync(file)

    /* 📤 ENVIAR AUDIO */
    await sock.sendMessage(from, {
      audio: audio,
      mimetype: 'audio/mpeg',
      fileName: `${title}.m4a`
    }, { quoted: m })

    /* 🧹 BORRAR TEMPORAL */
    fs.unlinkSync(file)

    /* ✅ REACCIÓN FINAL */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.error('PLAY ERROR:', e)

    reply(
`╭─❖ 「 ERROR 」 ❖─╮
│ ❌ No se pudo obtener el audio
│ 🔁 Intenta con otra canción
╰─────────────────╯`
    )
  }
}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true
handler.group = false

export default handler
