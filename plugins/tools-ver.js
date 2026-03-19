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

/* 🔍 DETECTAR MENSAJE CITADO (2 FORMAS) */
let q = m.quoted

if (!q) {
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quotedMsg = ctx?.quotedMessage
  if (quotedMsg) {
    const type = Object.keys(quotedMsg)[0]
    q = quotedMsg[type]
  }
}

if (!q) return reply('📸 Responde a una foto')

/* 🧠 MIME */
let mime = q.mimetype || q?.msg?.mimetype || ''

if (!mime || !mime.includes('image')) {
  return reply('❌ Responde a una foto válida')
}

/* ⛔ VALIDAR MEDIAKEY */
if (!q.mediaKey && !q?.msg?.mediaKey) {
  return reply('❌ No se pudo obtener la imagen (media caducada)')
}

/* 🔽 DESCARGAR */
const stream = await downloadContentFromMessage(
  q.msg || q,
  'image'
)

let buffer = Buffer.from([])

for await (const chunk of stream){
  buffer = Buffer.concat([buffer,chunk])
}

/* 📸 ENVIAR */
await sock.sendMessage(from,{
  image: buffer
},{ quoted:m })

}

handler.command = ['ver']
handler.tags = ['tools']
handler.help = ['ver']
handler.menu = true

export default handler
