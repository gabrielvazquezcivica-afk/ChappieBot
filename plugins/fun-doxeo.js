import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 🔒 Modo admin silencioso
  let groupSettings = {}
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return

  // 🔹 Usuario objetivo
  let targetJid = null
  const mentions = []

  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    targetJid = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    targetJid = ctx.participant
  }

  // ❌ SI NO MENCIONA NI RESPONDE
  if (!targetJid) {
    return reply(
`⚠️ Debes mencionar a alguien o responder a un mensaje

Ejemplo:
.doxear @usuario`
    )
  }

  mentions.push(targetJid)
  const name = targetJid.split('@')[0]

  // 🔥 GENERADORES RANDOM
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const randomIP = () => `${rand(1,255)}.${rand(0,255)}.${rand(0,255)}.${rand(0,255)}`
  const randomMAC = () => Array.from({length:6}, () => rand(0,255).toString(16).padStart(2,'0')).join(':').toUpperCase()
  const randomDNS = () => `${rand(1,255)}.${rand(1,255)}.${rand(1,255)}.${rand(1,255)}`
  const randomPort = () => rand(1,65535)

  const lat = (Math.random()*180 - 90).toFixed(4)
  const lon = (Math.random()*360 - 180).toFixed(4)

  // 🧠 TEXTO
  const text = `🕵️ *@${name}*

*𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙾𝙱𝚃𝙴𝙽𝙸𝙳𝙾𝚂:*

*Nombre:* ${name}
*Ip:* ${randomIP()}
*N:* ${lat}
*W:* ${lon}
*SS NUMBER:* ${rand(1000000000000000,9999999999999999)}
*IPV6:* fe80::${rand(1000,9999)}::${rand(1000,9999)}::${rand(1000,9999)}
*UPNP:* Enabled
*DMZ:* ${randomIP()}
*MAC:* ${randomMAC()}
*ISP:* Ucom universal
*DNS:* ${randomDNS()}
*ALT DNS:* ${randomDNS()}
*DNS SUFFIX:* Dlink
*WAN:* ${randomIP()}
*WAN TYPE:* private nat
*GATEWAY:* ${randomIP()}
*SUBNET MASK:* 255.255.0.255
*UDP OPEN PORTS:* ${randomPort()}, ${randomPort()}
*TCP OPEN PORTS:* ${randomPort()}
*ROUTER VENDEDOR:* ERICCSON
*DEVICE VENDEDOR:* WIN32-X
*CONNECTION TYPE:* TPLINK COMPANY
*ICMPHOPS:* ${randomIP()} ${randomIP()} ${randomIP()}
host-${rand(1,999)}.${rand(1,999)}.${rand(1,999)}.ucom.com
${randomIP()} ${randomIP()}
server-${rand(1,999)}.google.net
*HTTP:* ${randomIP()}:${randomPort()} --> ${randomIP()}:80
*Tcp:* ${randomIP()} --> ${randomIP()}:${randomPort()}
*EXTERNAL MAC:* ${randomMAC()}
*MODEM JUMPS:* ${rand(10,100)}`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

// ⚙️ CONFIG
handler.command = ['doxear']
handler.tags = ['juegos']
handler.group = true
handler.admin = false
handler.menu = true

export default handler
