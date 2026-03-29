import fs from 'fs'
import path from 'path'

const dbPath = path.join('./data/activeUsers.json')

const getNumber = (jid) => jid?.replace(/\D/g, '')

function loadDB() {
  if (!fs.existsSync(dbPath)) return {}
  try { return JSON.parse(fs.readFileSync(dbPath)) }
  catch { return {} }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

/* ───── COMANDO ───── */
export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  /* 👻 FANTASMAS = nunca hablaron */
  const ghosts = participants.filter(p => {
    const num = getNumber(p.id)
    return !db[from][num] // ❗ nunca habló
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

/* ───── DETECTAR ACTIVIDAD REAL ───── */
export const before = async (m, { isGroup }) => {

  if (!isGroup) return

  // ❗ ignorar mensajes falsos/sistema
  if (!m.message) return

  const db = loadDB()
  const from = m.chat || m.key.remoteJid

  if (!db[from]) db[from] = {}

  const sender = m.sender
  if (!sender) return

  const num = getNumber(sender)

  // 🔥 SOLO MARCAR COMO ACTIVO (no contar)
  db[from][num] = true

  saveDB(db)
}

handler.command = ['fantasmas']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
