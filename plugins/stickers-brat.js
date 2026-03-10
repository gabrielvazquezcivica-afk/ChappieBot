import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

/* ───── 🧷 FUNCIÓN: PNG → WEBP (STICKER) ───── */
async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)
  const tmpProcessed = path.join(os.tmpdir(), `brat_processed_${Date.now()}.png`)
  fs.writeFileSync(tmpIn, buffer)

  // ───── Procesar con ffmpeg: letras negras, fondo blanco ─────
  await new Promise((resolve, reject) => {
    const ffProc = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vf',
      `colorchannelmixer=.0:.0:.0:0:.0:.0:.0:0:.0:.0:.0:0,format=rgba`,
      tmpProcessed
    ])
    ffProc.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ffProc.on('error', reject)
  })

  // ───── Convertir a WEBP para sticker ─────
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpProcessed,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ff.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpProcessed)
  fs.unlinkSync(tmpOut)
  return result
}

/* ───── COMANDO BRAT ───── */
export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  reply,
  args
}) => {

  const text = args.join(' ').trim()
  if (!text) {
    return reply('❌ Escribe un texto\nEjemplo: `.brat Hola mundo`')
  }

  // 🎯 Reacción al iniciar
  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // ───── Descargar imagen desde API ─────
    const res = await axios.get(
      'https://kepolu-brat.hf.space/brat',
      {
        params: { q: text },
        responseType: 'arraybuffer'
      }
    )

    if (!res.data || !res.data.byteLength) {
      throw new Error('Respuesta vacía')
    }

    const sticker = await createSticker(res.data)

    // ───── Enviar sticker ─────
    await sock.sendMessage(
      from,
      { sticker },
      { quoted: m }
    )

    // ✅ Reacción final
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
