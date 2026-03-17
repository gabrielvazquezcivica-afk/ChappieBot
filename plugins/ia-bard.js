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
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []

      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!isAdmin) return // bloqueo silencioso
    } catch {}
  }

  // 🔹 texto corregido
  const text = args.join(' ')

  if (!text) {
    return reply(`🤖 INGRESA UNA PREGUNTA

Ejemplo:
.${command} ¿Conoces a Chappie?`)
  }

  try {

    // ⏳ reacción
    await sock.sendMessage(from, {
      react: { text: '🕒', key: m.key }
    })

    // ✍️ escribiendo
    await sock.sendPresenceUpdate('composing', from)

    const apii = await fetch(`https://aemt.me/bard?text=${encodeURIComponent(text)}`)
    const res = await apii.json()

    if (!res?.result) throw 'Sin respuesta'

    await reply(`🤖 RESPUESTA

${res.result}`)

    // ✅ reacción
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {

    console.error(e)

    await sock.sendMessage(from, {
      react: { text: '✖️', key: m.key }
    })

    reply('❌ ERROR AL CONSULTAR LA IA')
  }

}

handler.command = ['bard']
handler.tags = ['ai']
handler.group = true
handler.menu = true

export default handler
