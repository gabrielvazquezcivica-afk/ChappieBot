import fetch from 'node-fetch'
import cheerio from 'cheerio'
import fs from 'fs'

// ───── QUOTED SISTEMA (CHAPPIEBOT) ─────      
const sistema = (titulo = 'ChappieBot 🏜️') => ({      
  key: {      
    fromMe: false,      
    participant: '0@s.whatsapp.net',      
    remoteJid: 'status@broadcast'      
  },      
  message: {      
    orderMessage: {      
      itemCount: 1,      
      message: titulo,      
      footerText: 'ChappieBot',      
      surface: 2,      
      sellerJid: '0@s.whatsapp.net'      
    }      
  }      
})      
// ─────────────────────────────────────

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  args
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (CHAPPIEBOT) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {}
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
    if (!isAdmin) return // 🚫 silencioso
  }
  /* ───────────────────────────────────────────── */

  const text = args.join(' ')
  if (!text) {
    return sock.sendMessage(from, {
      text: '🔎 Ejemplo: .pinterest gatos'
    }, { quoted: sistema('🔍 BÚSQUEDA PINTEREST') })
  }

  try {

    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0'
      }
    })

    const html = await res.text()
    const $ = cheerio.load(html)

    let results = []

    $('img').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('pinimg.com')) {
        results.push(src)
      }
    })

    results = [...new Set(results)]

    if (results.length === 0) {
      return sock.sendMessage(from, {
        text: '❌ No encontré imágenes'
      }, { quoted: sistema('❌ SIN RESULTADOS') })
    }

    const send = results.slice(0, 5)

    for (let img of send) {
      await sock.sendMessage(from, {
        image: { url: img },
        caption: `📌 Resultado: ${text}`
      }, { quoted: sistema('📌 PINTEREST') })
    }

  } catch (e) {

    console.log('❌ Pinterest error:', e)

    sock.sendMessage(from, {
      text: '❌ Error buscando imágenes'
    }, { quoted: sistema('❌ ERROR') })
  }
}

// ───── CONFIG ─────
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
