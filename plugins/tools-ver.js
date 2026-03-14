import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'

export const handler = async (m, { sock, from, isAdmin, reply }) => {

const modoadminPath = './data/modoadmin.json'
let groupSettings = { enabled: false }

if (fs.existsSync(modoadminPath)) {
const data = JSON.parse(fs.readFileSync(modoadminPath))
groupSettings = data[from] || { enabled: false }
}

if (groupSettings.enabled && !isAdmin) return

await sock.sendMessage(from,{
react:{ text:'👀', key:m.key }
})

const ctx = m.message?.extendedTextMessage?.contextInfo
let quoted = ctx?.quotedMessage

if (!quoted) return reply('📸 Responde a una foto de ver una vez')

/* 🔓 quitar ephemeral */
if (quoted.ephemeralMessage) {
quoted = quoted.ephemeralMessage.message
}

/* 🔍 detectar view once */
let msg =
quoted?.viewOnceMessage?.message ||
quoted?.viewOnceMessageV2?.message ||
quoted?.viewOnceMessageV2Extension?.message

if (!msg) return reply('❌ Ese mensaje no es de ver una vez')

const type = Object.keys(msg)[0]

const stream = await downloadContentFromMessage(
msg[type],
type.replace('Message','')
)

let buffer = Buffer.from([])

for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

await sock.sendMessage(from,{
image: buffer
},{ quoted: m })

}

handler.command = ['ver']
handler.tags = ['tools']
handler.help = ['ver']
handler.menu = true

export default handler
