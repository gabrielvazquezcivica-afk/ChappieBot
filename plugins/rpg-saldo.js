import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

// ───── HELPERS ─────
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return def
  }
}

// ───── HANDLER ─────
export const handler = async (m, { sock, from, sender, isGroup, reply }) => {

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
  const user = registros[sender]

  if (!user?.registered) {
    return reply('❌ No estás registrado en el sistema RPG. Usa `.reg nombre edad` primero.')
  }

  // 🔹 Mostrar saldo
  const text = `
╭─〔 💰 SALDO RPG 〕
│ 👤 Usuario: ${user.name}
│ 💰 Dinero: ${user.money} coins
│ ⭐ Nivel : ${user.level}
╰─〔 🤖 ChappieBot 〕
`.trim()

  reply(text)
}

handler.command = ['saldo']
handler.tags = ['rpg']
handler.menu = true

export default handler
