import fs from 'fs'
import path from 'path'

const messagesPath = path.join('./data/messages.json')

/* 🔧 LIMPIAR JID (quita :1) */
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

  /* 👻 SOLO FANTASMAS (0 MENSAJES) */
  const ghosts = participants.filter(p => {
    const id = cleanJid(p.id)
    const count = msgsData[from][id] || 0

    // ignorar sistema/bot
    if (id.includes('status@broadcast')) return false

    return count === 0
  })

  if (!ghosts.length) {
    return reply('🎉 No hay fantasmas en este grupo')
  }

  /* ⚡ REACCIÓN */
  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  /* 📢 MENSAJE */
  let text = `╭━━━〔 👻 FANTASMAS DETECTADOS 〕━━━⬣\n\n`
  const mentions = []

  for (const p of ghosts) {
    const number = p.id.split('@')[0]
    text += `👻 @${number}\n`
    mentions.push(p.id)
  }

  text += `\n╰━━━━━━━━━━━━━━⬣`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

/* ───── 📊 CONTADOR DE MENSAJES ───── */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return

  const msgsData = loadMessages()
  const from = m.key.remoteJid

  if (!msgsData[from]) msgsData[from] = {}

  let sender = m.key.participant || m.key.remoteJid
  if (!sender) return

  sender = cleanJid(sender) // 🔥 CLAVE

  msgsData[from][sender] = (msgsData[from][sender] || 0) + 1

  saveMessages(msgsData)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
