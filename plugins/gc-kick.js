export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
  const groupOwner = metadata.owner
  const botJid = sock.user?.id || ''

  // Verifica si quien ejecuta es admin
  if (!admins.includes(sender)) return reply(msgs.admin || '⚠️ Solo admins pueden usar este comando')

  // Obtiene usuario objetivo (mención o reply)
  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) {
    return reply(
      '⚠️ Uso incorrecto:\nMenciona al usuario o responde a su mensaje\nEjemplo: .kick @usuario'
    )
  }

  // Protecciones
  if (user === groupOwner) return reply('🛡 No puedes expulsar al creador del grupo')
  if (user === botJid) return reply('⚠️ No puedo expulsarme a mí mismo')

  try {
    // Reacción al comando
    await sock.sendMessage(from, { react: { text: '🚪', key: m.key } })

    // Expulsar usuario
    await sock.groupParticipantsUpdate(from, [user], 'remove')

    // Mensaje informativo
    await sock.sendMessage(
      from,
      {
        text: `🚨 Usuario expulsado:\n🍁 @${user.split('@')[0]}\n👮 Expulsado por: @${sender.split('@')[0]}\n> ${botName}`,
        mentions: [user, sender]
      },
      { quoted: m }
    )
  } catch (e) {
    reply(msgs.error || '❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
