import fs from 'fs'

const warnsPath = './data/warns.json'
if (!fs.existsSync(warnsPath)) fs.writeFileSync(warnsPath, JSON.stringify({}))

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

export const handler = async (m, { from, isGroup, isAdmin, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')
  if (!isAdmin) return reply('❌ Solo admins')

  const user = m.mentionedJid?.[0] || m.quoted?.sender
  if (!user) return reply('⚠️ Menciona a alguien')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from] || !data[from][user]) return reply('✅ No tiene warns')

  data[from][user]--
  if (data[from][user] <= 0) delete data[from][user]

  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

  reply(`✅ Warn quitado a @${user.split('@')[0]}`, {
    mentions: [user],
    quoted: sistema('UNWARN')
  })
}

handler.command = ['unwarn']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
