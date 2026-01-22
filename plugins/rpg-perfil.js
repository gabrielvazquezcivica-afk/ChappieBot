import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = './data/modoadmin.json'

// ───── HELPERS ─────
function loadRegistro () {
  if (!fs.existsSync(registroPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(registroPath))
  } catch {
    return {}
  }
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

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  const registros = loadRegistro()
  const user = registros[sender]

  // 🚫 No registrado
  if (!user || !user.registered) {
    return reply(
`╭─〔 ❌ NO REGISTRADO 〕
│ Usa primero:
│ .reg nombre edad
╰─〔 🤖 ChappieBot 〕`
    )
  }

  // 👤 PERFIL
  const perfil = `
╭─〔 👤 PERFIL 〕
│ 🏷️ Nombre : ${user.name}
│ 🎂 Edad   : ${user.age}
│
│ ⭐ Nivel  : ${user.level}
│ ✨ Exp    : ${user.exp}
│
│ ❤️ Vida   : ${user.health}
│ 💰 Dinero : ${user.money}
╰─〔 🤖 ChappieBot 〕
`.trim()

  reply(perfil)
}

handler.command = ['perfil']
handler.tags = ['registro']
handler.menu = true
handler.group = true

export default handler
