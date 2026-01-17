// plugins/menu.js
import chalk from 'chalk'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '☀️ Buenos días'
  if (hour >= 12 && hour < 19) return '🌤️ Buenas tardes'
  return '🌙 Buenas noches'
}

export const handler = async (m, { sock, from, pushName, plugins, reply }) => {
  if (!plugins || plugins.length === 0) return reply('❌ No hay plugins cargados.')

  // ⚡ Reacción al comando
  await sock.sendMessage(from, { react: { text: '⚡', key: m.key } })

  const saludo = getGreeting()
  const botName = sock.user?.name || 'ChappieBot'

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

  // Emoji por tag
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
  const cmdEmoji = '🌟' // Emoji fijo para cada comando

  // Construir menú
  let menu = `🤖 ChappieBot\n${saludo} ${pushName}\n\nTotal de comandos: ${totalCommands}\n`

  for (const [tag, cmds] of Object.entries(categories)) {
    const emoji = tagEmoji[tag] || '⬢'
    menu += `\n${emoji} ${tag.toUpperCase()}\n`
    for (const c of cmds) {
      menu += `${cmdEmoji} .${c}\n`
    }
    menu += '────────────\n'
  }

  await sock.sendMessage(
    from,
    {
      text: menu
    },
    { quoted: m }
  )
}

handler.command = ['menu', 'help', 'comandos']
handler.tags = ['info']
handler.group = false

export default handler
