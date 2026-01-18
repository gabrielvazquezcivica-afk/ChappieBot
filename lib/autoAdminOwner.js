function normalizeJid (u) {
  return typeof u === 'string' ? u : u?.id
}

function onlyNumber (jid = '') {
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')
}

export async function autoAdminOwnerEvent (sock, update) {
  const { id, participants, action } = update
  if (!id?.endsWith('@g.us')) return
  if (action !== 'demote') return

  const owners = global.config.owner?.numbers || []

  for (const user of participants) {
    const jid = normalizeJid(user)
    const num = onlyNumber(jid)

    if (!owners.includes(num)) continue

    try {
      await sock.groupParticipantsUpdate(id, [jid], 'promote')
    } catch {
      // silencio total
    }
  }
}
