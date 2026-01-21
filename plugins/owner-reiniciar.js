import fs from 'fs'
import path from 'path'

const restartFlag = path.join('./tmp/reinicio.json')

// Helper para guardar el reinicio
function setRestartFlag(ownerJid) {
  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
  fs.writeFileSync(restartFlag, JSON.stringify({ owner: ownerJid }))
}

// Helper para leer y borrar el flag
function getAndClearRestartFlag() {
  if (!fs.existsSync(restartFlag)) return null
  const data = JSON.parse(fs.readFileSync(restartFlag))
  fs.unlinkSync(restartFlag)
  return data
}

export const handler = async (m, { sock, reply, sender }) => {
  const owners = global.config.owner?.numbers || []
  const senderNum = sender.split('@')[0]

  if (!owners.includes(senderNum)) {
    return reply('⚠️ Este comando solo puede usarlo el OWNER')
  }

  // Aviso antes de reiniciar
  await sock.sendMessage(m.key.remoteJid, {
    text: '♻️ Reiniciando ChappieBot...',
  })
  await sock.sendMessage(m.key.remoteJid, {
    react: { text: '♻️', key: m.key }
  })

  // Guardar flag para enviar mensaje al iniciar
  setRestartFlag(sender + '@s.whatsapp.net')

  // Reinicio
  process.exit(0)
}

// Revisar si hay reinicio pendiente al iniciar
if (fs.existsSync(restartFlag)) {
  const data = getAndClearRestartFlag()
  if (data?.owner) {
    setTimeout(async () => {
      try {
        await global.sock.sendMessage(data.owner, {
          text: '✅ ChappieBot se ha reiniciado correctamente',
        })
        await global.sock.sendMessage(data.owner, {
          react: { text: '✅', key: { remoteJid: data.owner, id: 'start', fromMe: true } }
        })
      } catch {}
    }, 2000) // espera 2s para que el bot esté listo
  }
}

handler.command = ['reiniciar']
handler.tags = ['owner']
handler.owner = true
handler.group = false
handler.menu = true

export default handler
