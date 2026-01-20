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

// ───── DETECTAR ESTADO REAL ─────
function isEnabled(data, groupId) {
  if (!data[groupId]) return false
  const v = data[groupId]
  if (typeof v === 'boolean') return v
  if (typeof v === 'object') {
    return Object.values(v).includes(true)
  }
  return false
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

  const metadata = await sock.groupMetadata(from)

  const antilinkData = loadJSON(antilinkPath)
  const modoadminData = loadJSON(modoadminPath)
  const welcomeData = loadJSON(welcomePath)

  const antilink = isEnabled(antilinkData, from)
  const modoadmin = isEnabled(modoadminData, from)
  const welcome = isEnabled(welcomeData, from)

  // 🎯 Reacción
  await sock.sendMessage(from, {
    react: { text: 'ℹ️', key: m.key }
  })

  const text = `
╭───〔 📌 INFO DEL GRUPO 〕───╮
│ 📛 Nombre : ${metadata.subject}
│ 👥 Miembros : ${metadata.participants.length}
│
│ ⚙️ Opciones:
│ 🔗 Antilink  : ${antilink ? '🟢 ON' : '🔴 OFF'}
│ 🔒 ModoAdmin : ${modoadmin ? '🟢 ON' : '🔴 OFF'}
│ 👋 Welcome   : ${welcome ? '🟢 ON' : '🔴 OFF'}
╰──────────────────────────╯
`.trim()

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['infogrupo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
