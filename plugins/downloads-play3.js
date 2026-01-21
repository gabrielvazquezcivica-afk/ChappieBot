import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

/* ───── PATH MODOADMIN ───── */
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

/* ───── UTIL ───── */
function getText(m) {
  return (
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  )
}

/* ───── DOWNLOADER ───── */
const ddownr = {
  download: async (url) => {
    const res = await axios.get(
      `https://p.savenow.to/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`
    )
    if (!res.data?.success) throw new Error('Error')

    const { id } = res.data
    return await ddownr.wait(id)
  },

  wait: async (id) => {
    while (true) {
      const r = await axios.get(
        `https://p.savenow.to/ajax/progress?id=${id}`
      )
      if (r.data?.success && r.data.progress === 1000) {
        return r.data.download_url
      }
      await new Promise(r => setTimeout(r, 2500))
    }
  }
}

/* ───── HANDLER ───── */
export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  isGroup,
  owner
}) => {
  try {

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

    const text = getText(m).replace(/^\.\w+\s?/, '').trim()
    if (!text) return reply('📁 Escribe el nombre de la canción')

    /* 🔎 BUSCAR */
    const search = await yts(text)
    if (!search.all.length) return reply('❌ No se encontraron resultados')

    const v = search.all.find(x => x.seconds) || search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = v

    /* 🎧 REACCIÓN */
    await sock.sendMessage(from, {
      react: { text: '📁', key: m.key }
    })

    /* 🧾 INFO */
    await sock.sendMessage(from, {
      image: { url: thumbnail },
      caption: `
╭─〔 📁 AUDIO DOCUMENTO 〕
│ 🎵 ${title}
├────────────────
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views?.toLocaleString() || 'N/A'}
│ 📅 Publicado: ${ago || 'N/A'}
├────────────────
│ 📦 Preparando archivo…
╰─〔 🤖 ChappieBot 〕
`.trim()
    }, { quoted: m })

    /* ⬇️ DESCARGAR */
    let dl
    try {
      dl = await ddownr.download(url)
    } catch {
      const api = await fetch(
        `https://api.stellarwa.xyz/dl/ytmp3?url=${url}&key=proyectsV2`
      ).then(r => r.json())
      dl = api.data?.dl
    }

    if (!dl) return reply('❌ No se pudo obtener el audio')

    /* 📁 ENVIAR */
    await sock.sendMessage(from, {
      document: { url: dl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    /* ✅ FINAL */
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('PLAY3 ERROR:', e)
    reply('❌ Error al enviar el audio')
  }
}

/* ───── CONFIG ───── */
handler.command = ['play3']
handler.tags = ['descargas']
handler.menu = true
handler.group = false

export default handler
