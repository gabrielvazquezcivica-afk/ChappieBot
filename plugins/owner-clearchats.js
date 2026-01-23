export const handler = async (m, {
  sock,
  from,
  sender,
  owner,
  reply
}) => {

  // 🔒 SOLO OWNER
  const owners = owner?.jid || []
  if (!owners.includes(sender)) {
    return reply('❌ Solo el owner puede usar este comando')
  }

  await sock.sendMessage(from, {
    react: { text: '🧹', key: m.key }
  })

  let total = 0

  try {
    // Obtener chats directamente desde Baileys
    const chats = await sock.groupFetchAllParticipating()
      .then(groups => Object.keys(groups))
      .catch(() => [])

    // Limpiar chats privados abiertos
    const recentChats = sock.chats || {}

    for (const jid of Object.keys(recentChats)) {
      await sock.chatModify(
        { clear: { messages: true } },
        jid
      )
      total++
    }

    // Limpiar grupos detectados
    for (const jid of chats) {
      await sock.chatModify(
        { clear: { messages: true } },
        jid
      )
      total++
    }

    await reply(`🧹 Chats limpiados: *${total}*`)

  } catch (e) {
    console.error(e)
    reply('❌ No se pudieron limpiar los chats')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.menu = true

export default handler
