export const handler = async (m, { sock, from, isGroup, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  const participants = metadata.participants

  // Reacción al comando
  await sock.sendMessage(from, { react: { text: '🗣️', key: m.key } })

  // Texto con solo el nombre del grupo y total de miembros
  let text = `${metadata.subject}\n𝐦𝐢𝐞𝐦𝐛𝐫𝐨𝐬: ${participants.length}\n\n`

  const mentions = []

  // Construir lista de menciones
  for (const p of participants) {
    const name = p?.notify || p?.id.split('@')[0]
    text += `🍁→ @${name}\n`
    mentions.push(p.id) // JID exacto
  }

  text += `\n> ${botName}`

  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )
}

handler.command = ['todos']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
