export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  const msgs = global.config?.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // 🔹 Solo grupos
  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 🔹 Debe responder a un mensaje
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.stanzaId) return reply('⚠️ Responde al mensaje que deseas borrar')

  // 🔹 Verificar admin
  if (!isAdmin) return reply(msgs.admin || '⚠️ Este comando es solo para administradores')

  try {
    // 🗑️ Borrar mensaje correctamente usando protocolMessage
    await sock.sendMessage(from, {
      protocolMessage: {
        key: {
          remoteJid: from,
          fromMe: false,
          id: ctx.stanzaId,
          participant: ctx.participant
        },
        type: 0
      }
    })

    // ⚡ Reacción de confirmación
    await sock.sendMessage(from, {
      react: { text: '🗑️', key: m.key }
    })
  } catch (e) {
    console.log('❌ Error al borrar mensaje:', e)
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
