import fs from 'fs'
import path from 'path'

const dbPath = path.join('./data/msgcount.json')

const getNumber = (jid) => jid?.replace(/\D/g, '')

/* 📂 DB */
function loadDB() {
  if (!fs.existsSync(dbPath)) return {}
  try { return JSON.parse(fs.readFileSync(dbPath)) }
  catch { return {} }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

/* ✅ VALIDAR MENSAJE REAL */
function isRealMessage(m) {
  if (!m.message) return false

  const msgType = Object.keys(m.message)[0]

  const validTypes = [
    'conversation',
    'extendedTextMessage',
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage'
  ]

  return validTypes.includes(msgType)
}

/* ───── COMANDO ───── */
export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  const ghosts = participants.filter(p => {
    const num = getNumber(p.id)
    const count = db[from][num] || 0

    return count < 10
  })

  if (!ghosts.length) {
    return reply('🎉 Todos tienen +10 mensajes')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `╭━━━〔 👻 INACTIVOS (<10 msj) 〕━━━⬣\n\n`
  const mentions = []

  for (const p of ghosts) {
    const num = getNumber(p.id)
    const count = db[from][num] || 0

    text += `👻 @${num} → ${count} msj\n`
    mentions.push(p.id)
  }

  text += `\n╰━━━━━━━━━━━━━━⬣`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

/* ───── CONTADOR REAL ───── */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return
  if (!isRealMessage(m)) return // 🔥 SOLO MENSAJES REALES

  const db = loadDB()
  const from = m.chat || m.key.remoteJid

  if (!db[from]) db[from] = {}

  let sender = m.sender
  if (!sender) return

  const num = getNumber(sender)

  db[from][num] = (db[from][num] || 0) + 1

  saveDB(db)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
