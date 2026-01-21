export const handler = async (m, {
  sock,
  from,
  owner,
  reply
}) => {

  // 📌 obtener sender
  const sender = m.key.participant || m.key.remoteJid
  const ownerJids = owner?.jid || []

  // 🔒 SOLO OWNER
  if (!ownerJids.includes(sender)) return

  await sock.sendMessage(from, {
    text: '🔄 Reiniciando *ChappieBot*...\n⏳ Espera unos segundos'
  }, { quoted: m })

  // ⏱️ pequeño delay para enviar el mensaje
  setTimeout(() => {
    process.exit(0)
  }, 1500)
}

handler.command = ['restart']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
