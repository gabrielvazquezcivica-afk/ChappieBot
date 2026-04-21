import { spawn } from 'child_process'
import fs from 'fs'

const modoadminPath = './data/modoadmin.json'

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender,
  owner
}) => {

  /* ───── 👑 MODO ADMIN ───── */
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

      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ───────────────────────── */

  const text = args.join(' ')
  if (!text) return reply('❌ Ejemplo: .bratvid hola grupo')

  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  try {

    const base = Date.now()
    const output = `./tmp/${base}.webp`

    // 🔥 TODO EN UNO (imagen + animación → webp)
    const ffmpeg = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=white:s=512x512:d=2',
      '-vf',
      `drawtext=fontfile=/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text}':fontcolor=black:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2,zoompan=z='min(zoom+0.002,1.2)':d=80`,
      '-vcodec', 'libwebp',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      output
    ])

    ffmpeg.on('close', async (code) => {

      if (code !== 0) {
        return reply('❌ Error creando sticker')
      }

      await sock.sendMessage(from, {
        sticker: fs.readFileSync(output)
      }, { quoted: m })

      fs.unlinkSync(output)

      await sock.sendMessage(from, {
        react: { text: '🔥', key: m.key }
      })

    })

  } catch (e) {
    console.log('BRATVID ERROR:', e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error')
  }
}

handler.command = ['bratvid']
handler.tags = ['stickers']
handler.help = ['bratvid <texto>']
handler.group = true

export default handler
