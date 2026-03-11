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

export const handler = async (m,{ sock, from, reply, args }) => {

const text = args.join(' ')
if(!text) return reply('❌ Escribe el nombre de la canción')

await sock.sendMessage(from,{ react:{ text:'🎧', key:m.key }})

try{

const res = await fetch(`https://api.nekorinn.my.id/downloader/youtube/play?q=${encodeURIComponent(text)}`)
const json = await res.json()

const data = json.result

await sock.sendMessage(from,{
image:{ url:data.thumbnail },
caption:
`🎧 *CANCIÓN ENCONTRADA*

📀 ${data.title}
👤 ${data.channel}
⏱ ${data.duration}

⬇️ Enviando audio...`
},{ quoted:sistema('🎵 SPOTIFY') })

await sock.sendMessage(from,{
audio:{ url:data.audio },
mimetype:'audio/mpeg'
})

await sock.sendMessage(from,{ react:{ text:'✅', key:m.key }})

}catch(e){

console.log(e)
reply('❌ No se pudo obtener la canción')

}

}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <nombre>']
handler.menu = true

export default handler
