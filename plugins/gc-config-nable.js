export const handler = async (m, { sock, from, isGroup, reply, command }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  // 🔹 Acción
  const isOpen = command === 'abrir'
  const actionText = isOpen
    ? '🔓 *Grupo abierto*'
    : '🔒 *Grupo cerrado*'

  // 🔹 Ejecutar acción
  await sock.groupSettingUpdate(
    from,
    isOpen ? 'not_announcement' : 'announcement'
  )

  // 🔹 Reacción
  await sock.sendMessage(from, {
    react: { text: isOpen ? '🔓' : '🔒', key: m.key }
  })

  const author = m.key.participant

  // 🔹 Mensaje final
  await sock.sendMessage(from, {
    text:
      `${actionText}\n\n` +
      `👮 Por: @${author.split('@')[0]}\n\n` +
      `> ${botName}`,
    mentions: [author],
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  })
}

// ───── CONFIG DEL PLUGIN ─────
handler.command = ['abrir', 'cerrar']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
