let started = false

export const handler = async (m, { sock, from, isGroup, reply, sender }) => {
  const msgs = global.config.messages || {}
  const botOwner = global.config.bot?.owner || []
  const botName = sock.user?.name || 'ChappieBot'

  // 🔒 SOLO OWNER DEL BOT
  if (!botOwner.includes(sender)) {
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')
  }

  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  const metadata = await sock.groupMetadata(from)
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const groupOwner = metadata.owner

  if (!groupOwner) {
    return reply('❌ No se pudo detectar al creador del grupo')
  }

  // 🤖 BOT ADMIN
  const botIsAdmin = metadata.participants.find(
    p => p.id === botId && p.admin
  )

  if (!botIsAdmin) {
    return reply(msgs.botAdmin || '⚠️ Necesito ser administrador para ejecutar esto')
  }

  // 👑 YA ES ADMIN
  const ownerIsAdmin = metadata.participants.find(
    p => p.id === groupOwner && p.admin
  )

  if (ownerIsAdmin) {
    return reply('ℹ️ El creador del grupo ya es administrador')
  }

  // ⚡ REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 🚀 PROMOVER OWNER
  await sock.groupParticipantsUpdate(from, [groupOwner], 'promote')

  await sock.sendMessage(
    from,
    {
      text:
        `👑 *Auto-Admin ejecutado*\n\n` +
        `🧑‍💼 Usuario: @${groupOwner.split('@')[0]}\n` +
        `🤖 Acción realizada por: ${botName}\n\n` +
        `> ${botName}`,
      mentions: [groupOwner]
    },
    { quoted: m }
  )
}

/* ────────────────────────────────────── */
/* 🔒 PROTECCIÓN SILENCIOSA DEL OWNER     */
/* ────────────────────────────────────── */

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update
    if (!id?.endsWith('@g.us')) return
    if (action !== 'demote') return

    const metadata = await sock.groupMetadata(id)
    const groupOwner = metadata.owner
    if (!groupOwner) return

    const user = participants[0]
    if (user !== groupOwner) return

    // 🤖 BOT ADMIN?
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botIsAdmin = metadata.participants.find(
      p => p.id === botId && p.admin
    )
    if (!botIsAdmin) return

    // 🚫 REVERTIR DEMOTE (SILENCIOSO)
    await sock.groupParticipantsUpdate(id, [groupOwner], 'promote')
  })
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.group = true
handler.menu = true

export default handler
