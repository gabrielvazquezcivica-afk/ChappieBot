import fs from 'fs'
import path from 'path'
import config from '../config.js'

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

const saveBanList = () => {
  fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))
}

const onlyNumber = (jid = '') => jid.replace(/[^0-9]/g, '')

export const handler = async (m, {
  sock,
  from,
  reply,
  isOwner,
  args
}) => {

  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  if (!args[0]) {
    return reply('📌 Uso: .unban <numero | @tag>')
  }

  const clean = onlyNumber(args[0])
  const jid = clean + '@s.whatsapp.net'

  if (!banList[clean]) {
    return reply('⚠️ Este usuario no está baneado')
  }

  delete banList[clean]
  saveBanList()

  await sock.sendMessage(from, {
    text: `✅ Usuario @${clean} desbaneado`,
    mentions: [jid]
  }, { quoted: m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
