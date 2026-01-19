import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

// ───── FUNCIÓN PARA CREAR STICKER ─────
async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `${Date.now()}.webp`)
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

// ───── COMANDO QC ─────
export const handler = async (m, {
  sock,
  from,
  args,
  isGroup,
  sender,
  reply,
  owner
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
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
    } catch { isAdmin = false }
    if (!isAdmin) return // silencioso para no-admins
  }
  /* ─────────────────────────────────── */

  /* ───── TEXTO QC ───── */
  let text = args.join(' ').trim()
  if (!text && m.quoted?.text) text = m.quoted.text
  if (!text) return reply('❌ Escribe un texto para el QC.\nEjemplo: `.qc Hola mundo`')
  if (text.length > 30) return reply('❌ El texto no puede tener más de 30 caracteres.')

  // ───── NOMBRE REAL ─────
  const name =
    m.pushName ||
    (isGroup
      ? (await sock.groupMetadata(from))
          .participants
          .find(p => p.id === sender)?.name
      : null) ||
    sender.split('@')[0]

  // ───── FOTO REAL ─────
  const avatar = await sock.profilePictureUrl(sender, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')

  try {
    // 🔹 REACCIÓN INICIAL
    await sock.sendMessage(from, { react: { text: '🖌️', key: m.key } })

    // 🔹 GENERAR QC EN PNG
    const body = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#0f0f0f',
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        avatar: true,
        from: {
          id: 1,
          name,
          photo: { url: avatar }
        },
        text,
        replyMessage: {}
      }]
    }

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    )

    if (!res.data?.result?.image) throw 'Respuesta inválida de la API'

    // 🔹 CREAR STICKER
    const buffer = Buffer.from(res.data.result.image, 'base64')
    const sticker = await createSticker(buffer)

    await sock.sendMessage(from, { sticker }, { quoted: m })

    // 🔹 REACCIÓN FINAL
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('QC ERROR:', e)
    reply('❌ Error al generar el QC.')
  }
}

handler.command = ['qc']
handler.tags = ['stickers']
handler.help = ['qc <texto>']
handler.menu = true
handler.group = false

export default handler
