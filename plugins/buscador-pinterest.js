import fetch from 'node-fetch'

export const handler = async (m, { sock, from, args }) => {

  const text = args.join(' ')
  if (!text) {
    return sock.sendMessage(from, {
      text: '🔎 Ejemplo: .pinterest gatos'
    }, { quoted: m })
  }

  try {

    // 🔥 API NUEVA (estable)
    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json || !json.data || json.data.length === 0) {
      return sock.sendMessage(from, {
        text: '❌ No encontré resultados'
      }, { quoted: m })
    }

    const results = json.data.slice(0, 5)

    for (let img of results) {
      await sock.sendMessage(from, {
        image: { url: img },
        caption: `📌 Resultado: ${text}`
      }, { quoted: m })
    }

  } catch (e) {
    console.log('❌ Pinterest error:', e)

    sock.sendMessage(from, {
      text: '❌ Error con Pinterest (API caída)'
    }, { quoted: m })
  }
}

// CONFIG
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
