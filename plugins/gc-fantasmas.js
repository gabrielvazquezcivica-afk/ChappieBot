import fs from 'fs'
import path from 'path'

const messagesPath = path.join('./data/messages.json')

const cleanJid = (jid) => jid?.split(':')[0]

function loadMessages() {
  if (!fs.existsSync(messagesPath)) return {}
  try { return JSON.parse(fs.readFileSync(messagesPath)) } 
  catch { return {} }
}

function saveMessages(data) {
  fs.writeFileSync(messagesPath, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores')

  const msgsData = loadMessages()
  if (!msgsData[from]) msgsData[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  /* 👻 FILTRO REAL */
  const ghosts = participants.filter(p => {
    const id = cleanJid(p.id)
    const count = msgsData[from][id] || 0

    // ignorar bot / sistema
    if (id.includes('status@broadcast')) return false

    return count === 0
  })

  if (!ghosts.length) {
    return reply('🎉 No hay fantasmas en este grupo')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `╭━━━〔 👻 FANTASMAS 〕━━━⬣\n\n`
  const mentions = []

  for (const p of ghosts) {
    const number = p.id.split('@')[0]
    text += `👻 @${number}\n`
    mentions.push(p.id)
  }

  text += `\n╰━━━━━━━━━━━━━━⬣`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

/* 🔥 CONTADOR 100% CORRECTO */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return

  const msgsData = loadMessages()
  const from = m.chat || m.key.remoteJid

  if (!msgsData[from]) msgsData[from] = {}

  // 🔥 USAR EL REAL
  let sender = m.sender

  if (!sender) return

  sender = cleanJid(sender)

  msgsData[from][sender] = (msgsData[from][sender] || 0) + 1

  saveMessages(msgsData)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
