import fs from 'fs'
import { spawn } from 'child_process'
import path from 'path'

export const handler = async (m, { sock, from, sender, isOwner, reply }) => {
  if (!isOwner) return reply('⚠️ Solo el owner puede usar este comando')

  // ⏳ Aviso de reinicio
  await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })
  await reply('🔄 Reiniciando ChappieBot...')

  // ───── Ejecutar reinicio ─────
  try {
    const scriptPath = path.resolve('./start.sh')
    if (!fs.existsSync(scriptPath)) {
      return reply('❌ No encontré el archivo start.sh para reiniciar')
    }

    // Ejecuta el script en background
    spawn('sh', [scriptPath], {
      detached: true,
      stdio: 'ignore'
    }).unref()

    // Reacción de reiniciado
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('REINICIAR ERROR:', e)
    return reply('❌ Error al reiniciar ChappieBot')
  }

  // Terminar proceso actual
  process.exit(0)
}

handler.command = ['reiniciar']
handler.tags = ['owner']
handler.owner = true
handler.group = false
handler.menu = true

export default handler
