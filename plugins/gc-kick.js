export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {    
  const msgs = global.config.messages || {}    
  const botName = sock.user?.name || 'ChappieBot'    
  const botJid = sock.user?.id || ''    
  const owners = global.config.owner?.numbers || []    
    
  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')    
    
  // ⚠️ Solo admins pueden ejecutar    
  if (!isAdmin) return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')    
    
  const metadata = await sock.groupMetadata(from)    
  const groupOwner = metadata.owner    
    
  // 🎯 Usuario objetivo: mención o reply    
  const ctx = m.message?.extendedTextMessage?.contextInfo    
  const user = ctx?.mentionedJid?.[0] || ctx?.participant    
    
  if (!user) {    
    return reply(    
      '⚠️ Uso incorrecto:\nMenciona al usuario o responde a su mensaje\nEjemplo: .kick @usuario'    
    )    
  }    
    
  // 🔥 LIMPIAR IDs (CLAVE)
  const cleanUser = user.split('@')[0].split(':')[0]
  const cleanSender = sender.split('@')[0].split(':')[0]
  const cleanBot = botJid.split('@')[0].split(':')[0]
  const cleanOwners = owners.map(o => o.split(':')[0])
    
  // 🔒 Protecciones    
  if (user === groupOwner) return reply('🛡 No puedes expulsar al creador del grupo')    
  if (cleanUser === cleanBot) return reply('⚠️ No puedo expulsarme a mí mismo')    
    
  // 🛡 Protección owner del bot (FIX REAL)
  if (cleanOwners.includes(cleanUser)) {
    return reply('🛡 No puedes expulsar al OWNER del bot')
  }
    
  try {    
    // 🚨 Reacción al comando    
    await sock.sendMessage(from, { react: { text: '🚪', key: m.key } })    
    
    // 👢 Expulsar usuario    
    await sock.groupParticipantsUpdate(from, [user], 'remove')    
    
    // 📢 Mensaje informativo    
    await sock.sendMessage(    
      from,    
      {    
        text: `🚨 Usuario expulsado:\n🍁 @${cleanUser}\n👮 Expulsado por: @${cleanSender}\n> ${botName}`,    
        mentions: [user, sender]    
      },    
      { quoted: m }    
    )    
    
  } catch (e) {    
    console.log('❌ Error kick:', e)    
    reply(msgs.error || '❌ No pude expulsar al usuario')    
  }    
}    
    
handler.command = ['kick']    
handler.tags = ['group']    
handler.group = true    
handler.admin = true    
handler.botAdmin = true    
handler.menu = true    
    
export default handler
