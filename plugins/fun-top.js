import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, reply, owner }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch { groupSettings = { enabled: false } }
  }

  if (groupSettings.enabled && isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    } catch {}
  }
  /* ─────────────────────────────────── */

  // ───── Obtener participantes del grupo ─────
  const metadata = await sock.groupMetadata(from)
  let participants = metadata.participants.map(p => p.id).filter(id => id !== sock.user.id)

  if (participants.length < 2) return reply('❌ No hay suficientes miembros para generar un Top')

  // ───── Seleccionar 10 personas aleatorias ─────
  participants = participants.sort(() => 0.5 - Math.random()).slice(0, 10)

  // ───── Nombres de los participantes ─────
  const participantNames = participants.map(id => {
    const contact = metadata.participants.find(p => p.id === id)
    return contact?.notify || id.split('@')[0]
  })

  // ───── Frase con emojis aleatorios ─────
  const emojis = ['🔥','✨','💥','🌟','💫','❤️','💎','💡','🎉','⚡','🎶','😎','🫶','💀','🧨','🌈','💐','🍀','🍭','🎁']
  const texto = participantNames.map(name => {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    return `${emoji} ${name}`
  }).join(' ')

  const finalText = `🏆 Top 10 del grupo 🏆\n\n${texto}\n\n> ¡Felicitaciones a los mejores del grupo!`

  await sock.sendMessage(
    from,
    { text: finalText, mentions: participants },
    { quoted: m }
  )
}

handler.command = ['top']
handler.tags = ['juegos']
handler.menu = true
handler.group = true
handler.help = ['top']

export default handler
