import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

const saveBanList = () => fs.writeFileSync(banPath, JSON.stringify(global.banList, null, 2))

const normalizeJid = (jid) => {
  if (!jid) return null
  return jid.includes('@') ? jid : (jid.length > 15 ? jid+'@lid' : jid+'@s.whatsapp.net')
}

export const handler = async (m, { sock, from, args, sender, isOwner }) => {
  if (!isOwner) return sock.sendMessage(from, { text: '🚫 Solo el OWNER puede usar este comando' }, { quoted: m })
  if (!args[0]) return sock.sendMessage(from, { text: '📌 Uso: .unban <@tag o número>' }, { quoted: m })

  const mention = m.mentionedJid?.[0] || normalizeJid(args[0])
  if (!mention) return sock.sendMessage(from, { text: '❌ Usuario no válido' }, { quoted: m })

  if (!global.banList || !global.banList[mention]) return sock.sendMessage(from, { text: '⚠️ Este usuario no está baneado' }, { quoted: m })

  delete global.banList[mention]
  saveBanList()

  await sock.sendMessage(from, {
    text: `╭─〔 ✅ DESBAN GLOBAL 〕\n│ Usuario desbaneado\n╰────────────`,
    mentions: [mention]
  }, { quoted: m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true
export default handler
