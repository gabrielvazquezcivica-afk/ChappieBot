import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

// ───── FUNCIONES ─────
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

// ───── HANDLER ─────
export const handler = async (m, { from, isGroup, isAdmin, reply }) => {
  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  if (!settings[from].customWelcome) {
    return reply('⚠️ No hay bienvenida personalizada para borrar')
  }

  delete settings[from].customWelcome
  saveSettings(settings)

  reply('✅ La bienvenida personalizada ha sido eliminada. Se usará la predeterminada')
}

handler.command = ['delwelcome']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
