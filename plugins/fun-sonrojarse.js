import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, reply, owner }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN (SILENCIOSO) ───── */
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
      if (!isAdmin) return // bloqueo silencioso
    } catch {}
  }
  /* ─────────────────────────────────── */

  /* ───── Detectar mención o reply ───── */
  let who
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) who = ctx.mentionedJid[0]
  else if (ctx?.participant) who = ctx.participant
  else who = sender

  // 👥 Obtener nombres reales del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const target = participants.find(p => p.id === who)
  const senderContact = participants.find(p => p.id === sender)

  const name1 = senderContact?.notify || sender.split('@')[0]
  const name2 = target?.notify || who.split('@')[0]

  // 😳 reacción inicial
  await sock.sendMessage(from, { react: { text: '😳', key: m.key } })

  const texto = `😳 *@${name1}* se sonrojó por *@${name2}*`

  // 🎞️ Videos aleatorios
  const videos = [
    'https://telegra.ph/file/a4f925aac453cad828ef2.mp4',
    'https://telegra.ph/file/f19318f1e8dad54303055.mp4',
    'https://telegra.ph/file/15605caa86eee4f924c87.mp4',
    'https://telegra.ph/file/d301ffcc158502e39afa7.mp4',
    'https://telegra.ph/file/c6105160ddd3ca84f887a.mp4',
    'https://telegra.ph/file/abd44f64e45c3f30442bd.mp4',
    'https://telegra.ph/file/9611e5c1d616209bc0315.mp4'
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

/* ───── CONFIG ───── */
handler.command = ['sonrojarse']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
