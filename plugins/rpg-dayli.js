import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

// ⏰ 24 horas
const COOLDOWN = 24 * 60 * 60 * 1000

function loadDB() {
  if (!fs.existsSync(registroPath)) return {}
  return JSON.parse(fs.readFileSync(registroPath))
}

function saveDB(data) {
  fs.writeFileSync(registroPath, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, from, sender, reply, isGroup }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const isAdmin = participants.some(
      p => p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return
  }
  /* ───────────────────────────────── */

  const db = loadDB()
  const user = db[sender]

  if (!user?.registered) {
    return reply('❌ No estás registrado. Usa: .reg nombre edad')
  }

  if (!user.money) user.money = 0
  if (!user.exp) user.exp = 0
  if (!user.lastDaily) user.lastDaily = 0

  const now = Date.now()
  const diff = now - user.lastDaily

  if (diff < COOLDOWN) {
    const restante = COOLDOWN - diff
    const horas = Math.floor(restante / 3600000)
    const minutos = Math.floor((restante % 3600000) / 60000)

    return reply(
`⏳ Ya reclamaste tu recompensa diaria

🕒 Vuelve en: ${horas}h ${minutos}m`
    )
  }

  // 🎁 recompensas aleatorias
  const coins = Math.floor(Math.random() * 200) + 100 // 100 a 300
  const xp = Math.floor(Math.random() * 50) + 30       // 30 a 80 XP

  user.money += coins
  user.exp += xp
  user.lastDaily = now

  saveDB(db)

  await sock.sendMessage(from, { react: { text: '🎁', key: m.key } })

  reply(
`🎁 RECOMPENSA DIARIA

💰 Coins: +${coins}
✨ XP: +${xp}

💳 Saldo: ${user.money}
📊 EXP: ${user.exp}

🗓️ Vuelve mañana por más`
  )
}

handler.command = ['daily']
handler.tags = ['rpg']
handler.menu = true
export default handler
