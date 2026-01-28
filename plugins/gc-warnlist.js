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

export const handler = async (m, { from, isGroup, isAdmin, reply }) => {
  if (!isGroup) return reply('❌ Solo en grupos')
  if (!isAdmin) return reply('❌ Solo admins pueden ver la lista de warns')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from] || Object.keys(data[from]).length === 0) {
    return reply('✅ No hay usuarios advertidos en este grupo')
  }

  let text = '📋 *WARN LIST DEL GRUPO*\n\n'
  for (const user in data[from]) {
    text += `👤 @${user.split('@')[0]} ➜ ${data[from][user]} warns\n`
  }

  const mentions = Object.keys(data[from])
  await m.reply(text, { mentions, quoted: sistema('WARNLIST') })
}

handler.command = ['warnlist']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
