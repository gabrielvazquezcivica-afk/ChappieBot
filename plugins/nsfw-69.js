import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Cargar o inicializar la DB
let nsfwDB = {}
try {
  if (fs.existsSync(nsfwFile)) {
    nsfwDB = JSON.parse(fs.readFileSync(nsfwFile))
  }
} catch (e) {
  console.error('Error cargando NSFW DB:', e)
  nsfwDB = {}
}

export const handler = async (m, { sock, from, sender, reply }) => {

  // 🛑 Solo grupos
  if (!m.isGroup) return

  // 🔞 Verificar si NSFW está activado en este grupo
  const nsfwActive = nsfwDB[from] || false
  if (!nsfwActive) {
    return reply(
      '🔞 *Comandos NSFW desactivados en este grupo*\n' +
      'Un administrador puede activarlos con:\n.nsfw on'
    )
  }

  // 👤 TARGET
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

  const texto = `${user1} está haciendo un 69 con ${user2}`

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎞️ Videos
  const videos = [
    'https://telegra.ph/file/bb4341187c893748f912b.mp4',
    'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
    'https://telegra.ph/file/1101c595689f638881327.mp4',
    'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
    'https://telegra.ph/file/a2098292896fb05675250.mp4',
    'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
    'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
    'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
    'https://telegra.ph/file/1083c19087f6997ec8095.mp4',
    'https://telegra.ph/file/0b1e2c3d4f5a6b7c8d9e.mp4'
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

handler.command = ['69', 'sixnine']
handler.group = true
handler.menu = true
handler.tags = ['nsfw']
handler.help = ['69 @usuario']

export default handler
