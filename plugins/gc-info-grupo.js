import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')
const modoadminPath = path.join(process.cwd(), 'data/modoadmin.json')
const nsfwPath = path.join(process.cwd(), 'data/nsfw.json')

// ───── LOADERS ─────
function loadSettings() {
  if (!fs.existsSync(settingsPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(settingsPath))
  } catch {
    return {}
  }
}

function loadModoAdmin() {
  if (!fs.existsSync(modoadminPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(modoadminPath))
  } catch {
    return {}
  }
}

function loadNSFW() {
  if (!fs.existsSync(nsfwPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(nsfwPath))
  } catch {
    return {}
  }
}

// ───── HANDLER ─────
export const handler = async (m, { sock, from, isGroup, isAdmin, reply }) => {

  if (!isGroup) return reply('⚠️ Solo funciona en grupos')

  // 🚫 SOLO ADMINS
  if (!isAdmin) {
    return reply('🔒 Este comando es solo para *administradores*')
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // ───── CARGAR CONFIGS ─────
  const settings = loadSettings()
  const modoadminData = loadModoAdmin()
  const nsfwData = loadNSFW()

  const groupSettings = settings[from] || {}
  const groupModoAdmin = modoadminData[from] || { enabled: false }
  const groupNSFW = nsfwData[from] === true

  // ───── ESTADOS REALES ─────
  const welcome = groupSettings.welcome === true
  const antilink = groupSettings.antilink === true
  const modoadmin = groupModoAdmin.enabled === true
  const nsfw = groupNSFW

  // ───── TEXTO ─────
  let text = `╭━━━〔 📊 INFO DEL GRUPO 〕━━━╮
┃ 📛 Nombre : ${metadata.subject}
┃ 👥 Miembros : ${participants.length}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ⚙️ OPCIONES 〕━━━╮
┃ 🔗 Antilink  : ${antilink ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
┃ 👑 ModoAdmin : ${modoadmin ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
┃ 👋 Welcome   : ${welcome ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
┃ 🔞 NSFW      : ${nsfw ? '🟢 ENCENDIDO' : '🔴 APAGADO'}
╰━━━━━━━━━━━━━━━━━━━━━━╯

> ${sock.user?.name || 'ChappieBot'}`

  // 🧠 Reacción
  await sock.sendMessage(from, {
    react: { text: '📊', key: m.key }
  })

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['infogrupo']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
