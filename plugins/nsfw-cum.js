import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Leer la DB de NSFW
function getNSFWDB() {
  try {
    if (!fs.existsSync(nsfwFile)) return {}
    return JSON.parse(fs.readFileSync(nsfwFile))
  } catch (e) {
    console.error('Error leyendo NSFW DB:', e)
    return {}
  }
}

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {
  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 🔞 Revisar estado real NSFW
  const nsfwDB = getNSFWDB()
  const nsfwActive = nsfwDB[from] || false

  if (!nsfwActive) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\n' +
      'Un admin puede activarlos con:\n.nsfw on'
    )
  }

  // 👤 Target
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) {
    target = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    target = ctx.participant
  } else {
    return reply('❌ Etiqueta o responde a alguien')
  }

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto = `${user1} se vino dentro de ${user2}`

  // 💦 Reacción
  await sock.sendMessage(from, {
    react: { text: '💦', key: m.key }
  })

  // 🎞️ Media
  const videos = [
    'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
    'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
    'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
    'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
    'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
    'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
    'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
    'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
    'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
    'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
  ]

  const media = videos[Math.floor(Math.random() * videos.length)]

  // 📤 Enviar
  await sock.sendMessage(
    from,
    {
      video: { url: media },
      gifPlayback: true,
      caption: texto,
      mentions: [sender, target]
    },
    { quoted: m }
  )
}

/* ───── CONFIGURACIÓN ───── */
handler.command = ['cum']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['cum @usuario']

export default handler
