import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

function loadDB() {
  if (!fs.existsSync(registroPath)) return {}
  return JSON.parse(fs.readFileSync(registroPath))
}

function saveDB(data) {
  fs.writeFileSync(registroPath, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, from, sender, args, reply, isGroup }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
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

  if (!user?.registered) return reply('❌ No estás registrado')

  if (!user.inventory || user.inventory.length === 0) {
    return reply('🎒 No tienes objetos para vender')
  }

  const index = parseInt(args[0]) - 1
  if (isNaN(index) || !user.inventory[index]) {
    return reply('❌ Usa: .vender número\nEjemplo: .vender 1')
  }

  const item = user.inventory[index]
  const ganancia = Math.floor(item.precio * 0.7)

  user.inventory.splice(index, 1)
  user.money += ganancia

  saveDB(db)

  reply(
`💰 VENTA EXITOSA

📦 Vendiste: ${item.nombre}
💵 Ganaste: ${ganancia}
💳 Saldo actual: ${user.money}`
  )
}

handler.command = ['vender']
handler.tags = ['rpg']
handler.menu = true
export default handler
