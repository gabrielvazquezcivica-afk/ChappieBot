20260505 12:34:57 || ponle q diga 👋🏻 USUARIO EXPULSADO CORRECTAMENTE > por

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

  // 👑 OWNERS
  const owners = (global.config.owner?.numbers || []).map(n => onlyNumber(n))

  // ❌ SOLO GRUPOS
  if (!isGroup) {
    return reply(msgs.group || '🚫 Este comando solo funciona en grupos')
  }

  // 🔐 SOLO ADMINS
  if (!isAdmin) {
    return reply(msgs.admin || '⛔ Solo administradores pueden usar este comando')
  }

  const senderNum = onlyNumber(sender)
  const botNum = onlyNumber(botJid)

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

  /* 🔐 PROTECCIÓN TOTAL */

  // 👑 OWNER PROTEGIDO (CHECK 1)
  if (owners.includes(userNum)) {

    await sock.sendMessage(from, {
      text: `🚨 *PROTECCIÓN OWNER ACTIVADA*\n\n👑 No puedes expulsar a este usuario\n\n💀 @${senderNum} eliminado`,
      mentions: [sender]
    })

    try {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
    } catch {}

    return
  }

  // 🤖 BOT PROTEGIDO
  if (userNum === botNum) {
    return reply('⚠️ No puedo expulsarme a mí mismo')
  }

  try {

    // 🔥 REACCIÓN
    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    // 👑 OWNER PROTEGIDO (CHECK 2 ANTIBUG)
    if (owners.includes(userNum)) return

    // 🚪 KICK
    await sock.groupParticipantsUpdate(from, [normalizeJid(userRaw)], 'remove')

    // 📩 MENSAJE
    await sock.sendMessage(
      from,
      {
        text: `👋🏻 USUARIO EXPULSADO CORRECTAMENTE
> por @${senderNum}`,
        mentions: [sender]
      },
      { quoted: m }
    )

  } catch (e) {
    console.log('❌ Error kick:', e)
    reply('❌ No pude expulsar al usuario')
  }
}

// ⚙️ CONFIG
handler.command = ['kick']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
