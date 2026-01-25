import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
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

  const inv = user.inventory || []

  if (!inv.length) {
    return reply('🎒 Tu inventario está vacío')
  }

  let text = '🎒 INVENTARIO\n\n'
  inv.forEach((item, i) => {
    text += `${i + 1}. ${item.nombre} (${item.precio}💰)\n`
  })

  reply(text)
}

handler.command = ['inventario']
handler.tags = ['rpg']
handler.menu = true

export default handler
