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
  // 🛑 Solo grupos
  if (!isGroup) return

  // 🔞 Leer estado real de NSFW desde archivo
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

  const texto = `${user1} le está chupando las tetas a ${user2}`

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎞️ Videos NSFW
  const videos = [
    'https://telegra.ph/file/1104aa065e51d29a5fb4f.mp4',
    'https://telegra.ph/file/f8969e557ad07e7e53f1a.mp4',
    'https://telegra.ph/file/f8cf75586670483fadc1d.mp4',
    'https://telegra.ph/file/7b181cbaa54eee6c048fc.mp4',
    'https://telegra.ph/file/01143878beb3d0430c33e.mp4',
    'https://telegra.ph/file/9827c7270c9ceddb8d074.mp4',
    'https://telegra.ph/file/95efbd8837aa18f3e2bde.mp4',
    'https://telegra.ph/file/b178b294a963d562bb449.mp4',
    'https://telegra.ph/file/949dff632250307033b2e.mp4',
    'https://telegra.ph/file/9e1240c29f3a6a9867aaa.mp4'
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
handler.command = ['chupartetas']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['chupartetas @usuario']

export default handler
