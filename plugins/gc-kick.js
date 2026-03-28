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
    return reply('🚫 Este comando solo funciona en grupos')
  }

  if (!isAdmin) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const metadata = await sock.groupMetadata(from)

  // 🔥 limpiar jid
  const clean = (jid) => jid?.split('@')[0].split(':')[0]

  const cleanSender = clean(sender)
  const cleanBot = clean(botJid)
  const cleanOwners = owners.map(o => clean(o))

  // 👑 detectar owner real
  const realOwner = metadata.participants.find(p => p.admin === 'superadmin')
  const groupOwner = realOwner ? clean(realOwner.id) : null

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const userRaw = ctx?.mentionedJid?.[0] || ctx?.participant

  if (!userRaw) {
    return reply(
`⚠️ Uso incorrecto

👉 Menciona al usuario o responde a su mensaje
Ejemplo: .kick @usuario`
    )
  }

  const cleanUser = clean(userRaw)

  /* 🔐 PROTECCIÓN + CASTIGO */

  // 👑 OWNER BOT
  if (cleanOwners.includes(cleanUser)) {

    await sock.sendMessage(from, {
      text: `🚨 *INTENTO DE EXPULSAR OWNER DEL BOT*\n\n👮 @${cleanSender} será eliminado`,
      mentions: [sender]
    })

    await sock.groupParticipantsUpdate(from, [sender], 'remove')
    return
  }

  // 👑 OWNER GRUPO
  if (groupOwner && cleanUser === groupOwner) {

    await sock.sendMessage(from, {
      text: `🚨 *PROTECCIÓN ACTIVADA*\n\n👑 No puedes expulsar al creador del grupo\n\n💀 @${cleanSender} eliminado por intento`,
      mentions: [sender]
    })

    await sock.groupParticipantsUpdate(from, [sender], 'remove')
    return
  }

  // 🤖 BOT
  if (cleanUser === cleanBot) {
    return reply('⚠️ No puedo expulsarme a mí mismo')
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    await sock.groupParticipantsUpdate(from, [userRaw], 'remove')

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

╭───────────────╮
   🤖 ${botName}
╰───────────────╯
`.trim(),
        mentions: [userRaw, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    console.log('❌ Error kick:', e)
    reply('❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
