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

export const handler = async (m, { sock, from, text, reply, sender, isGroup }) => {

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
    reason: text && text.trim() ? text : 'Sin motivo',
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
export default handler


// 🔔 detector automático
export async function before(m, { sock }) {
  if (!m.text) return

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

  let afkData = loadAFK()

  // 🟢 si vuelve del AFK
  if (afkData[sender]) {
    const { reason, time } = afkData[sender]
    const duracion = msToTime(Date.now() - time)

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, { react: { text: '👋', key: m.key } })
    await sock.sendMessage(from, {
      text: `👋 *${sender.split('@')[0]} volvió del AFK*

⏱ Tiempo AFK: ${duracion}
📝 Motivo: ${reason}`,
      mentions: [sender]
    })
  }

  // 🔴 si mencionan a alguien AFK
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

function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)

  s %= 60
  m %= 60

  return `${h}h ${m}m ${s}s`
}
