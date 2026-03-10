import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

// ───── CARGAR BAN LIST ─────
let banList = {}

if (fs.existsSync(banPath)) {
  try {
    banList = JSON.parse(fs.readFileSync(banPath))
  } catch {
    banList = {}
  }
}

// ───── GUARDAR BAN LIST ─────
const saveBanList = () => {
  fs.writeFileSync(banPath, JSON.stringify(banList, null, 2))
}

// ───── LIMPIAR NÚMERO ─────
const onlyNumber = (jid = '') => jid.replace(/[^0-9]/g, '')

export const handler = async (m, {
  sock,
  from,
  args,
  isOwner
}) => {

  if (!isOwner) {
    return sock.sendMessage(from,{
      text:'🚫 Solo el OWNER puede usar este comando'
    },{ quoted:m })
  }

  let target

  // 📌 TAG
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // 📌 REPLY
  else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    target = m.message.extendedTextMessage.contextInfo.participant
  }

  // 📌 NUMERO
  else if (args[0]) {
    target = args[0]
  }

  if (!target) {
    return sock.sendMessage(from,{
      text:
`📌 *USO DEL COMANDO*

.unban @usuario
.unban (responder mensaje)
.unban número`
    },{ quoted:m })
  }

  const clean = onlyNumber(target)

  if (!banList[clean]) {
    return sock.sendMessage(from,{
      text:'⚠️ Este usuario no está baneado'
    },{ quoted:m })
  }

  // ❌ ELIMINAR BAN
  delete banList[clean]
  saveBanList()

  const jid = clean + '@s.whatsapp.net'

  // ✅ MENSAJE CON MENCIÓN
  await sock.sendMessage(from,{
    text:
`╭─〔 ✅ DESBAN GLOBAL 〕
│ Usuario: @${clean}
│ Estado: Desbaneado
╰────────────`,
    mentions:[jid]
  },{ quoted:m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
