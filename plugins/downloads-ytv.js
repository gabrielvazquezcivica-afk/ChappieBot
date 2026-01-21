import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')

// ───── CARGAR MODO ADMIN ─────
function loadModoAdmin () {
  if (!fs.existsSync(modoadminPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(modoadminPath))
  } catch {
    return {}
  }
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN (CHAPPIEBOT) ───── */
  if (isGroup) {
    const modoadminData = loadModoAdmin()
    const groupModoAdmin = modoadminData[from]?.enabled === true

    if (groupModoAdmin) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      const ownerJids = owner?.jid || []

      if (!ownerJids.includes(sender)) {
        const isAdmin = participants.some(
          p => p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
        )
        if (!isAdmin) return // 🚫 bloqueo silencioso
      }
    }
  }
  /* ─────────────────────────────────── */

  if (!args[0]) {
    return reply(`
╭──〔 🎥 YOUTUBE VIDEO 〕──╮
│ 📌 Uso:
│ .ytv <link>
╰──〔 🤖 ChappieBot 〕──╯
`.trim())
  }

  const url = args[0]
  if (!/youtube\.com|youtu\.be/.test(url)) {
    return reply('❌ Link de YouTube inválido')
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  const tmpPath = path.join(os.tmpdir(), `${Date.now()}.mp4`)

  try {
    await new Promise((resolve, reject) => {
      const yt = spawn('yt-dlp', [
        '-f',
        'bv*[ext=mp4][height<=480]+ba[ext=m4a]/b[ext=mp4][height<=480]',
        '--merge-output-format', 'mp4',
        '--no-playlist',
        '-o', tmpPath,
        url
      ])

      yt.on('close', code => {
        code === 0 ? resolve() : reject(new Error('yt-dlp falló'))
      })
    })

    const video = fs.readFileSync(tmpPath)
    fs.unlinkSync(tmpPath)

    await sock.sendMessage(from, {
      video,
      mimetype: 'video/mp4',
      caption: '🎬 YouTube MP4'
    }, { quoted: m })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('YTMP4 ERROR:', e)
    reply('❌ No se pudo descargar el video')
  }
}

handler.command = ['ytv']
handler.tags = ['descargas']
handler.menu = true
handler.group = true

export default handler
