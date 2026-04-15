import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data/autoaceptar.json')

// ───── DB ─────
function loadDB() {
  if (!fs.existsSync(dbPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(dbPath))
  } catch {
    return {}
  }
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

let started = false

// ───── COMANDO ─────
export const handler = async (m, { sock, from, isGroup, isAdmin, args, reply }) => {

  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins pueden usar esto')

  if (!args[0]) return reply('⚠️ Uso: .autoaceptar on | off')

  const state = args[0].toLowerCase()
  if (!['on', 'off'].includes(state)) return reply('⚠️ Usa: .autoaceptar on | off')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const newState = state === 'on'

  if (db[from].enabled === newState) {
    return reply(`⚠️ Ya estaba *${state.toUpperCase()}*`)
  }

  db[from].enabled = newState
  saveDB(db)

  await sock.sendMessage(from, {
    text: `🤖 Autoaceptar solicitudes: *${state.toUpperCase()}*`
  }, { quoted: m })
}

// ───── EVENTO REAL ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  sock.ev.on('group.join-request', async (update) => {
    try {
      const { id, author, participants } = update

      const db = loadDB()
      const settings = db[id] || {}

      if (!settings.enabled) return

      for (const user of participants || []) {

        // 🔥 aceptar solicitud (FIX REAL)
        await sock.groupRequestParticipantsUpdate(
          id,
          [{ jid: user, action: 'approve' }]
        )

        await sock.sendMessage(id, {
          text: `✅ @${user.split('@')[0]} fue aceptado automáticamente`,
          mentions: [user]
        })

      }

    } catch (e) {
      console.log('❌ Error autoaceptar:', e)
    }
  })
}

// ⚙️ CONFIG
handler.command = ['autoaceptar']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
