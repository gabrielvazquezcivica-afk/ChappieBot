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

export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('❌ Solo administradores pueden usar este comando')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from] || Object.keys(data[from]).length === 0) {
    return reply('✅ No hay usuarios advertidos en este grupo')
  }

  let txt = '📋 *LISTA DE WARNINGS DEL GRUPO*\n\n'
  let i = 1

  for (const user in data[from]) {
    txt += `${i}. @${user.split('@')[0]} → ${data[from][user]} warn(s)\n`
    i++
  }

  await sock.sendMessage(from, {
    text: txt,
    mentions: Object.keys(data[from]),
    quoted: sistema('WARN LIST')
  })
}

handler.command = ['warnlist']
handler.group = true
handler.admin = true
handler.tags = ['group']
handler.menu = true
export default handler
