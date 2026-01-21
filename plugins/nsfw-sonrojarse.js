import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Cargar DB NSFW
let nsfwDB = {}
try {
  if (fs.existsSync(nsfwFile)) {
    nsfwDB = JSON.parse(fs.readFileSync(nsfwFile))
  }
} catch (e) {
  console.error('Error cargando NSFW DB:', e)
  nsfwDB = {}
}

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // ⚠️ Comprobar NSFW
  const nsfwEnabled = nsfwDB[from] || false
  if (!nsfwEnabled) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n\n' +
      'Un admin puede activarlo con:\n.nsfw on'
    )
  }

  /* ───── 👤 TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    target = sender
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto =
    target === sender
      ? `${user1} se sonrojó solito 😏`
      : `${user1} se sonrojó por ${user2}`

  /* ───── 🤭 REACCIÓN ───── */
  await sock.sendMessage(from, {
    react: { text: '🤭', key: m.key }
  })

  /* ───── 🎞️ VIDEOS ───── */
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

  /* ───── 📤 ENVIAR ───── */
  await sock.sendMessage(
    from,
    {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

/* ───── CONFIGURACIÓN ───── */
handler.command = ['sonrojarse']
handler.group = true
handler.tags = ['nsfw']

export default handler
