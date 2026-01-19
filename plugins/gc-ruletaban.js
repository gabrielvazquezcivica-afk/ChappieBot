export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  if (!isGroup) return reply('⚠️ Solo funciona en grupos')
  if (!isAdmin) return reply('⚠️ Solo administradores pueden usar este comando')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  // Excluir admins del sorteo
  const nonAdmins = participants.filter(p => !p.admin)

  if (!nonAdmins.length) return reply('⚠️ No hay miembros para ejecutar la ruleta')

  // Elegir aleatoriamente
  const victim = nonAdmins[Math.floor(Math.random() * nonAdmins.length)]

  const victimName = victim.notify || victim.id.split('@')[0]

  // Frases divertidas
  const phrases = [
    `💥 ¡BANG! @${victimName} ha perdido la ruleta rusa`,
    `🎯 Objetivo alcanzado: @${victimName} fuera del grupo`,
    `😱 @${victimName} se queda sin suerte... bye bye!`,
    `🔫 Ruleta terminada, @${victimName} fue eliminado`,
    `💀 La muerte virtual visita a @${victimName}`
  ]
  const phrase = phrases[Math.floor(Math.random() * phrases.length)]

  // Reacción
  await sock.sendMessage(from, { react: { text: '🎯', key: m.key } })

  try {
    // Expulsar usuario
    await sock.groupParticipantsUpdate(from, [victim.id], 'remove')

    // Aviso divertido
    await sock.sendMessage(from, {
      text: phrase,
      mentions: [victim.id]
    })
  } catch (e) {
    console.log('❌ Error ruletaban:', e)
    reply('❌ No pude sacar al usuario')
  }
}

handler.command = ['ruletaban']
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.menu = true

export default handler
