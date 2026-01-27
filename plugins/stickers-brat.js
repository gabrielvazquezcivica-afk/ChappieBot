import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const FONT = '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf'

function wrapText(text, max = 20) {
  const words = text.split(' ')
  let lines = []
  let line = ''

  for (let w of words) {
    if ((line + w).length > max) {
      lines.push(line.trim())
      line = ''
    }
    line += w + ' '
  }
  if (line) lines.push(line.trim())
  return lines.join('\n')
}

async function createSticker(text) {
  const safeText = wrapText(text).replace(/:/g, '\\:').replace(/'/g, "\\'")
  const tmpImg = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpWebp = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=black:s=512x512',
      '-vf',
      `drawtext=fontfile=${FONT}:text='${safeText}':fontcolor=white:borderw=4:bordercolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=12`,
      '-frames:v', '1',
      tmpImg
    ], { stdio: 'ignore' })

    ff.on('close', code => code === 0 ? resolve() : reject())
  })

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

export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Usa: .brat texto')

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
handler.tags = ['sticker']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
