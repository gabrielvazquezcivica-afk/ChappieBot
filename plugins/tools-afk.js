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

const handler = async (m, { sock, from, text, sender, isGroup, reply }) => {

  if (!m) return

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }

  if (isGroup && groupSettings.enabled) {
    const metadata = await sock.groupMetadata(from)
    const isAdmin = metadata.participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return
  }
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  afkData[sender] = {
    reason: text?.trim() || 'Sin motivo',
    time: Date.now()
  }

  saveAFK(afkData)

  await sock.sendMessage(from, { react: { text: '💤', key: m.key } })

  reply(
`😴 *MODO AFK ACTIVADO*

📌 Uso: .afk <motivo>
📝 Motivo: ${afkData[sender].reason}

📢 Avisaré:
• si te mencionan
• cuando vuelvas a escribir`
  )
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true

// 👇 BEFORE SEGURO (NO CRASHEA)
handler.before = async function (m, { sock }) {

  if (!m) return
  if (!m.sender) return
  if (!m.chat) return

  let afkData = loadAFK()
  const sender = m.sender
  const from = m.chat

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }

  if (m.isGroup && groupSettings.enabled) {
    const metadata = await sock.groupMetadata(from)
    const isAdmin = metadata.participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return
  }
  /* ─────────────────────────────────── */

  // 🟢 quitar AFK al escribir
  if (afkData[sender] && m.text) {
    const { reason, time } = afkData[sender]
    const duracion = msToTime(Date.now() - time)

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, {
      text: `👋 *${sender.split('@')[0]} volvió del AFK*

⏱ Tiempo: ${duracion}
📝 Motivo: ${reason}`,
      mentions: [sender]
    })
  }

  // 🔴 aviso si mencionan AFK
  if (m.mentionedJid && m.mentionedJid.length) {
    for (let jid of m.mentionedJid) {
      if (afkData[jid]) {
        const { reason, time } = afkData[jid]
        const duracion = msToTime(Date.now() - time)

        await sock.sendMessage(from, {
          text: `😴 *Usuario AFK*

👤 ${jid.split('@')[0]}
⏱ Tiempo: ${duracion}
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
