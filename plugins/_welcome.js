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

// ───── HANDLER ─────
let started = false

export const handler = async () => {}

handler.before = async (m, { sock }) => {
  if (started) return
  started = true

  const botName = sock.user?.name || 'ChappieBot'

  // 🔔 WELCOME / BYE
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update
    if (!id.endsWith('@g.us')) return

    // Solo entradas y salidas
    if (!['add', 'remove'].includes(action)) return

    const settings = loadSettings()
    const groupSettings = settings[id] || {}

    // ❌ Si welcome está apagado, no hace nada
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

    // ───── OBTENER FOTO PARA ENTRADAS Y SALIDAS ─────
    let image = null
    try {
      // Foto del usuario
      let profilePicUrl = null
      try { profilePicUrl = await sock.profilePictureUrl(user, 'image') } catch {}
      if (profilePicUrl) image = { url: profilePicUrl }

      // Si no tiene, foto del grupo
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
        await sock.sendMessage(id, { image, caption: text, mentions })
      } else {
        await sock.sendMessage(id, { text, mentions })
      }
    } catch (e) {
      console.log('❌ Error welcome:', e)
    }
  })
}

export default handler
