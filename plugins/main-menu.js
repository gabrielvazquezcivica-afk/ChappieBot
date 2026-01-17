export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  isGroup,
  plugins
}) => {

  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay comandos disponibles.')
  }

  // ⚡ Reacción
  await sock.sendMessage(from, {
    react: { text: '⚡', key: m.key }
  })

  const botName = 'ChappieBot'
  const saludo = getGreeting()

  // 🏷️ Emoji categorías
  const tagEmoji = {
    info: '🏜️',
    group: '🏕️',
    juegos: '🎡',
    frases: '📖',
    herramientas: '🛠️',
    descargas: '📦',
    stickers: '🖼️',
    rpg: '💎'
  }

  // ⚡ Emoji comandos reales
  const cmdEmoji = {
    info: 'ℹ️',
    group: '👥',
    juegos: '🎲',
    frases: '💬',
    herramientas: '🛠️',
    descargas: '📥',
    stickers: '🖼️',
    rpg: '🪙'
  }

  // Agrupar comandos por categoría
  const categories = {}
  let totalCommands = 0

  for (const plugin of plugins) {
    if (!plugin?.handler) continue
    const h = plugin.handler

    if (!h.command || !h.tags) continue
    if (h.tags.includes('nsfw') || h.tags.includes('owner')) continue

    const cmds = Array.isArray(h.command) ? h.command : [h.command]

    for (const tag of h.tags) {
      if (!categories[tag]) categories[tag] = []
      categories[tag].push(...cmds)
      totalCommands += cmds.length
    }
  }

  const orderedTags = [
    'info',
    'group',
    'juegos',
    'frases',
    'herramientas',
    'descargas',
    'stickers',
    'rpg'
  ]

  // ✨ MENÚ PRINCIPAL
  let menu = `
╭─🛸─ ChappieBot ─🛸─╮
│ ${saludo}, ${pushName}
│ Total comandos: ${totalCommands}
│ Chat: ${isGroup ? 'Grupo' : 'Privado'}
╰───────────────────╯
`.trim()

  for (const tag of orderedTags) {
    if (!categories[tag]) continue

    const tEmoji = tagEmoji[tag] || '📂'
    const cEmoji = cmdEmoji[tag] || '➡️'

    menu += `

${tEmoji} ${tag.toUpperCase()}
────────────────────`

    for (const cmd of categories[tag]) {
      menu += `\n${cEmoji} .${cmd}`
    }

    // Línea simple al final de cada categoría
    menu += `\n────────────────────`
  }

  menu += `

ChappieBot | © 2026
`

  await sock.sendMessage(
    from,
    { text: menu },
    { quoted: m }
  )
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = true
handler.private = true

export default handler

function getGreeting () {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
}
