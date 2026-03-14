import fs from 'fs'
import path from 'path'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

function loadSettings() {
  if (!fs.existsSync(settingsPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(settingsPath))
  } catch { return {} }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}

export const handler = async (m, { sock, from, isGroup, isAdmin, args, reply }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')
  if (!args || args.length < 1) return reply('⚠️ Uso: .setbye <texto>')

  const raw =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const text = raw.replace(/^\.setbye\s*/i, '')

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  settings[from].customBye = text
  saveSettings(settings)

  return reply('✅ Mensaje de despedida personalizado actualizado.\nPuedes usar `@user` para mencionar al que sale.')
}

handler.command = ['setbye']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
