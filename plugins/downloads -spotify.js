import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'

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

const text = args.join(' ').trim()
if(!text) return reply('❌ Escribe el nombre de la canción')

await sock.sendMessage(from,{ react:{ text:'🎧', key:m.key }})

try{

/* 🔎 BUSCAR VIDEO */
const search = await yts(text)

if(!search.videos.length){
return reply('❌ No encontré resultados')
}

const video = search.videos[0]

const { title, url, thumbnail, timestamp, views, author } = video

/* 🎵 TARJETA TIPO SPOTIFY */

await sock.sendMessage(from,{
image:{ url: thumbnail },
caption:
`╭─❖ 「 🎧 SPOTIFY 」 ❖─╮
│ 🎵 Título: ${title}
│ 👤 Artista: ${author.name}
│ ⏱ Duración: ${timestamp}
│ 👁 Vistas: ${views.toLocaleString()}
╰────────────────

⬇️ Descargando audio...`
},{ quoted:sistema('🎵 SPOTIFY SEARCH') })

/* 📁 ARCHIVO */

const file = `./tmp/${Date.now()}.m4a`

/* ⚡ DESCARGA RÁPIDA */

const ytdlp = spawn('yt-dlp',[
'-f',
'bestaudio[ext=m4a]',
'--no-playlist',
'--quiet',
'-o',
file,
url
])

ytdlp.on('close', async(code)=>{

if(code !== 0){
return reply('❌ Error descargando audio')
}

/* 🎧 ENVIAR AUDIO */

await sock.sendMessage(from,{
audio: fs.readFileSync(file),
mimetype:'audio/mp4',
fileName:`${title}.m4a`
},{ quoted:m })

fs.unlinkSync(file)

await sock.sendMessage(from,{
react:{ text:'✅', key:m.key }
})

})

}catch(e){

console.log('SPOTIFY ERROR:',e)
reply('❌ Error al procesar la canción')

}

}

handler.command = ['spotify']
handler.tags = ['descargas']
handler.help = ['spotify <canción>']
handler.menu = true

export default handler
