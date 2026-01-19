import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from, sender, reply, isGroup, isAdmin }) => {
  const botName = sock.user?.name || 'ChappieBot'

  // ───── 🔒 MODO ADMIN SILENCIOSO ─────
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  // ─────────────────────────────────────

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage
  const msg =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    quoted?.imageMessage ||
    quoted?.videoMessage ||
    quoted?.viewOnceMessageV2?.message?.imageMessage ||
    quoted?.viewOnceMessageV2?.message?.videoMessage

  if (!msg) return reply('❌ Responde a una imagen o video')

  const isVideo = !!msg.seconds
  if (isVideo && msg.seconds > 10) return reply('❌ El video debe durar máximo 10 segundos')

  let input, output
  try {
    // ───── 📥 DESCARGAR MEDIA ─────
    const type = isVideo ? 'video' : 'image'
    const stream = await downloadContentFromMessage(msg, type)

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const tmp = os.tmpdir()
    input = path.join(tmp, `stk_in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
    output = path.join(tmp, `stk_out_${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    // ───── 🛠 FFMPEG ─────
    await new Promise((resolve, reject) => {
      let args
      if (isVideo) {
        // Video -> sticker animado (.webp)
        args = [
          '-i', input,
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x00000000,fps=15',
          '-loop', '0',
          '-preset', 'default',
          '-an',
          '-vsync', '0',
          output
        ]
      } else {
        // Imagen -> sticker estático
        args = [
          '-i', input,
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x00000000',
          output
        ]
      }

      const ff = spawn('ffmpeg', args)
      ff.on('error', reject)
      ff.on('close', code => (code === 0 ? resolve() : reject(new Error('FFmpeg falló'))))
    })

    // ───── 📤 ENVIAR STICKER ─────
    await sock.sendMessage(
      from,
      {
        sticker: fs.readFileSync(output),
        mimetype: 'image/webp',
        packname: botName,
        author: botName
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('STICKER ERROR:', e)
    reply('❌ Error al crear el sticker')
  } finally {
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['s'']
handler.tags = ['stickers']
handler.menu = true
handler.group = false

export default handler
