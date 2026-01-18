import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

// Función que revisa y borra mensajes de usuarios silenciados
export async function muteWatcher(sock, m) {
  try {
    if (!m?.key?.remoteJid) return
    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    if (!isGroup) return

    const sender = m.key.participant || m.key.remoteJid

    // Leer mutes.json
    let data = {}
    try {
      data = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
    } catch (e) {
      data = {}
    }

    // Si el grupo tiene silenciados
    const mutedUsers = data[from] || []
    if (mutedUsers.includes(sender)) {
      // Borra el mensaje
      await sock.sendMessage(from, { delete: m.key })
    }
  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
  }
}
