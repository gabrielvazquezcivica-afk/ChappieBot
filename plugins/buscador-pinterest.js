import fetch from 'node-fetch'

export const handler = async (m, { sock, from, args }) => {

  // 🔥 obtener texto correctamente
  const text = args.join(' ') || 
    m.text || 
    m.message?.conversation || 
    m.message?.extendedTextMessage?.text || ''

  if (!text) {
    return sock.sendMessage(from, {
      text: '🔎 Escribe qué quieres buscar\nEj: .pinterest gatos'
    }, { quoted: m })
  }

  try {

    const res = await fetch(`https://api.nekosapi.com/v3/images/pinterest?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json?.items?.length) {
      return sock.sendMessage(from, {
        text: '❌ No encontré resultados'
      }, { quoted: m })
    }

    const results = json.items.slice(0, 5)

    for (let img of results) {
      await sock.sendMessage(from, {
        image: { url: img.image_url || img.url },
        caption: `📌 Resultado de: *${text}*`
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    sock.sendMessage(from, {
      text: '❌ Error buscando imágenes'
    }, { quoted: m })
  }
}

// ───── CONFIG ─────
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
