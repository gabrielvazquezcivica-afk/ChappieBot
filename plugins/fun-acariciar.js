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
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
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

  // 💞 Reacción
  await sock.sendMessage(from, {
    react: { text: '💞', key: m.key }
  })

  const name1 = sender.split('@')[0]
  const name2 = who.split('@')[0]

  // 📝 Texto
  let texto
  if (who !== sender) {
    texto = `💞 *@${name1}* acarició dulcemente a *@${name2}* (´｡• ᵕ •｡\`) ♡`
  } else {
    texto = `💞 *@${name1}* se acarició solito… todo bien en casa? 😳`
  }

  // 🎞️ Videos / GIFs
  const videos = [
    'https://telegra.ph/file/f75aed769492814d68016.mp4',
    'https://telegra.ph/file/4f24bb58fe580a5e97b0a.mp4',
    'https://telegra.ph/file/30206abdcb7b8a4638510.mp4',
    'https://telegra.ph/file/ecd7aeae5b2242c660d41.mp4',
    'https://telegra.ph/file/6d3ba201bcdd1fd2c1408.mp4',
    'https://telegra.ph/file/d5dbdcf845d2739dbe45e.mp4',
    'https://telegra.ph/file/c9a529908d4e0b71d7c5a.mp4'
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

handler.command = ['acariciar']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
