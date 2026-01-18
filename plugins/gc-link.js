export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // ───── VERIFICAR ADMIN ─────
  if (!isAdmin) {
    return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')
  }

  // ───── OBTENER LINK ─────
  let inviteCode
  try {
    inviteCode = await sock.groupInviteCode(from)
  } catch {
    return reply('❌ No pude obtener el link del grupo')
  }
  const link = `https://chat.whatsapp.com/${inviteCode}`

  // ───── OBTENER FOTO DEL GRUPO ─────
  let image = null
  try {
    const groupPic = await sock.profilePictureUrl(from, 'image')
    if (groupPic) image = { url: groupPic }
  } catch {}

  const text = `🔗 *Link del grupo*\n\n${link}\n\n> ${botName}`

  // ───── ENVIAR MENSAJE ─────
  if (image) {
    await sock.sendMessage(from, { image, caption: text }, { quoted: m })
  } else {
    await sock.sendMessage(from, { text }, { quoted: m })
  }
}

handler.command = ['link']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
