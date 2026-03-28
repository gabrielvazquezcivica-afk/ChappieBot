import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

export async function muteWatcher(sock, m) {
  try {
    if (!m?.key) return false

    const from = m.key.remoteJid
    if (!from || !from.endsWith('@g.us')) return false

    // 🔥 DETECTAR SENDER BIEN
    let sender =
      m.key.participant ||
      m.participant ||
      m.key.remoteJid

    if (!sender) return false

    // 🔥 LIMPIAR ID
    sender = sender.split(':')[0]

    // 🔥 LEER BASE
    let data = {}
    try {
      data = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
    } catch {
      data = {}
    }

    const mutedUsers = data[from] || []

    // 🔥 LIMPIAR LISTA
    const cleanMuted = mutedUsers.map(u => u.split(':')[0])

    if (!cleanMuted.includes(sender)) return false

    // 🔥 BORRADO FUERTE (ANTI BUG)
    try {
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant || sender
        }
      })
    } catch {
      // fallback
      try {
        await sock.sendMessage(from, { delete: m.key })
      } catch {}
    }

    return true

  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
    return false
  }
}
