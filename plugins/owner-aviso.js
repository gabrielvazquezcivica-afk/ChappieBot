export const handler = async (m, { sock, args, isOwner, reply }) => {

  const msgs = global.config.messages || {}

  if (!isOwner) {
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')
  }

  const msg = args.join(' ').trim()

  if (!msg) {
    return reply(
`📢 *AVISO GLOBAL*

Uso:
.aviso <mensaje>

Ejemplo:
.aviso El bot estará en mantenimiento`
    )
  }

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

  const groupsData = await sock.groupFetchAllParticipating()
  const groups = Object.keys(groupsData)

  if (!groups.length) {
    return reply('❌ El bot no está en ningún grupo')
  }

  reply(`📡 Enviando aviso a *${groups.length}* grupos...`)

  let enviados = 0

  for (const gid of groups) {
    try {

      const mentions = groupsData[gid].participants.map(p => p.id)

      await sock.sendMessage(
        gid,
        {
          text: `📢 *AVISO DEL OWNER*\n\n${msg}`,
          mentions
        },
        { quoted: sistema('AVISO GLOBAL') }
      )

      enviados++

    } catch (e) {
      console.log('❌ Error enviando aviso a:', gid)
    }
  }

  reply(`✅ Aviso enviado correctamente a *${enviados}* grupos`)
}

handler.command = ['aviso']
handler.tags = ['owner']
handler.help = ['aviso <mensaje>']
handler.menu = true
handler.owner = true

export default handler
