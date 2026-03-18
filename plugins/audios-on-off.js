let handler = async (m, { text }) => {
  let chat = global.db.data.chats[m.chat]

  if (!text) return m.reply('Usa: .audios on / off')

  if (text == 'on') {
    chat.audios = true
    m.reply('✅ Audios activados')
  } else if (text == 'off') {
    chat.audios = false
    m.reply('❌ Audios desactivados')
  }
}

handler.command = ['audios']
handler.tags = ['on-off']

export default handler
