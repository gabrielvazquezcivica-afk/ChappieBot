import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const FONT = '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf'

function wrapText(text, max = 22) {
  const words = text.split(' ')
  let lines = []
  let line = ''

  for (let word of words) {
    if ((line + word).length > max) {
      lines.push(line.trim())
      line = ''
    }
    line += word + ' '
  }
  if (line) lines.push(line.trim())
  return lines.join('\n')
}

/* ───── PNG → WEBP (STICKER) ───── */
async function createSticker(text) {
  const cleanText = wrapText(text)
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')

  const tmpImg = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpWebp = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)

  // Imagen (estilo meme blanco)
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=white:s=512x512',
      '-vf',
      `drawtext=fontfile=${FONT}:text='${cleanText}':fontcolor=black:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=10`,
      '-frames:v', '1',
      tmpImg
    ], { stdio: 'ignore' })

    ff.on('close', code => code === 0 ? resolve() : reject())
  })

  // PNG → WEBP (sticker)
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpImg,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512',
      '-lossless', '1',
      '-preset', 'picture',
      '-an',
      '-loop', '0',
      tmpWebp
    ], { stdio: 'ignore' })

    ff.on('close', code => code === 0 ? resolve() : reject())
  })

  const buffer = fs.readFileSync(tmpWebp)
  fs.unlinkSync(tmpImg)
  fs.unlinkSync(tmpWebp)
  return buffer
}

/* ───── COMANDO BRAT ───── */
export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Escribe un texto\nEjemplo: .brat hola mundo')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    const sticker = await createSticker(text)

    await sock.sendMessage(from, { sticker }, { quoted: m })
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('BRAT ERROR:', e)
    reply('❌ Error al crear el sticker')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
