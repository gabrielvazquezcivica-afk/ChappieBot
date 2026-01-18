export const handler = async (m, { sock, from, isGroup, reply }) => {
  const msgs = global.config.messages || {}

  // Solo grupos
  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // Debe responder a un mensaje
  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (!ctx?.stanzaId) {
    return reply('⚠️ Responde al mensaje que deseas borrar')
  }

  // Obtener metadata
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  // Verificar admin
  if (!admins.includes(m.key.participant)) {
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
