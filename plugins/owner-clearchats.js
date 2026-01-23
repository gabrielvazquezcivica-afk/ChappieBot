import config from '../config.js'

// ───── HELPERS ─────
function onlyNumber (jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, {
  sock,
  sender,
  reply
}) => {

  // 👑 Validar OWNER
  const owners = config.owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply('🔒 Este comando es solo para el *OWNER* del bot')
  }

  // ⏳ Reacción inicio
  await sock.sendMessage(m.chat, {
    react: { text: '🧹', key: m.key }
  })

  let total = 0

  try {
    const chats = Object.keys(sock.store.chats || {})

    for (const jid of chats) {
      await sock.chatModify(
        { clear: { messages: [] } },
        jid
      )
      total++
    }

    await sock.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

    reply(
`╭─〔 🧹 LIMPIEZA COMPLETA 〕
│ ✔️ Chats limpiados: ${total}
│ 🤖 Historial del bot reiniciado
╰─〔 CHAPPIEBOT 〕`
    )

  } catch (e) {
    console.error(e)
    reply('❌ Ocurrió un error al limpiar los chats')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.menu = true
handler.owner = true

export default handler
