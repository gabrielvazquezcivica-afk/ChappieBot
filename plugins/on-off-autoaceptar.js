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
export const handler = async (m, { from, isGroup, isAdmin, args, reply }) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  if (!args[0]) return reply('⚠️ Uso: .autoaceptar on | off')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const state = args[0].toLowerCase()
  const enabled = state === 'on'

  db[from].enabled = enabled
  saveDB(db)

  reply(`🤖 Autoaceptar: *${state.toUpperCase()}*`)
}

// ───── LOOP REAL ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  setInterval(async () => {
    try {
      const db = loadDB()

      for (const groupId of Object.keys(db)) {
        if (!db[groupId]?.enabled) continue

        try {
          // 🔥 obtener solicitudes pendientes
          const req = await sock.groupRequestParticipantsList(groupId)

          if (!req || !req.length) continue

          for (const user of req) {

            try {
              await sock.groupRequestParticipantsUpdate(
                groupId,
                [user.jid],
                'approve'
              )

              await sock.sendMessage(groupId, {
                text: `✅ @${user.jid.split('@')[0]} fue aceptado`,
                mentions: [user.jid]
              })

            } catch (e) {
              console.log('❌ Error aprobando:', e)
            }
          }

        } catch {}
      }

    } catch (e) {
      console.log('❌ Loop autoaceptar:', e)
    }

  }, 8000) // cada 8 segundos
}

// ⚙️ CONFIG
handler.command = ['autoaceptar']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
