// welcome.js
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

  sock.ev.on('group-participants.update', async update => {
    const { id, participants, action, admin } = update
    if (!id.endsWith('@g.us')) return

    // 🔹 Solo entradas y salidas reales
    if (!['add', 'remove'].includes(action)) return
    if (admin) return // ❌ Ignorar cambios de admin

    const settings = loadSettings()
    const groupSettings = settings[id] || {}
    if (!groupSettings.welcome) return

    const user = participants?.[0]
    if (!user) return

    // ───── METADATA DEL GRUPO ─────
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

    // ───── OBTENER FOTO SOLO PARA ENTRADAS/SALIDAS ─────
    let image = null
    try {
      // Foto del usuario
      let profilePicUrl = null
      try { profilePicUrl = await sock.profilePictureUrl(user, 'image') } catch {}
      if (profilePicUrl) image = { url: profilePicUrl }

      // Foto del grupo si usuario no tiene
      if (!image) {
        try {
          const groupPicUrl = await sock.profilePictureUrl(id, 'image')
          if (groupPicUrl) image = { url: groupPicUrl }
        } catch {}
      }

      // Foto del bot como fallback
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

handler.command = ['welcome']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
