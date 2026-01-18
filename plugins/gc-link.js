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

  // 🔹 Obtener link
  const inviteCode = await sock.groupInviteCode(from)
  const link = `https://chat.whatsapp.com/${inviteCode}`

  // 🔹 Obtener foto del grupo
  let image
  try {
    image = await sock.profilePictureUrl(from, 'image')
  } catch {
    image = null
  }

  const text =
    `🔗 *Link del grupo*\n\n` +
    `${link}\n\n` +
    `> ${botName}`

  // 🔹 Enviar mensaje
  if (image) {
    await sock.sendMessage(
      from,
      {
        image: { url: image },
        caption: text
      },
      { quoted: m }
    )
  } else {
    await sock.sendMessage(
      from,
      { text },
      { quoted: m }
    )
  }
}

handler.command = ['link']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
