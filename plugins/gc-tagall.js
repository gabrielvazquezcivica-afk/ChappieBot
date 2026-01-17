export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('❌ Solo se puede usar en grupos')

  // Obtener metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants
  const botName = sock.user?.name || 'ChappieBot'

  // Solo admins pueden ejecutar
  const admins = participants.filter(p => p.admin).map(p => p.id)
  if (!admins.includes(m.key.participant)) {
    return reply('❌ Solo admins pueden usar este comando')
  }

  // Emoji fijo para cada participante
  const emoji = '👤'

  // Construir lista de menciones
  const mentions = participants.map(p => p.id)
  let message = `🏜️ *Miembros de ${metadata.subject}* (${participants.length}):\n\n`

  participants.forEach((p, i) => {
    const name = p?.name || p.id.split('@')[0]
    message += `${emoji} ${i + 1}. @${p.id.split('@')[0]}\n`
  })

  // Mandar mensaje mencionando a todos
  await sock.sendMessage(
    from,
    { text: message, mentions },
    { quoted: m }
  )

  // Reaccionar al mensaje original
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })
}

handler.command = ['todos', 'everyone']
handler.tags = ['group']
handler.help = ['todos']
handler.group = true
handler.admin = true
handler.menu = true
