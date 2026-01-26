import fs from 'fs'

const afkPath = './data/afk.json'
const modoadminPath = './data/modoadmin.json'

if (!fs.existsSync(afkPath)) fs.writeFileSync(afkPath, JSON.stringify({}, null, 2))

function loadAFK() {
  return JSON.parse(fs.readFileSync(afkPath))
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2))
}

function loadModoAdmin(from) {
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  return groupSettings
}

const handler = async (m, { sock, from, sender, text, reply, isAdmin, isGroup }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  if (isGroup) {
    const groupSettings = loadModoAdmin(from)
    if (groupSettings.enabled && !isAdmin) return
  }
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  afkData[sender] = {
    reason: text || 'Sin motivo',
    time: Date.now()
  }

  saveAFK(afkData)

  await sock.sendMessage(from, { react: { text: '💤', key: m.key } })

  reply(
`『 ＡＦＫ 』

😴 @${sender.split('@')[0]} ahora está AFK

📝 Motivo: ${text || 'Sin motivo'}
`,
{ mentions: [sender] }
  )
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true

// ───── BEFORE ─────
handler.before = async function (m, { sock, isAdmin, isGroup }) {
  if (!m || !m.sender || !m.chat) return

  const from = m.chat
  const sender = m.sender

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  if (isGroup) {
    const groupSettings = loadModoAdmin(from)
    if (groupSettings.enabled && !isAdmin) return
  }
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  // ✅ SI EL USUARIO AFK HABLA
  if (afkData[sender]) {
    const { reason, time } = afkData[sender]
    const duration = msToTime(Date.now() - time)

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, {
      text:
`👋 @${sender.split('@')[0]} volvió del AFK

⏱ Tiempo: ${duration}
📝 Motivo: ${reason}`,
      mentions: [sender]
    })
  }

  // ✅ SI MENCIONAN A UN AFK
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    for (let jid of m.mentionedJid) {
      if (afkData[jid]) {
        const { reason, time } = afkData[jid]
        const duration = msToTime(Date.now() - time)

        await sock.sendMessage(from, {
          text:
`😴 Usuario AFK

👤 @${jid.split('@')[0]}
⏱ Tiempo: ${duration}
📝 Motivo: ${reason}`,
          mentions: [jid]
        })
      }
    }
  }
}

export default handler

function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)
  s %= 60
  m %= 60
  return `${h}h ${m}m ${s}s`
}
