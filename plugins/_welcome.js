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
    const { id, participants, action, author } = update
    if (!id.endsWith('@g.us')) return

    const settings = loadSettings()
    const groupSettings = settings[id] || {}

    // ❌ Si welcome está apagado, no hace nada
    if (!groupSettings.welcome) return

    const user = participants[0]
    if (!user) return

    const metadata = await sock.groupMetadata(id)
    const totalMembers = metadata.participants.length

    // ───── TEXTO PERSONALIZADO O POR DEFECTO ─────
    let text = ''
    if (action === 'add') {
      text = groupSettings.customWelcome || `🎉 ¡Bienvenido al grupo!\n👤 @${user.split('@')[0]}\n👥 Miembros: ${totalMembers}\n> ${botName}`
    } else if (action === 'remove') {
      text = groupSettings.customBye || `👋 Ha salido del grupo:\n👤 @${user.split('@')[0]}\n👥 Miembros restantes: ${totalMembers}\n> ${botName}`
    }

    // ───── OBTENER FOTO ─────
    let image
    try {
      const profilePic = await sock.profilePictureUrl(user).catch(() => null)
      if (profilePic) {
        image = { url: profilePic }
      } else {
        const groupPic = metadata?.icon || null
        if (groupPic) {
          image = { url: groupPic }
        } else {
          const botPic = sock.user?.imageUrl
          if (botPic) image = { url: botPic }
        }
      }
    } catch (e) {
      console.log('❌ Error obteniendo imagen:', e)
    }

    // ───── ENVIAR MENSAJE ─────
    try {
      if (image) {
        await sock.sendMessage(id, {
          image,
          caption: text,
          mentions: [user],
        })
      } else {
        await sock.sendMessage(id, {
          text,
          mentions: [user],
        })
      }
    } catch (e) {
      console.log('❌ Error welcome:', e)
    }
  })
}

export default handler
