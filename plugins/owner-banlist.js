import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

export const handler = async (m, { reply, isOwner }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  let banData = {}

  if (fs.existsSync(banPath)) {
    try {
      banData = JSON.parse(fs.readFileSync(banPath))
    } catch {
      banData = {}
    }
  }

  // 👉 Convertir a array si es objeto
  let banList = Array.isArray(banData)
    ? banData
    : Object.keys(banData)

  if (banList.length === 0) {
    return reply('📋 No hay usuarios baneados')
  }

  const texto = banList
    .map((u, i) => `${i + 1}. ${u.replace(/@.+/, '')}`)
    .join('\n')

  reply(`📋 *Lista de usuarios baneados:*\n\n${texto}`)
}

handler.command = ['banlist']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
