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

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')

  const msgsData = loadMessages()
  if (!msgsData[from]) msgsData[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // Filtrar usuarios que hayan escrito menos de 10 mensajes
  const ghosts = participants.filter(p => {
    const count = msgsData[from][p.id] || 0
    return count > 0 && count < 10 // ✅ Solo usuarios que escribieron pero <10
  })

  if (!ghosts.length) return reply('🎉 Ningún usuario está en la lista de fantasmas')

  // Reacción al comando
  await sock.sendMessage(from, { react: { text: '👻', key: m.key } })

  // Construir lista de menciones
  let text = `👻 Fantasmas ${metadata.subject}:\n\n`
  const mentions = []

  for (const p of ghosts) {
    const name = p.notify || p.id.split('@')[0]
    text += `🍁 @${name}\n`
    mentions.push(p.id)
  }

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

// ───── GUARDAR CADA MENSAJE ─────
export const before = async (m, { from, isGroup }) => {
  if (!isGroup) return

  const msgsData = loadMessages()
  if (!msgsData[from]) msgsData[from] = {}

  const sender = m.key.participant
  msgsData[from][sender] = (msgsData[from][sender] || 0) + 1

  saveMessages(msgsData)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
