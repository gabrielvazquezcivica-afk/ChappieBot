export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {    
  const msgs = global.config.messages || {}    
  const botName = sock.user?.name || 'ChappieBot'    
  const botJid = sock.user?.id || ''    
  const owners = global.config.owner?.numbers || []    
    
  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')    
    
  if (!isAdmin) return reply(msgs.admin || '⚠️ Solo administradores pueden usar este comando')    
    
  const metadata = await sock.groupMetadata(from)    
  const groupOwner = metadata.owner    
    
  // 🎯 Usuario objetivo
  const ctx = m.message?.extendedTextMessage?.contextInfo    
  const user = ctx?.mentionedJid?.[0] || ctx?.participant    
    
  if (!user) {    
    return reply('⚠️ Menciona o responde al usuario\nEjemplo: .kick @usuario')    
  }    
    
  // 🔥 LIMPIAR IDS
  const userClean = user.split('@')[0].split(':')[0]
  const senderClean = sender.split('@')[0].split(':')[0]
  const cleanOwners = owners.map(o => o.split(':')[0])
    
  // 🔒 PROTECCIONES
  if (user === groupOwner) return reply('🛡 No puedes expulsar al creador del grupo')    
  if (user === botJid) return reply('⚠️ No puedo expulsarme a mí mismo')    
    
  if (cleanOwners.includes(userClean) || owners.some(o => user.includes(o))) {
    return reply('🛡 No puedes expulsar al OWNER del bot')
  }
    
  try {    
    await sock.sendMessage(from, { react: { text: '🚪', key: m.key } })    
    
    await sock.groupParticipantsUpdate(from, [user], 'remove')    
    
    await sock.sendMessage(
      from,
      {
        text: `🚨 Usuario expulsado:\n🍁 @${userClean}\n👮 Por: @${senderClean}\n> ${botName}`,
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
