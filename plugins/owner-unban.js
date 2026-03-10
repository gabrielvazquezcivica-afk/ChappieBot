import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// cargar lista
let banList = {}
if (fs.existsSync(banPath)) {
  try {
    banList = JSON.parse(fs.readFileSync(banPath))
  } catch {
    banList = {}
  }
}

// guardar lista
const saveBanList = () => {
  fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))
}

const onlyNumber = (jid = '') => jid.replace(/[^0-9]/g, '')

export const handler = async (m, { reply, isOwner, args }) => {

  if (!isOwner) return reply(global.config.messages.owner)

  if (!args[0]) return reply('📌 Uso: .unban <numero>')

  const clean = onlyNumber(args[0])

  if (!banList[clean]) return reply('⚠️ Este usuario no estaba baneado')

  delete banList[clean]
  saveBanList()

  reply(`✅ Usuario ${clean} desbaneado`)
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
