import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender
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
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}

    if (!isAdmin) return // 🔇 silencioso
  }
  /* ───────────────────────────────── */

  const url = args[0]
  if (!url) return reply('❌ Pon un link de YouTube\n\nEjemplo:\n.ytmp4 https://youtu.be/xxxx')

  if (!/youtube\.com|youtu\.be/.test(url)) {
    return reply('❌ Ese no parece link de YouTube')
  }

  const file = path.join('./tmp', `ytmp4_${Date.now()}.mp4`)

  try {
    await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

    const cmd = `yt-dlp -f "best[ext=mp4]/best" -S res:360,codec:h264 --no-playlist -o "${file}" "${url}"`

    exec(cmd, async (err) => {
      if (err) {
        console.error(err)
        return reply('❌ Error al descargar el video')
      }

      const stats = fs.statSync(file)
      if (stats.size > 50 * 1024 * 1024) {
        fs.unlinkSync(file)
        return reply('❌ El video pesa más de 50MB')
      }

      await sock.sendMessage(from, {
        video: fs.readFileSync(file),
        caption: '✅ Video descargado con éxito'
      }, { quoted: m })

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

      fs.unlinkSync(file)
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error inesperado')
  }
}

handler.command = ['ytmp4']
handler.tags = ['descargas']
handler.help = ['ytmp4 <link>']
handler.menu = true

export default handler
