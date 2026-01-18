export const handler = async (m, { sock, pushName, plugins }) => {

  if (!plugins || plugins.length === 0) {
    return sock.sendMessage(m.key.remoteJid, { text: '❌ No hay plugins cargados.' })
  }

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

  // Agrupar comandos por tags
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

  // Construir menú
  let menu = `╭─〔 🤖 ${botName.toUpperCase()} 〕─╮
👋 ${saludo}
👤 Usuario : ${pushName}
🤖 Bot     : ${botName}
👨‍💻 Dev   : ${dev}
Total comandos: ${totalCommands}
╰─────────────────────╯`

  for (const tag of Object.keys(categories)) {
    const emoji = tagEmoji[tag] || defaultEmoji
    menu += `\n╔══〔 ${emoji} ${tag.toUpperCase()} 〕══╗`
    for (const cmd of categories[tag]) {
      menu += `\n║ ${emoji}  .${cmd}`
    }
    menu += `\n╚═════════════════╝`
  }

  menu += `\n╭─ 𝘾ℎ𝘢𝘱𝘱𝘪𝘦𝘉𝘰𝘵 • Menú ─╮`

  // Enviar al grupo o privado usando siempre m.key.remoteJid
  try {
    await sock.sendMessage(m.key.remoteJid, { text: menu })
  } catch (e) {
    console.log('❌ Error enviando menú:', e)
  }
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = true // importante para grupos
handler.botAdmin = false

export default handler

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
      }
