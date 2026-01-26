import fs from 'fs'

const afkPath = './data/afk.json'
const modoadminPath = './data/modoadmin.json'

function loadAFK() {
  if (!fs.existsSync(afkPath)) fs.writeFileSync(afkPath, JSON.stringify({}))
  return JSON.parse(fs.readFileSync(afkPath))
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2))
}

/* ───── COMANDO AFK ───── */
export const handler = async (m, { sock, from, text, sender, isGroup, isAdmin, reply }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  afkData[sender] = {
    reason: text || 'Sin motivo',
    time: Date.now()
  }

  saveAFK(afkData)

  reply(
`💤 *AFK ACTIVADO*
👤 Usuario: @${sender.split('@')[0]}
📄 Motivo: ${text || 'Sin motivo'}`,
  { mentions: [sender] })
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true
export default handler

/* ───── BEFORE (AUTOMÁTICO) ───── */
export async function before(m, { sock, from, sender, isGroup, isAdmin, reply }) {
  if (!m.message) return

  let afkData = loadAFK()

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  // ✅ Si el usuario estaba AFK y escribió
  if (afkData[sender]) {
    let afkTime = Date.now() - afkData[sender].time
    let reason = afkData[sender].reason

    delete afkData[sender]
    saveAFK(afkData)

    return reply(
`✅ *AFK DESACTIVADO*
👤 Usuario: @${sender.split('@')[0]}
📄 Motivo: ${reason}
⏱ Tiempo AFK: ${msToTime(afkTime)}`,
    { mentions: [sender] })
  }

  // ✅ Si mencionan a alguien AFK
  let mentioned = [
    ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
    m.message?.extendedTextMessage?.contextInfo?.participant
  ].filter(Boolean)

  for (let jid of mentioned) {
    if (afkData[jid]) {
      let reason = afkData[jid].reason
      let time = Date.now() - afkData[jid].time

      reply(
`💤 *USUARIO AFK*
👤 @${jid.split('@')[0]}
📄 Motivo: ${reason}
⏱ Tiempo: ${msToTime(time)}`,
      { mentions: [jid] })
    }
  }
}

/* ───── FUNCIÓN TIEMPO ───── */
function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)

  s %= 60
  m %= 60

  return `${h}h ${m}m ${s}s`
}
