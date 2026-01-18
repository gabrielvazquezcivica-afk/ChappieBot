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
export const handler = async (m, { from, sock, args, isGroup, reply, pushName, sender }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  const modes = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']

  if (!args || args.length < 2) {
    return reply(
      `⚠️ Uso correcto: .<modo> <on/off>\nEjemplo: .welcome on\n\nModos disponibles: ${modes.join(', ')}`
    )
  }

  const mode = args[0]?.toLowerCase()
  const state = args[1]?.toLowerCase()

  if (!modes.includes(mode)) {
    return reply(`⚠️ Modo inválido. Modos disponibles: ${modes.join(', ')}`)
  }
  if (!['on', 'off'].includes(state)) {
    return reply('⚠️ Estado inválido. Usa on o off')
  }

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  const current = settings[from][mode] === true ? 'on' : 'off'
  if (current === state) {
    return reply(`⚠️ El modo "${mode}" ya estaba ${state.toUpperCase()}`)
  }

  settings[from][mode] = state === 'on'
  saveSettings(settings)

  // Reacción al mensaje
  await sock.sendMessage(from, {
    text: `✅ Modo "${mode}" ahora está *${state.toUpperCase()}*`,
    react: { text: state === 'on' ? '✅' : '❌', key: m.key }
  })
}

// ───── CONFIG HANDLER ─────
handler.command = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
