export const handler = async (m, {              
  sock,              
  from,              
  reply,              
  pushName,              
  plugins              
}) => {              

  // Validar plugins            
  if (!Array.isArray(plugins) || plugins.length === 0) {              
    return reply('❌ No hay plugins cargados.')              
  }              

  // Reacción rápida            
  await sock.sendMessage(from, {              
    react: { text: '⚡', key: m.key }              
  })              

  const botName = 'ChappieBot'              
  const dev = 'SoyGabo'              
  const saludo = getGreeting()              

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

  // Agrupar comandos
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

  // Crear menú
  let menu = `╭━━━━〔 🤖 ${botName.toUpperCase()} 〕━━━━╮
┃ 👋 ${saludo}
┃ 👤 Usuario : ${pushName}
┃ 🤖 Bot     : ${botName}
┃ 👨‍💻 Dev   : ${dev}
╰━━━━━━━━━━━━━━━━━━━━━━╯
Total comandos: ${totalCommands}
─────────────────────────────
`.trim()

  for (const tag of Object.keys(categories)) {              
    const emoji = tagEmoji[tag] || defaultEmoji              
    menu += `\n╔══〔 ${emoji} ${tag.toUpperCase()} 〕══╗\n`            
    for (const cmd of categories[tag]) {              
      menu += `║ ${emoji}  .${cmd}\n`              
    }              
    menu += `╚════════════════════╝`              
  }              

  menu += `\n╭─ 𝘾ℎ𝘢𝘱𝘱𝘪𝘦𝘉𝘰𝘵 • Menú de comandos ─╮\n`              

  // Enviar menú al grupo o privado
  await sock.sendMessage(from, {              
    text: menu              
  }, { quoted: m })              
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
