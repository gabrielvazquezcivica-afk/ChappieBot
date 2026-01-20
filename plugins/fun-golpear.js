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

  // 👊 Reacción inicial
  await sock.sendMessage(from, { react: { text: '👊🏻', key: m.key } })

  const texto = `👊🏻 *@${name1}* golpeó a *@${name2}*`

  // 🎞️ Videos random
  const videos = [
    'https://telegra.ph/file/8e60a6379c1b72e4fbe0f.mp4',
    'https://telegra.ph/file/8ac9ca359cac4c8786194.mp4',
    'https://telegra.ph/file/cc20935de6993dd391af1.mp4',
    'https://telegra.ph/file/9c0bba4c6b71979e56f55.mp4',
    'https://telegra.ph/file/5d22649b472e539f27df9.mp4',
    'https://telegra.ph/file/804eada656f96a04ebae8.mp4',
    'https://telegra.ph/file/3a2ef7a12eecbb6d6df53.mp4',
    'https://telegra.ph/file/c4c27701496fec28d6f8a.mp4',
    'https://telegra.ph/file/c8e5a210a3a34e23391ee.mp4',
    'https://telegra.ph/file/70bac5a760539efad5aad.mp4',
    'https://qu.ax/iPDiG.mp4'
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
handler.command = ['golpear']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
