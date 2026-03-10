import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

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
    return sock.sendMessage(from,{ text:'🚫 Solo el OWNER puede usar este comando'},{ quoted:m })
  }

  let target

  // tag
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // reply
  else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }

  // numero
  else if (args[0]) {
    target = args[0]
  }

  if (!target) {
    return sock.sendMessage(from,{
      text:'📌 Uso: .unban @usuario | responder | número'
    },{ quoted:m })
  }

  const clean = onlyNumber(target)

  if (!banList[clean]) {
    return sock.sendMessage(from,{
      text:'⚠️ Este usuario no está baneado'
    },{ quoted:m })
  }

  delete banList[clean]
  saveBanList()

  await sock.sendMessage(from,{
    text:`✅ Usuario @${clean} desbaneado`,
    mentions:[clean+'@s.whatsapp.net']
  },{ quoted:m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
