import fs from 'fs'
import path from 'path'

const antilinkPath = path.join(process.cwd(), 'data/antilink.json')
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')
const welcomePath = path.join(process.cwd(), 'data/welcome.json')

function loadJSON(file) {
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return {}
  }
}

export const handler = async (m, {
  sock,
  from,
  isGroup,
  isAdmin,
  reply
}) => {

  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo admins')

  const metadata = await sock.groupMetadata(from)

  const antilinkData = loadJSON(antilinkPath)
  const modoadminData = loadJSON(modoadminPath)
  const welcomeData = loadJSON(welcomePath)

  /* ───── DETECCIÓN REAL ───── */

  // 🔗 ANTILINK → true / false directo
  const antilink =
    antilinkData[from] === true

  // 🔒 MODO ADMIN → enabled
  const modoadmin =
    modoadminData[from]?.enabled === true

  // 👋 WELCOME → welcome === true
  const welcome =
    welcomeData[from]?.welcome === true

  /* ───────────────────────── */

  await sock.sendMessage(from, {
    react: { text: 'ℹ️', key: m.key }
  })

  const text = `
╭──〔 📌 INFO DEL GRUPO 〕──╮
│ 📛 Nombre   : ${metadata.subject}
│ 👥 Miembros : ${metadata.participants.length}
│
│ ⚙️ Opciones:
│ 🔗 Antilink  : ${antilink ? '🟢 ON' : '🔴 OFF'}
│ 🔒 ModoAdmin : ${modoadmin ? '🟢 ON' : '🔴 OFF'}
│ 👋 Welcome   : ${welcome ? '🟢 ON' : '🔴 OFF'}
╰────────────────────────╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['infogrupo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
