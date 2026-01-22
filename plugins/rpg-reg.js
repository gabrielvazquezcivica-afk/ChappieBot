import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')

// ───── HELPERS ─────
function loadRegistro () {
  if (!fs.existsSync(registroPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(registroPath))
  } catch {
    return {}
  }
}

// ───── COMANDO PERFIL ─────
export const handler = async (m, { sender, reply }) => {

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

  // 👤 PERFIL (solo del ejecutor)
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

export default handler
