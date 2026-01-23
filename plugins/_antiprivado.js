// plugins/_antiprivado.js
export async function before(m, { sock, isOwner, isROwner }) {
  try {
    if (!m) return true                // ❌ Ignorar si m es null
    if (!m.key) return true            // ❌ Ignorar si no tiene key
    if (!m.message) return true        // ❌ Ignorar si no tiene mensaje

    // 🚫 Ignorar mensajes del bot
    if (m.key.fromMe) return true

    // 🚫 Ignorar mensajes de grupos
    if (m.key.remoteJid?.endsWith('@g.us')) return false

    // 🔹 Obtener configuración del bot
    const botSettings = global.db.data?.settings?.[sock.user?.id] || {}
    const antiPrivate = botSettings.antiPrivate || false

    // 🔹 Si antiPrivate está activo y no es owner ni root owner
    if (antiPrivate && !isOwner && !isROwner) {
      const senderJid = m.key.remoteJid
      if (!senderJid) return true

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
