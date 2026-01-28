import fs from 'fs'

// ───── QUOTED SISTEMA (CHAPPIEBOT) ─────      
const sistema = (titulo = 'CHAPPIE BOT') => ({      
  key: {      
    fromMe: false,      
    participant: '0@s.whatsapp.net',      
    remoteJid: 'status@broadcast'      
  },      
  message: {      
    orderMessage: {      
      itemCount: 1,      
      message: titulo,      
      footerText: 'ChappieBot',      
      surface: 2,      
      sellerJid: '0@s.whatsapp.net'      
    }      
  }      
})      
// ─────────────────────────────────────

const warnPath = './data/warn.json'
if (!fs.existsSync(warnPath)) fs.writeFileSync(warnPath, JSON.stringify({}, null, 2))

function loadWarn() {
  return JSON.parse(fs.readFileSync(warnPath))
}
function saveWarn(data) {
  fs.writeFileSync(warnPath, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  const msgs = global.config.messages || {}

  if (!isGroup) return reply(msgs.group)
  const meta = await sock.groupMetadata(from)
  const admins = meta.participants.filter(p => p.admin).map(p => p.id)

  if (!admins.includes(sender)) return reply(msgs.admin)

  const user = m.mentionedJid?.[0]
  if (!user) return reply('⚠️ Menciona a un usuario')

  const data = loadWarn()
  if (!data[from]) data[from] = {}
  if (!data[from][user]) data[from][user] = 0

  data[from][user]++
  const total = data[from][user]
  saveWarn(data)

  await sock.sendMessage(from, {
    text: `⚠️ *WARN*\n\n👤 @${user.split('@')[0]}\n📊 Warns: ${total}/3`,
    mentions: [user]
  }, { quoted: sistema('WARN') })

  // 🚫 AUTO KICK
  if (total >= 3) {
    await sock.sendMessage(from, {
      text: `🚫 @${user.split('@')[0]} alcanzó 3 warns y será expulsado`,
      mentions: [user]
    }, { quoted: sistema('AUTO KICK') })

    await sock.groupParticipantsUpdate(from, [user], 'remove')
    delete data[from][user]
    saveWarn(data)
  }
}

handler.command = ['warn']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
