export const handler = async (m, { sock, from, sender, isGroup, isOwner, reply }) => {

if (!isGroup) {
  return reply('⚠️ Este comando solo funciona en grupos')
}

// 🔒 Solo owner
if (!isOwner) {
  return reply('👑 Este comando solo puede usarlo el *OWNER del bot*')
}

try {

await sock.sendMessage(from,{
text:
`╭─❖ 「 👑 ORDEN DEL OWNER 」 ❖─╮
│ ⚠️ Procediendo a quitar admin...
│ 
│ A veces hasta el creador
│ necesita descansar del poder 😌
╰────────────────`
},{ quoted:m })

// quitar admin al owner
await sock.groupParticipantsUpdate(from, [sender], 'demote')

// mensaje final
await sock.sendMessage(from,{
text:
`╭─❖ 「 🤖 CHAPPIEBOT 」 ❖─╮
│ ✅ Admin removido correctamente
│ 
│ 👤 Usuario: @${sender.split('@')[0]}
│ 
│ El poder ha sido entregado
│ al destino del grupo ✨
╰────────────────`,
mentions:[sender]

},{ quoted:m })

} catch (e) {

console.log('DEMOTE OWNER ERROR:', e)
reply('❌ No pude quitar el admin')

}

}

handler.command = ['quitaradmin']
handler.tags = ['owner']
handler.help = ['quitaradmin']
handler.group = true
handler.menu = true
handler.owner = true

export default handler
