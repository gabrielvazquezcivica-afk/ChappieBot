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

  // 🗺️ Imagen del mapa Kalahari
  const imageUrl = 'https://telegra.ph/file/1d3f4b0b8e0c8f0f7b6c2.jpg'

  // 📸 Reacción
  await sock.sendMessage(from, {
    react: { text: '🗺️', key: m.key }
  })

  // 📤 Enviar imagen
  await sock.sendMessage(
    from,
    {
      image: { url: imageUrl },
      caption: 'Mapa de Kalahari Free Fire'
    },
    { quoted: m }
  )
}

handler.command = ['kalahari']
handler.tags = ['ff']
handler.help = ['kalahari']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
