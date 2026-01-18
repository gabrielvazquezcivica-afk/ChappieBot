export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  const msgs = global.config.messages

  // ───── SOLO GRUPOS ─────
  if (!isGroup) return reply(msgs.group)

  // ───── SOLO OWNER ─────
  if (!global.config.owner.jid.includes(sender)) {
    return reply(msgs.owner)
  }

  // ───── OBTENER METADATOS ─────
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const groupOwner = metadata.owner || metadata.subjectOwner

  // ───── VALIDACIONES ─────
  if (!groupOwner) {
    return reply('❌ No se pudo detectar el creador del grupo')
  }

  const botIsAdmin = participants.find(
    p => p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (!botIsAdmin) {
    return reply('⚠️ Dame administrador y vuelve a usar el comando')
  }

  const ownerIsAdmin = participants.find(
    p => p.id === groupOwner && (p.admin === 'admin' || p.admin === 'superadmin')
  )

  if (ownerIsAdmin) {
    return reply('ℹ️ El creador del grupo ya es administrador')
  }

  // ───── PROMOVER OWNER ─────
  await sock.groupParticipantsUpdate(from, [groupOwner], 'promote')

  return reply('👑 Administrador asignado correctamente al creador del grupo')
}

handler.command = ['autoadmin']
handler.group = true
handler.owner = true
handler.menu = true
export default handler
