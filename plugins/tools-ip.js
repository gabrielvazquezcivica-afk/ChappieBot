import fs from 'fs'
import fetch from 'node-fetch'

export const handler = async (m, {
  sock,
  from,
  args,
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

  if (!args[0]) return reply('🌐 Uso: `.ip 8.8.8.8`')

  try {
    const res = await fetch(`https://ipapi.co/${args[0]}/json`)
    const ip = await res.json()

    reply(`
🌐 IP INFO
📍 IP: ${ip.ip}
🏳️ País: ${ip.country_name}
🏙️ Ciudad: ${ip.city}
📡 ISP: ${ip.org}
`.trim())
  } catch {
    reply('❌ No se pudo obtener información')
  }
}

handler.command = ['ip']
handler.tags = ['tools']
handler.menu = true

export default handler
