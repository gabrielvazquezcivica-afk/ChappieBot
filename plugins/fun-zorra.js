import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

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
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }
    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  // 📌 Detectar mención o respuesta
  let who = null

  // Mención directa
  const mentions =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  if (mentions.length) {
    who = mentions[0]
  }
  // Respuesta a mensaje
  else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!who) {
    return reply('❌ Debes mencionar o responder a alguien')
  }

  // 🎯 Porcentaje aleatorio
  const porcentaje = Math.floor(Math.random() * 101)

  const texto = `
🦊 *DETECTOR DE ZORRAS ACTIVADO* 🦊

@${who.split('@')[0]} eres más zorra que tu madre 🤡

> Nivel de zorr@detectado: *${porcentaje}%*
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [who]
    },
    { quoted: m }
  )
}

// 📋 CONFIG
handler.command = ['zorra']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
