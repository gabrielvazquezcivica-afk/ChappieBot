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
  if (!['on','off'].includes(state)) return reply('⚠️ Usa: .autoaceptar on | off')

  const db = loadDB()
  if (!db[from]) db[from] = {}

  const enabled = state === 'on'

  if (db[from].enabled === enabled) {
    return reply(`⚠️ Ya estaba *${state.toUpperCase()}*`)
  }

  db[from].enabled = enabled
  saveDB(db)

  reply(`🤖 Autoaceptar: *${state.toUpperCase()}*`)
}

// ───── EVENTO UNIVERSAL ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  const aceptar = async (id, users = []) => {
    const db = loadDB()
    const settings = db[id] || {}
    if (!settings.enabled) return

    for (const user of users) {
      try {

        // 🔥 MÉTODO 1 (nuevo)
        await sock.groupRequestParticipantsUpdate(
          id,
          [{ jid: user, action: 'approve' }]
        )

      } catch {

        try {
          // 🔥 MÉTODO 2 (viejo)
          await sock.groupRequestParticipantsUpdate(
            id,
            [user],
            'approve'
          )
        } catch (e) {
          console.log('❌ Error approve:', e)
          continue
        }
      }

      // 📩 aviso
      await sock.sendMessage(id, {
        text: `✅ @${user.split('@')[0]} fue aceptado automáticamente`,
        mentions: [user]
      })
    }
  }

  // 🔥 EVENTO NUEVO
  sock.ev.on('group.join-request', async (update) => {
    try {
      await aceptar(update.id, update.participants || [])
    } catch {}
  })

  // 🔥 EVENTO VIEJO
  sock.ev.on('group-participants.update', async (update) => {
    if (update.action === 'request') {
      await aceptar(update.id, update.participants || [])
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
