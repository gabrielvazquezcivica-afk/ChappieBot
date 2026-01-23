import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

export const handler = async (m, {
  sock,
  from,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
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

  // ───── VALIDAR AUDIO RESPONDIDO ─────
  const quoted = m.quoted
  const msg = quoted?.message || {}

  const isAudio =
    msg.audioMessage ||
    quoted?.mimetype?.includes('audio')

  if (!quoted || !isAudio) {
    return reply('🎧 Responde a una *nota de voz o audio* para identificar la canción')
  }

  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })

  // ───── DESCARGAR AUDIO ─────
  let buffer
  try {
    buffer = await quoted.download()
  } catch {
    return reply('❌ No pude descargar el audio')
  }

  if (!buffer) return reply('❌ Audio inválido')

  // ───── GUARDAR TEMPORAL ─────
  const tmpDir = './tmp'
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const filePath = path.join(tmpDir, `${Date.now()}.ogg`)
  fs.writeFileSync(filePath, buffer)

  try {
    // ───── ENVIAR A LA API ─────
    const form = new FormData()
    form.append('media', fs.createReadStream(filePath))

    const res = await fetch('https://api.ananta.qzz.io/api/whatmusic', {
      method: 'POST',
      headers: {
        'x-api-key': 'ant2wpyf85ga6'
      },
      body: form
    })

    const json = await res.json()

    if (!json?.result) throw new Error('Sin resultado')

    const r = json.result

    const text = `
╭─〔 🎵 CANCIÓN IDENTIFICADA 〕
│ 🎶 ${r.title || 'Desconocido'}
│ 👤 ${r.artist || 'Desconocido'}
│ 💿 ${r.album || 'N/A'}
│ ⏱ ${r.duration || 'N/A'}
│
│ 🔗 YouTube:
│ ${r.youtube || 'No disponible'}
╰─〔 🤖 ChappieBot 〕
`.trim()

    await reply(text)

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ No pude identificar la canción')
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

handler.command = ['whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
