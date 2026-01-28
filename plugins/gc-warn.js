import fs from 'fs'

const warnsPath = './data/warns.json'
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, JSON.stringify({}))

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

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')
  if (!isAdmin) return reply('❌ Solo admins')

  const user = m.mentionedJid?.[0] || m.quoted?.sender
  if (!user) return reply('⚠️ Menciona a alguien')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from]) data[from] = {}
  if (!data[from][user]) data[from][user] = 0

  data[from][user]++
  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

  const warns = data[from][user]
  const max = 3

  await sock.sendMessage(from, {
    text: `⚠️ *ADVERTENCIA*\n\n👤 Usuario: @${user.split('@')[0]}\n📛 Warns: ${warns}/${max}`,
    mentions: [user]
  }, { quoted: sistema('WARN') })

  if (warns >= max) {
    await sock.sendMessage(from, {
      text: `🚫 *Usuario expulsado por demasiadas advertencias*\n@${user.split('@')[0]}`,
      mentions: [user]
    }, { quoted: sistema('AUTO-KICK') })

    await sock.groupParticipantsUpdate(from, [user], 'remove')
    delete data[from][user]
    fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))
  }
}

handler.command = ['warn']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
