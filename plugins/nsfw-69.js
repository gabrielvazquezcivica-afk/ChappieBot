import fs from 'fs'
import path from 'path'

const nsfwFile = path.join('./data/nsfw.json')

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return

  // ✅ 
  let nsfwData = {}
  if (fs.existsSync(nsfwFile)) {
    try {
      const raw = fs.readFileSync(nsfwFile, 'utf-8')
      nsfwData = JSON.parse(raw)
    } catch (e) {
      console.error('Error leyendo nsfw.json:', e)
      return reply('❌ Error al leer la configuración NSFW')
    }
  }

  // 🔞 
  if (!nsfwData[from]?.enabled) {
    return reply(
      '🔞 *Comandos NSFW desactivados*\nUn admin debe activar con:\n.nsfw on'
    )
  }

  // 👤 TARGET
  const ctx = m.message?.extendedTextMessage?.contextInfo
  let target
  if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]
  else if (ctx?.participant) target = ctx.participant
  else return reply('❌ Etiqueta o responde a alguien')

  const name1 = '@' + sender.split('@')[0]
  const name2 = '@' + target.split('@')[0]

  const texto = `😈 *${name1}* está haciendo travesuras con *${name2}* 😈`

  // 🔥 REACCIÓN
  await sock.sendMessage(from, { react: { text: '🔥', key: m.key } })

  // 🎞️ VIDEOS
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
    'https://telegra.ph/file/3a2c1b5e21f1d0a0f4a3b.mp4'
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]

  // 📤 ENVIAR
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

handler.command = ['69']
handler.group = true
handler.tags = ['nsfw']
handler.help = ['69 @usuario']

export default handler
