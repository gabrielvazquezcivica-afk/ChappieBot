export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  isAdmin,
  reply
}) => {
  const botName = sock.user?.name || 'ChappieBot'
  const botJid = sock.user?.id

  if (!isGroup)
    return reply('⚠️ Este comando solo funciona en grupos')

  if (!isAdmin)
    return reply('⚠️ Solo administradores pueden usar este comando')

  // 🎯 Usuario objetivo
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant

  if (!user) {
    return reply(
      '⚠️ Uso:\n.kick @usuario\nO responde a su mensaje'
    )
  }

  // 🚫 Intento de kick al bot
  if (user === botJid) {
    await sock.sendMessage(from, {
      text:
`😂 ¿Intentaste sacarme?
🚪 *Resultado:* tú te vas`,
      mentions: [sender],
      quoted: m
    })

    try {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
    } catch {
      await sock.sendMessage(from, {
        text: '⚠️ No tengo permisos para expulsar admins.\nHazme admin 😎',
        quoted: m
      })
    }
    return
  }

  // 🚪 Kick normal
  try {
    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    await sock.groupParticipantsUpdate(from, [user], 'remove')

    await sock.sendMessage(from, {
      text:
`🚨 *USUARIO EXPULSADO*

👤 @${user.split('@')[0]}
👮 Por: @${sender.split('@')[0]}
> ${botName}`,
      mentions: [user, sender]
    }, { quoted: m })

  } catch (e) {
    if (e?.data === 403) {
      return reply('⚠️ No tengo permisos para expulsar.\nNecesito ser *ADMIN*.')
    }
    reply('❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick']
handler.group = true
handler.admin = true
handler.botAdmin = false
handler.menu = true
handler.tags = ['group']

export default handler
