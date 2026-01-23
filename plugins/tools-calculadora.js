import fs from 'fs'

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

  if (!args.length) return reply('🧮 Uso: `.cal 5 * 8`')

  try {
    const result = Function(`"use strict";return (${args.join(' ')})`)()
    reply(`🧮 Resultado:\n*${result}*`)
  } catch {
    reply('❌ Operación inválida')
  }
}

handler.command = ['calculadora']
handler.tags = ['tools']
handler.menu = true

export default handler
