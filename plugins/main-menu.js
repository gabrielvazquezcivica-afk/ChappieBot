// Comandos: .menu o .help
export const command = ['menu', 'help']
export const tags = ['info']
export const description = 'Muestra todos los comandos disponibles'

export async function run(sock, m) {
  const pushName = m.pushName || 'Usuario'

  // ───── Saludo según hora ─────
  const hour = new Date().getHours()
  let greeting = 'Hola'
  if (hour >= 5 && hour < 12) greeting = 'Buenos días'
  else if (hour >= 12 && hour < 18) greeting = 'Buenas tardes'
  else greeting = 'Buenas noches'

  // ───── Emojis por tag ─────
  const tagEmojis = {
    info: 'ℹ️',
    tools: '🛠️',
    fun: '🎉',
    admin: '👑',
    owner: '👨‍💻',
  }

  // ───── Leer todos los plugins cargados ─────
  let menu = `╭━━━〔 📜 MENÚ 〕━━━╮
┃ ${greeting}, ${pushName}!
╰━━━━━━━━━━━━━━╯\n`

  // Plugins globales
  const plugins = global.plugins || []

  // Agrupar por tags
  const categories = {}
  for (const plugin of plugins) {
    const pluginTags = Array.isArray(plugin.handler.tags)
      ? plugin.handler.tags
      : [plugin.handler.tags || 'info']

    const commands = Array.isArray(plugin.handler.command)
      ? plugin.handler.command
      : [plugin.handler.command]

    for (const tag of pluginTags) {
      if (!categories[tag]) categories[tag] = []
      for (const cmd of commands) {
        categories[tag].push(cmd)
      }
    }
  }

  // Construir menú
  for (const tag in categories) {
    const tagEmoji = tagEmojis[tag] || '❔'
    menu += `\n╔══〔 ${tagEmoji} ${tag.toUpperCase()} 〕══╗\n`
    for (const cmd of categories[tag]) {
      menu += `║ 🧿 .${cmd}\n`
    }
  }

  menu += '\n╰━━━━━━━━━━━━━━╯'

  // ───── Enviar menú ─────
  await sock.sendMessage(
    m.key.remoteJid,
    { text: menu },
    { quoted: m }
  )
}
