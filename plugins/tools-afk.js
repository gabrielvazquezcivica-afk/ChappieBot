import fs from 'fs'

const afkPath = './data/afk.json'
const modoadminPath = './data/modoadmin.json'

// crear archivo si no existe
if (!fs.existsSync(afkPath)) fs.writeFileSync(afkPath, JSON.stringify({}, null, 2))

function loadAFK() {
  return JSON.parse(fs.readFileSync(afkPath))
}

function saveAFK(data) {
  fs.writeFileSync(afkPath, JSON.stringify(data, null, 2))
}

export const handler = async (m, { sock, from, text, reply, sender, isGroup, isAdmin }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (isGroup && groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  afkData[sender] = {
    reason: text || 'Sin motivo',
    time: Date.now()
  }

  saveAFK(afkData)

  await sock.sendMessage(from, { react: { text: '💤', key: m.key } })
  reply(`😴 *Ahora estás AFK*\n📝 Motivo: ${afkData[sender].reason}`)
}

handler.command = ['afk']
handler.tags = ['tools']
handler.menu = true

export default handler


// 🔔 detector
export async function before(m, { sock, isGroup, isAdmin }) {
  if (!m.text) return

  const sender = m.sender
  const from = m.chat

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (isGroup && groupSettings.enabled && !isAdmin) return
  /* ─────────────────────────────────── */

  let afkData = loadAFK()

  // 🟢 vuelve del AFK
  if (afkData[sender]) {
    const { reason, time } = afkData[sender]
    const duracion = msToTime(Date.now() - time)

    delete afkData[sender]
    saveAFK(afkData)

    await sock.sendMessage(from, { react: { text: '👋', key: m.key } })
    await sock.sendMessage(from, {
      text: `👋 *${sender.split('@')[0]} volvió*\n⏱ Tiempo AFK: ${duracion}\n📝 Motivo: ${reason}`,
      mentions: [sender]
    })
  }

  // 🔴 mencionan a AFK
  if (m.mentionedJid && m.mentionedJid.length) {
    for (let jid of m.mentionedJid) {
      if (afkData[jid]) {
        const { reason, time } = afkData[jid]
        const duracion = msToTime(Date.now() - time)

        await sock.sendMessage(from, {
          text: `😴 *Usuario AFK*\n👤 ${jid.split('@')[0]}\n⏱ Tiempo: ${duracion}\n📝 Motivo: ${reason}`,
          mentions: [jid]
        })
      }
    }
  }
}


// ⏱ tiempo bonito
function msToTime(ms) {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)

  s %= 60
  m %= 60

  return `${h}h ${m}m ${s}s`
      }
