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
    return reply('🔞 El NSFW no está activado en este grupo')
  }
  // ─────────────────

  await sock.sendMessage(from, { react: { text: '🕑', key: m.key } })

  const txt = '🔥 Pack NSFW 🔥\n> Escribe .pack otra vez para ver otro'

  // 📡 API (devuelve JSON)
  let res
  try {
    res = await axios.get('https://delirius-apiofc.vercel.app/nsfw/girls')
  } catch (e) {
    return reply('❌ Error al obtener imagen NSFW')
  }

  const img = res.data?.url
  if (!img) return reply('❌ La API no devolvió imagen')

  const textRandom = [
    "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
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
        jpegThumbnail: thumb
      }
    },
    participant: '0@s.whatsapp.net'
  }

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
