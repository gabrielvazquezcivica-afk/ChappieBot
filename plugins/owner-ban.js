import fs from 'fs'
import path from 'path'
import config from '../config.js'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
let banList = []
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

// Guardar lista de baneos
const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))

export const handler = async (m, { reply, sender, isOwner, args }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  const target = args[0]
  if (!target) return reply('📌 Uso: .ban <número o @tag>')

  const clean = target.replace(/[^0-9]/g, '')
  if (banList.includes(clean)) return reply('⚠️ Este usuario ya está baneado')

  banList.push(clean)
  saveBanList()

  reply(`✅ Usuario ${clean} baneado globalmente`)
}

handler.command = ['ban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
