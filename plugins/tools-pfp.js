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

  const numero = user.split('@')[0]

  // ⚡ REACCIÓN INICIAL
  await sock.sendMessage(from, {
    react: { text: '🖼️', key: m.key }
  })

  try {

    let pfp = null

    // 🔥 intento 1
    try {
      pfp = await sock.profilePictureUrl(user, 'image')
    } catch {}

    // 🔥 intento 2 (privacidad)
    if (!pfp) {
      try {
        pfp = await sock.profilePictureUrl(user, 'preview')
      } catch {}
    }

    // 🧠 VALIDAR SI ES FALSA (fondo/color bug)
    const isBadPfp =
      !pfp ||
      pfp.includes('default') ||
      pfp.includes('blank') ||
      pfp.includes('profilePicture') ||
      pfp.includes('null')

    // 😈 avatar automático si falla
    if (isBadPfp) {
      pfp = `https://api.dicebear.com/7.x/initials/png?seed=${numero}`
    }

    // 🎴 TARJETA PRO
    const caption = `
╭━━━〔 👑 PERFIL DIOS 〕━━━⬣
┃
┃ ✦ Usuario: @${numero}
┃ ✦ Link: wa.me/${numero}
┃
┃ 🖼️ Vista de perfil
┃ ⚡ ChappieBot Engine
┃
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await sock.sendMessage(from, {
      image: { url: pfp },
      caption,
      mentions: [user]
    }, { quoted: m })

    // ✅ REACCIÓN FINAL
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.log('PFP DIOS ERROR:', e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ Error al obtener el perfil')
  }
}

handler.command = ['pfp', 'perfil']
handler.tags = ['tools']
handler.help = ['pfp @user']
handler.group = true

export default handler
