import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

// 🔥 COLA GLOBAL
global.deleteQueue = global.deleteQueue || []
global.processingDelete = false

async function processQueue(sock) {
  if (global.processingDelete) return
  global.processingDelete = true

  while (global.deleteQueue.length > 0) {
    const item = global.deleteQueue.shift()

    try {
      await sock.sendMessage(item.from, {
        delete: {
          remoteJid: item.from,
          fromMe: false,
          id: item.id,
          participant: item.participant
        }
      })

      // pequeño delay para no saturar
      await new Promise(r => setTimeout(r, 80))

    } catch {}
  }

  global.processingDelete = false
}

export async function muteWatcher(sock, m) {
  try {
    if (!m?.key) return false

    const from = m.key.remoteJid
    if (!from || !from.endsWith('@g.us')) return false

    let sender =
      m.key.participant ||
      m.participant ||
      m.key.remoteJid

    if (!sender) return false

    sender = sender.split(':')[0]

    let data = {}
    try {
      data = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
    } catch {
      data = {}
    }

    const mutedUsers = data[from] || []
    const cleanMuted = mutedUsers.map(u => u.split(':')[0])

    if (!cleanMuted.includes(sender)) return false

    // 🔥 METER A COLA
    global.deleteQueue.push({
      from,
      id: m.key.id,
      participant: m.key.participant || sender
    })

    // 🔥 PROCESAR COLA
    processQueue(sock)

    return true

  } catch (err) {
    console.log('❌ Error en muteWatcher:', err)
    return false
  }
}
