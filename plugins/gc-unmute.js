import fs from 'fs'  
import path from 'path'  
  
const mutesFile = path.resolve('./data/mutes.json')  
  
function loadMutes() {  
  if (!fs.existsSync(mutesFile)) return {}  
  return JSON.parse(fs.readFileSync(mutesFile))  
}  
  
function saveMutes(data) {  
  fs.writeFileSync(mutesFile, JSON.stringify(data, null, 2))  
}  
  
export const handler = async (m, { sock, from, isGroup, sender, reply }) => {  
  const msgs = global.config?.messages || {}  
  
  if (!isGroup) return reply(msgs.group || '❌ Este comando solo funciona en grupos')  
  
  const metadata = await sock.groupMetadata(from)  
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)  
  
  if (!admins.includes(sender)) {  
    return reply(msgs.admin || '❌ Solo administradores pueden usar este comando')  
  }  
  
  const user =  
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||  
    m.message?.extendedTextMessage?.contextInfo?.participant  
  
  if (!user) {  
    return reply('⚠️ Menciona a un usuario o responde a su mensaje')  
  }  

  // ❌ Evitar que alguien se desmute a sí mismo  
  if (user === sender) return  

  const mutes = loadMutes()  
  if (!mutes[from] || !mutes[from].includes(user)) {  
    return reply('⚠️ Ese usuario no está silenciado')  
  }  
  
  // ✅ Desmutear  
  mutes[from] = mutes[from].filter(u => u !== user)  
  saveMutes(mutes)  
  
  // 🔊 reacción  
  await sock.sendMessage(from, {  
    react: { text: '🔊', key: m.key }  
  })  

  // 📝 Aviso que se desmuteó a alguien  
  await sock.sendMessage(from, {  
    text: `🔊 Usuario desilenciado\n\n👤 @${user.split('@')[0]}\n👮 Por: @${sender.split('@')[0]}`,  
    mentions: [user, sender]  
  }, { quoted: m })  
}  
  
handler.command = ['unmute']  
handler.tags = ['group']  
handler.group = true  
handler.admin = true  
handler.botAdmin = true  
handler.menu = true
