import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'

export const handler = async (m,{ sock, from, isAdmin, reply }) => {

/* 🔒 MODO ADMIN */
const modoadminPath = './data/modoadmin.json'
let groupSettings = { enabled:false }

if(fs.existsSync(modoadminPath)){
const data = JSON.parse(fs.readFileSync(modoadminPath))
groupSettings = data[from] || { enabled:false }
}

if(groupSettings.enabled && !isAdmin) return

/* ⚡ REACCIÓN */
await sock.sendMessage(from,{
react:{ text:'👀', key:m.key }
})

/* ✅ USAR m.quoted (IMPORTANTE) */
let q = m.quoted
if(!q) return reply('📸 Responde a una foto')

let mime = (q.msg || q).mimetype || ''
if(!mime.includes('image')) {
return reply('❌ Responde a una foto')
}

/* 🔽 DESCARGAR MEDIA */
const stream = await downloadContentFromMessage(
q.msg || q,
'image'
)

let buffer = Buffer.from([])

for await (const chunk of stream){
buffer = Buffer.concat([buffer,chunk])
}

/* 📸 ENVIAR FOTO */
await sock.sendMessage(from,{
image: buffer
},{ quoted:m })

}

handler.command = ['ver']
handler.tags = ['tools']
handler.help = ['ver']
handler.menu = true

export default handler
