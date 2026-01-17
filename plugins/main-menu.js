export const handler = async (m, { sock, from, pushName, reply, plugins }) => {
  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay plugins cargados.')
  }

  // ⚡ Reacción al mensaje
  await sock.sendMessage(from, { react: { text: '🔥', key: m.key } })

  const botName = 'ChappieBot'
  const dev = 'SoyGabo'
  const saludo = getGreeting()

  const tagEmoji = {
    info: '🍄',
    frases: '📖',
    group: '🏜️',
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
  const cmdEmoji = '🧿'
  const defaultEmoji = '⬢'

  // Agrupar comandos
  const categories = {}
  let totalCommands = 0
  for (const plugin of plugins) {
    const h = plugin.handler || plugin.default?.handler
    if (!h?.command || !h?.tags) continue

    const cmds = Array.isArray(h.command) ? h.command : [h.command]
    for (const tag of h.tags) {
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(...cmds)
      totalCommands += cmds.length
    }
  }

  // Orden de tags
  const orderedTags = [
    'info', 'frases', 'group', 'descargas', 'juegos',
    'ff', 'registro', 'rpg', 'tools', 'stickers',
    'nsfw', 'owner'
  ]

  // Construir menú
  let menu = `\n🚀 ${botName} • Comandos activos: ${totalCommands}\n`
  menu += `👤 Usuario: ${pushName} • ${saludo}\n👨‍💻 Dev: ${dev}\n`
  menu += `──────────────────────────\n`

  for (const tag of orderedTags) {
    if (!categories[tag]) continue
    const emoji = tagEmoji[tag] || defaultEmoji
    menu += `🌟 ${tag.toUpperCase()} ${emoji}\n`
    for (const cmd of categories[tag]) {
      menu += `   ${cmdEmoji} .${cmd}\n`
    }
    menu += `──────────────────────────\n`
  }

  menu += `\n> ${botName} | ChappieBot\n`

  await sock.sendMessage(from, { text: menu }, { quoted: m })
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
