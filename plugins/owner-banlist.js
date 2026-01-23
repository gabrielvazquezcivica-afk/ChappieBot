import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
let banList = []
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

export const handler = async (m, { reply, isOwner }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  if (banList.length === 0) return reply('📋 No hay usuarios baneados')

  const texto = banList.map((u, i) => `${i + 1}. ${u}`).join('\n')
  reply(`📋 Lista de usuarios baneados:\n\n${texto}`)
}

handler.command = ['banlist']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
