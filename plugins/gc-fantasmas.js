import fs from 'fs'
import path from 'path'

const dbPath = path.join('./data/msgcount.json')

/* 📂 DB */
function loadDB() {
  if (!fs.existsSync(dbPath)) return {}
  try { return JSON.parse(fs.readFileSync(dbPath)) }
  catch { return {} }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

/* ✅ MENSAJES REALES */
function isRealMessage(m) {
  if (!m.message) return false

  const type = Object.keys(m.message)[0]

  return [
    'conversation',
    'extendedTextMessage',
    'imageMessage',
    'videoMessage'
  ].includes(type)
}

/* ───── BEFORE ───── */
export async function before(m, { isGroup }) {
  if (!isGroup) return
  if (!isRealMessage(m)) return

  const db = loadDB()
  const from = m.key.remoteJid

  if (!db[from]) db[from] = {}

  // 🔥 USAR ESTE (EL REAL EN TU BOT)
  const sender = m.key.participant || m.key.remoteJid
  if (!sender) return

  db[from][sender] = (db[from][sender] || 0) + 1

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

  const ghosts = participants.filter(p => {
    const count = db[from][p.id] || 0
    return count < 10
  })

  if (!ghosts.length) {
    return reply('🎉 Todos tienen +10 mensajes')
  }

  await sock.sendMessage(from, {
    react: { text: '👻', key: m.key }
  })

  let text = `╭━━━〔 👻 INACTIVOS (<10) 〕━━━⬣\n\n`
  const mentions = []

  for (const p of ghosts) {
    const count = db[from][p.id] || 0
    const num = p.id.split('@')[0]

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
