// ───── HELPERS ─────    
function normalizeJid(u) {    
  return typeof u === 'string' ? u : u?.id    
}    
    
function onlyNumber(jid = '') {    
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')    
}    

// 🔥 CONTROL PARA NO DUPLICAR EVENTO
let started = false
    
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

// ───── 🔥 AUTO-DETECT (NUEVO) ─────
handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const owners = global.config.owner?.numbers || []

  sock.ev.on('group-participants.update', async update => {
    try {
      const { id, participants, action } = update

      if (!id?.endsWith('@g.us')) return
      if (action !== 'demote') return

      for (const user of participants) {
        const jid = normalizeJid(user)
        const num = onlyNumber(jid)

        // 👑 SI ES OWNER → VOLVER A DAR ADMIN
        if (owners.includes(num)) {
          try {
            await sock.groupParticipantsUpdate(id, [jid], 'promote')
          } catch {}
        }
      }

    } catch (e) {
      console.log('❌ Error auto-admin detect:', e)
    }
  })
}

handler.command = ['autoadmin']    
handler.tags = ['owner']    
handler.help = ['autoadmin']    
handler.owner = true    
handler.group = true    
handler.menu = true    
    
export default handler
