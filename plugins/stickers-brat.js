import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Ejemplo: .brat Hola mundo')

  const tmpImg = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpWebp = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)

  // limpiar texto
  const safeText = text.replace(/:/g, '').replace(/"/g, '')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // crear imagen
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-f', 'lavfi',
        '-i', 'color=c=black:s=512x512',
        '-vf',
        `drawtext=fontfile=/system/fonts/Roboto-Regular.ttf:text='${safeText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=10:wrap=1`,
        '-frames:v', '1',
        tmpImg
      ])
      ff.on('close', code => code === 0 ? resolve() : reject())
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
      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    const sticker = fs.readFileSync(tmpWebp)

    await sock.sendMessage(from, { sticker }, { quoted: m })
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

    fs.unlinkSync(tmpImg)
    fs.unlinkSync(tmpWebp)

  } catch (e) {
    console.error(e)
    reply('❌ Error generando sticker brat')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
