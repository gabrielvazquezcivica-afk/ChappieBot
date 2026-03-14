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

const ctx = m.message?.extendedTextMessage?.contextInfo
const quoted = ctx?.quotedMessage

if(!quoted) return reply('📸 Responde a una foto de ver una vez')

const type = Object.keys(quoted)[0]

if(type !== 'viewOnceMessageV2' && type !== 'viewOnceMessage'){
return reply('❌ Ese mensaje no es de ver una vez')
}

const msg = quoted[type].message
const mediaType = Object.keys(msg)[0]

const stream = await downloadContentFromMessage(
msg[mediaType],
mediaType.replace('Message','')
)

let buffer = Buffer.from([])

for await (const chunk of stream){
buffer = Buffer.concat([buffer,chunk])
}

/* 📸 ENVIAR SOLO FOTO */
await sock.sendMessage(from,{
image:buffer
},{ quoted:m })

}

handler.command = ['ver']
handler.tags = ['tools']
handler.help = ['ver']
handler.menu = true

export default handler
