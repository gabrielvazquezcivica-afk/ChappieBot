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

  // 👥 Obtener nombres reales
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []
  const target = participants.find(p => p.id === who)
  const name2 = target?.notify || who.split('@')[0]
  const senderContact = participants.find(p => p.id === sender)
  const name1 = senderContact?.notify || sender.split('@')[0]

  // 😹 reacción inicial
  await sock.sendMessage(from, { react: { text: '😹', key: m.key } })

  const texto = '😹 *' + name1 + '* se está riendo de *' + name2 + '*'

  // 🎞️ Videos aleatorios
  const videos = [
    'https://telegra.ph/file/5fa4fd7f4306aa7b2e17a.mp4',
    'https://telegra.ph/file/b299115a77fadb7594ca0.mp4',
    'https://telegra.ph/file/9938a8c2e54317d6b8250.mp4',
    'https://telegra.ph/file/e6c7b3f7d482ae42db9a7.mp4',
    'https://telegra.ph/file/a61b52737df7459580129.mp4',
    'https://telegra.ph/file/f34e1d5c8f17bd2739a51.mp4',
    'https://telegra.ph/file/c345ed1ca18a53655f857.mp4',
    'https://telegra.ph/file/4eec929f54bc4d83293a3.mp4',
    'https://telegra.ph/file/856e38b2303046990531c.mp4'
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

handler.command = ['reirse']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
