import config from '../config.js'

function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, reply }) => {
  const senderJid = m.key?.participant || m.sender
  const senderNum = onlyNumber(senderJid)
  const ownerNums = Array.isArray(config.owner.numbers)
    ? config.owner.numbers.map(n => onlyNumber(n))
    : []

  if (!ownerNums.includes(senderNum)) {
    return reply('🚫 Solo el OWNER del bot puede usar este comando.')
  }

  try {
    await reply('🧹 Iniciando limpieza de todos los chats del bot...')

    // Iterar todos los chats
    const chats = Object.keys(sock.chats || {})
    for (const chat of chats) {
      const chatData = sock.chats[chat]
      if (!chatData || !chatData.messages) continue

      // Borrar todos los mensajes enviados por el bot
      for (const msgKey of Object.keys(chatData.messages)) {
        const msg = chatData.messages[msgKey]
        if (msg.key.fromMe) {
          try {
            await sock.sendMessage(chat, { delete: msg.key })
          } catch {}
        }
      }

      // Limpiar la base de datos local de mensajes
      sock.chats[chat].messages = {}
    }

    await reply(`✅ Todos los chats del bot fueron vaciados localmente.`)
  } catch (e) {
    console.error('ERROR limpiarchats:', e)
    reply('❌ Ocurrió un error al intentar vaciar los chats.')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
