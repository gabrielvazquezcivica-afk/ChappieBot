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

// evitar spam
const warned = new Set()

// ───── COMANDO ─────
export const handler = async (m, {
  from,
  isGroup,
  isOwner,
  args,
  reply
}) => {

  if (!isGroup) return reply('⚠️ Solo en grupos')
  if (!isOwner) return reply('⚠️ Solo el owner')

  if (!args[0]) return reply('⚙️ Uso: .antiprivado on/off')

  const state = args[0].toLowerCase()
  if (!['on','off'].includes(state)) return reply('⚙️ Uso: on/off')

  const data = loadData()
  data[from] = { enabled: state === 'on' }
  saveData(data)

  reply(`🔒 Anti-privado: *${state.toUpperCase()}*`)
}

// ───── DETECTOR REAL (FIX) ─────
handler.before = async (m, { sock }) => {

  const from = m.key.remoteJid
  if (!from || from.endsWith('@g.us')) return // SOLO PRIVADOS

  const user = from
  const number = user.split('@')[0].split(':')[0]

  const data = loadData()
  const active = Object.values(data).some(cfg => cfg.enabled)

  if (!active) return

  // 🚫 NO bloquear owners
  const ownerNumbers = global.config.owner?.numbers || []
  if (ownerNumbers.includes(number)) return

  // ⚠️ evitar repetir
  if (warned.has(user)) return
  warned.add(user)

  // 📩 MENSAJE
  await sock.sendMessage(user, {
    text: `⚠️ *ANTI-PRIVADO ACTIVADO*

🚫 No puedes hablar conmigo por privado
📌 Usa los comandos en grupos

⏳ Serás bloqueado en 5 segundos...`
  })

  // ⏳ BLOQUEO
  setTimeout(async () => {
    try {
      await sock.updateBlockStatus(user, 'block')
      warned.delete(user)
    } catch (e) {
      console.log('❌ Error bloqueando:', e)
    }
  }, 5000)
}

// ───── CONFIG ─────
handler.command = ['antiprivado']
handler.tags = ['owner']
handler.help = ['antiprivado on/off']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
