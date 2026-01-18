export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // 🔒 Solo grupos
  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 👮 Verificar admin usando isAdmin del index
  if (!isAdmin) return reply(msgs.admin || '⚠️ Este comando es solo para administradores')

  // 🔹 Obtener link de invitación
  let inviteCode
  try {
    inviteCode = await sock.groupInviteCode(from)
  } catch (e) {
    console.log('❌ Error obteniendo link:', e)
    return reply('❌ No pude obtener el link del grupo')
  }
  const link = `https://chat.whatsapp.com/${inviteCode}`

  // 🔹 Obtener foto del grupo o del bot
  let image = null
  try {
    try {
      const groupPicUrl = await sock.profilePictureUrl(from, 'image')
      if (groupPicUrl) image = { url: groupPicUrl }
    } catch {
      const botPicUrl = await sock.profilePictureUrl(sock.user.id, 'image')
      if (botPicUrl) image = { url: botPicUrl }
    }
  } catch (e) {
    console.log('❌ Error obteniendo imagen:', e)
  }

  const text = `🔗 *Link del grupo*\n\n${link}\n\n> ${botName}`

  // 🔹 Enviar mensaje como **citado al mensaje original** y con foto si existe
  try {
    if (image) {
      await sock.sendMessage(from, {
        image,
        caption: text,
        quoted: m
      })
    } else {
      await sock.sendMessage(from, {
        text,
        quoted: m
      })
    }
  } catch (e) {
    console.log('❌ Error enviando link:', e)
    reply('❌ No pude enviar el link del grupo')
  }
}

handler.command = ['link']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
