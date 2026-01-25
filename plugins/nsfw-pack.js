import axios from 'axios'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

export const handler = async (m, { sock, from, isGroup, reply }) => {

  // 🔞 SISTEMA NSFW
  let nsfw = false
  if (fs.existsSync(nsfwPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(nsfwPath))
      nsfw = data[from] || false
    } catch {
      nsfw = false
    }
  }

  if (isGroup && !nsfw) {
    return reply('🔞 Este comando requiere que el NSFW esté activado en este grupo')
  }
  // ─────────────────

  // ⏳ Reacción inicial
  await sock.sendMessage(from, { react: { text: '🕑', key: m.key } })

  const txt = 'Pack🔥🔥🔥\n> Pon de nuevo .pack para mirar el siguiente ✨'
  const img = 'https://delirius-apiofc.vercel.app/nsfw/girls'

  const textRandom = [
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙂𝙚𝙣𝙚𝙧𝙖𝙡 𝙓 *ChappieBot*",
    "𝙈𝙚𝙣𝙘𝙞𝙤𝙣 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙣𝙙𝙤 𝙖 𝙡𝙤𝙨 𝙉𝙋𝘾"
  ]

  const imgRandom = [
    "https://iili.io/FKVDVAN.jpg",
    "https://iili.io/FKVbUrJ.jpg"
  ]

  const msjRandom = textRandom[Math.floor(Math.random() * textRandom.length)]
  const imgSelected = imgRandom[Math.floor(Math.random() * imgRandom.length)]

  const thumb = Buffer.from(
    (await axios.get(imgSelected, { responseType: 'arraybuffer' })).data
  )

  const fake = {
    key: {
      participant: '0@s.whatsapp.net',
      fromMe: false,
      id: 'ChappieBot'
    },
    message: {
      locationMessage: {
        name: msjRandom,
        jpegThumbnail: thumb,
        vcard:
          "BEGIN:VCARD\nVERSION:3.0\nN:;ChappieBot;;;\nFN:ChappieBot\nORG:ChappieBot\nTITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Bot\n" +
          "X-WA-BIZ-DESCRIPTION:ChappieBot\nX-WA-BIZ-NAME:ChappieBot\nEND:VCARD"
      }
    },
    participant: '0@s.whatsapp.net'
  }

  // ✅ Reacción final
  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  await sock.sendMessage(
    from,
    { image: { url: img }, caption: txt },
    { quoted: fake }
  )
}

handler.command = ['pack']
handler.tags = ['nsfw']
handler.menu = true

export default handler
