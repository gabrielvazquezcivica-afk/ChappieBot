import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  const botName = sock.user?.name || 'ChappieBot'

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

  /* ───── DETECTAR MEDIA RESPONDIDA ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  const qmsg = quoted?.quotedMessage

  const msg =
    m.message?.imageMessage ||
    m.message?.videoMessage ||
    qmsg?.imageMessage ||
    qmsg?.videoMessage ||
    qmsg?.viewOnceMessageV2?.message?.imageMessage ||
    qmsg?.viewOnceMessageV2?.message?.videoMessage

  if (!msg) return reply('❌ Responde a una imagen o video válido')

  const isVideo = !!msg.seconds
  if (isVideo && msg.seconds > 10) return reply('❌ El video debe durar máximo 10 segundos')

  let input, output

  try {
    /* ───── REACCIÓN INICIAL ───── */
    await sock.sendMessage(from, { react: { text: '⏳', key: m.key } }) // reloj mientras procesa

    /* ───── DESCARGAR MEDIA ───── */
    const type = isVideo ? 'video' : 'image'
    const stream = await downloadContentFromMessage(msg, type)

    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const tmp = os.tmpdir()
    input = path.join(tmp, `stk_in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
    output = path.join(tmp, `stk_out_${Date.now()}.webp`)
    fs.writeFileSync(input, buffer)

    /* ───── PROCESAR CON FFMPEG ───── */
    await new Promise((resolve, reject) => {
      const args = isVideo
        ? [
            '-i', input,
            '-vf',
            'scale=512:512:force_original_aspect_ratio=decrease,' +
            'pad=512:512:-1:-1:color=0x00000000,' +
            'fps=15,format=rgba,setsar=1',
            '-loop', '0',
            '-t', '10',
            '-preset', 'default',
            '-an',
            '-vsync', '0',
            output
          ]
        : [
            '-i', input,
            '-vf',
            'scale=512:512:force_original_aspect_ratio=decrease,' +
            'pad=512:512:-1:-1:color=0x00000000',
            output
          ]

      const ff = spawn('ffmpeg', args)
      ff.on('error', reject)
      ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg falló')))
    })

    /* ───── ENVIAR STICKER ───── */
    await sock.sendMessage(
      from,
      { sticker: fs.readFileSync(output) },
      { quoted: m }
    )

    /* ───── REACCIÓN FINAL ───── */
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } }) // check cuando termina

  } catch (e) {
    console.error('STICKER ERROR:', e)
    reply('❌ Error al crear el sticker')
  } finally {
    try { if (input) fs.unlinkSync(input) } catch {}
    try { if (output) fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['s']
handler.tags = ['stickers']
handler.menu = true
handler.group = false

export default handler
