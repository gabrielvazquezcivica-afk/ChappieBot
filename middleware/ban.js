// middleware/ban.js
import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Retorna true si el usuario está baneado
export const isBanned = (jid) => {
  let banList = {}
  if (fs.existsSync(banPath)) {
    banList = JSON.parse(fs.readFileSync(banPath))
  }

  const normalized = jid.includes('@') ? jid : (jid.length > 15 ? jid+'@lid' : jid+'@s.whatsapp.net')
  return !!banList[normalized]
}
