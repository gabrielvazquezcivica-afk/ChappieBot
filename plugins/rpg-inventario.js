import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

function loadDB() {
  if (!fs.existsSync(registroPath)) return {}
  return JSON.parse(fs.readFileSync(registroPath))
}

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

  if (!user?.registered) return reply('❌ No estás registrado')

  if (!user.inventory || user.inventory.length === 0) {
    return reply('🎒 Tu inventario está vacío')
  }

  let text = `🎒 INVENTARIO\n\n`

  user.inventory.forEach((item, i) => {
    text += `${i + 1}. ${item.nombre} — 💰 ${item.precio}\n`
  })

  reply(text)
}

handler.command = ['inventario']
handler.tags = ['rpg']
handler.menu = true
export default handler
