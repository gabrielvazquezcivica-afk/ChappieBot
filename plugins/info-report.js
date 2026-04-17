global.cooldownReport = global.cooldownReport || {}
global.reportReply = global.reportReply || {}

export const handler = async (m, { sock, from, sender, pushName, args, reply }) => {

  const ctx = m.message?.extendedTextMessage?.contextInfo

  // 🔥 SI RESPONDE AL MENSAJE DEL BOT (MODO OTRO)
  if (ctx?.quotedMessage && global.reportReply[sender]) {
    args = [m.message?.conversation || m.message?.extendedTextMessage?.text || '']
  }

  // 🔥 SI NO PONE TEXTO → MOSTRAR MENÚ
  if (!args.length) {

    const sections = [
      {
        title: '📋 Selecciona el problema',
        rows: [
          { title: '❌ El menú no sirve', rowId: '.reporte El menú no sirve' },
          { title: '🎵 Play no funciona', rowId: '.reporte Play no funciona' },
          { title: '🖼️ Creador de stickers no funciona', rowId: '.reporte Sticker no funciona' },
          { title: '✏️ Otro', rowId: '.reporte otro' }
        ]
      }
    ]

    return await sock.sendMessage(from, {
      text: '📩 Selecciona una opción para reportar',
      footer: 'ChappieBot',
      title: '🚨 SISTEMA DE REPORTES',
      buttonText: 'Seleccionar',
      sections
    }, { quoted: m })
  }

  // 🔥 SI ELIGE "OTRO"
  if (args.join(' ').toLowerCase() === 'otro') {

    global.reportReply[sender] = true

    return reply(
`✏️ *MODO REPORTE PERSONALIZADO*

📌 Responde a ESTE mensaje con tu problema

Ejemplo:
> El bot no responde bien`
    )
  }

  // 🔒 COOLDOWN
  const now = Date.now()
  const cooldown = 60000
  const last = global.cooldownReport[sender] || 0

  if (now - last < cooldown) {
    return reply('⏳ ESPERA UN MOMENTO ANTES DE ENVIAR OTRO REPORTE')
  }

  global.cooldownReport[sender] = now
  delete global.reportReply[sender]

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
  let groupLink = 'NO APLICA'

  if (isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      groupName = metadata.subject

      const code = await sock.groupInviteCode(from)
      groupLink = `https://chat.whatsapp.com/${code}`

    } catch {
      groupLink = 'NO SE PUDO OBTENER'
    }
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
┃ 🔗 LINK: ${groupLink}
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
