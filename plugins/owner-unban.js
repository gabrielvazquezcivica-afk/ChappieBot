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

// ───── COMANDO UNBAN ─────
export const handler = async (m, { sock, from, args, sender, isOwner }) => {
  if (!isOwner) return sock.sendMessage(from, { text: '🚫 Solo el OWNER puede usar este comando' }, { quoted: m })

  if (!args[0]) return sock.sendMessage(from, { text: '📌 Uso: .unban <número o @tag>' }, { quoted: m })

  const clean = args[0].replace(/[^0-9]/g, '')
  const jid = clean + '@s.whatsapp.net'

  if (!banList[jid]) return sock.sendMessage(from, { text: '⚠️ Este usuario no está baneado' }, { quoted: m })

  // Eliminar del ban
  delete banList[jid]
  saveBanList()

  // Mensaje con mención
  await sock.sendMessage(from, {
    text: `╭─〔 ✅ DESBAN GLOBAL 〕
│ Usuario: @${clean}
│ Estado: Desbaneado
╰────────────`,
    mentions: [jid]
  }, { quoted: m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
