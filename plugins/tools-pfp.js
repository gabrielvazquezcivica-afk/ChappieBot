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

  let user

  if (m.mentionedJid?.length) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else {
    user = sender
  }

  try {

    let pfp

    try {
      pfp = await sock.profilePictureUrl(user, 'image')
    } catch {
      return reply('❌ Este usuario no tiene foto de perfil')
    }

    const nombre = user.split('@')[0]

    const caption = `
╭━━━〔 👤 PERFIL 〕━━━⬣
┃
┃ ✦ Usuario: @${nombre}
┃ ✦ ID: wa.me/${nombre}
┃
┃ 🖼️ Foto de perfil
┃
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await sock.sendMessage(from, {
      image: { url: pfp },
      caption,
      mentions: [user]
    }, { quoted: m })

  } catch (e) {
    console.log('PFP ERROR:', e)
    reply('❌ Error al obtener la foto')
  }
}

handler.command = ['pfp']
handler.tags = ['tools']
handler.help = ['pfp @user']
handler.group = true

export default handler
