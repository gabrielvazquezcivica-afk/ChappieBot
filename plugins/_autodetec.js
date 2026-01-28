let started = false

export const handler = async () => {}

// ───── QUOTED SISTEMA (CHAPPIEBOT) ─────      
const sistema = (titulo = 'ChappieBot 🏜️') => ({      
  key: {      
    fromMe: false,      
    participant: '0@s.whatsapp.net',      
    remoteJid: 'status@broadcast'      
  },      
  message: {      
    orderMessage: {      
      itemCount: 1,      
      message: titulo,      
      footerText: 'ChappieBot',      
      surface: 2,      
      sellerJid: '0@s.whatsapp.net'      
    }      
  }      
})      
// ─────────────────────────────────────

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  /* ───── ADMIN / DEMOTE ───── */
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action, author } = update
      if (!id || !id.endsWith('@g.us')) return
      if (!['promote', 'demote'].includes(action)) return

      const user = participants?.[0]
      if (typeof user !== 'string' || typeof author !== 'string') return

      const text =
        action === 'promote'
          ? `👑 Administrador asignado\n\n👤 @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`
          : `👤 Administrador removido\n\n👤 @${user.split('@')[0]}\n👮 Por: @${author.split('@')[0]}`

      await sock.sendMessage(
        id,
        {
          text: text + `\n\n> ${botName}`,
          mentions: [user, author]
        },
        { quoted: sistema() }
      )
    } catch (e) {
      console.log('AUTO-DETECT ADMIN ERROR:', e)
    }
  })

  /* ───── CAMBIOS DEL GRUPO ───── */
  sock.ev.on('groups.update', async (updates) => {
    for (const g of updates) {
      try {
        const {
          id,
          subject,
          desc,
          announce,
          picture,
          author,
          participants
        } = g

        if (!id || !id.endsWith('@g.us')) continue

        let actor = author || participants?.[0]
        if (typeof actor !== 'string') actor = null

        let text = ''
        let mentions = []

        if (announce === true)
          text = '🔒 El grupo fue cerrado'
        else if (announce === false)
          text = '🔓 El grupo fue abierto'
        else if (subject)
          text = `✏️ Nombre del grupo cambiado\n\n📌 ${subject}`
        else if (desc !== undefined)
          text = '📝 Descripción del grupo modificada'
        else if (picture)
          text = '🖼️ Foto del grupo actualizada'

        if (!text) continue

        if (actor) {
          text += `\n\n👮 Por: @${actor.split('@')[0]}`
          mentions.push(actor)
        }

        await sock.sendMessage(
          id,
          {
            text: text + `\n\n> ${botName}`,
            mentions
          },
          { quoted: sistema() }
        )
      } catch (e) {
        console.log('AUTO-DETECT GROUP ERROR:', e)
      }
    }
  })
}

export default handler
