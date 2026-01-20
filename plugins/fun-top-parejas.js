import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }
    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  // 📌 Obtener participantes
  const metadata = await sock.groupMetadata(from)
  const users = metadata.participants
    .map(p => p.id)
    .filter(jid => jid !== sock.user?.id)

  if (users.length < 2) return reply('❌ No hay suficientes miembros')

  // 🔀 Mezclar usuarios
  const shuffled = users.sort(() => Math.random() - 0.5)

  const parejas = []
  for (let i = 0; i < shuffled.length - 1 && parejas.length < 5; i += 2) {
    parejas.push([shuffled[i], shuffled[i + 1]])
  }

  if (parejas.length === 0) return reply('❌ No se pudieron formar parejas')

  // 💞 Reacción
  await sock.sendMessage(from, {
    react: { text: '💖', key: m.key }
  })

  // 📝 Texto
  let text = `💞 *TOP 5 PAREJAS DEL GRUPO* 💞\n\n`
  let mentions = []

  parejas.forEach((pair, i) => {
    const u1 = pair[0]
    const u2 = pair[1]
    mentions.push(u1, u2)

    text += `${i + 1}. 💍 @${u1.split('@')[0]} ❤️ @${u2.split('@')[0]}\n`
  })

  text += `\n> El amor es temporal, el chisme es eterno 😏`

  await sock.sendMessage(
    from,
    {
      text,
      mentions
    },
    { quoted: m }
  )
}

// 📋 CONFIG
handler.command = ['topparejas']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
