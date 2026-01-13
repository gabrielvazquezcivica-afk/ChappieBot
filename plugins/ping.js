export const handler = async (m, { sock, from }) => {
  await sock.sendMessage(from, {
    text: 'pong 🏓\n\n> ChappieBot'
  })
}

handler.command = ['ping', 'p']
handler.help = ['ping']
handler.tags = ['info']
