const sistema = (titulo = 'CHAPPIE BOT') => ({
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast'
  },
  message: {
    orderMessage: {
      itemCount: 1,
      message: titulo,
      footerText: 'ChappieBot',
      surface: 2,
      sellerJid: '0@s.whatsapp.net'
    }
  }
})

export const handler = async (m, { sock, from }) => {

await sock.sendMessage(from,{
text:
`╭─❖ 「 👑 OWNER 」 ❖─╮
│ 👤 Nombre: SoyGabo
│ 📸 IG: gabriel_cv_89
│ 📱 Tel: +1 (365) 298-0907
╰────────────────

🤖 Bot: ChappieBot`
},{ quoted: sistema('👑 OWNER INFO') })

}

handler.command = ['owner','creador']
handler.tags = ['info']
handler.help = ['owner']
handler.menu = true

export default handler
