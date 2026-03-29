import fs from 'fs'
import path from 'path'

const messagesPath = path.join('./data/messages.json')

/* 🔥 SOLO NÚMERO */
const getNumber = (jid) => jid?.replace(/\D/g, '')

function loadMessages() {
  if (!fs.existsSync(messagesPath)) return {}
  try { return JSON.parse(fs.readFileSync(messagesPath)) } 
  catch { return {} }
}

function saveMessages(data) {
  fs.writeFileSync(messagesPath, JSON.stringify(data, null, 2))
}

/* ───── COMANDO ───── */
export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const msgsData = loadMessages()
  if (!msgsData[from]) msgsData[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  /* 👻 FILTRO REAL */
  const ghosts = participants.filter(p => {

    const num = getNumber(p.id)
    const count = msgsData[from][num] || 0

    return count === 0
  })

  if (!ghosts.length) {
    return reply('🎉 No hay fantasmas')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `╭━━━〔 👻 FANTASMAS REALES 〕━━━⬣\n\n`
  const mentions = []

  for (const p of ghosts) {
    const num = getNumber(p.id)

    text += `👻 @${num}\n`
    mentions.push(p.id)
  }

  text += `\n╰━━━━━━━━━━━━━━⬣`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

/* ───── CONTADOR REAL ───── */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return

  const msgsData = loadMessages()
  const from = m.chat || m.key.remoteJid

  if (!msgsData[from]) msgsData[from] = {}

  let sender = m.sender
  if (!sender) return

  const num = getNumber(sender)

  msgsData[from][num] = (msgsData[from][num] || 0) + 1

  saveMessages(msgsData)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
