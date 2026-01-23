import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {}
  }

  if (groupSettings.enabled && isGroup) {
    const meta = await sock.groupMetadata(from)
    const isAdmin = meta.participants.some(
      p => p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    )
    if (!isAdmin) return
  }
  /* ───────────────────────────── */

  const now = new Date()

  reply(`
📅 Fecha actual
📆 ${now.toLocaleDateString()}
🕒 ${now.toLocaleTimeString()}
`.trim())
}

handler.command = ['fecha']
handler.tags = ['tools']
handler.menu = true

export default handler
