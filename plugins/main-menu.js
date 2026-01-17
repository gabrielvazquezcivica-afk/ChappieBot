// plugins/menu.js
export const handler = async (m, { reply, pushName, plugins }) => {
  if (!Array.isArray(plugins) || plugins.length === 0)
    return reply('❌ No hay plugins cargados.')

  // Saludo según la hora
  const saludo = getGreeting()
  const botName = 'ChappieBot'
  const dev = 'SoyGabo'

  // Emoji fijo para comandos
  const cmdEmoji = '🧿'

  // Agrupar comandos por tags, sin filtrar nsfw ni owner
  const categories = {}
  let totalCommands = 0

  for (const plugin of plugins) {
    const h = plugin.handler ?? plugin.default?.handler
    if (!h?.command || !h?.tags) continue

    const cmds = Array.isArray(h.command) ? h.command : [h.command]
    for (const tag of h.tags) {
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(...cmds)
      totalCommands += cmds.length
    }
  }

  const orderedTags = Object.keys(categories)

  // Construir menú
  let menu = `🚀 ${botName} | Comandos: ${totalCommands}\n`
  menu += `👤 Usuario: ${pushName} • ${saludo}\n👨‍💻 Dev: ${dev}\n`
  menu += `────────────────────────\n`

  for (const tag of orderedTags) {
    menu += `🌟 ${tag.toUpperCase()}\n`
    for (const cmd of categories[tag]) {
      menu += `   ${cmdEmoji} .${cmd}\n`
    }
    menu += `────────────────────────\n`
  }

  menu += `\n> ${botName}\n`

  // ✅ Usar reply para enviar mensaje al chat
  reply(menu)
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = false
export default handler

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
}
