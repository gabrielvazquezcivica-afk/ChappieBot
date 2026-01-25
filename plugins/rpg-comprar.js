import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

// 🏪 Misma tienda que el comando tienda
const tienda = [
  { id: 1, name: '🗡️ Espada', price: 150 },
  { id: 2, name: '🛡️ Escudo', price: 120 },
  { id: 3, name: '🧪 Pocion de vida', price: 80 },
  { id: 4, name: '🏹 Arco', price: 200 },
  { id: 5, name: '💣 Bomba', price: 300 }
]

// ───── HELPERS ─────
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) }
  catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, {
  reply,
  sender,
  args,
  from,
  isGroup,
  sock
}) => {

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

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  const registros = loadJSON(registroPath)
  const user = registros[sender]

  if (!user?.registered) {
    return reply(
`╭─〔 ❌ NO REGISTRADO 〕
│ Usa:
│ .reg nombre edad
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  if (!args[0]) {
    return reply(
`╭─〔 🛒 COMPRAR 〕
│ Uso:
│ .comprar <id>
│
│ Ejemplo:
│ .comprar 3
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  const id = parseInt(args[0])
  const item = tienda.find(i => i.id === id)

  if (!item) return reply('❌ Ese artículo no existe')

  if (!user.money) user.money = 0
  if (!user.inventory) user.inventory = []

  if (user.money < item.price) {
    return reply(
`╭─〔 ❌ SIN DINERO 〕
│ Te faltan: ${item.price - user.money} coins
│ Precio: ${item.price}
│ Saldo: ${user.money}
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  // 💰 pagar
  user.money -= item.price
  user.inventory.push(item.name)

  saveJSON(registroPath, registros)

  reply(
`╭─〔 ✅ COMPRA EXITOSA 〕
│ Objeto: ${item.name}
│ Precio: ${item.price} coins
│
│ 💰 Saldo restante: ${user.money}
╰─〔 🤖 ChappieBot RPG 〕`
  )
}

handler.command = ['comprar']
handler.tags = ['rpg']
handler.menu = true

export default handler
