export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  isAdmin,
  reply
}) => {

  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 🔒 Solo admins
  if (!isAdmin) {
    return reply('🚫 Solo los *administradores* pueden crear la lista')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '🎮', key: m.key }
  })

  const text = `
╭━━━〔 🎮 4 VS 4 〕━━━╮

👥 *JUGADORES*
1️⃣ —
2️⃣ —
3️⃣ —
4️⃣ —

🪑 *SUPLENTES*
5️⃣ —
6️⃣ —
7️⃣ —
8️⃣ —

📌 *Notas:*
• Respeta tu lugar
• Admin organiza el match

╰━━━〔 🤖 ChappieBot 〕━━━╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['4vs4']
handler.tags = ['ff']
handler.help = ['4vs4']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
