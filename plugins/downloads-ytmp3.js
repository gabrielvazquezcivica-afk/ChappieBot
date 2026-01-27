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
  if (!url) return reply('❌ Pon un link de YouTube\n\nEjemplo:\n.ytmp3 https://youtu.be/xxxx')

  if (!/youtube\.com|youtu\.be/.test(url)) {
    return reply('❌ Ese no parece link de YouTube')
  }

  const file = path.join('./tmp', `ytmp3_${Date.now()}.mp3`)

  try {
    await sock.sendMessage(from, { react: { text: '🎵', key: m.key } })

    const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 128K -o "${file}" "${url}"`

    exec(cmd, async (err) => {
      if (err) {
        console.error(err)
        return reply('❌ Error al descargar el audio')
      }

      const stats = fs.statSync(file)
      if (stats.size > 50 * 1024 * 1024) {
        fs.unlinkSync(file)
        return reply('❌ El audio pesa más de 50MB')
      }

      await sock.sendMessage(from, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg',
        caption: '✅ Audio descargado con éxito'
      }, { quoted: m })

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

      fs.unlinkSync(file)
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error inesperado')
  }
}

handler.command = ['ytmp3']
handler.tags = ['descargas']
handler.help = ['ytmp3 <link>']
handler.menu = true

export default handler
