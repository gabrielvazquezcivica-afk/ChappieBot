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

function cleanJid(jid = '') {
  return jid.split(':')[0]
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
    return sock.sendMessage(from, {
      text: '⚠️ Solo en grupos'
    }, { quoted: m })
  }

  if (!isOwner) {
    return sock.sendMessage(from, {
      text: '⚠️ Solo el owner'
    }, { quoted: m })
  }

  if (!args[0]) {
    return sock.sendMessage(from, {
      text: '⚙️ Uso: .antiprivado on/off'
    }, { quoted: m })
  }

  const state = args[0].toLowerCase()
  if (!['on','off'].includes(state)) {
    return sock.sendMessage(from, {
      text: '⚙️ Uso correcto: on / off'
    }, { quoted: m })
  }

  const data = loadData()
  const current = data[from]?.enabled || false

  // 🔥 AVISO SI YA ESTÁ IGUAL
  if (state === 'on' && current) {
    return sock.sendMessage(from, {
      text: '⚠️ El Anti-Privado ya está *ACTIVADO*'
    }, { quoted: m })
  }

  if (state === 'off' && !current) {
    return sock.sendMessage(from, {
      text: '⚠️ El Anti-Privado ya está *DESACTIVADO*'
    }, { quoted: m })
  }

  // guardar estado
  data[from] = { enabled: state === 'on' }
  saveData(data)

  await sock.sendMessage(from, {
    text: `🔒 Anti-Privado: *${state.toUpperCase()}*`
  }, { quoted: m })
}

// ───── DETECTOR ─────
handler.before = async (m, { sock }) => {

  let from = m.key.remoteJid
  if (!from) return

  // ❌ ignorar grupos
  if (from.endsWith('@g.us')) return

  // ❌ ignorar status
  if (from === 'status@broadcast') return

  // ✅ solo usuarios reales
  if (!from.endsWith('@s.whatsapp.net')) return

  const user = cleanJid(from)
  const number = user.split('@')[0]

  const data = loadData()
  const active = Object.values(data).some(cfg => cfg.enabled)

  if (!active) return

  // 🚫 NO bloquear owners
  const ownerNumbers = global.config.owner?.numbers || []
  if (ownerNumbers.includes(number)) return

  // ⚠️ evitar spam
  if (warned.has(user)) return
  warned.add(user)

  // 📩 MENSAJE CON QUOTED
  await sock.sendMessage(user, {
    text: `⚠️ *ANTI-PRIVADO ACTIVADO*

🚫 No puedes hablar conmigo por privado
📌 Usa los comandos en grupos

⏳ Serás bloqueado en 5 segundos...`
  })

  // ⏳ BLOQUEO SEGURO
  setTimeout(async () => {
    try {

      const exists = await sock.onWhatsApp(user)
      if (!exists || !exists[0]?.exists) {
        warned.delete(user)
        return
      }

      await sock.updateBlockStatus(user, 'block')

      warned.delete(user)

    } catch (e) {
      console.log('❌ Error bloqueando:', e)
      warned.delete(user)
    }
  }, 6000)
}

// ───── CONFIG ─────
handler.command = ['antiprivado']
handler.tags = ['owner']
handler.help = ['antiprivado on/off']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
