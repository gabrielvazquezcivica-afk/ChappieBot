export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // 🔒 Solo grupos
  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // 👮 Solo admins pueden usarlo
  if (!isAdmin) {
    return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')
  }

  try {
    // 🔹 Obtener link del grupo
    const inviteCode = await sock.groupInviteCode(from)
    const link = `https://chat.whatsapp.com/${inviteCode}`

    // 🔹 Obtener foto del grupo
    let image = null
    try {
      image = await sock.profilePictureUrl(from, 'image')
    } catch {
      image = null
    }

    const text = `🔗 *Link del grupo*\n\n${link}\n\n> ${botName}`

    // 🔹 Enviar mensaje como si fuera reenviado
    if (image) {
      await sock.sendMessage(
        from,
        {
          image: { url: image },
          caption: text,
          contextInfo: { forwardingScore: 9999, isForwarded: true }
        },
        { quoted: m }
      )
    } else {
      await sock.sendMessage(
        from,
        {
          text,
          contextInfo: { forwardingScore: 9999, isForwarded: true }
        },
        { quoted: m }
      )
    }
  } catch (e) {
    console.log('❌ Error link:', e)
    reply(msgs.error || '❌ No pude obtener el link del grupo')
  }
}

handler.command = ['link']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
