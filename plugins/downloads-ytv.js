import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

const modoadminPath = './data/modoadmin.json'

function loadModoAdmin() {
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

  /* ───── 👑 MODO ADMIN (SILENCIOSO - REAL) ───── */
  if (isGroup) {
    const modoadminData = loadModoAdmin()
    const groupMode = modoadminData[from]?.enabled === true

    if (groupMode) {
      try {
        const metadata = await sock.groupMetadata(from)
        const participants = metadata.participants || []
        const ownerJids = owner?.jid || []

        if (!ownerJids.includes(sender)) {
          const isAdmin = participants.some(
            p =>
              p.id === sender &&
              (p.admin === 'admin' || p.admin === 'superadmin')
          )
          if (!isAdmin) return // 🚫 bloqueo silencioso
        }
      } catch {
        return
      }
    }
  }
  /* ─────────────────────────────────────────── */

  if (!args[0]) {
    return reply(
`╭─❖ 「 🎥 YOUTUBE VIDEO 」 ❖─╮
│ 📌 Uso:
│ .ytv <link>
╰──────────────────────────╯`
    )
  }

  const url = args[0]
  if (!/youtube\.com|youtu\.be/.test(url)) {
    return reply('❌ Link de YouTube inválido')
  }

  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  const tmp = path.join(os.tmpdir(), `${Date.now()}.mp4`)

  try {
    await new Promise((resolve, reject) => {
      const yt = spawn(
        'yt-dlp',
        [
          '-f', '18', // ⚡ 360p progresivo (audio + video)
          '--no-playlist',
          '--no-warnings',
          '--quiet',
          '-o', tmp,
          url
        ],
        { stdio: 'ignore' }
      )

      yt.on('close', code => code === 0 ? resolve() : reject())
      yt.on('error', reject)
    })

    if (!fs.existsSync(tmp)) {
      return reply('❌ No se pudo generar el video')
    }

    const video = fs.readFileSync(tmp)
    fs.unlinkSync(tmp)

    await sock.sendMessage(
      from,
      {
        video,
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('YTV ERROR:', e)
    reply('❌ Error al descargar el video')
  }
}

handler.command = ['ytv']
handler.tags = ['descargas']
handler.help = ['ytv <link>']
handler.menu = true
handler.group = false

export default handler
