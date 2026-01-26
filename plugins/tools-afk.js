import fs from 'fs'
import path from 'path'

// ───── Rutas JSON ─────
const afkPath = path.resolve('./data/afk.json')

// ───── Funciones para manejar JSON ─────
function loadAFK() {
  if (!fs.existsSync(afkPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(afkPath))
  } catch {
    return {}
  }
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2))
}

// ───── Comando .afk ─────
export const handler = async (m, { text, sock }) => {
  const afkData = loadAFK()
  afkData[m.sender] = {
    time: Date.now(),
    reason: text || 'Sin motivo'
  }
  saveAFK(afkData)

  await sock.sendMessage(m.chat, {
    text: `💤 Te pusiste AFK\nMotivo: ${text || 'Sin motivo'}\n📌 Tus menciones mostrarán este aviso`
  }, { quoted: m })
}

handler.command = ['afk']
handler.tags = ['main']
handler.help = ['afk [motivo]']

// ───── Before: Detectar menciones y regreso ─────
export async function before(m, { sock }) {
  if (!m.message) return true

  const afkData = loadAFK()

  // 🔹 Detectar si alguien que fue mencionado está AFK
  const mentions = [...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])]

  for (const jid of mentions) {
    const afkUser = afkData[jid]
    if (!afkUser) continue

    const tiempo = Math.floor((Date.now() - afkUser.time) / 60000)
    const motivo = afkUser.reason || 'Sin motivo'

    await sock.sendMessage(m.chat, {
      text: `🚩 El usuario está AFK\nMotivo: ${motivo}\nTiempo AFK: ${tiempo} min`
    }, { quoted: m })
  }

  // 🔹 Detectar si el propio usuario estaba AFK y volvió
  const userAFK = afkData[m.sender]
  if (userAFK) {
    const tiempo = Math.floor((Date.now() - userAFK.time) / 60000)
    await sock.sendMessage(m.chat, {
      text: `✅ ${await sock.getName(m.sender)} ya no está AFK\nMotivo previo: ${userAFK.reason || 'Sin motivo'}\nTiempo AFK: ${tiempo} min`
    }, { quoted: m })

    // Eliminar del JSON
    delete afkData[m.sender]
    saveAFK(afkData)
  }

  return true
}

export default handler
