function normalizeJid(u) {
  return typeof u === 'string' ? u : u?.id
}

function onlyNumber(jid = '') {
  return normalizeJid(jid)?.replace(/[^0-9]/g, '')
}

export async function autoAdminOwnerEvent(sock, update) {
  try {
    const { id, participants, action } = update
    if (!id?.endsWith('@g.us')) return

    const owners = global.config.owner?.numbers || []

    // 🔥 SOLO AUTO-ADMIN (NO BLOQUEA NADA)
    if (action === 'demote' && participants?.length) {
      for (const user of participants) {
        const jid = normalizeJid(user)
        if (!jid) continue

        const num = onlyNumber(jid)

        if (owners.includes(num)) {
          try {
            await sock.groupParticipantsUpdate(id, [jid], 'promote')
          } catch (e) {
            console.log('❌ Error auto-admin:', e)
          }
        }
      }
    }

    // 👀 DEBUG AUTODETECT (opcional)
    // console.log('📢 Cambio detectado:', update)

  } catch (e) {
    console.log('❌ Error en autoAdminOwnerEvent:', e)
  }
}
