// 🔔 AUTO-DETECT CHAPPIEBOT (solo texto, reenviado)
let started = false

export const handler = async () => {}

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  // ───── CAMBIOS DEL GRUPO ─────
  sock.ev.on('groups.update', async (updates) => {
    for (const g of updates) {
      const { id, announce, subject, desc, author } = g
      if (!id.endsWith('@g.us')) continue
      if (!author) continue // Si no hay autor → fue el bot o sistema

      const mentions = [author]

      // 🔒 ABRIR / CERRAR GRUPO
      if (announce !== undefined) {
        await sock.sendMessage(id, {
          text: announce
            ? `🔒 *Grupo cerrado: solo admins pueden enviar mensajes*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`
            : `🔓 *Grupo abierto: todos pueden enviar mensajes*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`,
          mentions,
          contextInfo: { forwardingScore: 9999, isForwarded: true }
        })
      }

      // ✏️ CAMBIO DE NOMBRE
      if (subject) {
        await sock.sendMessage(id, {
          text: `✏️ *Nombre del grupo cambiado*\n\n📌 Nuevo nombre: *${subject}*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`,
          mentions,
          contextInfo: { forwardingScore: 9999, isForwarded: true }
        })
      }

      // 📝 CAMBIO DE DESCRIPCIÓN
      if (desc !== undefined) {
        await sock.sendMessage(id, {
          text: `📝 *Descripción del grupo modificada*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`,
          mentions,
          contextInfo: { forwardingScore: 9999, isForwarded: true }
        })
      }
    }
  })

  // 👑 PROMOTE / DEMOTE
  sock.ev.on('group-participants.update', async (update) => {
    const { id, action, participants, actor } = update
    if (!id.endsWith('@g.us')) return
    if (!['promote', 'demote'].includes(action)) return
    if (!actor) return // Si no hay actor → fue el bot

    const target = participants?.[0]
    if (!target) return

    await sock.sendMessage(id, {
      text:
        action === 'promote'
          ? `👑 @${target.split('@')[0]} ahora es administrador\n\n👤 Acción realizada por @${actor.split('@')[0]}\n\n> ${botName}`
          : `🧹 @${target.split('@')[0]} ya no es administrador\n\n👤 Acción realizada por @${actor.split('@')[0]}\n\n> ${botName}`,
      mentions: [target, actor],
      contextInfo: { forwardingScore: 9999, isForwarded: true }
    })
  })
}

export default handler
