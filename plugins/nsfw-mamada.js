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

  // 🎯 Detectar mención / respuesta
  let target
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

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
      ? `${user1} anda bien cachondo 🔥`
      : `${user1} le está dando una mamada a ${user2}`

  // 🔥 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔥', key: m.key }
  })

  // 🎞️ Videos
  const videos = [
    'https://telegra.ph/file/0260766c6b36537aa2802.mp4',
    'https://telegra.ph/file/2c1c68c9e310f60f1ded1.mp4',
    'https://telegra.ph/file/e14f5a31d3b3c279f5593.mp4',
    'https://telegra.ph/file/e020aa808f154a30b8da7.mp4',
    'https://telegra.ph/file/1cafb3e72664af94d45c0.mp4',
    'https://telegra.ph/file/72b49d3b554df64e377bb.mp4',
    'https://telegra.ph/file/9687aedfd58a3110c7f88.mp4',
    'https://telegra.ph/file/c799ea8a1ed0fd336579c.mp4',
    'https://telegra.ph/file/7352d18934971201deed5.mp4',
    'https://telegra.ph/file/379edd38bac6de4258843.mp4'
  ]

  const video = videos[Math.floor(Math.random() * videos.length)]

  // 📤 Enviar
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
handler.command = ['mamada']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['mamada @usuario']

export default handler
