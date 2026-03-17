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

  const text = args.join(' ')
  if (!text) {
    return reply(`🤖 ESCRIBE UNA PREGUNTA

Ejemplo:
.${command} hola`)
  }

  try {

    await sock.sendMessage(from, {
      react: { text: '🧠', key: m.key }
    })

    await sock.sendPresenceUpdate('composing', from)

    // ✅ API NUEVA FUNCIONAL
    const res = await fetch(`https://api.simsimi.vn/v2/simtalk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(text)}&lc=es`
    })

    const data = await res.json()

    const respuesta = data.message || 'No entendí la pregunta'

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
