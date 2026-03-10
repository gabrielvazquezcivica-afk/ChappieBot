import config from '../config.js'

export const handler = async (m, { sock, from, reply, isOwner }) => {

  // 🔒 SOLO OWNER
  if (!isOwner) {
    return reply(global.config.messages.owner)
  }

  try {
    const botName = sock.user?.name || 'ChappieBot'

    // ───── MENSAJE DE DESPEDIDA ─────
    const mensaje = `
╭─❖ 「 ⚡ ${botName} 」 ❖─╮
│ 👋 Hola amig@s, gracias por la diversión
│ 💫 Pero es hora de que me tome un descanso
│ 🚀 Me despido con buena vibra
│
│ 🌟 Nos vemos pronto, cuídense mucho!
╰─────────────────────────╯
───────────────────────────
> ${botName}
`.trim()

    // ───── ENVIAR MENSAJE ─────
    await sock.sendMessage(from, { text: mensaje })

    // ───── SALIR DEL GRUPO ─────
    await sock.groupLeave(from)

  } catch (e) {
    console.error('SALIR ERROR:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo.')
  }
}

handler.command = ['salir']
handler.tags = ['owner']
handler.help = ['salir']
handler.menu = true
handler.owner = true
handler.group = true

export default handler
