import fs from 'fs'

const modoadminPath = './data/modoadmin.json'

export const handler = async (m, {
  sock,
  from,
  isGroup,
  sender,
  owner,
  reply
}) => {

  /* ───── 👑 MODO ADMIN ───── */
  if (isGroup && fs.existsSync(modoadminPath)) {
    let modoadmin = {}
    try {
      modoadmin = JSON.parse(fs.readFileSync(modoadminPath))
    } catch {}

    if (modoadmin[from]?.enabled) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      const ownerJids = owner?.jid || []

      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!isAdmin && !ownerJids.includes(sender)) return
    }
  }
  /* ───────────────────────── */

  let user =
    m.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.quoted?.sender ||
    sender

  // 🔥 limpiar formato jid raro
  if (user) user = user.split(':')[0]

  const numero = user.split('@')[0]

  // ⚡ REACCIÓN INICIAL
  await sock.sendMessage(from, {
    react: { text: '📲', key: m.key }
  })

  try {

    const caption = `
╭━━━〔 📲 ID DE WHATSAPP 〕━━━⬣
┃
┃ ✦ Usuario: @${numero}
┃ ✦ JID: ${user}
┃ ✦ Link: wa.me/${numero}
┃
┃ ⚡ Generado por bot
┃
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await sock.sendMessage(from, {
      text: caption,
      mentions: [user]
    }, { quoted: m })

    // ✅ REACCIÓN FINAL
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.log('ID ERROR:', e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al obtener el ID')
  }
}

handler.command = ['id']
handler.tags = ['tools']
handler.help = ['id @user']
handler.group = true

export default handler
