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
  if (!isGroup) return reply('❌ Solo en grupos')
  if (!isAdmin) return reply('❌ Solo admins pueden usar este comando')

  const data = JSON.parse(fs.readFileSync(warnsPath))
  if (!data[from]) data[from] = {}

  // 👉 Detectar usuario (mención o reply)
  let user =
    m.mentionedJid?.[0] ||
    m.quoted?.sender

  if (!user) return reply('❌ Debes mencionar o responder a un usuario')

  if (!data[from][user]) data[from][user] = 0
  data[from][user] += 1

  const maxWarn = 3
  const warns = data[from][user]

  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

  if (warns >= maxWarn) {
    await sock.sendMessage(from, {
      text: `🚫 @${user.split('@')[0]} alcanzó ${maxWarn} advertencias.\nSerá expulsado.`,
      mentions: [user],
      quoted: sistema('AUTO KICK')
    })

    delete data[from][user]
    fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2))

    await sock.groupParticipantsUpdate(from, [user], 'remove')
  } else {
    await sock.sendMessage(from, {
      text: `⚠️ @${user.split('@')[0]} recibió una advertencia.\n📊 Total: ${warns}/${maxWarn}`,
      mentions: [user],
      quoted: sistema('WARN')
    })
  }
}

handler.command = ['warn']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
