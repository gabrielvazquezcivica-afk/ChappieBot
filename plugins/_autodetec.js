export const handler = {
  before: async (m, { sock }) => {
    if (!m || !m.messageStubType) return
    if (!m.key.remoteJid?.endsWith('@g.us')) return

    const from = m.key.remoteJid
    const actor = m.key.participant || m.participant
    const actorTag = actor ? `@${actor.split('@')[0]}` : 'Desconocido'

    let text = ''
    let mentions = actor ? [actor] : []

    switch (m.messageStubType) {

      // 🔒 Grupo cerrado / abierto
      case 1:
        text = `🔒 *El grupo fue cerrado*\n👤 Acción realizada por: ${actorTag}`
        break

      case 2:
        text = `🔓 *El grupo fue abierto*\n👤 Acción realizada por: ${actorTag}`
        break

      // 🛡️ Admin añadido / removido
      case 29:
        text = `🛡️ *Se otorgó administrador*\n👤 Acción realizada por: ${actorTag}`
        break

      case 30:
        text = `🚫 *Se retiró administrador*\n👤 Acción realizada por: ${actorTag}`
        break

      // ✏️ Descripción
      case 21:
        text = `📝 *Se cambió la descripción del grupo*\n👤 Acción realizada por: ${actorTag}`
        break

      // 🏷️ Nombre del grupo
      case 22:
        text = `🏷️ *Se cambió el nombre del grupo*\n👤 Acción realizada por: ${actorTag}`
        break

      // 🖼️ Foto del grupo
      case 23:
        text = `🖼️ *Se cambió la foto del grupo*\n👤 Acción realizada por: ${actorTag}`
        break

      default:
        return
    }

    await sock.sendMessage(
      from,
      {
        text,
        mentions,
        forwardingScore: 999, // 🔁 reenviado muchas veces
        isForwarded: true
      }
    )
  }
}

export default handler
