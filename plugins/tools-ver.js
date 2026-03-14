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

if(!quoted) return reply('📸 Responde a una foto')

/* 🔍 buscar cualquier media */
const type = Object.keys(quoted)[0]

if(!type.includes('image')) {
return reply('❌ Responde a una foto')
}

const stream = await downloadContentFromMessage(
quoted[type],
'image'
)

let buffer = Buffer.from([])

for await (const chunk of stream){
buffer = Buffer.concat([buffer,chunk])
}

/* 📸 enviar foto */
await sock.sendMessage(from,{
image:buffer
},{ quoted:m })

}

handler.command = ['ver']
handler.tags = ['tools']
handler.help = ['ver']
handler.menu = true

export default handler
