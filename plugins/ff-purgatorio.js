export const handler = async (m, {
  sock,
  from,
  isGroup,
  isAdmin,
  reply
}) => {

  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')
  if (!isAdmin) return reply('🚫 Solo los *administradores* pueden usar este comando')

  const imageUrl = 'https://i.postimg.cc/XvX6Pys2/16d40be27a91dfbcc21f485b46c6eb23.jpg'

  await sock.sendMessage(from, {
    react: { text: '🗺️', key: m.key }
  })

  await sock.sendMessage(
    from,
    {
      image: { url: imageUrl },
      caption: 'Mapa de Purgatorio Free Fire'
    },
    { quoted: m }
  )
}

handler.command = ['purgatorio']
handler.tags = ['ff']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
