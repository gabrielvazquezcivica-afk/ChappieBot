export const handler = async (m, {
  sock,
  reply,
  isGroup,
  sender,
  isAdmin,
  from
}) => {

  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'
  const botJid = sock.user?.id || ''
  const owners = global.config.owner?.numbers || []

  if (!isGroup) {
    return reply(msgs.group || '🚫 Este comando solo funciona en grupos')
  }

  if (!isAdmin) {
    return reply(msgs.admin || '⛔ Solo administradores pueden usar este comando')
  }

  const metadata = await sock.groupMetadata(from)
  const groupOwner = metadata.owner

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user = ctx?.mentionedJid?.[0] || ctx?.participant

  if (!user) {
    return reply(
`⚠️ Uso incorrecto

👉 Menciona al usuario o responde a su mensaje
Ejemplo: .kick @usuario`
    )
  }

  // 🔥 LIMPIEZA
  const cleanUser = user.split('@')[0].split(':')[0]
  const cleanSender = sender.split('@')[0].split(':')[0]
  const cleanBot = botJid.split('@')[0].split(':')[0]
  const cleanOwners = owners.map(o => o.split(':')[0])

  /* 🔐 PROTECCIONES */

  if (cleanOwners.includes(cleanUser)) {
    return reply('👑 No puedes expulsar al OWNER del bot')
  }

  if (user === groupOwner) {
    return reply('🛡 No puedes expulsar al creador del grupo')
  }

  if (cleanUser === cleanBot) {
    return reply('⚠️ No puedo expulsarme a mí mismo')
  }

  try {

    // ⚡ reacción
    await sock.sendMessage(from, {
      react: { text: '⚡', key: m.key }
    })

    // 👢 expulsión
    await sock.groupParticipantsUpdate(from, [user], 'remove')

    // 💎 MENSAJE NUEVO
    await sock.sendMessage(
      from,
      {
        text: `
╔═══════════════════╗
   🚪  EXPULSIÓN
╚═══════════════════╝

👤 Usuario:
➤ @${cleanUser}

👮 Moderador:
➤ @${cleanSender}

📌 Acción realizada correctamente

╭───────────────╮
   🤖 ${botName}
╰───────────────╯
`.trim(),
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    console.log('❌ Error kick:', e)
    reply(msgs.error || '❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick', 'expulsar']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
