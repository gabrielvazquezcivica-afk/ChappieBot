import fs from 'fs'
import path from 'path'

const DATA = './data'
const MUTE_DB = path.join(DATA, 'mutes.json')

// Función para leer la DB de silenciados
const getMutes = () => {
  if (!fs.existsSync(MUTE_DB)) return {}
  return JSON.parse(fs.readFileSync(MUTE_DB))
}

// Esta función se ejecuta cada vez que llega un mensaje
export const muteWatcher = async (sock, m) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const mutes = getMutes()
  if (!mutes[from]) return
  if (!mutes[from].includes(sender)) return

  try {
    // Borra cualquier mensaje del usuario silenciado
    await sock.sendMessage(from, { delete: m.key })
  } catch (err) {
    console.log('❌ Error al borrar mensaje de silenciado:', err.message)
  }
}
