import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (CHAPPIEBOT) ───── */
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
    if (!isAdmin) return // 🚫 silencioso
  }
  /* ───────────────────────────────────────────── */

  // 🔗 Validar link
  const url = args[0]
  if (!url) return reply('❌ Usa:\n.fb <link de Facebook>')

  // 📘 Reacción inicial
  await sock.sendMessage(from, {
    react: { text: '📘', key: m.key }
  })

  const file = path.join(os.tmpdir(), `fb_${Date.now()}.mp4`)

  try {
    // ⬇️ Descargar video con yt-dlp
    await new Promise((resolve, reject) => {
      const p = spawn('yt-dlp', [
        '-f', 'mp4',
        '-o', file,
        url
      ])
      p.on('close', code => code === 0 ? resolve() : reject())
      p.on('error', reject)
    })

    const video = fs.readFileSync(file)
    fs.unlinkSync(file)

    // 📤 Enviar video
    await sock.sendMessage(
      from,
      {
        video,
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

    // ✅ Reacción final
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('FB ERROR:', e)
    reply('❌ Error descargando el video')
  }
}

handler.command = ['fb']
handler.tags = ['descargas']
handler.help = ['fb <link>']
handler.menu = true

export default handler
