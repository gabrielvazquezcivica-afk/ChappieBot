let started = false

const getBotOwners = () => {
  const o = global.config?.owner?.jid || []
  return Array.isArray(o) ? o : [o]
}

export const handler = async (m, { sock, from, isGroup, reply, sender }) => {
  const msgs = global.config.messages || {}
  const owners = getBotOwners()

  // 🚫 SOLO OWNER DEL BOT
  if (!owners.includes(sender)) {
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')
  }

  if (!isGroup) return reply(msgs.group)

  const metadata = await sock.groupMetadata(from)
  const groupOwner = metadata.owner
  if (!groupOwner) return

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const botIsAdmin = metadata.participants.some(
    p => p.id === botId && p.admin
  )

  if (!botIsAdmin) return reply(msgs.botAdmin)

  const alreadyAdmin = metadata.participants.some(
    p => p.id === groupOwner && p.admin
  )

  if (alreadyAdmin) {
    return reply('ℹ️ El creador del grupo ya es administrador')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 🚀 PROMOVER
  await sock.groupParticipantsUpdate(from, [groupOwner], 'promote')

  await sock.sendMessage(
    from,
    {
      text:
        `👑 *Auto-Admin ejecutado*\n\n` +
        `👤 Usuario: @${groupOwner.split('@')[0]}\n` +
        `👮 Por: OWNER DEL BOT\n\n` +
        `> ${sock.user?.name || 'ChappieBot'}`,
      mentions: [groupOwner]
    },
    { quoted: m }
  )
}

/* ───────────────────────────── */
/* 🔒 PROTEGER AL OWNER DEL GRUPO */
/* ───────────────────────────── */

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

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botIsAdmin = metadata.participants.some(
      p => p.id === botId && p.admin
    )
    if (!botIsAdmin) return

    // 🔁 Revertir SIN avisar
    await sock.groupParticipantsUpdate(id, [groupOwner], 'promote')
  })
}

handler.command = ['autoadmin']
handler.tags = ['owner']
handler.group = true
handler.menu = true

export default handler
