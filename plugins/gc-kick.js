export const handler = async (m, { sock, reply, isGroup, sender }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  // 🔒 Metadata del grupo
  const from = m.key.remoteJid
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)

  const groupOwner = metadata.owner
  const botOwners = global.owner?.jid || []

  // ❌ Verificar admin
  if (!admins.includes(sender)) {
    return reply('⛔ Solo los administradores pueden usar este comando')
  }

  // 🎯 Usuario objetivo (reply o mención)
  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) {
    return reply(
      '⚠️ Uso incorrecto:\nMenciona al usuario o responde a su mensaje\nEjemplo:\n.kick @usuario'
    )
  }

  /* ───── 🔐 PROTECCIONES ───── */
  if (botOwners.includes(user)) return reply('👑 No puedes expulsar al OWNER del bot')
  if (user === groupOwner) return reply('🛡 No puedes expulsar al creador del grupo')

  try {
    // 🚪 Expulsar usuario
    await sock.groupParticipantsUpdate(from, [user], 'remove')

    // ⚡ Mensaje corto indicando quién expulsó
    await sock.sendMessage(from, {
      text: `✅ Usuario expulsado: @${user.split('@')[0]}\n👮 Expulsado por: @${sender.split('@')[0]}`,
      mentions: [user, sender]
    })
  } catch (e) {
    reply('❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
