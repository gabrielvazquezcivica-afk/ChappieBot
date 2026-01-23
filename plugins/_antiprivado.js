// plugins/antiPrivate.js
export async function before(m, { sock, isAdmin, isBotAdmin, isOwner, isROwner }) {
  try {
    // 🚫 Ignorar mensajes del bot
    if (m.key?.fromMe) return true
    // 🚫 Ignorar mensajes de grupos
    if (m.key.remoteJid.endsWith('@g.us')) return false
    // 🚫 Ignorar mensajes vacíos
    if (!m.message) return true

    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const checkWords = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot']

    if (checkWords.some(w => text.includes(w))) return true

    // 🔹 Obtener configuración del bot
    const botSettings = global.db.data?.settings?.[sock.user.id] || {}
    const antiPrivate = botSettings.antiPrivate || false

    // 🔹 Si antiPrivate está activo y no es owner ni root owner
    if (antiPrivate && !isOwner && !isROwner) {
      const senderJid = m.key.remoteJid
      const senderNum = m.key.participant || senderJid
      const mention = senderNum.split('@')[0]

      // Mensaje de advertencia
      await sock.sendMessage(senderJid, {
        text: `⚠️ Hola @${mention}, no está permitido enviarme mensajes privados.\nPor favor, utiliza los grupos para interactuar conmigo.`,
        mentions: [senderJid]
      })

      // Bloquear contacto automáticamente
      await sock.updateBlockStatus(senderJid, 'block')
    }

    return false
  } catch (e) {
    console.error('❌ Error en before antiPrivate:', e)
    return false
  }
}
