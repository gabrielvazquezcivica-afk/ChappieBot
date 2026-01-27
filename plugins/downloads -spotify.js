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
/* ───────────────────────────────────── */

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
    if (!isAdmin) return
  }
  /* ───────────────────────────── */

  const query = args.join(' ').trim()
  if (!query) {
    return sock.sendMessage(from, {
      text: '❌ Escribe el nombre de la canción\n\nEjemplo:\n.playspotify Bad Bunny Monaco'
    }, { quoted: sistema('SPOTIFY PLAY') })
  }

  const outDir = './tmp'
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

  try {
    await sock.sendMessage(from, { react: { text: '🔎', key: m.key } })

    const cmd = `spotdl "${query}" --output "${outDir}" --format mp3`

    exec(cmd, async (err) => {
      if (err) {
        console.error(err)
        return sock.sendMessage(from, {
          text: '❌ No se pudo descargar desde Spotify'
        }, { quoted: sistema('SPOTIFY ERROR') })
      }

      const files = fs.readdirSync(outDir).filter(f => f.endsWith('.mp3'))
      if (!files.length) {
        return sock.sendMessage(from, {
          text: '❌ No se encontró ningún audio'
        }, { quoted: sistema('SPOTIFY ERROR') })
      }

      const filePath = path.join(outDir, files[0])
      const stats = fs.statSync(filePath)

      if (stats.size > 50 * 1024 * 1024) {
        fs.unlinkSync(filePath)
        return sock.sendMessage(from, {
          text: '❌ El audio pesa más de 50MB'
        }, { quoted: sistema('SPOTIFY ERROR') })
      }

      await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        caption: `🎵 *Spotify Play*\n\n🔎 ${query}`
      }, { quoted: sistema('SPOTIFY PLAY') })

      await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

      fs.unlinkSync(filePath)
    })

  } catch (e) {
    console.error(e)
    sock.sendMessage(from, {
      text: '❌ Error inesperado'
    }, { quoted: sistema('SPOTIFY ERROR') })
  }
}

handler.command = ['playspotify']
handler.tags = ['descargas']
handler.help = ['playspotify <nombre canción>']
handler.menu = true

export default handler
