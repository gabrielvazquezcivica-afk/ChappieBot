import config from '../config.js'

// ───── HELPERS ─────
function onlyNumber (jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isOwner
}) => {

  // 🔒 SOLO OWNER
  if (!isOwner) {
    return reply(global.config.messages.owner)
  }

  if (!args[0]) {
    return reply(
`🤖 *JOIN DE GRUPO*

📌 Uso:
.join <link del grupo>

🔗 Ejemplo:
.join https://chat.whatsapp.com/XXXXXXX`
    )
  }

  const link = args[0]
  const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)

  if (!match) {
    return reply('❌ El link del grupo no es válido')
  }

  const inviteCode = match[1]

  // ⏳ reacción de proceso
  await sock.sendMessage(from, {
    react: { text: '⏳', key: m.key }
  })

  try {

    await sock.groupAcceptInvite(inviteCode)

    // ✅ reacción de éxito
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

    reply(
`✅ *UNIDO AL GRUPO*

🤖 ChappieBot ya entró al grupo correctamente
👑 Acción autorizada por el OWNER`
    )

  } catch (e) {

    console.error('JOIN ERROR:', e)

    reply(
`❌ *NO PUDE UNIRME*

Posibles causas:
• Link expirado
• El bot ya está en el grupo
• WhatsApp bloqueó la invitación`
    )
  }
}

handler.command = ['join']
handler.tags = ['owner']
handler.help = ['join <link>']
handler.menu = true
handler.owner = true

export default handler
