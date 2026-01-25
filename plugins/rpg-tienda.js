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

export const handler = async (m, { sender, reply }) => {
  const db = loadDB()
  const user = db[sender]

  if (!user?.registered) {
    return reply('❌ No estás registrado. Usa: .reg nombre edad')
  }

  if (!user.inventory) user.inventory = []
  if (!user.money) user.money = 0

  const item = items[Math.floor(Math.random() * items.length)]

  if (user.money < item.precio) {
    return reply(
`❌ No tienes suficiente dinero

💰 Precio: ${item.precio}
💳 Tu saldo: ${user.money}`
    )
  }

  user.money -= item.precio
  user.inventory.push({
    nombre: item.nombre,
    precio: item.precio
  })

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
