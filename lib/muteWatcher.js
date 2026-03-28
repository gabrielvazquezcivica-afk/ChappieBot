import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

export async function muteWatcher(sock, m) {
  try {
    if (!m?.key?.remoteJid) return false

    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    if (!isGroup) return false

    let sender = m.key.participant || m.key.remoteJid

    // 🔥 LIMPIAR ID (IMPORTANTE)
    if (sender) sender = sender.split(':')[0]

    // Leer mutes.json
    let data = {}
    try {
      data = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
    } catch {
      data = {}
    }

    const mutedUsers = data[from] || []

    // 🔥 LIMPIAR LISTA TAMBIÉN
    const cleanMuted = mutedUsers.map(u => u.split(':')[0])

    if (cleanMuted.includes(sender)) {
      await sock.sendMessage(from, { delete: m.key })
      return true
    }

    return false

  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
    return false
  }
}
