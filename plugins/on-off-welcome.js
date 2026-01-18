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
let started = false

export const handler = async () => {}

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update
    if (!id.endsWith('@g.us')) return

    const settings = loadSettings()
    const groupSettings = settings[id] || {}

    // Si welcome está apagado, no hace nada
    if (!groupSettings.welcome) return

    const user = participants?.[0]
    if (!user) return

    const metadata = await sock.groupMetadata(id)
    const totalMembers = metadata.participants.length

    // ───── TEXTO PERSONALIZADO O POR DEFECTO ─────
    let text = ''
    if (action === 'add') {
      text = groupSettings.customWelcome ||
        `🎉 ¡Bienvenido al grupo!\n👤 @${user.split('@')[0]}\n👥 Miembros: ${totalMembers}\n> ${botName}`
    } else if (action === 'remove') {
      text = groupSettings.customBye ||
        `👋 Ha salido del grupo:\n👤 @${user.split('@')[0]}\n👥 Miembros restantes: ${totalMembers}\n> ${botName}`
    }

    // ───── OBTENER FOTO ─────
    let image = null
    try {
      // Foto del usuario
      try {
        const profilePicUrl = await sock.profilePictureUrl(user, 'image')
        if (profilePicUrl) image = { url: profilePicUrl }
      } catch {}

      // Si no hay, foto del grupo
      if (!image) {
        try {
          const groupPicUrl = await sock.profilePictureUrl(id, 'image')
          if (groupPicUrl) image = { url: groupPicUrl }
        } catch {}
      }

      // Si tampoco, foto del bot
      if (!image) {
        try {
          const botPicUrl = await sock.profilePictureUrl(sock.user.id, 'image')
          if (botPicUrl) image = { url: botPicUrl }
        } catch {}
      }
    } catch (e) {
      console.log('❌ Error obteniendo imagen:', e)
    }

    // ───── ENVIAR MENSAJE ─────
    try {
      const mentions = [user]
      if (image) {
        await sock.sendMessage(id, { image, caption: text, mentions, quoted: m })
      } else {
        await sock.sendMessage(id, { text, mentions, quoted: m })
      }
    } catch (e) {
      console.log('❌ Error welcome:', e)
    }
  })
}

// ───── COMANDO ON/OFF ─────
export const toggleWelcome = async (m, { sock, from, isGroup, isAdmin, reply, args }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')

  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  const state = args[0]?.toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return reply('⚠️ Uso: .welcome on | off')
  }

  if (settings[from].welcome === (state === 'on')) {
    return reply(`⚠️ El welcome ya estaba *${state.toUpperCase()}*`)
  }

  settings[from].welcome = state === 'on'
  saveSettings(settings)

  return reply(`✅ Welcome ahora está *${state.toUpperCase()}*`)
}

handler.command = ['welcome']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
