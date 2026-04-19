export const handler = async (m, { sock, from }) => {
  // Guardamos el tiempo en que se recibió el mensaje
  const tiempoInicio = Date.now()

  // Enviamos el mensaje y calculamos el tiempo de respuesta
  await sock.sendMessage(from, {
    text: `pong 🏓\n\n⚡ Velocidad: ${Date.now() - tiempoInicio} ms\n\n> ChappieBot`
  })
}

handler.command = ['ping']
handler.help = ['p']
handler.tags = ['info']
handler.menu = true
