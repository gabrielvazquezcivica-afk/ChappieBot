import fetch from 'node-fetch'

export const handler = async (m, { sock, from, args }) => {

  const text = args.join(' ')
  if (!text) {
    return sock.sendMessage(from, {
      text: '🔎 Ejemplo: .pinterest gatos'
    }, { quoted: m })
  }

  try {

    // 🔥 obtener token
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(text)}&iax=images&ia=images`)
    const html = await res.text()

    const token = html.match(/vqd='(.*?)'/)?.[1]
    if (!token) throw 'No token'

    // 🔥 obtener imágenes
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(text)}&vqd=${token}&f=,,,&p=1`)
    const data = await imgRes.json()

    if (!data?.results?.length) {
      return sock.sendMessage(from, {
        text: '❌ No encontré resultados'
      }, { quoted: m })
    }

    const results = data.results.slice(0, 5)

    for (let img of results) {
      await sock.sendMessage(from, {
        image: { url: img.image },
        caption: `📌 Resultado: ${text}`
      }, { quoted: m })
    }

  } catch (e) {

    console.log('❌ Error:', e)

    sock.sendMessage(from, {
      text: '❌ Error buscando imágenes'
    }, { quoted: m })
  }
}

// CONFIG
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
