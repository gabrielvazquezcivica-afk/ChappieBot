import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 📞 Owner
  const ownerNumber = config.owner.numbers[0] || 'No definido'

  // 📸 Instagram
  const instagramUser = 'gabriel_gdl_90'
  const instagramURL = `https://instagram.com/${instagramUser}`

  // 🖼 Imagen del owner
  const ownerImage = 'https://i.ibb.co/0JcN6gT/owner.jpg' // cambia si quieres

  // ───── TEXTO CORTO ─────
  const text = `
👑 Owner: ${config.owner.name}
🤖 Bot: ${config.bot.name}
📞 Número: ${ownerNumber}
📸 IG: ${instagramURL}
`.trim()

  // ───── ENVIAR IMAGEN + TEXTO ─────
  await sock.sendMessage(
    from,
    {
      image: { url: ownerImage },
      caption: text
    },
    { quoted: m }
  )
}

handler.command = ['owner']
handler.tags = ['info']
handler.menu = true
handler.help = ['owner']
