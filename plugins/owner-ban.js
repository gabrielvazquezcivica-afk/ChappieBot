import fs from 'fs'

const file = './data/ban.json'

function loadBan() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')
  return JSON.parse(fs.readFileSync(file))
}

function saveBan(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, isOwner, args, reply }) => {

  if (!isOwner) return reply('⚠️ Solo el owner puede usar este comando')

  let user = null

  if (m.mentionedJid && m.mentionedJid.length) {
    user = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    user = m.quoted.sender
  } else if (args[0]) {
    const number = args[0].replace(/[^0-9]/g, '')
    if (number.length < 5) return reply('⚠️ Número inválido')
    user = number + '@s.whatsapp.net'
  }

  if (!user) return reply('⚠️ Menciona o responde al usuario')

  let banned = loadBan()

  if (banned.includes(user)) return reply('⚠️ Ese usuario ya está baneado')

  banned.push(user)
  saveBan(banned)

  await sock.sendMessage(
    m.chat,
    {
      text: `🚫 Usuario baneado\n\n👤 @${user.split('@')[0]}`,
      mentions: [user]
    },
    { quoted: m }
  )
}

handler.command = ['ban']
handler.tags = ['owner']
handler.help = ['ban @usuario']
handler.owner = true
handler.menu = true

export default handler
