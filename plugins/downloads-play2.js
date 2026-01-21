import yts from 'yt-search'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, args, reply, isGroup, owner }) => {
  const sender = m.key.participant

  /* ───── MODO ADMIN SILENCIOSO ───── */
  if (isGroup) {
    if (!global.db) global.db = {}
    if (!global.db.groups) global.db.groups = {}
    if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

    const groupSettings = global.db.groups[from]
    if (groupSettings.modoadmin) {
      try {
        const metadata = await sock.groupMetadata(from)
        const parts = metadata.participants || []
        const ownerJids = owner?.jid || []

        if (!ownerJids.includes(sender)) {
          const isAdmin = parts.some(
            p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
          )
          if (!isAdmin) return
        }
      } catch {}
    }
  }
  /* ───────────────────────────────── */

  const text = args.join(' ').trim()
  if (!text) return reply(
`╭─❖ 「 🎬 JOSHI VIDEO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play2 dopamina
╰─────────────────────────╯`
  )

  try {
    // 🔍 BUSCAR VIDEO
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const video = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = video

    // 🎬 REACCIÓN
    await sock.sendMessage(from, { react: { text: '🎬', key: m.key } })

    // 📊 INFO DEL VIDEO
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption:
`╔════════════════════════════╗
║   🎬 JOSHI VIDEO SYSTEM   ║
╠════════════════════════════╣
║ 🎥 Título   : ${title}
║ 👤 Canal    : ${author?.name || 'Desconocido'}
║ ⏱ Duración : ${timestamp}
║ 👁 Vistas   : ${views?.toLocaleString() || 'N/A'}
║ 📅 Subido   : ${ago || 'N/A'}
╚════════════════════════════╝

⏳ Enviando video...`
    }, { quoted: m })

    // ⬇️ STREAM DIRECTO CON yt-dlp
    await new Promise((resolve, reject) => {
      const yt = spawn('yt-dlp', [
        '-f', 'bv*[height<=720]+ba/b[height<=720]',
        '--merge-output-format', 'mp4',
        '--no-playlist',
        '--no-warnings',
        '--quiet',
        '-o', '-', // ❗ salida a stdout
        url
      ])

      let chunks = []
      yt.stdout.on('data', data => chunks.push(data))
      yt.stderr.on('data', () => {}) // ignorar errores de consola
      yt.on('close', code => {
        if (code === 0) resolve(Buffer.concat(chunks))
        else reject(new Error('yt-dlp falló'))
      })
      yt.on('error', reject)
    }).then(async buffer => {
      // 📤 ENVIAR VIDEO
      await sock.sendMessage(from, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `🎬 ${title}`
      }, { quoted: m })
    })

    // ✅ REACCIÓN FINAL
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('PLAY2 STREAM ERROR:', e?.message || e)
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
