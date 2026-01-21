import { config } from '../config.js' // Ajusta la ruta si tu config está en otra carpeta

export const handler = async (m, { sock, from, reply }) => {

  const sender = m.key.participant || m.key.remoteJid

  // 🔒 SOLO OWNER según config.js
  const ownerJids = Array.isArray(config.owner) ? config.owner : [config.owner]
  if (!ownerJids.includes(sender)) {
    return reply('❌ Solo *OWNER* puede usar este comando')
  }

  // ✅ Aviso de reinicio
  await sock.sendMessage(from, {
    text: '🔄 Reiniciando *ChappieBot*...\n⏳ Espera unos segundos',
  }, { quoted: m })

  // ⏱ Pequeña espera antes de reiniciar
  setTimeout(() => {
    process.exit(0)
  }, 1500)
}

handler.command = ['reiniciar']
handler.tags = ['owner']
handler.owner = true
handler.menu = true

export default handler
