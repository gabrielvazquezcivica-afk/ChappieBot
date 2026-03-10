import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
let banList = {}
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

// Guardar lista de baneos
const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))

export const handler = async (m, { sock, from, args, sender, isOwner }) => {
  if (!isOwner) return sock.sendMessage(from, { text: '🚫 Solo el OWNER puede usar este comando' }, { quoted: m })

  if (!args[0]) return sock.sendMessage(from, { text: '📌 Uso: .ban <número o @tag>' }, { quoted: m })

  const clean = args[0].replace(/[^0-9]/g, '')
  const jid = clean.length > 15 ? clean + '@lid' : clean + '@s.whatsapp.net'

  if (banList[jid]) return sock.sendMessage(from, { text: '⚠️ Este usuario ya está baneado' }, { quoted: m })

  // Guardar ban
  banList[jid] = true
  saveBanList()

  await sock.sendMessage(from, {
    text: `╭─〔 🚫 BAN GLOBAL 〕
│ Usuario: @${clean}
│ Estado: Baneado
╰────────────`,
    mentions: [jid]
  }, { quoted: m })
}

handler.command = ['ban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
