export const handler = async (m, {              
  sock,              
  from,              
  reply,              
  pushName,              
  plugins              
}) => {              

  // 🛑 Validar plugins            
  if (!Array.isArray(plugins) || plugins.length === 0) {              
    return reply('❌ No hay plugins cargados.')              
  }              

  // ⚡ Reacción            
  await sock.sendMessage(from, {              
    react: { text: '⚡', key: m.key }              
  })              

  const botName = 'ChappieBot'              
  const dev = 'SoyGabo'              
  const saludo = getGreeting()              

  // 🎯 Emojis por categoría            
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
    nsfw: '🔞',              
    owner: '👑'              
  }              
  const defaultEmoji = '⬢'              

  // 📂 Agrupar comandos por tags            
  const categories = {}              
  let totalCommands = 0              

  for (const plugin of plugins) {              
    if (!plugin?.handler) continue              
    const h = plugin.handler              

    if (!h.command || !h.tags) continue              

    const cmds = Array.isArray(h.command) ? h.command : [h.command]            

    for (const tag of h.tags) {              
      if (!categories[tag]) categories[tag] = []              
      categories[tag].push(cmds[0])              
      totalCommands++              
    }              
  }              

  // 📌 Orden opcional (puedes reordenar si quieres)
  const orderedTags = Object.keys(categories)  

  // 🧠 MENÚ ESTILO JOSHIBOT            
  let menu = `╭━━━━〔 🤖 ${botName.toUpperCase()} 〕━━━━╮
┃ 👋 ${saludo}
┃ 👤 Usuario : ${pushName}
┃ 🤖 Bot     : ${botName}
┃ 👨‍💻 Dev   : ${dev}
╰━━━━━━━━━━━━━━━━━━━━━━╯
Total comandos: ${totalCommands}
─────────────────────────────
`.trim()

  // 📑 Listar categorías y comandos
  for (const tag of orderedTags) {              
    const emoji = tagEmoji[tag] || defaultEmoji              
    menu += `\n╔══〔 ${emoji} ${tag.toUpperCase()} 〕══╗\n`            

    for (const cmd of categories[tag]) {              
      menu += `║ ${emoji}  .${cmd}\n`              
    }              

    menu += `╚════════════════════╝`              
  }              

  menu += `\n╭─ 𝘾ℎ𝘢𝘱𝘱𝘪𝘦𝘉𝘰𝘵 • Menú de comandos ─╮\n`              

  // ✉️ Enviar menú con imagen
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

handler.command = ['menu', 'help', 'comandos']              
handler.tags = ['info']              
handler.group = true              

export default handler              

function getGreeting() {              
  const hour = new Date().getHours()              
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'              
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'              
  return '🌙 Buenas noches'              
}
