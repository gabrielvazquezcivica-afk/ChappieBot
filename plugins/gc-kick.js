export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  isAdmin,
  reply
}) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'
  const botJid = sock.user?.id
  const owners = global.config.owner?.numbers || []

  if (!isGroup)
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // ⚠️ Solo admins
  if (!isAdmin)
    return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')

  let metadata
  try {
    metadata = await sock.groupMetadata(from)
  } catch (e) {
    return reply('⚠️ No tengo permisos para obtener información del grupo')
  }

  const groupOwner = metadata.owner

  // 🎯 Usuario objetivo
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant

  if (!user) {
    return reply(
      '⚠️ Uso incorrecto:\nMenciona al usuario o responde a su mensaje\nEjemplo: .kick @usuario'
    )
  }

  /* ───── 🛡 PROTECCIONES ───── */

  // ❌ No kick creator
  if (user === groupOwner)
    return reply('🛡 No puedes expulsar al creador del grupo')

  // 🧠 Número limpio
  const userNumber = user.replace(/[^0-9]/g, '')

  // 🛡 Protección owner del bot
  if (owners.includes(userNumber))
    return reply('🛡 No puedes expulsar al OWNER del bot')

  /* ───── 😈 ANTI KICK AL BOT ───── */
  if (user === botJid) {
    const frases = [
      '😈 ¿Intentaste sacarme? Error fatal.',
      '🤖 Buena suerte la próxima vez.',
      '🧠 Pensaste que sería tan fácil?',
      '😂 Yo no salgo, tú sí.'
    ]

    const frase = frases[Math.floor(Math.random() * frases.length)]

    // 🎭 Mensaje troll
    await sock.sendMessage(from, {
      text: `${frase}\n\n🚪 *Expulsando al traidor...*`,
      mentions: [sender],
      quoted: m
    })

    // 🚨 Intentar expulsar al admin
    try {
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
    } catch (e) {
      if (e?.data === 403) {
        return reply('⚠️ No tengo permisos para defenderme.\nNecesito ser *ADMIN*.')
      }
      console.log('❌ Anti-kick error:', e)
    }
    return
  }

  /* ───── 🚪 KICK NORMAL ───── */
  try {
    // Reacción
    await sock.sendMessage(from, {
      react: { text: '🚪', key: m.key }
    })

    await sock.groupParticipantsUpdate(from, [user], 'remove')

    await sock.sendMessage(
      from,
      {
        text:
`🚨 *USUARIO EXPULSADO*

🍁 Usuario: @${user.split('@')[0]}
👮 Expulsado por: @${sender.split('@')[0]}
> ${botName}`,
        mentions: [user, sender]
      },
      { quoted: m }
    )

  } catch (e) {
    if (e?.data === 403) {
      return reply('⚠️ No tengo permisos para expulsar usuarios.\nHazme *ADMIN*.')
    }
    console.log('❌ Error kick:', e)
    reply(msgs.error || '❌ No pude expulsar al usuario')
  }
}

handler.command = ['kick']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
