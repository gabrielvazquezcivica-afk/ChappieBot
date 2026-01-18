import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

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

export const handler = async (m, { sock, from, isGroup, reply }) => {
  if (!isGroup) return reply('⚠️ Este comando solo funciona en grupos')

  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
  if (!admins.includes(m.key.participant)) return reply('⚠️ Solo admins pueden usar este comando')

  const settings = loadSettings()
  if (!settings[from]?.customBye) return reply('⚠️ No hay mensaje de despedida personalizado para borrar')

  delete settings[from].customBye
  saveSettings(settings)

  reply('✅ Mensaje de despedida restaurado al predeterminado')
}

handler.command = ['deletebye']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true
export default handler
