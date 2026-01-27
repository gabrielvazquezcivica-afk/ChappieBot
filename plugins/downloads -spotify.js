import fs from 'fs'
import path from 'path'
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
  isGroup,
  sender,
  reply,
  args
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
  /* ───────────────────────────────── */

  const text = args.join(' ')
  if (!text) return reply('❌ Escribe el nombre de la canción')

  const tmpDir = './tmp'
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const file = path.join(tmpDir, `spotify_${Date.now()}.mp3`)

  await sock.sendMessage(from, { react: { text: '🎧', key: m.key } })

  const cmd = `yt-dlp --js-runtimes node -x --audio-format mp3 --audio-quality 0 -o "${file}" "ytsearch1:${text}"`

  exec(cmd, async (err) => {
    if (err) {
      console.error('SPOTIFY ERROR:', err)
      return reply('❌ Error al descargar la canción')
    }

    await sock.sendMessage(
      from,
      {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg'
      },
      { quoted: sistema('🎧 SPOTIFY DOWNLOAD') }
    )

    fs.unlinkSync(file)
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  })
}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <nombre de la canción>']
handler.menu = true
handler.group = false

export default handler
