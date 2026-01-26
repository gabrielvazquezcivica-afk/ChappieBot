import fs from 'fs'
import path from 'path'

const afkPath = path.resolve('./data/afk.json')
const modoadminPath = path.resolve('./data/modoadmin.json')

function loadAFK() {
  if (!fs.existsSync(afkPath)) return {}
  return JSON.parse(fs.readFileSync(afkPath))
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2))
}

function msToTime(ms) {
  let sec = Math.floor(ms / 1000)
  let min = Math.floor(sec / 60)
  let hr = Math.floor(min / 60)
  sec %= 60
  min %= 60
  return `${hr}h ${min}m ${sec}s`
}

/* ───── COMANDO AFK ───── */
export const handler = async (m, { sock, from, sender, isGroup, reply, text, isAdmin }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && isGroup && !isAdmin) return
  /* ─────────────────────────────────── */

  const afkData = loadAFK()
  const reason = text || 'Sin motivo'

  afkData[sender] = {
    reason,
    time: Date.now()
  }

  saveAFK(afkData)

  await sock.sendMessage(from, {
    text: `💤 *AFK ACTIVADO*\n\n👤 @${sender.split('@')[0]}\n📄 Motivo: ${reason}`,
    mentions: [sender]
  })
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true
export default handler

/* ───── BEFORE (DETECTA MENCIÓN Y REGRESO) ───── */
export async function before(m, { sock, from, sender, isGroup, isAdmin }) {
  if (!m.message) return

  const afkData = loadAFK()

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && isGroup && !isAdmin) return
  /* ─────────────────────────────────── */

  // 🔹 TEXTO REAL
  const body =
    m.body ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  // 🔔 SI EL USUARIO AFK ESCRIBE → QUITAR AFK
  if (afkData[sender] && !body.startsWith('.afk')) {
    let reason = afkData[sender].reason
    let time = Date.now() - afkData[sender].time

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, {
      text: `✅ *AFK DESACTIVADO*\n\n👤 @${sender.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo AFK: ${msToTime(time)}`,
      mentions: [sender]
    })
  }

  // 🔔 DETECTAR MENCIONES
  let mentioned =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  for (let jid of mentioned) {
    if (afkData[jid]) {
      let reason = afkData[jid].reason
      let time = Date.now() - afkData[jid].time

      await sock.sendMessage(from, {
        text: `💤 *USUARIO AFK*\n\n👤 @${jid.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo AFK: ${msToTime(time)}`,
        mentions: [jid]
      })
    }
  }
}
