import fs from 'fs'
import path from 'path'

const messagesPath = path.join('./data/messages.json')

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
  if (!isAdmin) return reply('⚠️ Solo admins')

  const msgsData = loadMessages()
  if (!msgsData[from]) msgsData[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // 👻 DETECTAR FANTASMAS REALES
  const ghosts = participants.filter(p => {
    const count = msgsData[from][p.id] || 0

    // ❌ ignorar bot
    if (p.id.includes('status@broadcast')) return false

    return count < 10 // ✅ incluye los de 0 mensajes
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
    const count = msgsData[from][p.id] || 0

    text += `👻 @${number} ➤ ${count} mensajes\n`
    mentions.push(p.id)
  }

  text += `\n╰━━━━━━━━━━━━━━⬣`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

/* ───── CONTADOR FIX ───── */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return

  const msgsData = loadMessages()
  const from = m.key.remoteJid

  if (!msgsData[from]) msgsData[from] = {}

  // 🔥 FIX REAL DEL SENDER
  const sender = m.key.participant || m.key.remoteJid

  if (!sender) return

  msgsData[from][sender] = (msgsData[from][sender] || 0) + 1

  saveMessages(msgsData)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
