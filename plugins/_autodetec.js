export const handler = async () => {}
handler.all = async (m, { sock }) => {
  try {
    const from = m.key.remoteJid
    if (!from || !from.endsWith('@g.us')) return

    const msg = m.message?.protocolMessage ||
                m.message?.groupProtocolMessage

    if (!msg) return

    const metadata = await sock.groupMetadata(from)
    const subject = metadata.subject
    const actor = m.key.participant
    const actorTag = actor ? `@${actor.split('@')[0]}` : 'Desconocido'

    let text = ''

    // ───── ABRIR / CERRAR GRUPO ─────
    if (msg.type === 4) {
      const isClosed = msg.groupChange?.announce
      text = isClosed
        ? `🔒 *Grupo cerrado*\n\n👮 Acción por: ${actorTag}`
        : `🔓 *Grupo abierto*\n\n👮 Acción por: ${actorTag}`
    }

    // ───── CAMBIO DE NOMBRE ─────
    if (msg.type === 21) {
      text =
        `✏️ *Nombre del grupo actualizado*\n\n` +
        `📌 Nuevo nombre:\n${subject}\n\n` +
        `👮 Acción por: ${actorTag}`
    }

    // ───── CAMBIO DE DESCRIPCIÓN ─────
    if (msg.type === 22) {
      text =
        `📝 *Descripción del grupo modificada*\n\n` +
        `👮 Acción por: ${actorTag}`
    }

    // ───── ADMIN / DEMOTE ─────
    if (msg.type === 25) {
      const action = msg.groupChange?.promote
      const users = msg.groupChange?.participants || []

      for (const u of users) {
        text = action
          ? `⬆️ *Administrador asignado*\n\n👤 Usuario: @${u.split('@')[0]}\n👮 Por: ${actorTag}`
          : `⬇️ *Administrador removido*\n\n👤 Usuario: @${u.split('@')[0]}\n👮 Por: ${actorTag}`

        await sock.sendMessage(from, {
          text,
          mentions: [u, actor],
          forwarded: true
        })
      }
      return
    }

    // ───── FOTO DE GRUPO ─────
    if (msg.type === 26) {
      text =
        `🖼️ *Foto del grupo actualizada*\n\n` +
        `👮 Acción por: ${actorTag}`
    }

    if (!text) return

    await sock.sendMessage(from, {
      text,
      mentions: actor ? [actor] : [],
      forwarded: true
    })

  } catch (e) {
    console.log('❌ autodetect error:', e)
  }
}

export default handler
