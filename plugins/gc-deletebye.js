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

  if (!settings[from].customBye) {
    return reply('⚠️ No hay mensaje de salida personalizado para borrar')
  }

  delete settings[from].customBye
  saveSettings(settings)

  reply('✅ El mensaje de salida personalizado ha sido eliminado. Se usará el predeterminado')
}

handler.command = ['delbye']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
