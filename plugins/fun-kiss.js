import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  reply
}) => {

  // ❌ Solo grupos
  if (!isGroup) {
    return reply('🚫 Este comando solo funciona en grupos')
  }

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  let who

  // 🎯 Prioridad: mención > reply > self
  if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  } else {
    who = sender
  }

  // 💋 Reacción
  await sock.sendMessage(from, {
    react: { text: '🫦', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  // 📝 Mensaje
  let texto
  if (who !== sender) {
    texto = `💋 *@${name1}* le dio besos a *@${name2}* ( ˘ ³˘)♥`
  } else {
    texto = `💋 *@${name1}* se besó solito… falta amor 😳`
  }

  // 🎞️ Videos / GIFs
  const videos = [
    'https://telegra.ph/file/d6ece99b5011aedd359e8.mp4',
    'https://telegra.ph/file/ba841c699e9e039deadb3.mp4',
    'https://telegra.ph/file/6497758a122357bc5bbb7.mp4',
    'https://telegra.ph/file/8c0f70ed2bfd95a125993.mp4',
    'https://telegra.ph/file/826ce3530ab20b15a496d.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  // 📤 Enviar como sticker animado
  await sock.sendMessage(
    from,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, who]
    },
    {
      quoted: m,
      sendMediaAsSticker: true
    }
  )
}

// 📋 CONFIG
handler.command = ['kiss']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
