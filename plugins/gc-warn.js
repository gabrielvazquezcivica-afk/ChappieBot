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

function getTarget(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo
  return ctx?.mentionedJid?.[0] || ctx?.participant || null
}

export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('❌ Solo administradores pueden usar este comando')

  const user = getTarget(m)
  if (!user) return reply('❌ Menciona o responde a un usuario')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from]) data[from] = {}
  if (!data[from][user]) data[from][user] = 0

  data[from][user]++
  const warns = data[from][user]
  const maxWarn = 3

  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

  if (warns >= maxWarn) {
    await sock.sendMessage(from, {
      text: `🚫 @${user.split('@')[0]} alcanzó ${maxWarn} advertencias.\nSerá expulsado del grupo.`,
      mentions: [user],
      quoted: sistema('AUTO KICK')
    })

    delete data[from][user]
    fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

    await sock.groupParticipantsUpdate(from, [user], 'remove')
  } else {
    await sock.sendMessage(from, {
      text: `⚠️ @${user.split('@')[0]} advertido\n📊 Advertencias: ${warns}/${maxWarn}`,
      mentions: [user],
      quoted: sistema('WARN')
    })
  }
}

handler.command = ['warn']
handler.group = true
handler.admin = true
handler.tags = ['group']
handler.menu = true
export default handler
