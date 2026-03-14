import fs from 'fs'

const file = './data/ban.json'

function loadBan() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')
  return JSON.parse(fs.readFileSync(file))
}

function saveBan(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, mentionedJid, isOwner, reply }) => {

  if (!isOwner) return reply('⚠️ Solo el owner puede usar este comando')

  const user = mentionedJid[0]
  if (!user) return reply('⚠️ Menciona al usuario')

  let banned = loadBan()

  if (banned.includes(user)) {
    return reply('⚠️ Ese usuario ya está baneado')
  }

  banned.push(user)
  saveBan(banned)

  await sock.sendMessage(m.chat, {
    text: `🚫 Usuario baneado del bot\n\n👤 @${user.split('@')[0]}`,
    mentions: [user]
  }, { quoted: m })

}

handler.command = ['ban']
handler.tags = ['owner']
handler.help = ['ban @usuario']
handler.owner = true
handler.menu = true

export default handler
