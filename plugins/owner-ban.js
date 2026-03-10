import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// Cargar lista de baneos
global.banList = global.banList || {}
if (fs.existsSync(banPath)) {
  global.banList = JSON.parse(fs.readFileSync(banPath))
}

// Guardar lista de baneos
const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(global.banList, null, 2))

const normalizeJid = (jid) => {
  if (!jid) return null
  return jid.includes('@') ? jid : (jid.length > 15 ? jid+'@lid' : jid+'@s.whatsapp.net')
}

export const handler = async (m, { sock, from, args, sender, isOwner }) => {
  if (!isOwner) return sock.sendMessage(from, { text: '🚫 Solo el OWNER puede usar este comando' }, { quoted: m })

  if (!args[0]) return sock.sendMessage(from, { text: '📌 Uso: .ban <@tag o número>' }, { quoted: m })

  const mention = m.mentionedJid?.[0] || normalizeJid(args[0])
  if (!mention) return sock.sendMessage(from, { text: '❌ Usuario no válido' }, { quoted: m })

  if (global.banList[mention]) return sock.sendMessage(from, { text: '⚠️ Este usuario ya está baneado' }, { quoted: m })

  global.banList[mention] = true
  saveBanList()

  await sock.sendMessage(from, {
    text: `╭─〔 🚫 BAN GLOBAL 〕\n│ Usuario baneado\n╰────────────`,
    mentions: [mention]
  }, { quoted: m })
}

handler.command = ['ban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true
export default handler
