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

  const safeText = text
    .replace(/:/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\n/g, ' ')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // IMAGEN BLANCA CON TEXTO NEGRO
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'color=c=white:s=512x512',
        '-vf',
        `drawtext=fontfile=${FONT}:text='${safeText}':fontcolor=black:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=12`,
        '-frames:v', '1',
        tmpImg
      ], { stdio: 'ignore' }) // 👈 SILENCIA FFMPEG

      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    // CONVERTIR A STICKER
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
      ], { stdio: 'ignore' }) // 👈 SILENCIA FFMPEG

      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    const sticker = fs.readFileSync(tmpWebp)

    await sock.sendMessage(from, { sticker }, { quoted: m })
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

    fs.unlinkSync(tmpImg)
    fs.unlinkSync(tmpWebp)

  } catch (e) {
    reply('❌ Error creando el sticker')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
