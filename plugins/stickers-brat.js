import fs from 'fs'
import path from 'path'
import os from 'os'
import { createCanvas, loadImage, registerFont } from 'canvas'

/* ───── 🖌 FUNCIÓN: TEXTO → STICKER WEBP ───── */
async function createStickerFromText(text) {
  const size = 512
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fondo blanco
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)

  // Letras negras, centradas y con word-wrap
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Fuente: puedes cambiar a la que quieras
  ctx.font = 'bold 48px Sans'

  // Función de word-wrap
  const words = text.split(' ')
  let line = ''
  const lines = []
  const maxWidth = size - 40
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim())
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line.trim())

  // Dibujar líneas centradas verticalmente
  const lineHeight = 50
  const totalHeight = lines.length * lineHeight
  let y = size / 2 - totalHeight / 2 + lineHeight / 2
  for (const l of lines) {
    ctx.fillText(l, size / 2, y)
    y += lineHeight
  }

  // Guardar como PNG temporal
  const tmpFile = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(tmpFile, buffer)

  // Convertir a WebP con ffmpeg
  const tmpWebp = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)
  await new Promise((resolve, reject) => {
    const { spawn } = require('child_process')
    const ff = spawn('ffmpeg', [
      '-i', tmpFile,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpWebp
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg falló')))
    ff.on('error', reject)
  })

  fs.unlinkSync(tmpFile)
  const result = fs.readFileSync(tmpWebp)
  fs.unlinkSync(tmpWebp)
  return result
}

/* ───── COMANDO BRAT ───── */
export const handler = async (m, { sock, from, args, reply }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Escribe un texto\nEjemplo: `.brat Hola mundo`')

  // ⏳ reacción inicial
  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    const sticker = await createStickerFromText(text)

    await sock.sendMessage(from, { sticker }, { quoted: m })

    // ✅ reacción final
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('BRAT ERROR:', e)
    reply('❌ Error al generar el sticker')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true
handler.group = false

export default handler
