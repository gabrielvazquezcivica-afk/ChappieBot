import fs from 'fs'
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  isGroup
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
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */


  /* ───── 🎧 DETECTAR AUDIO RESPONDIDO (FIX REAL) ───── */
  const quoted =
    m.quoted ||
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage

  const audioMsg =
    quoted?.message?.audioMessage ||
    quoted?.audioMessage ||
    quoted?.msg?.audioMessage

  if (!audioMsg) {
    return reply('🎧 Responde a una *nota de voz o audio* para identificar la canción')
  }
  /* ─────────────────────────────────────────────── */


  await sock.sendMessage(from, {
    react: { text: '🎶', key: m.key }
  })


  /* ───── ⬇️ DESCARGAR AUDIO ───── */
  let buffer
  try {
    buffer = await sock.downloadMediaMessage(
      { message: { audioMessage: audioMsg } }
    )
  } catch {
    return reply('❌ No pude descargar el audio')
  }

  if (!buffer) return reply('❌ Audio inválido')


  /* ───── 🔍 IDENTIFICAR CANCIÓN (ACRCloud / similar) ───── */
  try {
    const res = await fetch('https://api.audd.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: 'test', // ← puedes poner tu API real
        audio: buffer.toString('base64'),
        return: 'apple_music,spotify'
      })
    })

    const json = await res.json()

    if (!json.result) {
      return reply('❌ No se pudo identificar la canción')
    }

    const song = json.result

    const text = `
╭─〔 🎵 CANCIÓN IDENTIFICADA 〕
│ 🎶 Título : ${song.title}
│ 👤 Artista: ${song.artist}
│ 💽 Álbum  : ${song.album || 'Desconocido'}
│ ⏱ Duración: ${song.duration || 'N/A'}s
╰─〔 🤖 ChappieBot 〕
`.trim()

    await reply(text)

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error(e)
    reply('❌ Error al identificar la canción')
  }
}

handler.command = ['whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
