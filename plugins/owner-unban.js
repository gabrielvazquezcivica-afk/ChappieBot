import fs from 'fs'

const file = './data/ban.json'

function loadBan() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')
  return JSON.parse(fs.readFileSync(file))
}

function saveBan(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function getNumber(m,args){

  if (m.mentionedJid?.length)
    return m.mentionedJid[0].split('@')[0]

  if (m.quoted?.sender)
    return m.quoted.sender.split('@')[0]

  if (args[0])
    return args[0].replace(/[^0-9]/g,'')

  return null
}

export const handler = async (m,{ isOwner,args,reply }) => {

  if (!isOwner) return reply('⚠️ Solo el owner puede usar este comando')

  const number = getNumber(m,args)

  if (!number) return reply('⚠️ Menciona o responde al usuario')

  let banned = loadBan()

  if (!banned.includes(number))
    return reply('⚠️ Ese usuario no está baneado')

  banned = banned.filter(x => x !== number)

  saveBan(banned)

  reply(`✅ Usuario desbaneado\n\n👤 ${number}`)

}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true

export default handler
