import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

// ⏱️ COOLDOWN (10 minutos)
const COOLDOWN = 10 * 60 * 1000

function loadDB() {
  if (!fs.existsSync(registroPath)) return {}
  return JSON.parse(fs.readFileSync(registroPath))
}

function saveDB(data) {
  fs.writeFileSync(registroPath, JSON.stringify(data, null, 2))
}

const items = [
  { nombre: '👕 Playera', precio: 120 },
  { nombre: '👟 Tenis', precio: 300 },
  { nombre: '🎮 Videojuego', precio: 450 },
  { nombre: '📱 Celular', precio: 800 },
  { nombre: '🕶️ Lentes', precio: 200 },
  { nombre: '⌚ Reloj', precio: 350 },
  { nombre: '🎧 Audífonos', precio: 250 },
  { nombre: '🧢 Gorra', precio: 150 }
]

export const handler = async (m, { sock, from, sender, reply, isGroup }) => {

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

  if (!user?.registered) {
    return reply('❌ No estás registrado. Usa: .reg nombre edad')
  }

  if (!user.inventory) user.inventory = []
  if (!user.money) user.money = 0
  if (!user.lastShop) user.lastShop = 0

  // ⏱️ COOLDOWN
  const now = Date.now()
  const diff = now - user.lastShop

  if (diff < COOLDOWN) {
    const restante = COOLDOWN - diff
    const minutos = Math.ceil(restante / 60000)
    return reply(`⏳ Debes esperar *${minutos} minuto(s)* para volver a comprar en la tienda`)
  }

  const item = items[Math.floor(Math.random() * items.length)]

  if (user.money < item.precio) {
    return reply(
`❌ No tienes suficiente dinero

💰 Precio: ${item.precio}
💳 Tu saldo: ${user.money}`
    )
  }

  user.money -= item.precio
  user.inventory.push(item)
  user.lastShop = now

  saveDB(db)

  reply(
`🛒 COMPRA REALIZADA

📦 Objeto: ${item.nombre}
💰 Costo: ${item.precio}
💳 Saldo restante: ${user.money}`
  )
}

handler.command = ['tienda']
handler.tags = ['rpg']
handler.menu = true
export default handler
