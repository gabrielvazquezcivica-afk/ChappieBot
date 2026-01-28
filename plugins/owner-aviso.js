// ───── AVISO GLOBAL A TODOS LOS GRUPOS ─────
export const handler = async (m, { sock, args, isOwner, reply }) => {

  if (!isOwner) return reply('❌ Solo el OWNER puede usar este comando')

  const msg = args.join(' ').trim()
  if (!msg) {
    return reply('✳️ Uso correcto:\n.aviso <mensaje>\n\nEjemplo:\n.aviso El bot estará en mantenimiento')
  }

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

  const groupsData = await sock.groupFetchAllParticipating()
  const groups = Object.keys(groupsData)

  if (!groups.length) {
    return reply('❌ El bot no está en ningún grupo')
  }

  reply(`📢 Enviando aviso a ${groups.length} grupos...`)

  let enviados = 0

  for (const gid of groups) {
    try {
      const meta = await sock.groupMetadata(gid)
      const mentions = meta.participants.map(p => p.id)

      await sock.sendMessage(
        gid,
        {
          text: `📢 *AVISO GLOBAL*\n\n${msg}`,
          mentions
        },
        { quoted: sistema('AVISO GLOBAL') }
      )

      enviados++
    } catch (e) {
      console.log('❌ Error enviando a:', gid)
    }
  }

  reply(`✅ Aviso enviado a ${enviados} grupos`)
}

handler.command = ['aviso']
handler.tags = ['owner']
handler.menu = true
handler.owner = true
export default handler
