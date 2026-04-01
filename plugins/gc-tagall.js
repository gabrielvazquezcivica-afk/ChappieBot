export const handler = async (m, { sock, from, isGroup, reply }) => {            
  const msgs = global.config.messages || {}            
  const botName = sock.user?.name || 'ChappieBot'            
            
  if (!isGroup) return reply(msgs.group || '⚠️ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')            
            
  const metadata = await sock.groupMetadata(from)            
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id)            
            
  if (!admins.includes(m.key.participant)) {            
    return reply(msgs.admin || '⚠️ ESTE COMANDO ES SOLO PARA ADMINISTRADORES')            
  }            
            
  const participants = metadata.participants            
            
  // 🔊 AUDIO DESDE LINK (TU AUDIO)
  try {
    await sock.sendMessage(from, {
      audio: {
        url: 'https://files.catbox.moe/y0jgrt.ogg'
      },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      fileName: 'audio.ogg'
    }, { quoted: m })
  } catch (e) {
    console.log('Error audio:', e)
  }

  // 🔥 REACCIÓN
  await sock.sendMessage(from, { react: { text: '🗣️', key: m.key } })            
            
  // ───── EMOJIS ULTRA ─────        
  const emojis = [        
    '🛸','👾','🚀','🔥','⚡','💎','🎯','🎮','🐲','😎','🤖','👑','💥','✨',        
    '🌪️','☄️','🌟','🧨','🦁','🐉','🐺','🦅','🦊','🐯','🐻‍❄️','🦂','🐍',        
    '🦖','🦕','🎲','🧠','👻','💀','🎃','🧿','🔮','🪐','🌌','🌠','⭐',        
    '🏆','🥇','🥷','🕶️','🎩','🪖','🗡️','⚔️','🛡️','🔱','🏹','💣',
    '🍀','🌊','🌙','☀️','🍁','❄️','🍓','🍕','🍔','🥶','🥵','😈','👽',
    '💜','❤️','🖤','💛','💚','💙','🤍','🧡','💖','💫'
  ]        
    
  // ───── PANEL PRO ─────    
  let text = `╭━━━〔 🗣️ 𝐓𝐎𝐃𝐎𝐒 𝐏𝐀𝐍𝐄𝐋 〕━━━⬣  
┃ 👑 𝐁𝐨𝐭: ${botName}  
┃ 🏷️ 𝐆𝐫𝐮𝐩𝐨: ${metadata.subject}  
┃ 👥 𝐌𝐢𝐞𝐦𝐛𝐫𝐨𝐬: ${participants.length}  
╰━━━━━━━━━━━━━━━━⬣  

╭━━━〔 📢 𝐄𝐓𝐈𝐐𝐔𝐄𝐓𝐀𝐒 〕━━━⬣  
`            
            
  const mentions = []            
            
  for (const p of participants) {            
    const name = p?.notify || p?.id.split('@')[0]            
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]        
    text += `┃ ${emoji} @${name}\n`            
    mentions.push(p.id)            
  }            
            
  text += `╰━━━━━━━━━━━━━━━━⬣  

✨ 𝐀𝐜𝐭𝐢𝐯𝐢𝐝𝐚𝐝 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨 ✨  
💬 𝐏𝐚𝐫𝐭𝐢𝐜𝐢𝐩𝐚 𝐲 𝐧𝐨 𝐬𝐞𝐚𝐬 𝐟𝐚𝐧𝐭𝐚𝐬𝐦𝐚 👻  
🌟 𝐋𝐈𝐕𝐄 𝐀 𝐇𝐀𝐏𝐏𝐘 𝐋𝐈𝐅𝐄 🤍`            
            
  await sock.sendMessage(            
    from,            
    { text, mentions },            
    { quoted: m }            
  )            
}            
            
handler.command = ['todos']            
handler.tags = ['group']            
handler.group = true            
handler.admin = true            
handler.menu = true            
            
export default handler
