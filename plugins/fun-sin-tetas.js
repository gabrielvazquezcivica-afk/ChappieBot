import fs from 'fs'

const frases = [
  'ni la pubertad se acordó de ti',
  'eres tabla premium edición limitada',
  'ni con fe aparecen',
  'el brasier ya se jubiló contigo',
  'ni en tus sueños crecen',
  'pareces pared recién repellada',
  'ni el espejo te miente',
  'plano nivel arquitecto',
  'ni con inflación suben',
  'ni el viento encuentra algo',
  'ni con Photoshop Pro',
  'ni tu sombra los detecta',
  'ni la gravedad los reconoce',
  'pareces mesa de billar',
  'ni en otra vida',
  'ni la esperanza insiste',
  'eres el terror de los sostenes',
  'ni los milagros te ayudan'
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
    if (!isAdmin) return // bloqueo silencioso
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
@${who.split('@')[0]} ni tetas tienes 😂

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
handler.command = ['sintetas']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
