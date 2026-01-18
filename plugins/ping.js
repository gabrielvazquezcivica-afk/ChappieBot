export const handler = async (m, { sock, from }) => {
  await sock.sendMessage(from, {
    text: 'pong 🏓\n\n> ChappieBot'
  })
}

handler.command = ['ping']
handler.help = ['ping']
handler.tags = ['info']
handler.menu = true
