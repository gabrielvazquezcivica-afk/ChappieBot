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
    } catch { groupSettings = { enabled: false } }
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

  /* ───── 🎯 MENCIÓN O RESPUESTA ───── */
  let who
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  if (ctx?.mentionedJid?.length) who = ctx.mentionedJid[0]
  else if (ctx?.participant) who = ctx.participant
  else who = sender

  // Obtener nombres reales
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const target = participants.find(p => p.id === who)
  const senderContact = participants.find(p => p.id === sender)

  const name1 = senderContact?.notify || sender.split('@')[0]
  const name2 = target?.notify || who.split('@')[0]

  // 👋 reacción
  await sock.sendMessage(from, { react: { text: '🖐🏻', key: m.key } })

  const texto = `🖐🏻 *@${name1}* le dio una bofetada a *@${name2}*`

  // 🎞️ Videos random slap
  const videos = [
    'https://telegra.ph/file/3ba192c3806b097632d3f.mp4',
    'https://telegra.ph/file/58b33c082a81f761bbee8.mp4',
    'https://telegra.ph/file/da5011a1c504946832c81.mp4',
    'https://telegra.ph/file/20ac5be925e6cd48f549f.mp4',
    'https://telegra.ph/file/a00bc137b0beeec056b04.mp4',
    'https://telegra.ph/file/080f08d0faa15119621fe.mp4',
    'https://telegra.ph/file/eb0b010b2f249dd189d06.mp4',
    'https://telegra.ph/file/734cb1e4416d80a299dac.mp4',
    'https://telegra.ph/file/fc494a26b4e46c9b147d2.mp4'
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

handler.command = ['bofetada']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
