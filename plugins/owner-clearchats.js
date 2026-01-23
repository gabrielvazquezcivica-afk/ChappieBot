import config from '../config.js'

function onlyNumber(jid = '') {
  return jid.replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, sender, reply }) => {
  const owners = config.owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply('🔒 Solo el OWNER puede usar este comando')
  }

  await sock.sendMessage(from, {
    react: { text: '🧹', key: m.key }
  })

  let cleared = 0

  const chats = Object.keys(sock.store.chats || {})

  for (const jid of chats) {
    if (
      !jid ||
      jid === 'status@broadcast' ||
      !jid.includes('@')
    ) continue

    try {
      await sock.chatModify(
        {
          clear: {
            messages: []
          }
        },
        jid
      )

      await sock.readMessages([{ remoteJid: jid }])

      cleared++
    } catch {}
  }

  reply(
`╭─〔 🧹 LIMPIEZA REAL 〕
│ ✔️ Chats vaciados: ${cleared}
│ ℹ️ WhatsApp no permite
│ eliminar chats completos
╰─〔 🤖 ChappieBot 〕`
  )
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.menu = true
handler.owner = true

export default handler
