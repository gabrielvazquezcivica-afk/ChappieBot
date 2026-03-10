import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
let banList = {}
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

// Guardar lista de baneos
const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))

/**
 * Revisar si un JID está baneado
 * @param {string} jid
 * @returns {boolean}
 */
export const isBanned = (jid) => {
  if (!jid) return false
  return !!banList[jid]
}

/**
 * Banear un usuario por JID
 * @param {string} jid
 */
export const banUser = (jid) => {
  if (!jid) return
  banList[jid] = true
  saveBanList()
}

/**
 * Desbanear un usuario por JID
 * @param {string} jid
 */
export const unbanUser = (jid) => {
  if (!jid) return
  delete banList[jid]
  saveBanList()
}

export default isBanned
