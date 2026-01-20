import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, reply, owner }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
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
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    } catch {}
  }
  /* ─────────────────────────────────── */

  /* ───── 🎯 Detectar mención o reply ───── */
  let who
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) who = ctx.mentionedJid[0]
  else if (ctx?.participant) who = ctx.participant
  else who = sender

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const target = participants.find(p => p.id === who)
  const name2 = target?.notify || who.split('@')[0]
  const senderContact = participants.find(p => p.id === sender)
  const name1 = senderContact?.notify || sender.split('@')[0]

  /* ─────────────────────────────────── */

  // 😶 Reacción inicial
  await sock.sendMessage(from, { react: { text: '🥺', key: m.key } })

  const texto = `@${name1} le está haciendo pucheros a @${name2}`

  // 🎞️ Videos aleatorios
  const videos = [
    'https://telegra.ph/file/e2a25adcb74689a58bcc6.mp4',
    'https://telegra.ph/file/5239f6f8837383fa5bf2d.mp4',
    'https://telegra.ph/file/63564769ec715d3b6379d.mp4',
    'https://telegra.ph/file/06f7458e3a6a19deb5173.mp4',
    'https://telegra.ph/file/cdd5e7db98e1d3a46231a.mp4',
    'https://telegra.ph/file/070e2c38c9569a764cc10.mp4',
    'https://telegra.ph/file/c1834a34cd0edfd2bdbe1.mp4',
    'https://telegra.ph/file/4ceafdd813e727548cb2f.mp4',
    'https://telegra.ph/file/7aa2790c3eba5b27416ce.mp4',
    'https://telegra.ph/file/ec2d25e70b165a19e7ef7.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  await sock.sendMessage(
    from,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, who]
    },
    { quoted: m }
  )
}

// 📋 CONFIG
handler.command = ['pucheros']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
