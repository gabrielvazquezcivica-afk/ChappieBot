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

function getText(m) {
  if (!m || !m.message) return ''
  return (
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''
  ).trim()
}

/* ───── COMANDO AFK ───── */
export const handler = async (m, { sock, from, sender, reply, isGroup, isAdmin }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ───────────────────────────────── */

  const afkDB = loadAFK()
  const reason = getText(m).split(' ').slice(1).join(' ') || 'Sin motivo'

  afkDB[sender] = {
    time: Date.now(),
    reason
  }

  saveAFK(afkDB)

  await sock.sendMessage(from, {
    text: `💤 *AFK ACTIVADO*\n\n👤 Usuario: @${sender.split('@')[0]}\n📌 Motivo: ${reason}`,
    mentions: [sender]
  }, { quoted: m })
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true
export default handler

/* ───── BEFORE (AVISOS AUTOMÁTICOS) ───── */
handler.before = async function (m, { sock, from, sender, isGroup, isAdmin }) {
  if (!m || !m.message) return

  const afkDB = loadAFK()
  const text = getText(m)

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const data = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = data[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return
  /* ───────────────────────────────── */

  /* ───── QUITAR AFK SI ESCRIBE ───── */
  if (afkDB[sender]) {
    const time = afkDB[sender].time
    const reason = afkDB[sender].reason

    delete afkDB[sender]
    saveAFK(afkDB)

    return sock.sendMessage(from, {
      text: `✅ *AFK DESACTIVADO*\n\n👤 Usuario: @${sender.split('@')[0]}\n📌 Motivo: ${reason}\n⏱ Tiempo AFK: ${msToTime(Date.now() - time)}`,
      mentions: [sender]
    })
  }

  /* ───── SI MENCIONAN A ALGUIEN AFK ───── */
  const mentioned = [
    ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
    ...(m.message?.extendedTextMessage?.contextInfo?.participant ? [m.message.extendedTextMessage.contextInfo.participant] : [])
  ]

  for (const jid of mentioned) {
    if (afkDB[jid]) {
      const user = afkDB[jid]
      await sock.sendMessage(from, {
        text: `⚠️ *USUARIO AFK*\n\n👤 @${jid.split('@')[0]}\n📌 Motivo: ${user.reason}\n⏱ Desde: ${msToTime(Date.now() - user.time)}`,
        mentions: [jid]
      })
    }
  }
}

/* ───── TIEMPO BONITO ───── */
function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)

  s %= 60
  m %= 60

  return `${h}h ${m}m ${s}s`
}
