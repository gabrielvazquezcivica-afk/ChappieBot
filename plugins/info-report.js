global.cooldownReport = global.cooldownReport || {}
global.reportReply = global.reportReply || {}

export const handler = async (m, { sock, from, sender, pushName, args, reply }) => {

  const textMsg =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const ctx = m.message?.extendedTextMessage?.contextInfo

  // 🔥 RESPUESTA A "OTRO"
  if (ctx?.quotedMessage && global.reportReply[sender]) {
    if (!textMsg) return reply('⚠️ Escribe tu problema')
    args = [textMsg]
  }

  // 🔥 MENÚ PREMIUM EN FORMATO DE LISTA (CORREGIDO)
  if (!args.length) {

    // Estructura compatible con la mayoría de versiones de Baileys
    const msg = {
      text: '🚨 *SISTEMA DE REPORTES PREMIUM*\n\nSelecciona una opción de la lista:',
      footer: 'ChappieBot',
      // 📌 Usamos "interactive" en lugar de viewOnceMessage para mayor compatibilidad
      interactive: {
        type: "list_reply",
        nativeFlowMessage: {
          buttons: [
            {
              name: "list_reply",
              buttonParamsJson: JSON.stringify({
                title: "📋 Opciones de Reporte",
                sections: [
                  {
                    title: "Elige el tipo de problema",
                    rows: [
                      {
                        title: "❌ Menú no sirve",
                        id: ".reporte El menú no sirve"
                      },
                      {
                        title: "🎵 Play no funciona",
                        id: ".reporte Play no funciona"
                      },
                      {
                        title: "🖼️ Stickers no funcionan",
                        id: ".reporte Sticker no funciona"
                      },
                      {
                        title: "✏️ Otro",
                        id: ".reporte otro"
                      }
                    ]
                  }
                ]
              })
            }
          ]
        }
      }
    }

    // 📤 Enviamos el mensaje con el método correcto
    return await sock.sendMessage(from, msg, { quoted: m })
  }

  // 🔥 OPCIÓN OTRO
  if (args.join(' ').toLowerCase() === 'otro') {

    global.reportReply[sender] = true

    return reply(
`✏️ *MODO REPORTE PERSONALIZADO*

📌 Responde a ESTE mensaje con tu problema`
    )
  }

  // 🔒 COOLDOWN
  const now = Date.now()
  const cooldown = 60000
  const last = global.cooldownReport[sender] || 0

  if (now - last < cooldown) {
    return reply('⏳ ESPERA ANTES DE ENVIAR OTRO REPORTE')
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
  await sock.sendMessage(from, {
    react: { text: '📩', key: m.key }
  })

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

  await reply('✅ TU REPORTE FUE ENVIADO AL OWNER')
}

handler.command = ['reporte']
handler.tags = ['info']
handler.menu = true

export default handler
        
