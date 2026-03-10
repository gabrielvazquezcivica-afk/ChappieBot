import { unbanUser, isBanned } from '../middleware/ban.js'

export const handler = async (m, { reply, sock, sender, isOwner, pushName }) => {
  if (!isOwner) return reply('🚫 Solo el OWNER puede usar este comando')

  const targetJid = m.mentionedJid?.[0] || m.quoted?.sender
  if (!targetJid) return reply('📌 Menciona o responde al usuario a desbanear')

  if (!isBanned(targetJid)) return reply('⚠️ Este usuario no está baneado')

  unbanUser(targetJid)

  await sock.sendMessage(m.key.remoteJid, {
    text: `✅ Usuario @${targetJid.split('@')[0]} desbaneado`,
    mentions: [targetJid]
  }, { quoted: m })
}

handler.command = ['unban']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
