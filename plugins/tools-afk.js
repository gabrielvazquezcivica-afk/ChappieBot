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
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)
  s %= 60
  m %= 60
  return `${h}h ${m}m ${s}s`
}

function getText(m) {
  return (
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  ).trim()
}

/* ───── COMANDO AFK ───── */
export const handler = async (m, { sock, from, sender, isGroup, reply, isAdmin }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && isGroup && !isAdmin) return
  /* ─────────────────────────────────── */

  const afkData = loadAFK()
  const fullText = getText(m)
  const reason = fullText.replace(/^\.?afk/i, '').trim() || 'Sin motivo'

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

/* ───── BEFORE ───── */
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

  const body = getText(m)

  // 🟢 SI EL AFK ESCRIBE → QUITAR AFK
  if (afkData[sender] && !body.toLowerCase().startsWith('.afk')) {
    const reason = afkData[sender].reason
    const time = Date.now() - afkData[sender].time

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, {
      text: `✅ *AFK DESACTIVADO*\n\n👤 @${sender.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo: ${msToTime(time)}`,
      mentions: [sender]
    })
  }

  // 🟡 DETECTAR MENCIONES Y REPLY
  const mentioned = [
    ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
    ...(m.message?.extendedTextMessage?.contextInfo?.participant
      ? [m.message.extendedTextMessage.contextInfo.participant]
      : [])
  ]

  for (const jid of mentioned) {
    if (afkData[jid]) {
      const reason = afkData[jid].reason
      const time = Date.now() - afkData[jid].time

      await sock.sendMessage(from, {
        text: `💤 *USUARIO AFK*\n\n👤 @${jid.split('@')[0]}\n📄 Motivo: ${reason}\n⏱ Tiempo: ${msToTime(time)}`,
        mentions: [jid]
      })
    }
  }
}
