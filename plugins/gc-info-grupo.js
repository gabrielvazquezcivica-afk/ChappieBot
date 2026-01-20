import fs from 'fs'
import path from 'path'

const antilinkPath = path.join(process.cwd(), 'data/antilink.json')
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')
const welcomePath = path.join(process.cwd(), 'data/welcome.json')

// ───── CARGAR JSON SEGURO ─────
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

  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')

  // 📊 Metadata
  const metadata = await sock.groupMetadata(from)
  const total = metadata.participants.length
  const name = metadata.subject

  // ⚙️ Estados
  const antilink = loadJSON(antilinkPath)[from]?.enabled
  const modoadmin = loadJSON(modoadminPath)[from]?.enabled
  const welcome = loadJSON(welcomePath)[from]?.enabled

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: 'ℹ️', key: m.key }
  })

  const text = `
╭───〔 📌 INFO DEL GRUPO 〕───╮
│ 📛 Nombre : ${name}
│ 👥 Miembros : ${total}
│
│ ⚙️ Opciones:
│ 🔗 Antilink : ${antilink ? '🟢 ON' : '🔴 OFF'}
│ 🔒 ModoAdmin : ${modoadmin ? '🟢 ON' : '🔴 OFF'}
│ 👋 Welcome : ${welcome ? '🟢 ON' : '🔴 OFF'}
╰──────────────────────────╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['grupoinf']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
