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

  // 📌 Obtener participantes del grupo
  const metadata = await sock.groupMetadata(from)
  const users = metadata.participants
    .map(p => p.id)
    .filter(jid => jid !== sock.user?.id)

  if (users.length < 2) {
    return reply('❌ No hay suficientes miembros para formar pareja')
  }

  // 🎲 Elegir 2 personas aleatorias
  const shuffled = users.sort(() => Math.random() - 0.5)
  const pareja = shuffled.slice(0, 2)

  const u1 = pareja[0]
  const u2 = pareja[1]

  // 💞 Reacción
  await sock.sendMessage(from, {
    react: { text: '💘', key: m.key }
  })

  const texto = `
💍 *NUEVA PAREJA FORMADA* 💍

💖 @${u1.split('@')[0]} ❤️ @${u2.split('@')[0]}

> El bot no se equivoca… o tal vez sí 😏
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      mentions: [u1, u2]
    },
    { quoted: m }
  )
}

// 📋 CONFIG
handler.command = ['formarparej']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
