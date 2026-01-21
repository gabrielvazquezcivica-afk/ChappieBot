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
╭━━━〔 🎮 6 VS 6 〕━━━╮

👥 *JUGADORES*
1️⃣ —
2️⃣ —
3️⃣ —
4️⃣ —
5️⃣ —
6️⃣ —

🪑 *SUPLENTES*
7️⃣ —
8️⃣ —
9️⃣ —
🔟 —
1️⃣1️⃣ —
1️⃣2️⃣ —

📌 *Notas:*
• Respeta tu lugar
• Admin organiza el match

╰━━━〔 🤖 ChappieBot 〕━━━╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['6vs6']
handler.tags = ['ff']
handler.help = ['6vs6']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
