// ───── HELPERS ─────    
function normalizeJid(u) {    
  return typeof u === 'string' ? u : u?.id    
}    
    
function onlyNumber(jid = '') {    
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')    
}    
    
// ───── COMANDO AUTOADMIN ─────    
export const handler = async (m, {    
  sock,    
  from,    
  sender,    
  isGroup,    
  isOwner,    
  reply    
}) => {    
    
  const msgs = global.config.messages || {}    
    
  // 🔒 Solo grupos    
  if (!isGroup) {    
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')    
  }    
    
  // 👑 Solo OWNER    
  if (!isOwner) {    
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')    
  }    
    
  let metadata    
  try {    
    metadata = await sock.groupMetadata(from)    
  } catch {    
    return reply(msgs.error || '❌ No pude obtener información del grupo')    
  }    
    
  const senderNum = onlyNumber(sender)    
    
  const participant = metadata.participants.find(    
    p => onlyNumber(p.id) === senderNum    
  )    
    
  if (!participant) {    
    return reply('❌ El owner no está en el grupo')    
  }    
    
  if (participant.admin) {    
    return reply(    
`╭─〔 👑 AUTO ADMIN 〕    
│ El OWNER ya es administrador    
│ Estado: OK    
╰──────────────`    
    )    
  }    
    
  try {    
    
    await sock.groupParticipantsUpdate(from, [participant.id], 'promote')    
    
    await sock.sendMessage(from, {    
      react: { text: '👑', key: m.key }    
    })    
    
    reply(    
`╭─〔 👑 AUTO ADMIN 〕    
│ OWNER promovido correctamente    
│ Rol: ADMIN    
╰──────────────`    
    )    
    
  } catch {    
    
    reply(    
`╭─〔 ❌ ERROR 〕    
│ No pude promover al OWNER    
│ El bot no es admin    
╰────────────`    
    )    
    
  }    
}    
    
handler.command = ['autoadmin']    
handler.tags = ['owner']    
handler.help = ['autoadmin']    
handler.owner = true    
handler.group = true    
handler.menu = true    
    
export default handler

// ───── AUTO DETECTOR (SIN COMANDO) ─────
export async function autoAdminOwnerEvent (sock, update, owner) {
  const { id, participants, action } = update
  if (action !== 'demote') return

  const owners = owner?.numbers || []

  for (const user of participants) {
    const jid = normalizeJid(user)
    const num = onlyNumber(jid)

    if (!owners.includes(num)) continue

    try {
      await sock.groupParticipantsUpdate(id, [jid], 'promote')
    } catch {
      // silencio total si el bot no es admin
    }
  }
}
