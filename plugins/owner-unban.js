import fs from 'fs'
import path from 'path'
import config from '../config.js'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
let banList = {}
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

// Guardar lista de baneos
const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))

// ───── HELPER ─────
const normalizeJid = (jid = '') => jid?.toString().replace(/[^0-9]/g, '')

export const handler = async (m, { sock, reply, sender, isOwner, args }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  // Determinar target: mención, respuesta o número
  let targetJid = m.mentionedJid?.[0] || m.quoted?.sender || (args[0] ? args[0].includes('@') ? args[0] : args[0] + '@s.whatsapp.net' : null)
  if (!targetJid) return reply('📌 Debes mencionar al usuario, responder o escribir su número')

  const targetNum = normalizeJid(targetJid)
  if (!banList[targetNum]) {
    return reply({
      text: `⚠️ El usuario no está baneado`,
      mentions: [targetJid]
    })
  }

  // Quitar baneo
  delete banList[targetNum]
  saveBanList()

  // Mensaje de confirmación
  await sock.sendMessage(m.key.remoteJid, {
    text: `✅ Usuario desbaneado`,
    mentions: [targetJid]
  }, { quoted: m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
