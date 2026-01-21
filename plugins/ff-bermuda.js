export const handler = async (m, {
  sock,
  from,
  isGroup,
  isAdmin,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) {
    return reply('❌ Este comando solo funciona en grupos')
  }

  // 🔒 Solo admins
  if (!isAdmin) {
    return reply('🚫 Solo los *administradores* pueden usar este comando')
  }

  // 🗺️ Imagen del mapa Bermuda
  const imageUrl = 'https://i.postimg.cc/ydv6Rzpp/WANVTVBRYZHVXJPBL32TEUZI74.jpg'

  // 🗺️ Reacción
  await sock.sendMessage(from, {
    react: { text: '🗺️', key: m.key }
  })

  // 📤 Enviar imagen
  await sock.sendMessage(
    from,
    {
      image: { url: imageUrl },
      caption: 'Mapa de Bermuda Free Fire'
    },
    { quoted: m }
  )
}

handler.command = ['bermuda']
handler.tags = ['juegos']
handler.help = ['bermuda']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
