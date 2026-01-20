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

  // 📌 Obtener menciones
  const mentions =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  let user1, user2

  if (mentions.length >= 2) {
    user1 = mentions[0]
    user2 = mentions[1]
  } else if (mentions.length === 1) {
    user1 = sender
    user2 = mentions[0]
  } else {
    return reply('💍 Usa el comando así:\n.casar @persona\n.casar @persona1 @persona2')
  }

  // 💞 Reacción
  await sock.sendMessage(from, {
    react: { text: '💍', key: m.key }
  })

  const name1 = user1.split('@')[0]
  const name2 = user2.split('@')[0]

  const texto = `
💒 *¡BODA CONFIRMADA!*

💍 *@${name1}* y *@${name2}*
han sido oficialmente casados 🥂✨

💖 Que dure más que sus datos móviles
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [user1, user2]
    },
    { quoted: m }
  )
}

handler.command = ['casar']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
