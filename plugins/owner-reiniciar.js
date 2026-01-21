export const handler = async (m, { sock, from, sender, reply }) => {
  const owners = global.config.owner?.numbers || []
  const onlyNumber = jid => jid.replace(/[^0-9]/g, '')
  if (!owners.includes(onlyNumber(sender))) {
    return reply('❌ Solo el OWNER puede usar este comando')
  }

  await sock.sendMessage(from, { text: '♻️ Reiniciando ChappieBot…' })
  process.exit(0) // Sale para que start.sh lo reinicie
}

handler.command = ['reiniciar']
handler.owner = true
handler.group = false
handler.menu = true

export default handler
