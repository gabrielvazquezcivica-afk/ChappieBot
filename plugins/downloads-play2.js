import yts from 'yt-search'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, args, reply, isGroup, owner }) => {
  const sender = m.key.participant

  /* ───── 👑 MODO ADMIN (data/modoadmin.json) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const ownerJids = owner?.jid || []

      // Bloqueo silencioso: solo admins y owner pueden usar el comando
      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return
      }
    } catch {}
  }
  /* ───────────────────────────────────────────── */

  const text = args.join(' ').trim()
  if (!text) {
    return reply(
`╭─❖ 「 🎬 JOSHI VIDEO 」 ❖─╮
│ ✍️ Ejemplo:
│ .play2 dopamina
╰─────────────────────────╯`
    )
  }

  try {
    /* 🔍 BUSCAR VIDEO */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No encontré resultados')

    const videoInfo = search.all.find(v => v.seconds) || search.all[0]
    const { title, url, thumbnail, author, timestamp, views, ago } = videoInfo

    /* 🎬 REACCIÓN */
    await sock.sendMessage(from, { react: { text: '🎬', key: m.key } })

    /* ⬇️ DESCARGA TEMPORAL */
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

    /* 📊 INFO DEL VIDEO */
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
    console.error('PLAY2 ERROR:', e?.message || e)
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
