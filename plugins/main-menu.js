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
  await sock.sendMessage(from, { react: { text: '🎭', key: m.key } })    
    
  const botName = 'ChappieBot'    
  const dev = 'SoyGabo'    
  const saludo = getGreeting()    
    
  // 🎯 Emoji por categoría (título del tag)    
  const tagEmoji = {                  
    info: '🚀',    
    frases: '🌟',    
    group: '🏜️',    
    descargas: '🎧',    
    juegos: '🎠',    
    ff: '🕹️',    
    registro: '📚',    
    buscador: '🔍',
    rpg: '💰',    
    tools: '🧰',    
    stickers: '🖼️',    
    owner: '👑',    
    nsfw: '🔞',    
    xvideos: '🤤',
    logos: '🏞️',
    'on-off': '📴'
  }                  

  // 🎯 Emoji por comandos dentro del tag
  const cmdEmojiByTag = {
    info: '💫',
    frases: '🍃',
    group: '🍁',
    descargas: '🎵',
    juegos: '🎯',
    ff: '🚀',
    registro: '📝',
    buscador: '🔎',
    rpg: '💎',
    tools: '🔧',
    stickers: '🖌️',
    owner: '🤴🏻',
    nsfw: '🔥',
    xvideos: '🥵',
    logos: '🎐',
    'on-off': '📳'
  }    
  
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
    'on-off',    
    'frases',    
    'group',    
    'descargas',    
    'juegos',    
    'game',
    'ff',    
    'registro',    
    'rpg',    
    'tools',    
    'stickers',    
    'owner',    
    'nsfw',
    'xvideos',
    'buscador'
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
    const emojiTag = tagEmoji[tag] || '⬢'
    const cmdEmoji = cmdEmojiByTag[tag] || '🚀'
    
    menu += `\n╔─〔 ${emojiTag} ${tag.toUpperCase()} 〕─╗\n`    
    
    for (const cmd of categories[tag]) {    
      menu += `║ ${cmdEmoji} .${cmd}\n`    
    }    
    menu += `╚─────────────────────╝`    
  }    
    
  menu += `\n\n> ${botName}`    
    
await sock.sendMessage(from, {
    image: { url: 'https://i.postimg.cc/0jXLvZxR/868bfb1ce56805562e86e1b517df1460.jpg' },
    caption: menu
  })
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
