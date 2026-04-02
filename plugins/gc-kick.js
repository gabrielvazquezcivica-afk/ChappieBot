// ───── HELPERS ─────
function normalizeJid(u) {
  return typeof u === 'string' ? u : u?.id
}

function onlyNumber(jid = '') {
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')
}

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

  // 👑 OWNERS (USANDO TU MÉTODO)
  const owners = (global.config.owner?.numbers || []).map(n => onlyNumber(n))

  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  if (!isAdmin) {
    return reply('⛔ Solo administradores pueden usar este comando')
  }

  const metadata = await sock.groupMetadata(from)

  const senderNum = onlyNumber(sender)
  const botNum = onlyNumber(botJid)

  // 👑 OWNER GRUPO
  const realOwner = metadata.participants.find(p => p.admin === 'superadmin')
  const groupOwner = realOwner ? onlyNumber(realOwner.id) : null

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const userRaw = ctx?.mentionedJid?.[0] || ctx?.participant

  if (!userRaw) {
    return reply(
`⚠️ Uso incorrecto

👉 Menciona al usuario o responde a su mensaje
Ejemplo: .kick @usuario`
    )
  }

  const userNum = onlyNumber(userRaw)

  /* 🔐 PROTECCIÓN + CASTIGO */

  // 👑 OWNER BOT (FIX REAL CON TU SISTEMA)
  if (owners.includes(userNum)) {

    await sock.sendMessage(from, {
      text: `🚨 *INTENTO DE EXPULSAR OWNER DEL BOT*\n\n👮 @${senderNum} será eliminado`,
      mentions: [sender]
    })

    await sock.groupParticipantsUpdate(from, [sender], 'remove')
    return
  }

  // 👑 OWNER GRUPO
  if (groupOwner && userNum === groupOwner) {

    await sock.sendMessage(from, {
      text: `🚨 *PROTECCIÓN ACTIVADA*\n\n👑 No puedes expulsar al creador del grupo\n\n💀 @${senderNum} eliminado por intento`,
      mentions: [sender]
    })

    await sock.groupParticipantsUpdate(from, [sender], 'remove')
    return
  }

  // 🤖 BOT
  if (userNum === botNum) {
    return reply('⚠️ No puedo expulsarme a mí mismo')
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    await sock.groupParticipantsUpdate(from, [normalizeJid(userRaw)], 'remove')

    await sock.sendMessage(
      from,
      {
        text: `
╔═══════════════════╗
   🚪  EXPULSIÓN
╚═══════════════════╝

👤 Usuario:
➤ @${userNum}

👮 Moderador:
➤ @${senderNum}

╭───────────────╮
   🤖 ${botName}
╰───────────────╯
`.trim(),
        mentions: [normalizeJid(userRaw), sender]
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
