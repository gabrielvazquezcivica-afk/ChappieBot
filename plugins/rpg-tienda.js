import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const COOLDOWN = 10 * 60 * 1000 // 10 minutos

const tiendas = [
  { nombre: 'Playera nueva 👕', precio: 50, tipo: 'Ropa' },
  { nombre: 'Tenis deportivos 👟', precio: 120, tipo: 'Ropa' },
  { nombre: 'Videojuego 🎮', precio: 150, tipo: 'Videojuegos' },
  { nombre: 'Control gamer 🕹️', precio: 200, tipo: 'Videojuegos' },
  { nombre: 'Hamburguesa 🍔', precio: 40, tipo: 'Comida' },
  { nombre: 'Pizza 🍕', precio: 60, tipo: 'Comida' },
  { nombre: 'Audífonos 🎧', precio: 180, tipo: 'Electrónica' },
  { nombre: 'Celular 📱', precio: 500, tipo: 'Electrónica' },
  { nombre: 'Mochila 🎒', precio: 90, tipo: 'Accesorios' },
  { nombre: 'Reloj ⌚', precio: 220, tipo: 'Accesorios' }
]

// ───── HELPERS ─────
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { reply, sender, from, isGroup, sock }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return
  }
  /* ─────────────────────────────────────────────── */

  const registros = loadJSON(registroPath)
  const user = registros[sender]

  if (!user?.registered) {
    return reply('❌ No estás registrado. Usa `.reg nombre edad`')
  }

  const now = Date.now()
  if (user.lastShop && now - user.lastShop < COOLDOWN) {
    const wait = Math.ceil((COOLDOWN - (now - user.lastShop)) / 60000)
    return reply(`🕒 Debes esperar ${wait} minuto(s) para volver a comprar.`)
  }

  const item = tiendas[Math.floor(Math.random() * tiendas.length)]

  if (user.money < item.precio) {
    return reply(
`💸 No tienes suficientes coins
🛒 Artículo: ${item.nombre}
💰 Precio: ${item.precio}
💳 Tu saldo: ${user.money}`
    )
  }

  user.money -= item.precio
  user.lastShop = now

  saveJSON(registroPath, registros)

  reply(
`🛍️ COMPRA REALIZADA

🏪 Tienda: ${item.tipo}
📦 Compraste: ${item.nombre}
💰 Precio: ${item.precio} coins

💳 Saldo restante: ${user.money} coins`
  )
}

handler.command = ['tienda']
handler.tags = ['rpg']
handler.menu = true

export default handler
