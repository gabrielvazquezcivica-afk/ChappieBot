import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, reply, owner }) => {
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

  /* ───── 🎯 DETECTAR MENCIÓN / RESPUESTA ───── */
  let who
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    who = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    who = ctx.participant
  } else {
    who = sender
  }

  const target = participants.find(p => p.id === who)
  const name2 = target?.notify || who.split('@')[0]
  const senderContact = participants.find(p => p.id === sender)
  const name1 = senderContact?.notify || sender.split('@')[0]
  /* ─────────────────────────────────── */

  // 😋 reacción inicial
  await sock.sendMessage(from, { react: { text: '😋', key: m.key } })

  const texto = `😋 *@${name1}* lamió a *@${name2}*`

  // 🎞️ Videos random
  const videos = [
    'https://telegra.ph/file/0ce171b163a669ae9819d.mp4',
    'https://telegra.ph/file/b80fdfb8551b66f77b67e.mp4',
    'https://telegra.ph/file/f87d442b78389d4ed5be0.mp4',
    'https://telegra.ph/file/74828e36617c16421598f.mp4',
    'https://telegra.ph/file/093cbdd990220446d8920.mp4',
    'https://telegra.ph/file/5042d5f627a3500e2fe8e.mp4',
    'https://telegra.ph/file/02ec493403335917d1ece.mp4',
    'https://telegra.ph/file/a0a86516033a906b55220.mp4',
    'https://telegra.ph/file/570944813cab1c9dddd03.mp4'
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
handler.command = ['lamber']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
