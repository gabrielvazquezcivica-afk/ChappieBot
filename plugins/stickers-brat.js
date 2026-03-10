import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpBg = path.join(os.tmpdir(), `brat_bg_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  // ───── Crear fondo blanco y superponer la imagen ─────
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'color=c=white:s=512x512:d=1',
      '-i', tmpIn,
      '-filter_complex', 'overlay=(W-w)/2:(H-h)/2',
      '-y',
      tmpBg
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ff.on('error', reject)
  })

  // ───── Convertir a WEBP para sticker ─────
  await new Promise((resolve, reject) => {
    const ff2 = spawn('ffmpeg', [
      '-i', tmpBg,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff2.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ff2.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpBg)
  fs.unlinkSync(tmpOut)
  return result
}

export const handler = async (m, { sock, from, reply, args }) => {
  const text = args.join(' ').trim()
  if (!text) return reply('❌ Escribe un texto\nEjemplo: `.brat Hola mundo`')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    const res = await axios.get('https://kepolu-brat.hf.space/brat', {
      params: { q: text },
      responseType: 'arraybuffer'
    })
    if (!res.data || !res.data.byteLength) throw new Error('Respuesta vacía')

    const sticker = await createSticker(res.data)

    await sock.sendMessage(from, { sticker }, { quoted: m })
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
