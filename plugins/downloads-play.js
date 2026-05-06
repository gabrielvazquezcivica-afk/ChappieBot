import yts from 'yt-search'
import { spawn } from 'child_process'
import fs from 'fs'

export const handler = async (m, { sock, from, args, reply, isAdmin }) => {

const botName = sock.user?.name || 'ChappieBot'

/* 🔒 MODO ADMIN */
const modoadminPath = './data/modoadmin.json'
let groupSettings = { enabled: false }

if (fs.existsSync(modoadminPath)) {
  const data = JSON.parse(fs.readFileSync(modoadminPath))
  groupSettings = data[from] || { enabled: false }
}

if (groupSettings.enabled && !isAdmin) return

const text = args.join(' ').trim()

if (!text) {
  return reply('🎧 Uso: .play <canción>')
}

/* ⚡ REACCIÓN */
await sock.sendMessage(from,{
  react:{ text:'🎧', key:m.key }
})

try {

/* 🔎 BUSCAR */
const search = await yts(text)

if (!search.videos.length) {
  return reply('❌ No encontré resultados')
}

const video = search.videos[0]

const { title, url, thumbnail, timestamp, views, author } = video

/* 🎨 DISEÑO NUEVO */
await sock.sendMessage(from,{
  image:{ url:thumbnail },
  caption:
`╭━━━〔 🎶 ${botName} 〕━━━⬣
┃
┃ 🎵 *${title}*
┃ 👤 ${author.name}
┃ ⏱ ${timestamp}
┃ 👁 ${views.toLocaleString()} vistas
┃
┃ ⬇️ Descargando...
╰━━━━━━━━━━━━━━⬣`
},{ quoted:m })

/* 📁 ASEGURAR CARPETA TMP */
if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp')
}

const file = `./tmp/${Date.now()}.m4a`

/* 🚀 DESCARGA */
const ytdlp = spawn('yt-dlp',[
  '-f','bestaudio[abr<=128][ext=m4a]/bestaudio',
  '--no-playlist',
  '--quiet',
  '-o',file,
  url
])

/* 🧠 LOG DE ERRORES (por si algo falla) */
ytdlp.stderr.on('data', data => {
  console.log('YTDLP ERROR:', data.toString())
})

ytdlp.on('close', async(code)=>{

  if(code !== 0){
    return reply('❌ Error descargando audio')
  }

  try {

    /* ✅ FIX: enviar por URL (no buffer) */
    await sock.sendMessage(from,{
      audio: { url: file },
      mimetype:'audio/mp4',
      ptt:false
    },{ quoted:m })

    fs.unlinkSync(file)

    await sock.sendMessage(from,{
      react:{ text:'✅', key:m.key }
    })

  } catch (err) {
    console.log('SEND AUDIO ERROR:', err)
    reply('❌ Error enviando audio')
  }

})

}catch(e){

console.log('PLAY ERROR:',e)
reply('❌ Error al procesar la canción')

}

}

handler.command = ['play']
handler.tags = ['descargas']
handler.help = ['play <canción>']
handler.menu = true

export default handler
