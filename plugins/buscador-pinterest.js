import fetch from 'node-fetch'
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


  // 🔍 detectar texto correctamente
  const query = text || m.text || m.body || m.message?.conversation || ''

  if (!query) {
    return sock.sendMessage(from, {
      text: '⚡ Usa: .pinterest gatos'
    }, { quoted: sistema('Pinterest 🔍') })
  }

  try {

    // ⚡ reacción de carga
    await sock.sendMessage(from, {
      react: { text: '⚡', key: m.key }
    })

    const res = await fetch(`https://api.nekosapi.com/v3/images/search?query=${encodeURIComponent(query)}`)
    const json = await res.json()

    const img = json.items?.[0]?.url

    if (!img) {
      await sock.sendMessage(from, {
        react: { text: '❌', key: m.key }
      })
      return sock.sendMessage(from, {
        text: '❌ No encontré resultados'
      }, { quoted: sistema('Pinterest ❌') })
    }

    // 📌 enviar imagen
    await sock.sendMessage(from, {
      image: { url: img },
      caption: `📌 Resultado de: ${query}`
    }, { quoted: sistema('Pinterest 📌') })

    // ✅ reacción final
    await sock.sendMessage(from, {
      react: { text: '📌', key: m.key }
    })

  } catch (e) {
    console.log(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    sock.sendMessage(from, {
      text: '❌ Error al buscar'
    }, { quoted: sistema('Error ❌') })
  }
}


// ───── CONFIG ─────
handler.command = ['pinterest']
handler.tags = ['buscador']
handler.help = ['pinterest <texto>']
handler.menu = true

export default handler
