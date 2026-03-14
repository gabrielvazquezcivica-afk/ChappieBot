import fs from 'fs'

const file = './data/ban.json'

function loadBan() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')
  return JSON.parse(fs.readFileSync(file))
}

function saveBan(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function getUser(m, args) {

  if (m.mentionedJid?.length) {
    return m.mentionedJid[0].split(':')[0]
  }

  if (m.quoted?.sender) {
    return m.quoted.sender.split(':')[0]
  }

  if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, '')
    if (!num) return null
    return num + '@s.whatsapp.net'
  }

  return null
}

export const handler = async (m, { sock, isOwner, args, reply }) => {

  if (!isOwner) return reply('⚠️ Solo el owner puede usar este comando')

  const user = getUser(m, args)

  if (!user) return reply('⚠️ Menciona o responde al usuario')

  let banned = loadBan()

  if (!banned.includes(user)) {
    return reply('⚠️ Ese usuario no está baneado')
  }

  banned = banned.filter(u => u !== user)

  saveBan(banned)

  const number = user.split('@')[0]

  await sock.sendMessage(
    m.chat,
    { text: `✅ Usuario desbaneado\n\n👤 ${number}` },
    { quoted: m }
  )

}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
