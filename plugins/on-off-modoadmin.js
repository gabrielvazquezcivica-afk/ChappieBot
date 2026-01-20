import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/modoadmin.json')

// ───── FUNCIONES DE SETTINGS ─────
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

// ───── HANDLER PRINCIPAL ─────
export const handler = async (m, { sock, from, isGroup, isAdmin, args, command, reply }) => {
  if (!isGroup) return

  const settings = loadSettings()
  if (!settings[from]) settings[from] = { enabled: false }

  // Activar/desactivar modo admin
  if (command === 'modoadmin') {

    // 🚫 Aviso si no es admin
    if (!isAdmin) {
      return reply('⚠️ Solo los *administradores* pueden encender o apagar el modo admin')
    }

    if (!args || args.length === 0)
      return reply('⚠️ Uso: .modoadmin on | off')

    const state = args[0].toLowerCase()
    if (!['on', 'off'].includes(state))
      return reply('⚠️ Uso: .modoadmin on | off')

    const newState = state === 'on'

    // ℹ️ Aviso si ya estaba en ese estado
    if (settings[from].enabled === newState) {
      return reply(
        `ℹ️ El *modo admin* ya estaba *${newState ? 'ENCENDIDO' : 'APAGADO'}*`
      )
    }

    settings[from].enabled = newState
    saveSettings(settings)

    return reply(`✅ Modo admin ahora está *${state.toUpperCase()}*`)
  }
}

// ───── BEFORE PARA SILENCIAR COMANDOS ─────
handler.before = async (m, { command, from, isGroup, isAdmin }) => {
  if (!m || !isGroup || !command) return

  const settings = loadSettings()
  const groupSettings = settings[from] || { enabled: false }

  // Si modo admin está activo y el comando es solo admin → bloqueo silencioso
  if (groupSettings.enabled) {
    const plugin = global.plugins?.find(p => {
      const cmds = Array.isArray(p.command) ? p.command : [p.command]
      return cmds.includes(command)
    })

    if (plugin?.admin && !isAdmin) {
      return true // ⛔ cancelación silenciosa
    }
  }
}

handler.command = ['modoadmin']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
