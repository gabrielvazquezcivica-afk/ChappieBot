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

// ───── DETECTOR REAL ─────
handler.before = async (m, { sock }) => {

  // 🔥 detectar mensaje privado correctamente
  const from = m.key.remoteJid
  if (!from) return

  const isPrivate = from.endsWith('@s.whatsapp.net')
  if (!isPrivate) return

  const user = from
  const number = user.split('@')[0].split(':')[0]

  const data = loadData()

  // 🔥 AQUÍ ESTABA TU ERROR
  // antes: Object.values(data)
  // ahora: verificar si EXISTE AL MENOS UN GRUPO ACTIVADO
  const active = Object.keys(data).some(g => data[g]?.enabled)

  if (!active) return

  // 🚫 no bloquear owner
  const ownerNumbers = global.config.owner?.numbers || []
  if (ownerNumbers.includes(number)) return

  // ⚠️ evitar repetir
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
}

// ───── CONFIG ─────
handler.command = ['antiprivado']
handler.tags = ['owner']
handler.help = ['antiprivado on/off']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
