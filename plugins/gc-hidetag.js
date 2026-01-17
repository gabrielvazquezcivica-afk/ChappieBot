import { downloadContentFromMessage } from '@whiskeysockets/baileys'

// 🌐 Footer dinámico por fecha
function footer(botName) {
  const meses = [
    { name: 'enero', emojis: ['❄️','☃️','✨'] },
    { name: 'febrero', emojis: ['❤️','💘','🌹'] },
    { name: 'marzo', emojis: ['🍀','🌱','🌸'] },
    { name: 'abril', emojis: ['🌷','☔','🌼'] },
    { name: 'mayo', emojis: ['🌺','🌼','☀️'] },
    { name: 'junio', emojis: ['🌞','🏖️','😎'] },
    { name: 'julio', emojis: ['🔥','🌴','☀️'] },
    { name: 'agosto', emojis: ['🌻','☀️','🏖️'] },
    { name: 'septiembre', emojis: ['🍁','🍂','🌾'] },
    { name: 'octubre', emojis: ['🎃','👻','🕸️'] },
    { name: 'noviembre', emojis: ['🍂','🦃','🤎'] },
    { name: 'diciembre', emojis: ['🎄','✨','🎅'] }
  ]

  const now = new Date()
  const m = meses[now.getMonth()]
  const emoji = m.emojis[Math.floor(Math.random() * m.emojis.length)]

  return `\n\n> ${botName} • ${now.getDate()} ${m.name} ${now.getFullYear()} ${emoji}`
}

export const handler = async (m, { sock, from, isGroup, reply }) => {

  if (!isGroup) return reply('❌ Solo se puede usar en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply('❌ Solo admins pueden usar este comando')
  }

  const participants = metadata.participants.map(p => p.id)
  const botName = sock.user?.name || 'ChappieBot'

  // ✅ TEXTO ORIGINAL (con saltos)
  const rawText =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const cleanText = rawText.slice(2).trim() // quita ".n"

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  // 📌 RESPONDIENDO A MENSAJE
  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text = (quoted.conversation ||
                  quoted.extendedTextMessage?.text ||
                  '') + footer(botName)
    } else {
      const mediaType = type.replace('Message', '')
      const stream = await downloadContentFromMessage(
        quoted[type],
        mediaType
      )

      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      msg[mediaType] = buffer
      msg.caption = (quoted[type]?.caption || cleanText || '') + footer(botName)
    }

    msg.mentions = participants
    await sock.sendMessage(from, msg, { quoted: m })
    return
  }

  // 📝 SOLO TEXTO
  if (cleanText) {
    await sock.sendMessage(
      from,
      {
        text: cleanText + footer(botName),
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  reply('⚠️ Usa .n <texto> o responde a un mensaje para agregar footer')
}

handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto>']
handler.group = true
handler.admin = true
