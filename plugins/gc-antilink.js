import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

// ───── LEER / GUARDAR SETTINGS ─────
function loadSettings() {
  if (!fs.existsSync(settingsPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(settingsPath))
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}

// ───── HANDLER DE COMANDO ─────
let started = false

export const handler = async (m, { sock, from, isGroup, isAdmin, args, command, reply }) => {
  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  if (command === 'antilink') {
    if (!isGroup) return reply('⚠️ Solo funciona en grupos')
    if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')
    if (!args || args.length === 0) return reply('⚠️ Uso: .antilink on | off')

    const state = args[0].toLowerCase()
    if (!['on','off'].includes(state)) return reply('⚠️ Uso: .antilink on | off')

    if (settings[from].antilink === (state === 'on')) {
      return reply(`⚠️ El antilink ya estaba *${state.toUpperCase()}*`)
    }

    settings[from].antilink = state === 'on'
    saveSettings(settings)

    return reply(`✅ Antilink ahora está *${state.toUpperCase()}*`)
  }
}

// ───── WATCHER PARA BORRAR LINKS ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return

    const from = m.key.remoteJid
    if (!from || !from.endsWith('@g.us')) return

    const settings = loadSettings()
    const groupSettings = settings[from] || {}
    if (!groupSettings.antilink) return

    // 🔹 Ignorar admins
    let sender = m.key.participant
    try {
      const metadata = await sock.groupMetadata(from)
      const admins = metadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id)
      if (admins.includes(sender)) return
    } catch {}

    // 🔹 Detectar cualquier link
    const text = m.message.conversation ||
                 m.message.extendedTextMessage?.text ||
                 m.message.imageMessage?.caption ||
                 m.message.videoMessage?.caption || ''

    if (!text) return

    // Regex para cualquier URL
    const linkRegex = /(https?:\/\/[^\s]+)/gi
    const links = text.match(linkRegex)
    if (!links) return

    // 🔹 Borrar mensaje y avisar
    try {
      await sock.sendMessage(from, { 
        delete: { remoteJid: from, fromMe: false, id: m.key.id, participant: sender } 
      })
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split('@')[0]} no se permiten links en este grupo`,
        mentions: [sender],
        quoted: m
      })
    } catch (e) {
      console.log('❌ Error antilink:', e)
    }
  })
}

handler.command = ['antilink']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
