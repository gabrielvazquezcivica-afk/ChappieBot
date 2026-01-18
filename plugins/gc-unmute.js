import fs from 'fs'
import path from 'path'

const mutesFile = path.join('./data/mutes.json')

export const handler = async (m, { sock, from, reply, sender, isGroup }) => {
  if (!isGroup) return reply(global.config.messages.group)

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
  if (!admins.includes(sender)) return reply(global.config.messages.admin)

  // Usuario a desmutear (mención o reply)
  const user =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant

  if (!user) return reply('⚠️ Menciona al usuario o responde a su mensaje para desilenciar.')

  // Leer mutes.json
  let data = {}
  try {
    data = JSON.parse(fs.readFileSync(mutesFile, 'utf-8'))
  } catch (e) {
    data = {}
  }

  if (!data[from]) data[from] = []

  if (!data[from].includes(user)) return reply('⚠️ Este usuario no estaba silenciado.')

  data[from] = data[from].filter(u => u !== user)
  fs.writeFileSync(mutesFile, JSON.stringify(data, null, 2))

  // Reacción
  await sock.sendMessage(from, { react: { text: '🔊', key: m.key } })

  // Mensaje confirmando
  await reply(`🔊 @${user.split('@')[0]} ha sido desilenciado por @${sender.split('@')[0]}`, { mentions: [user, sender] })
}

handler.command = ['unmute']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true
