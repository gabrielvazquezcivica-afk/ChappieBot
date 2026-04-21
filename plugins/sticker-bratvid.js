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

  /* ───── 👑 MODO ADMIN (CHAPPIEBOT) ───── */
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
  /* ─────────────────────────────────── */

  const text = args.join(' ')
  if (!text) return reply('❌ Escribe un texto\nEjemplo: .bratvid hola grupo')

  // ⚡ reacción inicio
  await sock.sendMessage(from, {
    react: { text: '🖤', key: m.key }
  })

  try {

    const input = `./tmp/${Date.now()}.png`
    const output = `./tmp/${Date.now()}.webp`

    // 🧠 CREAR IMAGEN (fondo blanco + texto negro)
    const ffmpeg1 = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', `color=c=white:s=512x512:d=2`,
      '-vf',
      `drawtext=fontfile=/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text}':fontcolor=black:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-frames:v', '1',
      input
    ])

    ffmpeg1.on('close', () => {

      // 🎬 ANIMACIÓN BRAT (zoom)
      const ffmpeg2 = spawn('ffmpeg', [
        '-loop', '1',
        '-i', input,
        '-vf',
        "scale=512:512,zoompan=z='min(zoom+0.002,1.15)':d=80",
        '-t', '2',
        '-vcodec', 'libwebp',
        '-lossless', '1',
        '-qscale', '80',
        '-preset', 'default',
        '-an',
        '-vsync', '0',
        output
      ])

      ffmpeg2.on('close', async () => {

        await sock.sendMessage(from, {
          sticker: fs.readFileSync(output)
        }, { quoted: m })

        fs.unlinkSync(input)
        fs.unlinkSync(output)

        // ✅ reacción final
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
