export const handler = async (m, {
  sock,
  from,
  reply,
  pushName,
  plugins
}) => {

  if (!Array.isArray(plugins) || plugins.length === 0) {
    return reply('❌ No hay comandos disponibles.')
  }

  await sock.sendMessage(from, {
    react: { text: '📂', key: m.key }
  })

  const botName = 'ChappieBot'
  const saludo = getGreeting()

  // 🏷️ Emoji categoría
  const tagEmoji = {
    info: '🏜️',
    group: '🏕️',
    juegos: '🎡',
    frases: '📖',
    herramientas: '🛠️',
    descargas: '📦',
    stickers: '🖼️',
    rpg: '💰'
  }

  // ⚡ Emoji comandos
  const cmdEmoji = {
    info: '➜',
    group: '➜',
    juegos: '✦',
    frases: '✧',
    herramientas: '➤',
    descargas: '⬥',
    stickers: '◆',
    rpg: '✪'
  }

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
      categories[tag].push(cmds[0])
      totalCommands++
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

  let menu = `
ChappieBot

${saludo}, ${pushName}

Prefijo de comandos:
.

Comandos disponibles: ${totalCommands}
`.trim()

  for (const tag of orderedTags) {
    if (!categories[tag]) continue

    const tEmoji = tagEmoji[tag] || '📁'
    const cEmoji = cmdEmoji[tag] || '•'

    menu += `

${tEmoji} ${tag.toUpperCase()}
────────────────────`

    for (const cmd of categories[tag]) {
      menu += `\n${cEmoji} .${cmd}`
    }

    menu += `
┄┄┄┄┄┄┄┄┄┄┄┄┄┄`
  }

  menu += `

ChappieBot
`

  await sock.sendMessage(
    from,
    { text: menu },
    { quoted: m }
  )
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = false

export default handler

function getGreeting () {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
      }
