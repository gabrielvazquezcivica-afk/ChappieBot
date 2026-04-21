import { spawn } from 'child_process'
import fs from 'fs'
import { Sticker } from 'wa-sticker-formatter'

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
    const img = `./tmp/${base}.png`
    const vid = `./tmp/${base}.mp4`

    // 🔥 crear imagen brat (fondo blanco + texto negro)
    const ff1 = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=white:s=512x512:d=1',
      '-vf',
      `drawtext=fontfile=/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text}':fontcolor=black:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-frames:v', '1',
      img
    ])

    ff1.on('close', () => {

      // 🎬 animación tipo brat (zoom)
      const ff2 = spawn('ffmpeg', [
        '-loop', '1',
        '-i', img,
        '-vf', "zoompan=z='min(zoom+0.002,1.2)':d=60,scale=512:512",
        '-t', '2',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        vid
      ])

      ff2.on('close', async () => {

        const buffer = fs.readFileSync(vid)

        const sticker = new Sticker(buffer, {
          pack: 'ChappieBot',
          author: 'BratVid',
          type: 'full',
          quality: 70
        })

        await sock.sendMessage(from, {
          sticker: await sticker.toBuffer()
        }, { quoted: m })

        fs.unlinkSync(img)
        fs.unlinkSync(vid)

        await sock.sendMessage(from, {
          react: { text: '🔥', key: m.key }
        })

      })

    })

  } catch (e) {
    console.log('BRATVID ERROR:', e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error creando sticker')
  }
}

handler.command = ['bratvid']
handler.tags = ['stickers']
handler.help = ['bratvid <texto>']
handler.group = true

export default handler
