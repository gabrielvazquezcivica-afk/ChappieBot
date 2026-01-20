import fs from 'fs'
import path from 'path'

const nsfwFile = path.join('./data/nsfw.json')

// Cargar estado NSFW al iniciar
let nsfwData = {}
if (fs.existsSync(nsfwFile)) {
  nsfwData = JSON.parse(fs.readFileSync(nsfwFile))
} else {
  fs.writeFileSync(nsfwFile, JSON.stringify({}))
}

function saveNSFW() {
  fs.writeFileSync(nsfwFile, JSON.stringify(nsfwData, null, 2))
}

export const handler = async (m, { sock, from, sender, isGroup, reply, args }) => {

  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // Inicializar grupo en NSFW
  if (!nsfwData[from]) nsfwData[from] = { enabled: false }

  const groupNSFW = nsfwData[from]

  // Activar/desactivar NSFW (solo admins)
  if (args[0] === 'on' || args[0] === 'off') {

    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []

    const isAdmin = participants.some(
      p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
    )

    if (!isAdmin) return reply('❌ Solo admins pueden activar o desactivar NSFW')

    groupNSFW.enabled = args[0] === 'on'
    saveNSFW()

    return reply(`✅ Comandos NSFW ${groupNSFW.enabled ? 'activados' : 'desactivados'} para este grupo`)
  }

  // ❌ Bloquear si NSFW está desactivado
  if (!groupNSFW.enabled) {
    return reply('🔞 *Comandos NSFW desactivados*\nUn admin debe activar con:\n.nsfw on')
  }

  /* ───── 👤 TARGET ───── */
  let target
  const ctx = m.message?.extendedTextMessage?.contextInfo

  if (ctx?.mentionedJid?.length) target = ctx.mentionedJid[0]
  else if (ctx?.participant) target = ctx.participant
  else return reply('❌ Etiqueta o responde a alguien')

  const user1 = '@' + sender.split('@')[0]
  const user2 = '@' + target.split('@')[0]

  const texto = `${user1} está haciendo un 69 con ${user2}`

  /* ───── 🔥 REACCIÓN ───── */
  await sock.sendMessage(from, { react: { text: '🔥', key: m.key } })

  /* ───── 🎞️ VIDEOS ───── */
  const videos = [
    'https://telegra.ph/file/bb4341187c893748f912b.mp4',
    'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
    'https://telegra.ph/file/1101c595689f638881327.mp4',
    'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
    'https://telegra.ph/file/a2098292896fb05675250.mp4',
    'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
    'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
    'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
    'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
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
handler.command = ['69']
handler.group = true
handler.menu = false
handler.menu2 = true
handler.tags = ['nsfw']
handler.help = ['69 @usuario', 'nsfw on/off']

export default handler
