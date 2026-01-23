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

function saveJSON(file, data) {
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

  if (!registros[sender]?.registered) {
    return reply('❌ No estás registrado en el sistema RPG')
  }

  // 🔥 Borrar registro
  delete registros[sender]
  saveJSON(registroPath, registros)

  reply(
`╭─〔 🗑️ REGISTRO ELIMINADO 〕
│ 👤 Usuario borrado
│ ✅ Ahora ya no estás registrado
╰─〔 🤖 ChappieBot 〕`
  )
}

handler.command = ['unreg']
handler.tags = ['registro']
handler.menu = true

export default handler
