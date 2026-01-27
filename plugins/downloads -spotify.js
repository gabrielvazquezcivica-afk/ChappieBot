import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { exec } from 'child_process'

/* ───── QUOTED SISTEMA (CHAPPIEBOT) ───── */
const sistema = (titulo = 'CHAPPIE BOT') => ({
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast'
  },
  message: {
    orderMessage: {
      itemCount: 1,
      message: titulo,
      footerText: 'ChappieBot',
      surface: 2,
      sellerJid: '0@s.whatsapp.net'
    }
  }
})
// ─────────────────────────────────────

export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  sender,
  reply
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminData[from] || { enabled: false }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}
    if (!isAdmin) return
  }
  /* ───────────────────────────── */

  let text = args.join(' ')
  if (!text) return reply('🎵 Usa:\n.spotify nombre canción\n.spotify link de spotify')

  await sock.sendMessage(from, { react: { text: '🎧', key: m.key } })

  // 🎯 Si es link de Spotify → obtener nombre
  if (text.includes('spotify.com')) {
    try {
      const oembed = await axios.get(`https://open.spotify.com/oembed?url=${text}`)
      text = oembed.data.title.replace(/-.*$/, '')
    } catch {
      return reply('❌ No pude leer el link de Spotify')
    }
  }

  const file = `./tmp/spotify_${Date.now()}.mp3`
  const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${file}" "ytsearch1:${text}"`

  exec(cmd, async (err) => {
    if (err) {
      console.error(err)
      return reply('❌ Error al descargar la canción')
    }

    await sock.sendMessage(from, {
      audio: fs.readFileSync(file),
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: sistema('SPOTIFY DOWNLOADER') })

    fs.unlinkSync(file)
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  })
}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <nombre | link>']
handler.menu = true

export default handler
