import config from '../config.js'

function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, reply }) => {
  try {
    // ───── VERIFICAR OWNER ─────
    const senderJid = m.key?.participant || m.sender
    const senderNum = onlyNumber(senderJid)
    const ownerNums = Array.isArray(config.owner.numbers) 
      ? config.owner.numbers.map(n => onlyNumber(n)) 
      : []

    if (!ownerNums.includes(senderNum)) {
      return reply('🚫 Solo el OWNER del bot puede usar este comando.')
    }

    // ───── MENSAJE INICIAL ─────
    await sock.sendMessage(m.key.remoteJid, { text: '🧹 Limpiando todas las conversaciones...' })

    // ───── BORRAR TODOS LOS CHATS ─────
    const chats = Object.keys(sock.chats || {})
    for (const chat of chats) {
      try {
        await sock.sendMessage(chat, { delete: {} }) // opcional, borrar mensajes individuales
        await sock.chatModify({ clear: true }, chat) // intentamos vaciar el chat
      } catch {}
    }

    // ───── MENSAJE FINAL ─────
    await sock.sendMessage(m.key.remoteJid, { text: '✅ Todas las conversaciones han sido limpiadas.' })

  } catch (e) {
    console.error('ERROR limpiarchats:', e)
    reply('❌ Ocurrió un error al intentar limpiar los chats.')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.owner = true
handler.menu = true
export default handler
