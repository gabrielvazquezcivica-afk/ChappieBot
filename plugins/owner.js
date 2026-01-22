import config from '../config.js'

export const handler = async (m, { sock, from }) => {

  // 👑 Reacción al ejecutor
  await sock.sendMessage(from, {
    react: { text: '👑', key: m.key }
  })

  // 📞 Owner
  const ownerNumber = config.owner.numbers[0] || 'No definido'

  // 📸 Instagram (LINK DIRECTO)
  const instagramUser = 'gabriel_gdl_90'
  const instagramURL = `https://instagram.com/${instagramUser}`

  // 🖼 Imagen del owner (puedes cambiar la URL por una local o remota)
  const ownerImage = 'https://i.postimg.cc/Z5jgVfmX/file-00000000c4407230be23ee400c514cf9.jpg' // ejemplo, cambia si quieres

  // ───── TEXTO DISEÑO CHAPPIEBOT ─────
  const text = `
╔════〔 👑 CREATOR 〕════╗
║ 🤖 Bot: ${config.bot.name}
║ 👤 Nombre: ${config.owner.name}
║ 📞 Número: ${ownerNumber}
║
║ 📸 Instagram: ${instagramURL}
╚═══════════════════════╝

✨ Contacto directo del creador
🚀 Powered by ChappieBot
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
