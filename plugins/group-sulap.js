const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export const handler = async (m, { sock, from, sender, args, reply, isGroup, isAdmin }) => {

  if (!isGroup) return reply('⚠️ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')
  if (!isAdmin) return reply('⚠️ SOLO ADMINS')

  // 🔹 REACCIÓN AL COMANDO
  await sock.sendMessage(from, {
    react: { text: '🪄', key: m.key }
  })

  let target =
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

  if (!target)
    return reply(`RESPONDE O ETIQUETA A ALGUIEN\n\nEJEMPLO:\n.sulap @usuario`)

  if (target === sender)
    return reply('NO PUEDES EXPULSARTE A TI MISMO')

  await reply("✨🎩 ¡BIENVENIDOS AL ESPECTÁCULO DE MAGIA! 🎩✨")
  await delay(2000)

  await reply("🔮 HOY HAREMOS ALGO EXTRAORDINARIO... 🔮")
  await delay(2000)

  await reply("🧙‍♂️ PREPÁRENSE... MIREN CON ATENCIÓN... 🧙‍♂️")
  await delay(2000)

  await reply("✨ SIM SALABIM... HACIENDO DESAPARECER LO INESPERADO... ✨")
  await delay(2000)

  await reply("🎩 ABRACADABRA... ALGO ASOMBROSO ESTÁ POR SUCEDER... 🎩")
  await delay(2000)

  await reply("🪄 HOCUS POCUS... LISTO PARA HACER DESAPARECER A ALGUIEN... 🪄")
  await delay(2000)

  await reply("✨ ¡PREPÁRENSE!... TODO DESAPARECERÁ EN UN INSTANTE... ✨")
  await delay(2000)

  await reply("🌟 *¡Y...!* 🌟")
  await delay(1000)

  await reply("💥 *¡PUF!* ¡ESTE MIEMBRO HA DESAPARECIDO DEL GRUPO!* 💥")
  await delay(2000)

  await sock.groupParticipantsUpdate(from, [target], 'remove')

  await sock.sendMessage(
    from,
    {
      text: `🧙‍♂️✨ SE HA EXPULSADO A @${target.split('@')[0]} DEL GRUPO`,
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.command = ['sulap']
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
