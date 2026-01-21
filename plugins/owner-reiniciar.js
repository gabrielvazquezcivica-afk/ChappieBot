// ───── REINICIAR BOT ─────
import { exec } from 'child_process'

function onlyNumber(jid = '') {
  return typeof jid === 'string' ? jid.replace(/[^0-9]/g, '') : jid?.id?.replace(/[^0-9]/g, '')
}

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  const msgs = global.config.messages || {}

  if (!isGroup) {
    return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')
  }

  // 🔹 OWNER del bot desde config
  const owners = global.config.owner?.numbers || []
  const senderNum = onlyNumber(sender)

  if (!owners.includes(senderNum)) {
    return reply(msgs.owner || '⚠️ Este comando es solo para el propietario')
  }

  try {
    await sock.sendMessage(from, {
      text: '♻️ Reiniciando ChappieBot...'
    })

    await sock.sendMessage(from, {
      react: { text: '✅', key: m.key }
    })

    // ───── REINICIO ─────
    setTimeout(() => {
      //
      process.exit(0)
    }, 1000)

  } catch (e) {
    console.error('RESTART ERROR:', e)
    reply('❌ Error al intentar reiniciar el bot')
  }
}

handler.command = ['reiniciar']
handler.tags = ['owner']
handler.owner = true
handler.group = true
handler.menu = true

export default handler
