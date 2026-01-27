import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const FONT = '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans.ttf'

export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Ejemplo: .brat Hola mundo')

  const tmpImg = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpWebp = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)

  // limpiar texto para ffmpeg
  const safeText = text
    .replace(/:/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // crear imagen
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'color=c=black:s=512x512',
        '-vf',
        `drawtext=fontfile=${FONT}:text='${safeText}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=10:wrap=1`,
        '-frames:v', '1',
        tmpImg
      ])

      ff.stderr.on('data', d => console.log('ffmpeg:', d.toString()))
      ff.on('close', code => code === 0 ? resolve() : reject('ffmpeg error'))
    })

    // convertir a sticker
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-i', tmpImg,
        '-vcodec', 'libwebp',
        '-vf', 'scale=512:512',
        '-lossless', '1',
        '-preset', 'default',
        '-an',
        '-vsync', '0',
        tmpWebp
      ])

      ff.stderr.on('data', d => console.log('webp:', d.toString()))
      ff.on('close', code => code === 0 ? resolve() : reject('webp error'))
    })

    const sticker = fs.readFileSync(tmpWebp)

    await sock.sendMessage(from, { sticker }, { quoted: m })
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

    fs.unlinkSync(tmpImg)
    fs.unlinkSync(tmpWebp)

  } catch (e) {
    console.error('BRAT ERROR:', e)
    reply('❌ Error generando sticker brat')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
