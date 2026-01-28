import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { spawn } from 'child_process'
import os from 'os'

/* ───── FUNCIÓN: PNG → WEBP (STICKER) ───── */
async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `logo_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `logo_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg falló')))
    ff.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return result
}

/* ───── HANDLER LOGOS ───── */
export const handler = async (m, { sock, from, isGroup, sender, reply, args, command }) => {

  /* ───── MODO ADMIN SILENCIOSO ───── */
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
    if (!isAdmin) return // 🚫 silencioso
  }

  const text = args.join(' ').trim()
  if (!text) return reply(`❌ Uso correcto: .${command} <texto>`)

  // Reacción inicial
  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // ───── API DE LOGOS ─────
    const apiUrl = `https://api.xteam.xyz/textpro?theme=${command}&text=${encodeURIComponent(text)}`
    const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })

    if (!res.data || !res.data.byteLength) {
      throw new Error('Respuesta vacía')
    }

    const sticker = await createSticker(res.data)

    await sock.sendMessage(from, { sticker }, { quoted: m })

    // Reacción final
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ No se pudo generar el logo. Intenta otro texto o comando.')
  }
}

/* ───── CONFIGURACIÓN DEL HANDLER ───── */
handler.command = [
  'neon', '3d', 'flame', 'metal', 'glitch', 'holographic', 'joker', 'sketch', 'whitegold', 'lava'
]
handler.tags = ['logos']
handler.help = handler.command.map(c => `${c} <texto>`)
handler.menu = true
handler.group = false

export default handler
