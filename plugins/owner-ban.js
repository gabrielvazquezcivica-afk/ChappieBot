import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// cargar lista
let banList = {}

if (fs.existsSync(banPath)) {
  try {
    banList = JSON.parse(fs.readFileSync(banPath))
  } catch {
    banList = {}
  }
}

const saveBanList = () => {
  fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))
}

const onlyNumber = (jid = '') => jid.replace(/[^0-9]/g, '')

export const handler = async (m, {
  sock,
  from,
  args,
  isOwner
}) => {

  if (!isOwner) {
    return sock.sendMessage(from, { text: global.config.messages.owner }, { quoted: m })
  }

  let target

  // por tag
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // por reply
  else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }

  // por número
  else if (args[0]) {
    target = onlyNumber(args[0]) + '@s.whatsapp.net'
  }

  if (!target) {
    return sock.sendMessage(from, {
      text: '📌 Uso: .ban @usuario | responder mensaje | número'
    }, { quoted: m })
  }

  const clean = onlyNumber(target)

  if (banList[clean]) {
    return sock.sendMessage(from, { text: '⚠️ Este usuario ya está baneado' }, { quoted: m })
  }

  banList[clean] = true
  saveBanList()

  await sock.sendMessage(from, {
    text: `🚫 Usuario @${clean} baneado globalmente`,
    mentions: [target]
  }, { quoted: m })
}

handler.command = ['ban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
