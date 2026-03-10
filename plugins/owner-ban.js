import fs from 'fs'
import path from 'path'

const dataDir = './data'
const banPath = path.join(dataDir, 'ban.json')

// asegurar carpeta
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

// cargar lista
let banList = []
if (fs.existsSync(banPath)) {
  banList = JSON.parse(fs.readFileSync(banPath))
}

// guardar lista
const saveBanList = () => {
  fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))
}

// limpiar número
const onlyNumber = (jid = '') => jid.replace(/[^0-9]/g, '')

export const handler = async (m, {
  sock,
  from,
  sender,
  reply,
  isOwner,
  args
}) => {

  const msgs = global.config.messages || {}

  // 🔒 solo owner
  if (!isOwner) {
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')
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
    target = args[0]
  }

  if (!target) {
    return reply('📌 Uso: .ban <número | @tag | responder mensaje>')
  }

  const clean = onlyNumber(target)

  // evitar banear owner
  if (global.config.owner.numbers.includes(clean)) {
    return reply('❌ No puedes banear al OWNER')
  }

  if (banList.includes(clean)) {
    return reply('⚠️ Este usuario ya está baneado')
  }

  banList.push(clean)
  saveBanList()

  reply(`✅ Usuario ${clean} baneado globalmente`)
}

handler.command = ['ban']
handler.tags = ['owner']
handler.help = ['ban <numero|@tag>']
handler.owner = true
handler.menu = true

export default handler
