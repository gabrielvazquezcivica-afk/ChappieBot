import fs from 'fs'

const file = './data/ban.json'

function loadBan() {
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file))
}

function saveBan(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { isOwner, reply }) => {

  if (!isOwner) return reply('❌ Solo el owner')

  const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid
  const user = mention?.[0]

  if (!user) return reply('⚠️ Menciona al usuario')

  let banned = loadBan()

  if (banned.includes(user)) return

  banned.push(user)
  saveBan(banned)

  reply('🚫 Usuario baneado')
}

handler.command = ['ban']
handler.tag = ['owner']
handler.owner = true
handler.menu =true

export default handler
