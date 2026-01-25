import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

// 🛒 Objetos de la tienda
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

export const handler = async (m, {
  reply,
  sender,
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

  let text = `╭─〔 🏪 TIENDA RPG 〕\n`

  for (let item of tienda) {
    text += `│ ${item.id}. ${item.name} - 💰 ${item.price} coins\n`
  }

  text += `├───────────────
│ 💰 Tu saldo: ${user.money || 0} coins
│
│ Próximamente:
│ .comprar <id>
╰─〔 🤖 ChappieBot RPG 〕`

  reply(text)
}

handler.command = ['tienda']
handler.tags = ['rpg']
handler.menu = true

export default handler
