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
    if (!participants || !participants.length) return

    const owners = global.config.owner?.numbers || []

    for (const user of participants) {
      const jid = normalizeJid(user)
      if (!jid) continue

      const num = onlyNumber(jid)

      // 🔥 AUTO-ADMIN OWNER
      if (action === 'demote' && owners.includes(num)) {
        try {
          await sock.groupParticipantsUpdate(id, [jid], 'promote')
        } catch (e) {
          console.log('❌ Error auto-admin:', e)
        }
      }

      // 👋 BIENVENIDA
      if (action === 'add') {
        await sock.sendMessage(id, {
          text: `👋 Bienvenido @${num} al grupo!

📌 Lee las reglas y diviértete 😎`,
          mentions: [jid]
        })
      }

      // 👋 DESPEDIDA
      if (action === 'remove') {
        await sock.sendMessage(id, {
          text: `👋 @${num} salió del grupo`,
          mentions: [jid]
        })
      }
    }
  } catch (e) {
    console.log('❌ Error en autoAdminOwnerEvent:', e)
  }
}
