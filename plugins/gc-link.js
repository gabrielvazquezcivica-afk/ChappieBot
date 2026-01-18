export const handler = async (m, { sock, from, isGroup, reply }) => {
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

  // 🔗 Obtener link del grupo
  const link = await sock.groupInviteCode(from)
  const invite = `https://chat.whatsapp.com/${link}`

  // 🖼️ Obtener foto del grupo
  let img
  try {
    img = await sock.profilePictureUrl(from, 'image')
  } catch {
    img = null
  }

  // 📤 Enviar sin mostrar quién lo pidió
  await sock.sendMessage(from, {
    image: img ? { url: img } : undefined,
    caption:
      `🔗 *Link del grupo*\n\n` +
      `${invite}\n\n` +
      `> ${botName}`,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  })
}

handler.command = ['link']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
