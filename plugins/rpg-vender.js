import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { reply, sender, from, args, isGroup, sock }) => {

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

  const inv = user.inventory || []

  if (!inv.length) {
    return reply('🎒 No tienes objetos para vender')
  }

  if (!args[0]) {
    let list = '💰 ¿Qué deseas vender?\n\n'
    inv.forEach((item, i) => {
      list += `${i + 1}. ${item.nombre} (${item.precio}💰)\n`
    })
    list += `\nUsa: .vender número`
    return reply(list)
  }

  const index = parseInt(args[0]) - 1
  if (isNaN(index) || !inv[index]) {
    return reply('❌ Número inválido')
  }

  const item = inv[index]
  const sellPrice = Math.floor(item.precio * 0.6)

  user.money += sellPrice
  inv.splice(index, 1)
  user.inventory = inv

  saveJSON(registroPath, registros)

  reply(
`💸 VENTA EXITOSA

📦 Vendiste: ${item.nombre}
💰 Recibiste: ${sellPrice} coins

💳 Saldo actual: ${user.money}`
  )
}

handler.command = ['vender']
handler.tags = ['rpg']
handler.menu = true

export default handler
