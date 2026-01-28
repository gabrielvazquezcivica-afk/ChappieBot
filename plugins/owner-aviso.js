// ───── AVISO GLOBAL A TODOS LOS GRUPOS ─────
export const handler = async (m, { sock, text, isOwner, reply }) => {
  if (!isOwner) return reply('❌ Solo el OWNER puede usar este comando')

  if (!text) return reply('✳️ Escribe el mensaje del aviso\nEjemplo:\n.aviso Se reiniciará el bot')

  // ───── QUOTED SISTEMA (CHAPPIEBOT) ─────
  const sistema = (titulo = 'CHAPPIE BOT') => ({
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: {
      orderMessage: {
        itemCount: 1,
        message: titulo,
        footerText: 'ChappieBot',
        surface: 2,
        sellerJid: '0@s.whatsapp.net'
      }
    }
  })
  // ─────────────────────────────────────

  const groups = Object.values(sock.chats)
    .filter(chat => chat.id.endsWith('@g.us'))
    .map(chat => chat.id)

  reply(`📢 Enviando aviso a ${groups.length} grupos...`)

  for (const id of groups) {
    try {
      const metadata = await sock.groupMetadata(id)
      const members = metadata.participants.map(p => p.id)

      await sock.sendMessage(id, {
        text: `📢 *AVISO GLOBAL*\n\n${text}`,
        mentions: members,
        quoted: sistema('AVISO GLOBAL')
      })

    } catch (e) {
      console.log('Error en grupo:', id)
    }
  }

  reply('✅ Aviso enviado a todos los grupos')
}

handler.command = ['aviso']
handler.tags = ['owner']
handler.menu = true
handler.owner = true
export default handler
