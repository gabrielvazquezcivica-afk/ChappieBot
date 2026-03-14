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

  if (!isOwner) return

  let user =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

  if (!user) return reply('⚠️ Menciona o responde al usuario')

  let banned = loadBan()

  if (!banned.includes(user)) return reply('⚠️ Ese usuario no está baneado')

  banned = banned.filter(u => u !== user)

  saveBan(banned)

  await sock.sendMessage(
    m.chat,
    { text: `✅ Usuario desbaneado\n\n${user.split('@')[0]}` },
    { quoted: m }
  )

}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true

export default handler
