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

// ───── COMANDO ─────
export const handler = async (m, { sock, from, sender, args, reply, isOwner }) => {

  // 🔒 SOLO OWNER
  if (!isOwner) {
    return reply('🚫 Solo el OWNER puede usar este comando')
  }

  // ⚡ Reacción inicial
  await sock.sendMessage(from, {
    react: { text: '💫', key: m.key }
  })

  const db = loadDB()

  // 🎯 Determinar usuario objetivo
  let target

  // 1️⃣ Si hay mención
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0]
  } 
  // 2️⃣ Si se responde a un mensaje
  else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  } 
  // 3️⃣ Fallback: te cheta a ti mismo
  else {
    target = sender
  }

  if (!db[target]?.registered) {
    return reply('❌ Ese usuario no está registrado')
  }

  const coins = parseInt(args[0]) || 1000
  const exp = parseInt(args[1]) || 500
  const level = parseInt(args[2]) || 1
  const health = parseInt(args[3]) || 100

  db[target].money += coins
  db[target].exp += exp
  db[target].level += level
  db[target].health += health

  saveDB(db)

  const text = `
😈 CHETADO EXITOSO

👤 Usuario: @${target.split('@')[0]}
💰 Coins: +${coins}
✨ EXP: +${exp}
⭐ Nivel: +${level}
❤️ Vida: +${health}
`.trim()

  await sock.sendMessage(from, {
    text,
    mentions: [target]
  }, { quoted: m })

  // ✅ Reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['chetar']
handler.tags = ['owner']
handler.menu = true
handler.owner = true

export default handler
