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

// 🔹 FUNCIÓN PARA LEER TEXTO REAL
function getText(m) {
  return (
    m.body ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  )
}

/* ───── COMANDO AFK ───── */
export const handler = async (m, { sock, from, sender, isAdmin }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  // ✅ TEXTO SEGURO
  let fullText = getText(m)
  let reason = fullText.replace(/^\.afk\s*/i, '').trim()
  if (!reason) reason = 'Sin motivo'

  afkData[sender] = {
    reason,
    time: Date.now()
  }

  saveAFK(afkData)

  await sock.sendMessage(from, {
    text: `💤 *AFK ACTIVADO*\n\n👤 Usuario: @${sender.split('@')[0]}\n📄 Motivo: ${reason}`,
    mentions: [sender]
  })
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true
export default handler

/* ───── BEFORE ───── */
export async function before(m, { sock, from, sender, isAdmin }) {
  if (!m.message) return

  let afkData = loadAFK()

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  // 🔔 CUANDO REGRESA
  if (afkData[sender]) {
    let reason = afkData[sender].reason
    let time = Date.now() - afkData[sender].time

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, {
      text: `✅ *AFK DESACTIVADO*\n\n👤 Usuario: @${sender.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo: ${msToTime(time)}`,
      mentions: [sender]
    })
  }

  // 🔔 CUANDO LO MENCIONAN
  let mentioned = m.mentionedJid || []

  for (let jid of mentioned) {
    if (afkData[jid]) {
      let reason = afkData[jid].reason
      let time = Date.now() - afkData[jid].time

      await sock.sendMessage(from, {
        text: `💤 *USUARIO AFK*\n\n👤 @${jid.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo: ${msToTime(time)}`,
        mentions: [jid]
      })
    }
  }
}

function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)
  s %= 60
  m %= 60
  return `${h}h ${m}m ${s}s`
}
