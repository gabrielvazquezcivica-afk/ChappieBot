import fs from 'fs'

const frases = [
  'ni con lupa aparece',
  'eso no califica ni como intento',
  'la evolución se rindió contigo',
  'ni la biología te defendió',
  'pareces Ken versión económica',
  'ni la testosterona quiso ayudar',
  'eso es ausencia, no tamaño',
  'ni el espejo lo registra',
  'ni la imaginación coopera',
  'parece error de fábrica',
  'ni la pubertad hizo checkpoint',
  'eso no cuenta como equipo',
  'ni en modo difícil aparece',
  'ni el censo lo detecta',
  'ni el instinto lo busca',
  'eso es mito urbano',
  'ni con fe se materializa',
  'ni el viento lo presume'
]

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

  // 📌 Mención o respuesta
  let who = null
  const mentions =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  if (mentions.length) {
    who = mentions[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!who) return reply('❌ Debes mencionar o responder a alguien')

  const frase = frases[Math.floor(Math.random() * frases.length)]

  const texto = `
@${who.split('@')[0]} no tienes pito 💀

> ${frase}
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
handler.command = ['sinpito']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
