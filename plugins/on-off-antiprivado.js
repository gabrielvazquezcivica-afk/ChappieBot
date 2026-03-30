import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'data/antiprivado.json')

// ───── HELPERS ─────
function loadData() {
  if (!fs.existsSync(filePath)) return {}
  try {
    return JSON.parse(fs.readFileSync(filePath))
  } catch {
    return {}
  }
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// 🔥 CONTROL PARA NO DUPLICAR EVENTO
let initialized = false
const warned = new Set()

// ───── COMANDO ─────
export const handler = async (m, {
  sock,
  from,
  isGroup,
  isOwner,
  args
}) => {

  if (!isGroup) {
    return sock.sendMessage(from, { text: '⚠️ Solo en grupos' }, { quoted: m })
  }

  if (!isOwner) {
    return sock.sendMessage(from, { text: '⚠️ Solo el owner' }, { quoted: m })
  }

  if (!args[0]) {
    return sock.sendMessage(from, { text: 'Uso: .antiprivado on/off' }, { quoted: m })
  }

  const state = args[0].toLowerCase()
  if (!['on','off'].includes(state)) {
    return sock.sendMessage(from, { text: 'Uso: on/off' }, { quoted: m })
  }

  const data = loadData()
  const current = data[from]?.enabled || false

  if (state === 'on' && current) {
    return sock.sendMessage(from, { text: '⚠️ Ya está ACTIVADO' }, { quoted: m })
  }

  if (state === 'off' && !current) {
    return sock.sendMessage(from, { text: '⚠️ Ya está DESACTIVADO' }, { quoted: m })
  }

  data[from] = { enabled: state === 'on' }
  saveData(data)

  sock.sendMessage(from, {
    text: `🔒 Anti-Privado: ${state.toUpperCase()}`
  }, { quoted: m })
}

// ───── EVENTO GLOBAL REAL ─────
handler.before = async (m, { sock }) => {

  if (initialized) return
  initialized = true

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const msg = messages[0]
      if (!msg?.message) return

      const jid = msg.key.remoteJid
      if (!jid) return

      // 🔥 SOLO PRIVADOS
      if (!jid.endsWith('@s.whatsapp.net')) return

      const user = jid.split(':')[0]
      const number = user.split('@')[0]

      const data = loadData()
      const active = Object.keys(data).some(g => data[g]?.enabled)

      if (!active) return

      // 🚫 no bloquear owner
      const ownerNumbers = global.config.owner?.numbers || []
      if (ownerNumbers.includes(number)) return

      if (warned.has(user)) return
      warned.add(user)

      // 📩 MENSAJE
      await sock.sendMessage(user, {
        text: `⚠️ ANTI-PRIVADO ACTIVADO

No puedes hablar conmigo por privado.
Serás bloqueado en 5 segundos.`
      })

      // ⏳ BLOQUEO
      setTimeout(async () => {
        try {
          await sock.updateBlockStatus(user, 'block')
        } catch (e) {
          console.log('❌ Error bloqueando:', e)
        }
        warned.delete(user)
      }, 5000)

    } catch (e) {
      console.log('❌ AntiPrivado:', e)
    }
  })
}

// ───── CONFIG ─────
handler.command = ['antiprivado']
handler.tags = ['owner']
handler.help = ['antiprivado on/off']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
