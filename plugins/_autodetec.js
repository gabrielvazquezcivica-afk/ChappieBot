let started = false

export const handler = async () => {}

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  // ───── ADMIN / DEMOTE ─────
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action, author } = update
    if (!id.endsWith('@g.us')) return
    if (!['promote', 'demote'].includes(action)) return

    const user = participants[0]
    if (!user || !author) return

    const text =
      action === 'promote'
        ? `👑 *Administrador asignado*\n\n👤 Usuario: @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`
        : `👤 *Administrador removido*\n\n👤 Usuario: @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`

    await sock.sendMessage(id, {
      text: text + `\n\n> ${botName}`,
      mentions: [user, author],
      forwarded: true
    })
  })

  // ───── CAMBIOS DEL GRUPO ─────
  sock.ev.on('groups.update', async (updates) => {
    for (const g of updates) {
      const { id, subject, desc, announce, picture } = g
      if (!id.endsWith('@g.us')) continue

      let text = ''

      if (announce === true) text = '🔒 *El grupo fue cerrado*'
      if (announce === false) text = '🔓 *El grupo fue abierto*'
      if (subject) text = `✏️ *Nombre del grupo cambiado*\n\n📌 ${subject}`
      if (desc !== undefined) text = '📝 *Descripción del grupo modificada*'
      if (picture) text = '🖼️ *Foto del grupo actualizada*'

      if (!text) continue

      await sock.sendMessage(id, {
        text: text + `\n\n> ${botName}`,
        forwarded: true
      })
    }
  })
}

export default handler
