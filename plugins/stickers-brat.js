import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

/* ───── FUNCIÓN: PNG → WEBP (STICKER) ───── */
async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  // FFmpeg: fondo blanco + overlay + webp
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vf', 'format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white',
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      '-y',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ff.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return result
}

/* ───── COMANDO BRAT ───── */
export const handler = async (m, { sock, from, isGroup, sender, reply, args }) => {

  // 🔒 Modo admin silencioso (opcional)
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminData[from] || { enabled: false }
  }
  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}
    if (!isAdmin) return
  }

  const text = args.join(' ').trim()
  if (!text) return reply('❌ Escribe un texto\nEjemplo: `.brat Hola mundo`')

  // 🎨 Reacción inicial
  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // 🔹 Llamada a la API del generador Brat
    const res = await axios.get('https://kepolu-brat.hf.space/brat', {
      params: { q: text },
      responseType: 'arraybuffer'
    })

    if (!res.data || !res.data.byteLength) throw new Error('Respuesta vacía')

    // 🔹 Crear sticker con fondo blanco y letras negras
    const sticker = await createSticker(res.data)

    // 🔹 Enviar sticker
    await sock.sendMessage(from, { sticker }, { quoted: m })

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
