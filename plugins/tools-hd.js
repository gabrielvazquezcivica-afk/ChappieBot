import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (isGroup && groupSettings.enabled) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  /* ───── 🔎 DETECTAR IMAGEN (ROBUSTO) ───── */
  const quoted =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo

  const qmsg = quoted?.quotedMessage

  const imgMsg =
    m.message?.imageMessage ||
    qmsg?.imageMessage ||
    qmsg?.viewOnceMessageV2?.message?.imageMessage

  if (!imgMsg) {
    return reply('📸 Responde a una *imagen* para mejorarla en HD')
  }

  await sock.sendMessage(from, {
    react: { text: '✨', key: m.key }
  })

  let input, output

  try {
    /* ───── 📥 DESCARGAR IMAGEN ───── */
    const stream = await downloadContentFromMessage(imgMsg, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const tmp = os.tmpdir()
    input = path.join(tmp, `chappie_hd_in_${Date.now()}.jpg`)
    output = path.join(tmp, `chappie_hd_out_${Date.now()}.jpg`)
    fs.writeFileSync(input, buffer)

    /* ───── 🎨 MEJORA HD (FFMPEG) ───── */
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-i', input,
        '-vf',
        'eq=brightness=0.04:contrast=1.18:saturation=1.12,unsharp=5:5:1.3',
        '-q:v', '2',
        output
      ])

      ff.on('error', reject)
      ff.on('close', code => code === 0 ? resolve() : reject())
    })

    /* ───── 📤 ENVIAR RESULTADO ───── */
    await sock.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: '✨ Imagen mejorada en HD\n> 🤖 ChappieBot'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    reply('❌ No pude mejorar la imagen')
  } finally {
    try { fs.unlinkSync(input) } catch {}
    try { fs.unlinkSync(output) } catch {}
  }
}

handler.command = ['hd']
handler.tags = ['tools']
handler.menu = true

export default handler
