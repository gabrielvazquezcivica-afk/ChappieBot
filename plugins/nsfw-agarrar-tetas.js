import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Función para leer NSFW DB
function getNSFWDB() {
  try {
    if (!fs.existsSync(nsfwFile)) return {}
    return JSON.parse(fs.readFileSync(nsfwFile))
  } catch (e) {
    console.error('Error leyendo NSFW DB:', e)
    return {}
  }
}

export const handler = async (m, { sock, from, sender, reply, isGroup }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 🔞 Leer estado real de NSFW desde el archivo
  const nsfwDB = getNSFWDB()
  const nsfwActive = nsfwDB[from] || false

  if (!nsfwActive) {
    return reply(
      '🔞 *Comandos NSFW desactivados en este grupo*\n' +
      'Un administrador puede activarlos con:\n.nsfw on'
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

  const texto = `${user1} está agarrando las tetas de ${user2}`

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎞️ Videos NSFW
  const videos = [
    'https://telegra.ph/file/82d32821f3b57b62359f2.mp4',
    'https://telegra.ph/file/04bbf490e29158f03e348.mp4',
    'https://telegra.ph/file/37c21753892b5d843b9ce.mp4',
    'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4',
    'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4',
    'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4',
    'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4',
    'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4',
    'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4',
    'https://telegra.ph/file/36149496affe5d02c8965.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  // 📤 Enviar video
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
handler.command = ['agarrartetas']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['agarrartetas @usuario']

export default handler
