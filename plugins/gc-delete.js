export const handler = async (m, { sock, from, isGroup, isAdmin, isOwner, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // 🔹 Solo grupos
  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // 🔹 Debe responder a un mensaje
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.stanzaId) {
    return reply('⚠️ Responde al mensaje que deseas borrar')
  }

  // 🔹 Verificar admin usando index.js
  if (!isAdmin && !isOwner) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  try {
    // 🗑️ Borrar mensaje
    await sock.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: false,
        id: ctx.stanzaId,
        participant: ctx.participant
      }
    })

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '🗑️', key: m.key }
    })
  } catch (e) {
    console.log('❌ Error delete:', e)
    reply(msgs.error || '❌ No pude borrar el mensaje')
  }
}

handler.command = ['del']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
