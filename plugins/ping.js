export const handler = async (m, { sock, from }) => {
  const start = Date.now()

  // 🔥 reacción instantánea (mide latencia real)
  await sock.sendMessage(from, {
    react: { text: '🏓', key: m.key }
  })

  const speed = Date.now() - start

  // 🔥 respuesta final
  await sock.sendMessage(from, {
    text: `🏓 *Pong*

⚡ Velocidad: ${speed} ms
🚀 Estado: ${speed < 200 ? 'Rápido' : speed < 500 ? 'Normal' : 'Lento'}

> ChappieBot`
  }, { quoted: m })
}

handler.command = ['p']
handler.help = ['p']
handler.tags = ['info']
handler.menu = true

export default handler
