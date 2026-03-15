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
        
  // Reacción al comando        
  await sock.sendMessage(from, { react: { text: '🗣️', key: m.key } })        
        
  // ───── EMOJIS RANDOM ─────    
  const emojis = [    
    '🛸','👾','🚀','🔥','⚡','💎','🎯','🎮','🐲','😎','🤖','👑','💥','✨',    
    '🌪️','☄️','🌟','🧨','🦁','🐉','🐺','🦅','🦊','🐯','🐻‍❄️','🦂','🐍',    
    '🦖','🦕','🎲','🧠','👻','💀','🎃','🧿','🔮','🪐','🌌','🌠','⭐',    
    '🏆','🥇','🥷','🕶️','🎩','🪖','🗡️','⚔️','🛡️','🔱','🏹','💣',    
    '📣','📢','📡','🧬','🛰️','💫','🌈','🎆','🎇','🎉'    
  ]    

  // ───── MENSAJE SIMPLIFICADO ─────
  let text = `📣 INVOCANDO GRUPO 📣

GRUPO: ${metadata.subject}
MIEMBROS: ${participants.length}

ETIQUETAS 🌠
`        
        
  const mentions = []        
        
  for (const p of participants) {        
    const name = p?.notify || p?.id.split('@')[0]        
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]    
    text += `${emoji} @${name}\n`        
    mentions.push(p.id)        
  }        
        
  text += `\n> ${botName.toUpperCase()}`        
        
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
