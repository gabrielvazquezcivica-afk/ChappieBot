import config from '../config.js'

export const handler = async (m, {
  sock,
  from,
  sender,
  reply
}) => {

  // 🔒 SOLO OWNER (desde config)
  const owners = (config.owner || []).map(v => v + '@s.whatsapp.net')
  if (!owners.includes(sender)) {
    return reply('❌ Solo el owner puede usar este comando')
  }

  await sock.sendMessage(from, {
    react: { text: '🧹', key: m.key }
  })

  let total = 0

  try {
    // Chats cargados en memoria
    const chats = Object.keys(sock.chats || {})

    for (const jid of chats) {
      await sock.chatModify(
        { clear: { messages: true } },
        jid
      )
      total++
    }

    await reply(`🧹 Conversaciones vaciadas: *${total}*`)

  } catch (e) {
    console.error(e)
    reply('❌ Error al limpiar los chats')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.menu = true

export default handler
