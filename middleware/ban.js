import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Siempre mantener la lista sincronizada con global.banList
export const isBanned = (jid) => {
  // Si no existe la global, cargar del archivo
  if (!global.banList) {
    if (fs.existsSync(banPath)) {
      global.banList = JSON.parse(fs.readFileSync(banPath))
    } else {
      global.banList = {}
    }
  }

  const normalized = jid.includes('@') ? jid : (jid.length > 15 ? jid+'@lid' : jid+'@s.whatsapp.net')
  return !!global.banList[normalized]
}
