import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

// ───── HELPERS ─────
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) }
  catch { return def }
}

// ───── HANDLER ─────
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

  const inventory = user.inventory || []

  if (!inventory.length) {
    return reply(
`╭─〔 🎒 INVENTARIO 〕
│ Tu mochila está vacía
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  let text = `╭─〔 🎒 INVENTARIO 〕\n`

  inventory.forEach((item, i) => {
    text += `│ ${i + 1}. ${item}\n`
  })

  text += `╰─〔 🤖 ChappieBot RPG 〕`

  reply(text)
}

handler.command = ['inventario']
handler.tags = ['rpg']
handler.menu = true

export default handler
