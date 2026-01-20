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

  // 📌 Obtener menciones
  const mentions =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  let user1, user2

  if (mentions.length >= 2) {
    user1 = mentions[0]
    user2 = mentions[1]
  } else if (mentions.length === 1) {
    user1 = sender
    user2 = mentions[0]
  } else {
    return reply('❌ Menciona a alguien\nEjemplo:\n.ship @usuario\n.ship @u1 @u2')
  }

  // 🎯 Porcentaje aleatorio
  const porcentaje = Math.floor(Math.random() * 101)

  // ⏳ Mensaje inicial
  const loadingMsg = await sock.sendMessage(
    from,
    {
      text: '💞 Calculando compatibilidad...\n▰▱▱▱▱▱▱▱▱▱ 0%'
    },
    { quoted: m }
  )

  const key = loadingMsg.key

  // ⏱️ Animación de carga
  const frames = [
    '▰▰▱▱▱▱▱▱▱▱ 20%',
    '▰▰▰▰▱▱▱▱▱▱ 40%',
    '▰▰▰▰▰▰▱▱▱▱ 60%',
    '▰▰▰▰▰▰▰▰▱▱ 80%',
    '▰▰▰▰▰▰▰▰▰▰ 100%'
  ]

  for (const frame of frames) {
    await new Promise(r => setTimeout(r, 700))
    await sock.sendMessage(from, {
      text: `💞 Calculando compatibilidad...\n${frame}`,
      edit: key
    })
  }

  // ❤️ Resultado final
  const resultText = `
💘 *SHIP RESULT* 💘

👤 @${user1.split('@')[0]}
💞
👤 @${user2.split('@')[0]}

📊 Compatibilidad: *${porcentaje}%*

> El amor es impredecible 😏
`.trim()

  await sock.sendMessage(
    from,
    {
      text: resultText,
      mentions: [user1, user2],
      edit: key
    }
  )
}

// 📋 CONFIG
handler.command = ['ship']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
