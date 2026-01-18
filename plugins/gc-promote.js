export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  const msgs = global.config.messages || {}

  // 🔒 Solo grupos
  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // 📌 Metadata
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const admins = participants.filter(p => p.admin).map(p => p.id)

  // 👮 Verificar admin
  if (!admins.includes(sender)) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  // 🎯 Usuario objetivo (mención o reply)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant

  if (!user) {
    return reply(
      '⚠️ Uso incorrecto\n\n' +
      'Ejemplo:\n' +
      '.promote @usuario\n' +
      'o responde a su mensaje'
    )
  }

  // ⚠️ Ya es admin
  if (admins.includes(user)) {
    return reply('⚠️ Ese usuario *ya es administrador*')
  }

  try {
    // ⬆️ Dar admin
    await sock.groupParticipantsUpdate(from, [user], 'promote')

    // ⚡ Reacción
    await sock.sendMessage(from, {
      react: { text: '⬆️', key: m.key }
    })

    // 📢 Mensaje
    await sock.sendMessage(
      from,
      {
        text:
          `⬆️ *Administrador asignado*\n\n` +
          `👤 Usuario: @${user.split('@')[0]}\n` +
          `👮 Otorgado por: @${sender.split('@')[0]}\n\n` +
          `> ${sock.user?.name || 'ChappieBot'}`,
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    console.log('❌ Error promote:', e)
    reply(msgs.error || '❌ No pude otorgar administrador')
  }
}

handler.command = ['promote']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
