export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'
  const botJid = sock.user?.id || ''
  const owners = global.config.owner?.numbers || []

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // ⚠️ Solo admins pueden ejecutar
  if (!isAdmin) return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')

  const metadata = await sock.groupMetadata(from)
  const groupOwner = metadata.owner

  // 🎯 Usuario objetivo
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user = ctx?.mentionedJid?.[0] || ctx?.participant

  if (!user) {
    return reply(
      '⚠️ Uso incorrecto:\nMenciona al usuario o responde a su mensaje\nEjemplo: .kick @usuario'
    )
  }

  // 🚨 SI INTENTAN SACAR AL BOT
  if (user === botJid) {
    const frases = [
      '😹 Buen intento, pero aquí mando yo',
      '🤖 ¿Expulsarme a mí? error 404 cerebro no encontrado',
      '😂 Intenta con otro bot, este no',
      '🛡️ Protección anti-tontos activada'
    ]

    const frase = frases[Math.floor(Math.random() * frases.length)]

    try {
      await sock.sendMessage(from, {
        text: `${frase}\n\n👢 Ahora sales tú @${sender.split('@')[0]}\n> ${botName}`,
        mentions: [sender]
      }, { quoted: m })

      // 👢 Eliminar al que intentó sacar al bot
      await sock.groupParticipantsUpdate(from, [sender], 'remove')
    } catch (e) {
      console.log('❌ AntiKickBot ERROR:', e)
    }

    return
  }

  // 🔒 Protecciones normales
  if (user === groupOwner) return reply('🛡 No puedes expulsar al creador del grupo')

  const userNumber = user.replace(/[^0-9]/g, '')
  if (owners.includes(userNumber)) return reply('🛡 No puedes expulsar al OWNER del bot')

  try {
    // 🚨 Reacción
    await sock.sendMessage(from, { react: { text: '🚪', key: m.key } })

    // 👢 Expulsar usuario
    await sock.groupParticipantsUpdate(from, [user], 'remove')

    // 📢 Mensaje informativo
    await sock.sendMessage(
      from,
      {
        text: `🚨 Usuario expulsado:
🍁 @${user.split('@')[0]}
👮 Expulsado por: @${sender.split('@')[0]}
> ${botName}`,
        mentions: [user, sender]
      },
      { quoted: m }
    )
  } catch (e) {
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
