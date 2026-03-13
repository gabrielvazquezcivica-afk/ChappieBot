import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function footer(name) {
  return `\n\n> ${name}`
}

export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {
  const msgs = global.config.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // 🔹 Obtener nombre del grupo
  let groupName = botName
  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      groupName = metadata.subject
    } catch {}
  }

  // ✅ REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '📢', key: m.key }
  })

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 🔹 Verificar admin según index.js
  if (!isAdmin) {
    return reply(msgs.admin || '⚠️ Este comando es solo para administradores')
  }

  // 🔹 Obtener todos los participantes
  let participants = []
  try {
    const metadata = await sock.groupMetadata(from)
    participants = metadata.participants.map(p => p.id)
  } catch {
    participants = [m.key.participant]
  }

  const rawText =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const cleanText = rawText.startsWith(global.prefix)
    ? rawText.slice(2).trim()
    : rawText.trim()

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  if (quoted) {
    const type = Object.keys(quoted)[0]
    let msg = {}

    if (type === 'conversation' || type === 'extendedTextMessage') {
      msg.text = (quoted.conversation ||
        quoted.extendedTextMessage?.text || '') + footer(groupName)
    } else {
      const mediaType = type.replace('Message', '')
      const stream = await downloadContentFromMessage(quoted[type], mediaType)
      let buffer = Buffer.from([])

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      msg[mediaType] = buffer
      msg.caption = (quoted[type]?.caption || cleanText || '') + footer(groupName)
    }

    msg.mentions = participants
    await sock.sendMessage(from, msg, { quoted: m })
    return
  }

  if (cleanText) {
    await sock.sendMessage(
      from,
      {
        text: cleanText + footer(groupName),
        mentions: participants
      },
      { quoted: m }
    )
    return
  }

  reply(msgs.error || '❌ Usa .n <texto> o responde a un mensaje')
}

handler.command = ['n']
handler.tags = ['group']
handler.help = ['n <texto>']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
