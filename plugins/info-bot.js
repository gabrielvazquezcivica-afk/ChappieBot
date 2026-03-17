export const handler = async (m, { sock, from, args, command, reply }) => {

  const text = args.join(' ').toLowerCase().trim()

  if (!text) {
    return reply(`🤖 ESCRIBE ALGO

Ejemplo:
.${command} hola`)
  }

  // 🤖 reacción inicial
  await sock.sendMessage(from, {
    react: { text: '🤖', key: m.key }
  })

  // ✍️ escribiendo...
  await sock.sendPresenceUpdate('composing', from)

  // ⏳ pequeño delay para que se vea real
  await new Promise(resolve => setTimeout(resolve, 1500))

  let respuesta = ''

  // 🧠 RESPUESTAS
  if (text.includes('hola')) {
    respuesta = `👋 Hola ${m.pushName || ''}\nSoy ChappieBot 🤖`
  }

  else if (text.includes('como estas')) {
    respuesta = '😎 Estoy funcionando al 100%'
  }

  else if (text.includes('quien eres')) {
    respuesta = '🤖 Soy ChappieBot, tu asistente virtual'
  }

  else if (text.includes('que haces')) {
    respuesta = '⚙️ Ayudo en grupos, ejecuto comandos y me adapto a lo que necesites'
  }

  else if (text.includes('chiste')) {
    respuesta = '😂 ¿Por qué el bot no fue a la fiesta?\nPorque estaba ejecutando comandos 😎'
  }

  else if (text.includes('amor')) {
    respuesta = '💖 El amor es complicado… pero siempre vale la pena'
  }

  else if (text.includes('dueño') || text.includes('owner')) {
    respuesta = '👑 Mi creador es el dueño del bot'
  }

  else if (text.includes('menu')) {
    respuesta = `📜 Usa ${global.prefix}menu para ver todos los comandos`
  }

  else if (text.includes('grupo')) {
    respuesta = '👥 Este bot funciona mejor en grupos'
  }

  else if (text.includes('gracias')) {
    respuesta = '🙏 De nada, para eso estoy 😎'
  }

  else if (text.includes('adios')) {
    respuesta = '👋 Hasta luego'
  }

  else {
    respuesta = `🤖 Aún no entiendo eso

Prueba con:
• hola
• chiste
• quien eres
• que haces`
  }

  await reply(respuesta)

  // ✅ reacción final
  await sock.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}

handler.command = ['bot']
handler.tags = ['info']
handler.menu = true

export default handler
