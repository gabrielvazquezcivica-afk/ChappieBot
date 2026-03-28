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

  // 🔥 LIMPIEZA GLOBAL (CLAVE)
  const clean = (jid) => jid?.split('@')[0].split(':')[0]

  const groupOwner = clean(metadata.owner)
  const cleanSender = clean(sender)
  const cleanBot = clean(botJid)
  const cleanOwners = owners.map(o => clean(o))

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

  /* 🔐 PROTECCIONES REALES */

  // 👑 OWNER DEL BOT
  if (cleanOwners.includes(cleanUser)) {
    return reply('👑 No puedes expulsar al OWNER del bot')
  }

  // 👑 OWNER DEL GRUPO (FIX AQUÍ)
  if (cleanUser === groupOwner) {
    return reply('🛡 No puedes expulsar al creador del grupo')
  }

  // 🤖 BOT
  if (cleanUser === cleanBot) {
    return reply('⚠️ No puedo expulsarme a mí mismo')
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '⚡', key: m.key }
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

📌 Acción realizada correctamente

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
