import fs from 'fs'
import axios from 'axios'

export const handler = async (m, { sock, from, isGroup, sender, reply, args }) => {

  /* 🔒 MODO ADMIN SILENCIOSO */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminData[from] || { enabled: false }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}
    if (!isAdmin) return
  }

  const rawText = args.join(' ').trim()
  if (!rawText) return reply('❌ Ejemplo: .brat hola mundo')

  // 👇 evita vertical y NO usa _
  const text = rawText.replace(/\s+/g, '+')

  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    const res = await axios.get(
      `https://kepolu-brat.hf.space/brat?q=${encodeURIComponent(text)}`,
      { responseType: 'arraybuffer' }
    )

    await sock.sendMessage(
      from,
      { sticker: res.data },
      { quoted: m }
    )

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    reply('❌ Error al generar sticker')
  }
}

handler.command = ['brat']
handler.tags = ['stickers']
handler.help = ['brat <texto>']
handler.menu = true

export default handler
