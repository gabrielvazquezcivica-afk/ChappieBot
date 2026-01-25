import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

function loadDB() {
  if (!fs.existsSync(registroPath)) return {}
  return JSON.parse(fs.readFileSync(registroPath))
}

function saveDB(data) {
  fs.writeFileSync(registroPath, JSON.stringify(data, null, 2))
}

function onlyNumber(jid = '') {
  return jid.replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, sender, args, reply }) => {

  // 👑 OWNER desde config
  const owners = global.config.owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  const db = loadDB()

  // 🎯 Usuario objetivo
  let target = sender
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0]
  }

  if (!db[target]?.registered) {
    return reply('❌ Ese usuario no está registrado')
  }

  // 📊 Cantidades
  const coins = parseInt(args[0]) || 1000
  const exp = parseInt(args[1]) || 500
  const level = parseInt(args[2]) || 1
  const health = parseInt(args[3]) || 100

  db[target].money += coins
  db[target].exp += exp
  db[target].level += level
  db[target].health += health

  saveDB(db)

  reply(
`😈 CHETADO EXITOSO

👤 Usuario: @${onlyNumber(target)}
💰 Coins: +${coins}
✨ EXP: +${exp}
⭐ Nivel: +${level}
❤️ Vida: +${health}
`
  )
}

handler.command = ['chetar']
handler.tags = ['owner']
handler.menu = true
handler.owner = true

export default handler
