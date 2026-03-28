import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

// 🔥 LIMPIAR JID (ANTI BUG BAILEYS)
const cleanJid = jid => jid?.split(':')[0]

// 🔥 CACHE EN MEMORIA (ULTRA RÁPIDO)
let muteCache = {}

try {
  muteCache = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
} catch {
  muteCache = {}
}

// 🔁 GUARDAR CAMBIOS
function saveMutes() {
  fs.writeFileSync(mutesFile, JSON.stringify(muteCache, null, 2))
}

// 👀 WATCHER ULTRA RÁPIDO
export async function muteWatcher(sock, m) {
  try {
    if (!m?.key?.remoteJid) return false

    const from = m.key.remoteJid
    if (!from.endsWith('@g.us')) return false

    // 🔥 OBTENER Y LIMPIAR USUARIO
    let sender = m.key.participant || m.key.remoteJid
    sender = cleanJid(sender)

    const mutedUsers = muteCache[from] || []

    // 🔥 BLOQUEO INSTANTÁNEO
    if (mutedUsers.includes(sender)) {
      await sock.sendMessage(from, { delete: m.key })
      return true
    }

    return false

  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
    return false
  }
}

// 🔇 MUTEAR USUARIO
export function muteUser(groupId, userId) {
  userId = cleanJid(userId)

  if (!muteCache[groupId]) muteCache[groupId] = []

  if (!muteCache[groupId].includes(userId)) {
    muteCache[groupId].push(userId)
    saveMutes()
  }
}

// 🔊 DESMUTEAR USUARIO
export function unmuteUser(groupId, userId) {
  userId = cleanJid(userId)

  if (!muteCache[groupId]) return

  muteCache[groupId] = muteCache[groupId].filter(u => u !== userId)
  saveMutes()
}
