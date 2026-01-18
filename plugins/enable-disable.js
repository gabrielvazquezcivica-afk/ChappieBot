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

// ───── HANDLER ─────
export const handler = async (m, { from, sock, args, isGroup, reply, isAdmin }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo los administradores pueden usar este comando')

  const modes = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']
  
  // Verificar que se enviaron argumentos
  if (!args || args.length < 1) {
    return reply(
      `⚠️ Uso correcto:\n.ejemplo: .welcome on\nModos disponibles: ${modes.join(', ')}`
    )
  }

  const mode = args[0].toLowerCase()
  const state = (args[1] || '').toLowerCase()

  if (!modes.includes(mode)) return reply(`⚠️ Modo inválido. Modos disponibles: ${modes.join(', ')}`)
  if (!['on', 'off'].includes(state)) return reply(`⚠️ Estado inválido. Usa "on" o "off"`)

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  const current = settings[from][mode] === true ? 'on' : 'off'
  if (current === state) {
    return reply(`⚠️ El modo "${mode}" ya estaba *${state.toUpperCase()}*`)
  }

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
