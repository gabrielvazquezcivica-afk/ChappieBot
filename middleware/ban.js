import fs from 'fs'
import path from 'path'

const banFile = path.join('./data/ban.json')

// Cargar baneos
let bans = {}
if (fs.existsSync(banFile)) {
  try {
    bans = JSON.parse(fs.readFileSync(banFile))
  } catch {
    bans = {}
  }
}

// Guardar baneos
function saveBans() {
  fs.writeFileSync(banFile, JSON.stringify(bans, null, 2))
}

/**
 * Middleware para ChappieBot
 * @param {Object} m - mensaje
 * @returns {Boolean} - true si bloquea al usuario
 */
export async function checkBan(m, { reply }) {
  const sender = m.key?.participant || m.sender
  if (bans[sender]) {
    await reply(`❌ Lo siento, estás baneado de usar este bot.`)
    return true // 🚫 Bloquea la ejecución del comando
  }
  return false
}

/**
 * Funciones de ban
 */
export function banUser(jid, reason = 'Sin motivo') {
  bans[jid] = { reason, time: Date.now() }
  saveBans()
}

export function unbanUser(jid) {
  delete bans[jid]
  saveBans()
}

export function listBans() {
  return bans
}
