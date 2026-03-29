export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const fs = await import('fs')

  let db = {}
  try {
    db = JSON.parse(fs.readFileSync('./data/msgcount.json'))
  } catch {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const ghosts = participants.filter(p => {
    const count = db[from]?.[p.id] || 0
    return count < 10
  })

  if (!ghosts.length) {
    return reply('🎉 Todos tienen +10 mensajes')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `👻 INACTIVOS (<10 msj)\n\n`
  const mentions = []

  for (const p of ghosts) {
    const num = p.id.split('@')[0]
    const count = db[from]?.[p.id] || 0

    text += `👻 @${num} → ${count}\n`
    mentions.push(p.id)
  }

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

handler.command = ['fantasmas']
handler.group = true
handler.admin = true

export default handler
