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

  // 🔥 MENÚ AUTOMÁTICO
  if (!args.length) {

    // 🧠 DETECCIÓN
    let sent = false

    // ───── 1. INTENTO PREMIUM ─────
    try {
      const msg = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: '🚨 *SISTEMA DE REPORTES*\n\nSelecciona una opción:'
              },
              footer: {
                text: 'ChappieBot'
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "❌ Menú no sirve",
                      id: ".reporte El menú no sirve"
                    })
                  },
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🎵 Play no funciona",
                      id: ".reporte Play no funciona"
                    })
                  },
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🖼️ Stickers no funcionan",
                      id: ".reporte Sticker no funciona"
                    })
                  },
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "✏️ Otro",
                      id: ".reporte otro"
                    })
                  }
                ]
              }
            }
          }
        }
      }

      await sock.relayMessage(from, msg, {})
      sent = true
    } catch {}

    // ───── 2. BOTONES NORMALES ─────
    if (!sent) {
      try {
        await sock.sendMessage(from, {
          text: `🚨 *SISTEMA DE REPORTES*\n\nSelecciona una opción:`,
          footer: 'ChappieBot',
          buttons: [
            { buttonId: '.reporte El menú no sirve', buttonText: { displayText: '❌ Menú no sirve' }, type: 1 },
            { buttonId: '.reporte Play no funciona', buttonText: { displayText: '🎵 Play no funciona' }, type: 1 },
            { buttonId: '.reporte Sticker no funciona', buttonText: { displayText: '🖼️ Stickers no sirven' }, type: 1 },
            { buttonId: '.reporte otro', buttonText: { displayText: '✏️ Otro' }, type: 1 }
          ],
          headerType: 1
        }, { quoted: m })

        sent = true
      } catch {}
    }

    // ───── 3. TEXTO (SI TODO FALLA) ─────
    if (!sent) {
      global.reportReply[sender] = false

      return reply(
`🚨 *SISTEMA DE REPORTES*

Responde con el número:

1️⃣ Menú no sirve  
2️⃣ Play no funciona  
3️⃣ Stickers no funcionan  
4️⃣ Otro`
      )
    }

    return
  }

  // 🔥 PROCESAR OPCIONES
  let texto = args.join(' ').toLowerCase()

  if (texto === '1') texto = 'Menú no sirve'
  else if (texto === '2') texto = 'Play no funciona'
  else if (texto === '3') texto = 'Stickers no funcionan'

  // 🔥 OPCIÓN OTRO
  if (texto === '4' || texto === 'otro') {
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

  // 📌 OWNER
  const ownerNumbers = global.config.owner?.numbers || []
  if (!ownerNumbers.length) return reply('❌ NO HAY OWNER CONFIGURADO')

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

  const hora = new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City'
  })

  await sock.sendMessage(from, {
    react: { text: '📩', key: m.key }
  })

  const reportMsg = `
╭━━━〔 🚨 REPORTE 〕━━━⬣
┃ 👤 USUARIO: ${pushName}
┃ 🔢 NÚMERO: ${userTag}
┃ 📍 CHAT: ${groupName}
┃ 🔗 LINK: ${groupLink}
┃ 🕒 HORA: ${hora}
┃
┃ 📝 MENSAJE:
┃ ${texto}
╰━━━━━━━━━━━━━━━━⬣
`.trim()

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
