import fetch from 'node-fetch'
import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, args, command, reply }) => {

  /* ───── 🔒 MODO ADMIN ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {}
  }

  if (groupSettings.enabled && isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      const isAdmin = metadata.participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    } catch {}
  }

  const text = args.join(' ').trim()

  if (!text) {
    return reply(`🤖 ESCRIBE UNA PREGUNTA

Ejemplo:
.${command} ¿Qué es la inteligencia artificial?`)
  }

  // 💬 RESPUESTA ESPECIAL PARA "hola"
  if (text.toLowerCase() === 'hola') {
    return reply(`👋 Hola ${m.pushName || ''}

Soy ChappieBot 🤖

Puedes preguntarme cosas como:
• Cuéntame un chiste
• Dame un dato curioso
• ¿Qué es la inteligencia artificial?`)
  }

  try {

    // 🧠 reacción
    await sock.sendMessage(from, {
      react: { text: '🧠', key: m.key }
    })

    // ✍️ escribiendo
    await sock.sendPresenceUpdate('composing', from)

    // 🔥 API
    const res = await fetch(`https://api.simsimi.vn/v2/simtalk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(text)}&lc=es`
    })

    const data = await res.json()

    let respuesta = data.message

    // 🧠 mejora de respuesta
    if (!respuesta || respuesta.toLowerCase().includes('no entend')) {
      respuesta = `🤖 No entendí bien tu mensaje.

Intenta algo más claro como:
• Cuéntame un chiste
• ¿Qué es el amor?
• Dame un dato curioso`
    }

    await reply(`🤖 RESPUESTA

${respuesta}`)

    // ✅ reacción
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ ERROR AL CONSULTAR LA IA')
  }

}

handler.command = ['bard']
handler.tags = ['ia']
handler.group = true
handler.menu = true

export default handler
