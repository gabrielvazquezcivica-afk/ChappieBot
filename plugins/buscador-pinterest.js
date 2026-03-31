import fetch from 'node-fetch'
import fs from 'fs'

// ───── QUOTED SISTEMA ─────
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
// ─────────────────────────


// ───── HANDLER ─────
export const handler = async (m, { sock, text, from, sender, isGroup }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
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
  /* ───────────────────────────────── */

  const query = text || m.text || m.body || ''

  if (!query) {
    return sock.sendMessage(from, {
      text: '⚡ Usa: .pinterest gatos'
    }, { quoted: sistema('Pinterest 🔍') })
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '⚡', key: m.key }
    })

    const res = await fetch(`https://api.nekosapi.com/v3/images/search?query=${encodeURIComponent(query)}`)

    const raw = await res.text()

    // 💥 detectar si devolvió HTML
    if (raw.startsWith('<')) {
      throw new Error('API devolvió HTML (bloqueado)')
    }

    const json = JSON.parse(raw)

    const img = json.items?.[0]?.url

    if (!img) throw new Error('Sin resultados')

    await sock.sendMessage(from, {
      image: { url: img },
      caption: `📌 Resultado de: ${query}`
    }, { quoted: sistema('Pinterest 📌') })

    await sock.sendMessage(from, {
      react: { text: '📌', key: m.key }
    })

  } catch (e) {
    console.log('❌ Error Pinterest:', e.message)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    // 🔥 FALLBACK (imagen random segura)
    const fallback = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`

    await sock.sendMessage(from, {
      image: { url: fallback },
      caption: `⚠️ API falló, resultado alternativo:\n${query}`
    }, { quoted: sistema('Pinterest Fallback ⚠️') })
  }
}


// ───── CONFIG ─────
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
