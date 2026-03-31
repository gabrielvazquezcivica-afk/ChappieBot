import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
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


// ───── HANDLER ─────
export const handler = async (m, {
  sock,
  text,
  from,
  sender,
  isGroup
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (CHAPPIEBOT) ───── */
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
  /* ───────────────────────────────────────────── */


  if (!text) {
    return sock.sendMessage(from, {
      text: '⚡ Usa: .pinterest gatos'
    }, { quoted: sistema('Pinterest 🔍') })
  }

  try {

    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const html = await res.text()

    const $ = cheerio.load(html)
    const results = []

    $('img').each((i, el) => {
      const src = $(el).attr('src')
      if (src && src.includes('pinimg.com')) {
        results.push(src)
      }
    })

    const unique = [...new Set(results)]

    if (unique.length === 0) {
      return sock.sendMessage(from, {
        text: '❌ No encontré resultados'
      }, { quoted: sistema('Pinterest ❌') })
    }

    const random = unique[Math.floor(Math.random() * unique.length)]

    await sock.sendMessage(from, {
      image: { url: random },
      caption: `📌 Resultado de: ${text}`
    }, { quoted: sistema('Pinterest 📌') })

  } catch (e) {
    console.log(e)
    sock.sendMessage(from, {
      text: '❌ Error al buscar en Pinterest'
    }, { quoted: sistema('Pinterest Error') })
  }
}


// ───── CONFIG ─────
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.group = false
handler.menu = true

export default handler
