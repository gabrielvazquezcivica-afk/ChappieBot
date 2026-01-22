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
  const ownerImage = 'https://i.postimg.cc/Z5jgVfmX/file-00000000c4407230be23ee400c514cf9.jpg' // cambia si quieres

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
