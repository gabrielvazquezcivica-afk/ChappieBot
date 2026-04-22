import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const settingsPath = path.join(process.cwd(), 'data/settings.json')

// ───── FUNCIONES PARA SETTINGS ─────
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

let started = false

// ───── COMANDO WELCOME ON/OFF ─────
export const handler = async (m, { sock, from, isGroup, isAdmin, args, command, reply }) => {
  const botName = sock.user?.name || 'ChappieBot'
  const settings = loadSettings()
  if (!settings[from]) settings[from] = {}

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

// ───── HANDLER ANTES DE CUALQUIER COMANDO (EVENTO) ─────
handler.before = async (_, { sock }) => {
  if (started) return
  started = true

  sock.ev.on('group-participants.update', async update => {
    const { id, participants, action, admin } = update
    if (!id.endsWith('@g.us')) return

    if (!['add', 'remove'].includes(action)) return
    if (admin) return

    const settings = loadSettings()
    const groupSettings = settings[id] || {}
    if (!groupSettings.welcome) return

    const user = participants?.[0]
    if (!user) return

    const metadata = await sock.groupMetadata(id)
    const totalMembers = metadata.participants.length

    // ───── TEXTO ─────
    let text = ''
    if (action === 'add') {
      text = groupSettings.customWelcome ||
        `🎉 ¡Bienvenido al grupo!\n👤 @user\n👥 Miembros: ${totalMembers}\n> ${sock.user?.name || 'ChappieBot'}`
    } else if (action === 'remove') {
      text = groupSettings.customBye ||
        `👋 Ha salido del grupo:\n👤 @user\n👥 Miembros restantes: ${totalMembers}\n> ${sock.user?.name || 'ChappieBot'}`
    }

    text = text.replace(/@user/g, `@${user.split('@')[0]}`)

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

      // 🔊 AUDIO (FIX REAL)
      try {
        let audioUrl = ''

        if (action === 'add') {
          audioUrl = 'https://files.catbox.moe/t73rbs.mp3'
        } else if (action === 'remove') {
          audioUrl = 'https://files.catbox.moe/swqi7e.mp3'
        }

        if (audioUrl) {
          await sock.sendMessage(id, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: 'audio.mp3'
          })
        }

      } catch(e){console.log('❌ Error audio:',e)}

    } catch(e){console.log('❌ Error welcome:',e)}
  })
}

// ───── CONFIG ─────
handler.command = ['welcome']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
handler.menu = true

export default handler
