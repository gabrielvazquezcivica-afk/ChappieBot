import axios from 'axios'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

const apis = [
  'https://api.waifu.pics/nsfw/waifu',
  'https://api.waifu.im/search?included_tags=ecchi',
  'https://nekos.life/api/v2/img/lewd'
]

export const handler = async (m, { sock, from, isGroup, reply }) => {

  // 🔞 NSFW SYSTEM
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

  await sock.sendMessage(from, { react: { text: '🕑', key: m.key } })

  let img = null

  for (let api of apis) {
    try {
      const res = await axios.get(api, { timeout: 10000 })

      img =
        res.data?.url ||
        res.data?.image ||
        res.data?.images?.[0]?.url ||
        res.data?.data?.[0]?.url

      if (img) break
    } catch {}
  }

  if (!img) return reply('❌ Ninguna API respondió con imagen')

  let buffer
  try {
    buffer = Buffer.from(
      (await axios.get(img, { responseType: 'arraybuffer' })).data
    )
  } catch {
    return reply('❌ Error al descargar la imagen')
  }

  const txt = '🔥 Pack NSFW 🔥\n> Usa .pack para otro'

  await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  await sock.sendMessage(
    from,
    { image: buffer, caption: txt },
    { quoted: m }
  )
}

handler.command = ['pack']
handler.tags = ['nsfw']
handler.menu = true
export default handler
