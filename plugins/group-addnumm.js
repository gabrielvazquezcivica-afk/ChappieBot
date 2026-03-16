export const handler = async (m, { sock, from, args, reply, isGroup, isAdmin }) => {

  if (!isGroup) return reply('⚠️ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')
  if (!isAdmin) return reply('⚠️ SOLO ADMINS PUEDEN USAR ESTE COMANDO')

  if (!args[0])
    return reply('📌 USO:\n.invitar 521234567890')

  // limpiar número
  let number = args[0].replace(/[^0-9]/g, '')

  if (number.length < 8)
    return reply('❌ NÚMERO INVÁLIDO')

  let user = number + '@s.whatsapp.net'

  try {

    // reacción
    await sock.sendMessage(from, {
      react: { text: '📨', key: m.key }
    })

    await sock.groupParticipantsUpdate(
      from,
      [user],
      'add'
    )

    await sock.sendMessage(
      from,
      {
        text: `✅ USUARIO INVITADO\n\n👤 @${number}`,
        mentions: [user]
      },
      { quoted: m }
    )

  } catch (e) {

    await reply('❌ NO SE PUDO AGREGAR\nEL USUARIO PUEDE TENER PRIVACIDAD ACTIVADA')

  }

}

handler.command = ['invitar','addnum']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
