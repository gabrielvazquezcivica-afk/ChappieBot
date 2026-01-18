import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

// ───── LEER SETTINGS ─────
function loadSettings() {
  if (!fs.existsSync(settingsPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(settingsPath))
  } catch {
    return {}
  }
}

// ───── GUARDAR SETTINGS ─────
function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}

// ───── COMANDO ─────
export const handler = async (m, { from, sock, args = [], isGroup, sender, reply, command }) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  // Solo admins pueden usar
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
  if (!admins.includes(sender)) return reply('⚠️ Solo los administradores pueden usar este comando')

  const modes = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']
  const mode = command?.toLowerCase()
  if (!modes.includes(mode)) return

  if (!args[0]) return reply(`⚠️ Uso correcto: .${mode} on/off`)

  const state = args[0].toLowerCase()
  if (!['on', 'off'].includes(state)) return reply(`⚠️ Uso correcto: .${mode} on/off`)

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  settings[from][mode] = state === 'on'
  saveSettings(settings)

  await sock.sendMessage(from, {
    text: `✅ Modo "${mode}" ahora está *${state.toUpperCase()}*`,
    react: { text: state === 'on' ? '✅' : '❌', key: m.key }
  })
}

handler.command = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
