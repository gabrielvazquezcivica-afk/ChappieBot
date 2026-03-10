import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

export const isBanned = (jid) => {
  // Siempre leer la lista más reciente del archivo o usar la global
  let banList = {}
  if (global.banList) banList = global.banList
  else if (fs.existsSync(banPath)) banList = JSON.parse(fs.readFileSync(banPath))

  const normalized = jid.includes('@') ? jid : (jid.length > 15 ? jid+'@lid' : jid+'@s.whatsapp.net')
  return !!banList[normalized]
}
