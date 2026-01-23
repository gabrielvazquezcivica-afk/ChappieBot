import fs from 'fs'
import path from 'path'
import config from '../config.js'

const banPath = path.join('./data/ban.json')

let banList = []
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))

export const handler = async (m, { reply, sender, isOwner, args }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  const target = args[0]
  if (!target) return reply('📌 Uso: .unban <número o @tag>')

  const clean = target.replace(/[^0-9]/g, '')
  if (!banList.includes(clean)) return reply('⚠️ Este usuario no está baneado')

  banList = banList.filter(u => u !== clean)
  saveBanList()

  reply(`✅ Usuario ${clean} desbaneado`)
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
