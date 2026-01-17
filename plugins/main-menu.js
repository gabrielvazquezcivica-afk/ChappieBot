// plugins/menu.js
export const handler = async (m, { sock, from, pushName, plugins, reply }) => {
  if (!plugins || plugins.length === 0) return reply('❌ No hay plugins cargados.')

  // Reaccionar al mensaje
  await sock.sendMessage(from, { react: { text: '⚡', key: m.key } })

  // Saludo según hora
  const hour = new Date().getHours()
  const saludo = hour >= 5 && hour < 12
    ? '☀️ Buenos días'
    : hour >= 12 && hour < 19
      ? '🌤️ Buenas tardes'
      : '🌙 Buenas noches'

  // Agrupar comandos por tags
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

  // Emojis para cada tag
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
    owner: '👑',
    nsfw: '🔥'
  }

  const cmdEmoji = '🌟' // Emoji fijo para comandos

  // Construir menú
  let menu = `🤖 ChappieBot | ${saludo} ${pushName}\nComandos disponibles: ${totalCommands}\n────────────────────────────\n`

  for (const [tag, cmds] of Object.entries(categories)) {
    const emoji = tagEmoji[tag] || '⬢'
    menu += `${emoji} ${tag.toUpperCase()}\n`
    for (const c of cmds) {
      menu += `${cmdEmoji} .${c}\n`
    }
    menu += '────────────────────────────\n'
  }

  await sock.sendMessage(from, { text: menu }, { quoted: m })
}

// Configuración del handler
handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = false

export default handler
