import fs from 'fs'
import path from 'path'

const dbPath = path.join('./data/msgcount.json')

/* 🔥 SOLO NÚMEROS */
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

/* ✅ SOLO MENSAJES REALES */
function isRealMessage(m) {
  if (!m.message) return false

  const type = Object.keys(m.message)[0]

  const valid = [
    'conversation',
    'extendedTextMessage',
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage'
  ]

  return valid.includes(type)
}

/* ───── BEFORE (CONTADOR REAL) ───── */
export async function before(m, { isGroup }) {
  if (!isGroup) return
  if (!isRealMessage(m)) return

  const db = loadDB()
  const from = m.chat || m.key.remoteJid

  if (!db[from]) db[from] = {}

  const sender = m.sender
  if (!sender) return

  const num = getNumber(sender)

  db[from][num] = (db[from][num] || 0) + 1

  saveDB(db)
}

/* ───── COMANDO ───── */
export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  /* 👻 FILTRO <10 MENSAJES */
  const ghosts = participants.filter(p => {
    const num = getNumber(p.id)
    const count = db[from][num] || 0

    return count < 10
  })

  if (!ghosts.length) {
    return reply('🎉 Todos son activos (+10 mensajes)')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `╭━━━〔 👻 POCA ACTIVIDAD 〕━━━⬣\n\n`
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

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
