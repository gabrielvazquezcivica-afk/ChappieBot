import config from '../config.js'

function onlyNumber(jid = '') {
  return jid?.toString().replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, reply }) => {
  // ───── DETERMINAR QUIÉN USA EL COMANDO ─────
  const senderJid = m.key?.participant || m.sender
  const senderNum = onlyNumber(senderJid)
  const ownerNums = config.owner.numbers.map(n => onlyNumber(n))

  if (!ownerNums.includes(senderNum)) {
    return reply('🚫 Solo el OWNER del bot puede usar este comando.')
  }

  try {
    // ───── MENSAJE ESTILO FUTURISTA ─────
    const botName = sock.user?.name || 'ChappieBot'
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
    console.error('ERROR al salir del grupo:', e)
    reply('❌ Ocurrió un error al intentar salir del grupo.')
  }
}

handler.command = ['salir']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
