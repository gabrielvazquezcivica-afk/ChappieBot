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
.${command} ¿Qué es el amor?`)
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '🧠', key: m.key }
    })

    await sock.sendPresenceUpdate('composing', from)

    // 🔥 API MEJOR
    const res = await fetch(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(text)}&owner=Chappie&botname=ChappieBot`)
    const data = await res.json()

    let respuesta = data.message

    if (!respuesta) {
      respuesta = '🤖 No pude responder, intenta otra pregunta'
    }

    await reply(`🤖 RESPUESTA

${respuesta}`)

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })

    reply('❌ ERROR EN LA IA')
  }

}

handler.command = ['bard']
handler.tags = ['ia']
handler.group = true
handler.menu = true

export default handler
