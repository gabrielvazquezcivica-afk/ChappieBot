export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {
  if (!isGroup) return

  // 📌 Metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 👑 Verificar admin
  const isAdmin = participants.some(
    p =>
      p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
  )

  // 🚫 No admin → solo reacción silenciosa
  if (!isAdmin) {
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    return
  }

  // 🔁 Reacción de proceso
  await sock.sendMessage(from, {
    react: { text: '🔁', key: m.key }
  })

  // 🔄 Resetear link
  await sock.groupRevokeInvite(from)

  const code = await sock.groupInviteCode(from)
  const link = `https://chat.whatsapp.com/${code}`

  const caption = `╭━━━〔 🔁 LINK RESETEADO 〕━━━╮
┃ 📛 Grupo : ${metadata.subject}
┃ 🔗 Nuevo link:
┃ ${link}
╰━━━━━━━━━━━━━━━━━━━━━━╯
> ${sock.user?.name || 'ChappieBot'}`

  // 🖼️ Foto del grupo
  let image = null
  try {
    const pfp = await sock.profilePictureUrl(from, 'image')
    if (pfp) image = { url: pfp }
  } catch {}

  // 📤 Enviar mensaje
  if (image) {
    await sock.sendMessage(
      from,
      { image, caption },
      { quoted: m }
    )
  } else {
    await sock.sendMessage(
      from,
      { text: caption },
      { quoted: m }
    )
  }
}

handler.command = ['resetlink']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.tags = ['group']
handler.menu = true

export default handler
