import config from '../config.js'

// ───── HELPERS ─────
function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, sender, reply }) => {
  const owners = config.owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply('🔒 Solo el OWNER puede usar este comando')
  }

  // ⚡ reacción (USAR from)
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  let total = 0

  try {
    const chats = Object.keys(sock.store?.chats || {})

    for (const jid of chats) {
      if (
        !jid ||
        typeof jid !== 'string' ||
        jid === 'status@broadcast' ||
        !jid.includes('@')
      ) continue

      try {
        await sock.chatModify(
          { clear: { messages: [] } },
          jid
        )
        total++
      } catch {
        // ignorar errores individuales
      }
    }

    await reply(
`╭─〔 🧹 LIMPIEZA COMPLETA 〕
│ ✔️ Chats limpiados: ${total}
│ 🗑️ Historial eliminado
╰─〔 🤖 ChappieBot 〕`
    )

  } catch (e) {
    console.error(e)
    reply('❌ Error al limpiar los chats')
  }
}

handler.command = ['limpiarchats']
handler.tags = ['owner']
handler.menu = true
handler.owner = true

export default handler
