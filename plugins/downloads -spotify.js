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
  if (!url) return reply('❌ Pon un link de Spotify\n\nEjemplo:\n.spotify https://open.spotify.com/track/xxxxx')

  if (!/open\.spotify\.com/.test(url)) {
    return reply('❌ Ese no parece un link de Spotify')
  }

  const outDir = './tmp'
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

  try {
    await sock.sendMessage(from, { react: { text: '🎧', key: m.key } })

    const cmd = `spotdl "${url}" --output "${outDir}" --format mp3`

    exec(cmd, async (err) => {
      if (err) {
        console.error(err)
        return reply('❌ Error al descargar desde Spotify')
      }

      const files = fs.readdirSync(outDir).filter(f => f.endsWith('.mp3'))
      if (!files.length) return reply('❌ No se pudo descargar la canción')

      const filePath = path.join(outDir, files[0])
      const stats = fs.statSync(filePath)

      if (stats.size > 50 * 1024 * 1024) {
        fs.unlinkSync(filePath)
        return reply('❌ El audio pesa más de 50MB')
      }

      await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        caption: '✅ Canción descargada desde Spotify'
      }, { quoted: m })

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

      fs.unlinkSync(filePath)
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error inesperado')
  }
}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <link>']
handler.menu = true

export default handler
