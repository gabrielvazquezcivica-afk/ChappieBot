export const handler = async (m, {
  sock,
  from,
  isGroup,
  isAdmin,
  reply
}) => {

  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 🔒 Solo administradores
  if (!isAdmin) {
    return reply('🚫 Solo los *administradores* pueden crear la lista')
  }

  // 🥷 Reacción
  await sock.sendMessage(from, {
    react: { text: '🥷', key: m.key }
  })

  const text = `
╭━━━━〔 🥷 20 VS 20 〕━━━━╮

👑
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
───────

👑
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
───────

👑
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
───────

👑
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
───────

🪑 *SUPLENTES*
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —
🥷 —

╰━━━━〔 🤖 ChappieBot 〕━━━━╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['20vs20']
handler.tags = ['ff']
handler.help = ['20vs20']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
