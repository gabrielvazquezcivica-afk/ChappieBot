export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // ───── METADATA Y ADMINS ─────
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin || p.id === metadata.owner)
    .map(p => p.id)

  // ───── VERIFICAR ADMIN ─────
  if (!admins.includes(sender)) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  // ───── OBTENER LINK ─────
  const inviteCode = await sock.groupInviteCode(from)
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
