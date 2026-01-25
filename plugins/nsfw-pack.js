import axios from 'axios'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

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

  let api
  try {
    api = await axios.get('https://delirius-apiofc.vercel.app/nsfw/girls')
  } catch {
    return reply('❌ Error al contactar la API')
  }

  // 🧠 DETECTAR LINK CORRECTO
  let img =
    api.data?.url ||
    api.data?.image ||
    api.data?.result ||
    (Array.isArray(api.data) ? api.data[0]?.url : null)

  if (!img) {
    console.log(api.data)
    return reply('❌ La API no devolvió imagen válida')
  }

  // 📥 DESCARGAR IMAGEN
  let buffer
  try {
    buffer = Buffer.from(
      (await axios.get(img, { responseType: 'arraybuffer' })).data
    )
  } catch {
    return reply('❌ No se pudo descargar la imagen')
  }

  const txt = '🔥 Pack NSFW 🔥\n> Usa .pack otra vez para otro'

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
