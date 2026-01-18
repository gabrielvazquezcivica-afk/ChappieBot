import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function footer(botName) {
  return `\n\n> ${botName}`
}

export const handler = async (m, { sock, from, isGroup, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  const participants = metadata.participants.map(p => p.id)

  const rawText =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const cleanText = rawText.slice(2).trim() // quita ".n"

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text = (quoted.conversation ||
                  quoted.extendedTextMessage?.text || '') + footer(botName)
    } else {
      const mediaType = type.replace('Message', '')
      const stream = await downloadContentFromMessage(quoted[type], mediaType)
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

  reply(msgs.error || '❌ Ocurrió un error, intenta nuevamente')
}

handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto>']
handler.group = true
handler.admin = true
handler.menu = true
