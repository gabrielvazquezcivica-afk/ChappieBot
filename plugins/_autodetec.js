// 🔔 AUTO-DETECT SOLO TEXTO (PROMOTE/DEMOTE, CAMBIOS DE GRUPO)

export function initAutoDetect(sock) {

  // 👑 PROMOTE / DEMOTE
  sock.ev.on('group-participants.update', async (update) => {
    const { id, action, participants, actor } = update

    if (!id.endsWith('@g.us')) return
    if (!['promote', 'demote'].includes(action)) return
    if (!actor) return // si no hay actor → fue el bot o sistema

    const target = participants?.[0]
    if (!target) return

    const text =
      action === 'promote'
        ? `👑 @${target.split('@')[0]} ahora es administrador.\n\n👤 Acción realizada por @${actor.split('@')[0]}`
        : `🧹 @${target.split('@')[0]} ya no es administrador.\n\n👤 Acción realizada por @${actor.split('@')[0]}`

    await sock.sendMessage(id, {
      text,
      mentions: [target, actor],
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      }
    })
  })

  // ⚙️ CAMBIOS DEL GRUPO (abrir/cerrar, nombre, descripción, foto)
  sock.ev.on('groups.update', async (updates) => {
    for (const u of updates) {
      const { id, announce, subject, desc, picture, author } = u
      if (!id.endsWith('@g.us')) continue
      if (!author) continue // si no hay autor → bot o sistema

      const mentions = [author]
      const botName = sock.user?.name || 'ChappieBot'
      let text = ''

      // 🔒 ABRIR / CERRAR GRUPO
      if (announce !== undefined) {
        text = announce
          ? `🔒 *El grupo fue cerrado (solo admins pueden enviar mensajes)*\n\n👤 Acción realizada por @${author.split('@')[0]}`
          : `🔓 *El grupo fue abierto (todos pueden enviar mensajes)*\n\n👤 Acción realizada por @${author.split('@')[0]}`
      }

      // ✏️ CAMBIO DE NOMBRE
      if (subject) {
        text = `✏️ *Nombre del grupo cambiado*\n\n📛 Nuevo nombre: *${subject}*\n👤 Acción realizada por @${author.split('@')[0]}`
      }

      // 📝 CAMBIO DE DESCRIPCIÓN
      if (desc !== undefined) {
        text = `📝 *Descripción del grupo modificada*\n\n👤 Acción realizada por @${author.split('@')[0]}`
      }

      // 📷 CAMBIO DE FOTO (solo texto)
      if (picture) {
        text = `🖼️ *Foto del grupo actualizada*\n\n👤 Acción realizada por @${author.split('@')[0]}`
      }

      if (!text) continue

      await sock.sendMessage(id, {
        text: text + `\n\n> ${botName}`,
        mentions,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true
        }
      })
    }
  })
}
