// owner-reiniciar.js
export const handler = async (m, { sock, reply, owner, sender }) => {
  const owners = global.config.owner?.numbers || []
  const senderNum = sender.split('@')[0]

  if (!owners.includes(senderNum)) {
    return reply('❌ Este comando es solo para el OWNER')
  }

  await sock.sendMessage(m.key.remoteJid, {
    react: { text: '🔄', key: m.key }
  })

  reply('♻️ Reiniciando ChappieBot...')

  // ❗ Esto detiene el proceso
  process.exit(0)
}

handler.command = ['reiniciar']
handler.tags = ['owner']
handler.owner = true
handler.group = false
handler.menu = true

export default handler
