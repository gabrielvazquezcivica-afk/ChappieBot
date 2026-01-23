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

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*'
  let pass = ''

  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }

  reply(`🔐 Contraseña generada:\n*${pass}*`)
}

handler.command = ['password']
handler.tags = ['tools']
handler.menu = true

export default handler
