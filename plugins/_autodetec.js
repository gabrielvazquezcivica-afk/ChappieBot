// 🔔 AUTO-DETECT CHAPPIEBOT (solo texto, reenviado)

let started = false

export const handler = async () => {}

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  // ───── CAMBIOS DEL GRUPO (abrir, cerrar, nombre, descripción)
  sock.ev.on('groups.update', async (updates) => {
    for (const u of updates) {
      const { id, announce, subject, desc, author } = u
      if (!id.endsWith('@g.us')) continue
      if (!author) continue // ❌ Si no hay autor → fue el bot o sistema

      const mentions = [author]

      // 🔒 ABRIR / CERRAR GRUPO
      if (announce !== undefined) {
        await sock.sendMessage(id, {
          text: announce
            ? `🔒 *Solo los administradores pueden enviar mensajes*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`
            : `🔓 *Todos los participantes pueden enviar mensajes*\n\n👤 Acción realizada por @${author.split('@')[0]}\n\n> ${botName}`,
          mentions,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true
          }
        })
      }

      // ✏️ CAMBIO DE NOMBRE
      if (subject) {
        await sock.sendMessage(id, {
          text:
`✏️ *El nombre del grupo fue cambiado*

📛 Nuevo nombre:
*${subject}*

👤 Acción realizada por @${author.split('@')[0]}

> ${botName}`,
          mentions,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true
          }
        })
      }

      // 📝 CAMBIO DE DESCRIPCIÓN
      if (desc !== undefined) {
        await sock.sendMessage(id, {
          text:
`📝 *La descripción del grupo fue actualizada*

👤 Acción realizada por @${author.split('@')[0]}

> ${botName}`,
          mentions,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true
          }
        })
      }
    }
  })

  // 👑 PROMOTE / DEMOTE (solo manual, sin mandar foto)
  sock.ev.on('group-participants.update', async (u) => {
    const { id, action, participants, actor } = u
    if (!id.endsWith('@g.us')) return
    if (!['promote', 'demote'].includes(action)) return
    if (!actor) return // ❌ si no hay actor → fue el bot

    const target = participants?.[0]
    if (!target) return

    await sock.sendMessage(id, {
      text:
action === 'promote'
  ? `👑 @${target.split('@')[0]} ahora es administrador.\n\n👤 Acción realizada por @${actor.split('@')[0]}\n\n> ${botName}`
  : `🧹 @${target.split('@')[0]} ya no es administrador.\n\n👤 Acción realizada por @${actor.split('@')[0]}\n\n> ${botName}`,
      mentions: [target, actor],
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      }
    })
  })
}

export default handler
