export const handler = async (m, { sock, from, isGroup, reply }) => {
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // Obtener admins
  const admins = participants.filter(
    p => p.admin === 'admin' || p.admin === 'superadmin'
  )

  // Validar que quien ejecuta sea admin
  if (!admins.map(a => a.id).includes(m.key.participant)) {
    return reply('⚠️ Este comando es solo para administradores')
  }

  // Reacción
  await sock.sendMessage(from, { react: { text: '🕴🏻', key: m.key } })

  // Obtener foto del grupo
  let image = null
  try {
    const gpfp = await sock.profilePictureUrl(from, 'image')
    if (gpfp) image = { url: gpfp }
  } catch {}

  // Construir texto
  let text = `╭━━━〔 👑 ADMINS DEL GRUPO 〕━━━╮
┃ 📛 Grupo : ${metadata.subject}
┃ 👑 Total : ${admins.length}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 👤 LISTA 〕━━━╮
`

  const mentions = []

  for (const admin of admins) {
    const name = admin?.notify || admin.id.split('@')[0]
    const role = admin.admin === 'superadmin' ? '👑 Creador' : '🛡️ Admin'
    text += `┃ ${role} → @${name}\n`
    mentions.push(admin.id)
  }

  text += `╰━━━━━━━━━━━━━━━━━━━━━━╯
> ${botName}`

  // Enviar mensaje
  if (image) {
    await sock.sendMessage(
      from,
      { image, caption: text, mentions },
      { quoted: m }
    )
  } else {
    await sock.sendMessage(
      from,
      { text, mentions },
      { quoted: m }
    )
  }
}

handler.command = ['admins']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
