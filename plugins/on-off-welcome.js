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

// ───── HANDLER PRINCIPAL ─────
let started = false

export const handler = async (m, { sock, from, isGroup, isAdmin, args, command, reply }) => {
  const botName = sock.user?.name || 'ChappieBot'
  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

  // ───── COMANDO ON/OFF ─────
  if (command === 'welcome') {
    if (!isGroup) return reply('⚠️ Solo funciona en grupos')
    if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')
    if (!args || args.length === 0) return reply('⚠️ Uso: .welcome on | off')

    const state = args[0].toLowerCase()
    if (!['on','off'].includes(state)) return reply('⚠️ Uso: .welcome on | off')

    if (settings[from].welcome === (state === 'on')) {
      return reply(`⚠️ El welcome ya estaba *${state.toUpperCase()}*`)
    }

    settings[from].welcome = state === 'on'
    saveSettings(settings)

    return reply(`✅ Welcome ahora está *${state.toUpperCase()}*`)
  }
}

// ───── DETECCIÓN DE ENTRADAS/SALIDAS ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  sock.ev.on('group-participants.update', async update => {
    const { id, participants, action } = update
    if (!id.endsWith('@g.us')) return

    const settings = loadSettings()
    const groupSettings = settings[id] || {}
    if (!groupSettings.welcome) return

    const user = participants?.[0]
    if (!user) return

    const metadata = await sock.groupMetadata(id)
    const totalMembers = metadata.participants.length

    let text = ''
    if (action === 'add') {
      text = groupSettings.customWelcome ||
        `🎉 ¡Bienvenido al grupo!\n👤 @${user.split('@')[0]}\n👥 Miembros: ${totalMembers}\n> ${sock.user?.name || 'ChappieBot'}`
    } else if (action === 'remove') {
      text = groupSettings.customBye ||
        `👋 Ha salido del grupo:\n👤 @${user.split('@')[0]}\n👥 Miembros restantes: ${totalMembers}\n> ${sock.user?.name || 'ChappieBot'}`
    }

    // ───── FOTO ─────
    let image = null
    try {
      try { const pfp = await sock.profilePictureUrl(user,'image'); if(pfp) image={url:pfp} } catch{}
      if(!image){try{const gpfp = await sock.profilePictureUrl(id,'image'); if(gpfp) image={url:gpfp}} catch{}}
      if(!image){try{const bpfp = await sock.profilePictureUrl(sock.user.id,'image'); if(bpfp) image={url:bpfp}} catch{}}
    } catch(e){console.log('❌ Error imagen:',e)}

    try {
      const mentions = [user]
      if (image) {
        await sock.sendMessage(id, { image, caption:text, mentions, quoted:update })
      } else {
        await sock.sendMessage(id, { text, mentions, quoted:update })
      }
    } catch(e){console.log('❌ Error welcome:',e)}
  })
}

handler.command = ['welcome']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
