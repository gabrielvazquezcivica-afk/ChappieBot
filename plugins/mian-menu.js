export const handler = async (m, {              
  sock,              
  from,              
  reply,              
  pushName,              
  plugins              
}) => {              

  // 🛑 Verificar plugins
  if (!Array.isArray(plugins) || plugins.length === 0) {              
    return reply('❌ No hay plugins cargados.')              
  }              

  // ⚡ Reacción al abrir menú
  await sock.sendMessage(from, { react: { text: '⚡', key: m.key } })

  const botName = 'ChappieBot'
  const dev = 'SoyGabo'
  const saludo = getGreeting()

  // 🎯 Emoji por categoría
  const tagEmoji = {              
    info: '🍄',
    frases: '📖',
    group: '🐉',
    descargas: '🎧',
    juegos: '🎡',
    ff: '🔫',
    registro: '📚',
    rpg: '💰',
    tools: '🧰',
    stickers: '🖼️',
    owner: '👑',
    nsfw: '🔞'
  }              

  const cmdEmoji = '🧿' // emoji fijo para comandos

  // 📂 Agrupar comandos
  const categories = {}              
  let totalCommands = 0              

  for (const plugin of plugins) {              
    const h = plugin.handler ?? plugin
    if (!h?.command || !h?.tags) continue

    const cmds = Array.isArray(h.command) ? h.command : [h.command]

    for (const tag of h.tags) {
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(...cmds)
      totalCommands += cmds.length
    }
  }

  // 📌 Orden de los tags en el menú
  const orderedTags = [
    'info',
    'frases',
    'group',
    'descargas',
    'juegos',
    'ff',
    'registro',
    'rpg',
    'tools',
    'stickers',
    'owner',
    'nsfw'
  ]

  // 🧠 Construir menú
  let menu = `╭─〔 🤖 ${botName} 〕─╮
👋 ${saludo}
👤 Usuario : ${pushName}
🤖 Bot     : ${botName}
👨‍💻 Dev   : ${dev}
╰─────────────────────╯
Total de comandos: ${totalCommands}\n`

  for (const tag of orderedTags) {
    if (!categories[tag]) continue
    const emoji = tagEmoji[tag] || '⬢'

    menu += `\n╔─〔 ${emoji} ${tag.toUpperCase()} 〕─╗\n`
    for (const cmd of categories[tag]) {
      menu += `║ ${cmdEmoji} .${cmd}\n`
    }
    menu += `╚─────────────────────╝`
  }

  menu += `\n\n> ${botName}`

  // 📸 Enviar menú con imagen
  await sock.sendMessage(
    from,
    {
      image: {
        url: 'https://i.postimg.cc/jjYq0Hm2/0519561cff59024a52aa893d49d7af17.jpg'
      },
      caption: menu
    },
    { quoted: m }
  )
}

handler.command = ['menu']
handler.tags = ['info']
handler.group = null

export default handler

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
}
