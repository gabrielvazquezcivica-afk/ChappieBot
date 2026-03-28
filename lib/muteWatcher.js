import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

// 🔥 CACHE EN MEMORIA (RÁPIDO)
let muteCache = {}

try {
  muteCache = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
} catch {
  muteCache = {}
}

// 🔁 Guardar cambios
function saveMutes() {
  fs.writeFileSync(mutesFile, JSON.stringify(muteCache, null, 2))
}

// 👀 WATCHER ULTRA RÁPIDO
export async function muteWatcher(sock, m) {
  try {
    if (!m?.key?.remoteJid) return false

    const from = m.key.remoteJid
    if (!from.endsWith('@g.us')) return false

    const sender = m.key.participant || m.key.remoteJid

    const mutedUsers = muteCache[from] || []

    if (mutedUsers.includes(sender)) {
      // ⚡ BORRADO INSTANTÁNEO
      await sock.sendMessage(from, { delete: m.key })
      return true
    }

    return false

  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
    return false
  }
}

// 🔇 FUNCIÓN PARA MUTEAR
export function muteUser(groupId, userId) {
  if (!muteCache[groupId]) muteCache[groupId] = []

  if (!muteCache[groupId].includes(userId)) {
    muteCache[groupId].push(userId)
    saveMutes()
  }
}

// 🔊 FUNCIÓN PARA DESMUTEAR
export function unmuteUser(groupId, userId) {
  if (!muteCache[groupId]) return

  muteCache[groupId] = muteCache[groupId].filter(u => u !== userId)
  saveMutes()
}
