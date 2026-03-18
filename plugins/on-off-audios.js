let handler = async (m, { args, reply }) => {

if (!global.db) return reply('❌ Base de datos no cargada')

if (!global.db.data) global.db.data = {}
if (!global.db.data.chats) global.db.data.chats = {}

let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

if (args[0] === 'on') {
  chat.audios = true
  reply('✅ Audios activados')
} else if (args[0] === 'off') {
  chat.audios = false
  reply('❌ Audios desactivados')
} else {
  reply('⚠️ Usa:\n.audios on\n.audios off')
}
}

handler.command = ['audios']
handler.tags = ['on-off']
handler.help = ['audios on', 'audios off']
handler.menu = true

export default handler
