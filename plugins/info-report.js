global.cooldownReport = global.cooldownReport || {}

export const handler = async (m, { sock, from, sender, pushName, args, reply }) => {

  if (!args.length) {
    return reply('⚠️ ESCRIBE TU REPORTE\n\nEJEMPLO:\n.reporte EL BOT NO FUNCIONA')
  }

  const now = Date.now()
  const cooldown = 60000 // 60 segundos
  const last = global.cooldownReport[sender] || 0

  if (now - last < cooldown) {
    return reply('⏳ ESPERA UN MOMENTO ANTES DE ENVIAR OTRO REPORTE')
  }

  global.cooldownReport[sender] = now

  const texto = args.join(' ')

  // 📌 OWNER
  const ownerNumbers = global.config.owner?.numbers || []

  if (!ownerNumbers.length) {
    return reply('❌ NO HAY OWNER CONFIGURADO')
  }

  // 📍 INFO
  const userTag = `@${sender.split('@')[0]}`
  const isGroup = from.endsWith('@g.us')

  let groupName = 'CHAT PRIVADO'

  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      groupName = metadata.subject
    } catch {}
  }

  // 🕒 HORA
  const hora = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City'
  })

  // ✍️ REACCIÓN
  await sock.sendMessage(from, { react: { text: '📩', key: m.key } })

  // 📄 MENSAJE
  const reportMsg = `
╭━━━〔 🚨 REPORTE 〕━━━⬣
┃
┃ 👤 USUARIO: ${pushName}
┃ 🔢 NÚMERO: ${userTag}
┃ 📍 CHAT: ${groupName}
┃ 🕒 HORA: ${hora}
┃
┃ 📝 MENSAJE:
┃ ${texto}
┃
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  // 📤 ENVIAR A OWNERS
  for (let number of ownerNumbers) {
    const jid = number + '@s.whatsapp.net'

    await sock.sendMessage(jid, {
      text: reportMsg,
      mentions: [sender]
    })
  }

  // ✅ CONFIRMACIÓN
  await reply('✅ TU REPORTE FUE ENVIADO AL OWNER')
}

handler.command = ['reporte']
handler.tags = ['info']
handler.menu = true

export default handler
