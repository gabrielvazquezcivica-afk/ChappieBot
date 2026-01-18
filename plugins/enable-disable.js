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

// ───── HANDLER ON/OFF ─────
export const handler = async (m, { from, sock, args: rawArgs, isGroup, reply, sender }) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')

  // ⚠️ Parsear args correctamente
  const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim()
  const args = rawArgs?.length ? rawArgs : text.slice(global.prefix.length).trim().split(/\s+/).slice(1)

  if (!args || args.length < 2) return reply(
    `⚠️ Uso correcto: .<modo> <on/off>\nEjemplo: .welcome on`
  )

  const modes = ['welcome', 'antilink', 'nsfw', 'modoadmin', 'anti-spam']
  const mode = args[0]?.toLowerCase()
  const state = args[1]?.toLowerCase()

  if (!modes.includes(mode)) return reply(
    `⚠️ Modo inválido. Modos disponibles: ${modes.join(', ')}`
  )
  if (!['on', 'off'].includes(state)) return reply(
    '⚠️ Estado inválido. Usa "on" o "off"'
  )

  // ───── VERIFICAR ADMIN ─────
  let groupMeta
  try {
    groupMeta = await sock.groupMetadata(from)
  } catch {
    return reply('❌ No pude obtener info del grupo')
  }
  const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id)
  if (!admins.includes(sender)) return reply('🚫 Solo los administradores pueden usar este comando')

  // ───── ACTUALIZAR SETTINGS ─────
  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  const current = settings[from][mode] ? 'on' : 'off'
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
