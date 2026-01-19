import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
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

  /* ───── 🔎 STICKER RESPONDIDO ───── */
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (!quoted || !quoted.stickerMessage) {
    return reply('🖼️ Responde a un *sticker* para convertirlo en imagen')
  }

  // 🎯 Reacción al iniciar
  await sock.sendMessage(from, { react: { text: '🖼️', key: m.key } })

  let input, output

  try {
    /* ───── 📥 DESCARGAR STICKER ───── */
    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    /* ───── 📂 TEMPORALES ───── */
    const tmp = os.tmpdir()
    input = path.join(tmp, `toimg_${Date.now()}.webp`)
    output = path.join(tmp, `toimg_${Date.now()}.png`)
    fs.writeFileSync(input, buffer)

    /* ───── 🔄 CONVERTIR WEBP → PNG ───── */
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ['-y', '-i', input, output])
      ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg falló')))
      ffmpeg.on('error', reject)
    })

    /* ───── 📤 ENVIAR IMAGEN ───── */
    await sock.sendMessage(
      from,
      { image: fs.readFileSync(output), caption: '🖼️ Sticker convertido a imagen' },
      { quoted: m }
    )

    // 🎯 Reacción final
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('TOIMG ERROR:', e)
    reply('❌ Error al convertir el sticker')

  } finally {
    /* ───── 🧹 LIMPIEZA ───── */
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['toimg']
handler.help = ['toimg (responde a un sticker)']
handler.tags = ['stickers']
handler.menu = true
handler.group = false

export default handler
