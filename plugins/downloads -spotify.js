import fetch from 'node-fetch'

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

export const handler = async (m, {
  sock,
  from,
  reply,
  args
}) => {

  const text = args.join(' ')
  if (!text) return reply('❌ Escribe el nombre de la canción')

  await sock.sendMessage(from,{ react:{ text:'🎧', key:m.key }})

  try {

    /* API DE MÚSICA */
    const res = await fetch(`https://api.dorratz.com/ytplay?q=${encodeURIComponent(text)}`)
    const data = await res.json()

    const title = data.title
    const artist = data.author
    const duration = data.duration
    const thumb = data.thumbnail
    const audio = data.audio

    /* TARJETA DE CANCIÓN */

    await sock.sendMessage(from,{
      image:{ url: thumb },
      caption:
`🎧 *CANCIÓN ENCONTRADA*

📀 ${title}
🎤 ${artist}
⏱ ${duration}

⬇️ Enviando audio...`
    },{ quoted: sistema('🎵 SPOTIFY') })

    /* AUDIO */

    await sock.sendMessage(from,{
      audio:{ url: audio },
      mimetype:'audio/mpeg'
    })

    await sock.sendMessage(from,{ react:{ text:'✅', key:m.key }})

  } catch(e){
    console.log(e)
    reply('❌ No se pudo obtener la canción')
  }

}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <nombre>']
handler.menu = true

export default handler
