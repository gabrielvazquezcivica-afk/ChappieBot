import fs from 'fs'

const frases = [
  "Te vi nacer y aún así nadie te quiere.",
  "Si fueras menos adoptado, serías normal.",
  "Eres como un Wi-Fi sin señal, inútil en todos lados.",
  "Hasta tu sombra te ignora.",
  "Si la vida fuera justa, no existirías.",
  "Te adoptaron para que alguien tenga compasión.",
  "Tu existencia es como un bug, nadie sabe para qué sirve.",
  "Hasta el perro de la vecina es más respetable que tú.",
  "Eres el equivalente humano de un error 404.",
  "Tu mamá adoptiva llora en secreto cada noche por ti."
]

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
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

  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  }

  if (!who) return reply('❌ Debes mencionar o responder a alguien')

  // 🎲 Frase aleatoria
  const frase = frases[Math.floor(Math.random() * frases.length)]

  const texto = `
${frase}
> @${who.split('@')[0]} Inservible 😂
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

handler.command = ['adoptado']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
