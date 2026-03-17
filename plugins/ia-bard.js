import fetch from 'node-fetch'

export const handler = async (m, { sock, from, text, command, reply }) => {

  if (!text) {
    return reply(`🤖 INGRESA UNA PREGUNTA

Ejemplo:
.${command} ¿Conoces a chappie?`)
  }

  try {

    // ⏳ reacción
    await sock.sendMessage(from, {
      react: { text: '🕒', key: m.key }
    })

    // ✍️ escribiendo...
    await sock.sendPresenceUpdate('composing', from)

    const apii = await fetch(`https://aemt.me/bard?text=${encodeURIComponent(text)}`)
    const res = await apii.json()

    if (!res?.result) {
      throw 'Sin respuesta'
    }

    // 📩 respuesta
    await reply(`🤖 RESPUESTA

${res.result}`)

    // ✅ reacción final
    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

  } catch (error) {

    console.error(error)

    await sock.sendMessage(from, {
      react: { text: '✖️', key: m.key }
    })

    return reply('❌ OCURRIÓ UN ERROR AL CONSULTAR LA IA')
  }

}

handler.command = ['bard']
handler.tags = ['ia']
handler.group = true
handler.menu = true

export default handler
