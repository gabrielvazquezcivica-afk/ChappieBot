import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

// ───── HELPERS ─────
function loadJSON (file, def = {}) {
  if (!fs.existsSync(file)) return def
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return def
  }
}

function saveJSON (file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ───── HANDLER ─────
export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminData = loadJSON(modoadminPath)

  if (isGroup) {
    groupSettings = modoadminData[from] || { enabled: false }

    if (groupSettings.enabled) {
      let isAdmin = false
      try {
        const metadata = await sock.groupMetadata(from)
        const participants = metadata.participants || []
        isAdmin = participants.some(
          p =>
            p.id === sender &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        )
      } catch {
        isAdmin = false
      }

      if (!isAdmin) return // 🚫 bloqueo silencioso
    }
  }
  /* ─────────────────────────────────────────────── */

  const registros = loadJSON(registroPath)

  // ✅ Ya registrado
  if (registros[sender]?.registered) {
    return reply('✅ Ya estás registrado en el sistema RPG')
  }

  // 🧠 Obtener texto
  const text =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.split(' ').slice(1)

  if (args.length < 2) {
    return reply(
`╭─〔 🧾 REGISTRO RPG 〕
│ Uso correcto:
│ .reg nombre edad
│
│ Ejemplo:
│ .reg Gabo 22
╰─〔 🤖 ChappieBot 〕`
    )
  }

  const name = args[0]
  const age = parseInt(args[1])

  if (!name || name.length < 3) {
    return reply('❌ El nombre debe tener al menos 3 letras')
  }

  if (!age || age < 5 || age > 100) {
    return reply('❌ Edad inválida')
  }

  // 💾 Guardar registro
  registros[sender] = {
    registered: true,
    name,
    age,
    level: 1,
    exp: 0,
    money: 0,
    health: 100,
    registerTime: Date.now()
  }

  saveJSON(registroPath, registros)

  reply(
`╭─〔 ✅ REGISTRO COMPLETADO 〕
│ 👤 Usuario : ${name}
│ 🎂 Edad   : ${age}
│ ⭐ Nivel  : 1
│ ❤️ Vida   : 100
│ 💰 Dinero : 0
╰─〔 🤖 ChappieBot 〕`
  )
}

handler.command = ['reg']
handler.tags = ['registro']
handler.menu = true

export default handler
