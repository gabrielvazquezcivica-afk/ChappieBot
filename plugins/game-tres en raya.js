import fs from 'fs'

let ttt = {}

const emojis = {
1:"1️⃣",
2:"2️⃣",
3:"3️⃣",
4:"4️⃣",
5:"5️⃣",
6:"6️⃣",
7:"7️⃣",
8:"8️⃣",
9:"9️⃣"
}

function draw(board){
return `
${board[0]}${board[1]}${board[2]}
${board[3]}${board[4]}${board[5]}
${board[6]}${board[7]}${board[8]}
`
}

function win(b){

const w = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
]

for (let i of w){
if(b[i[0]]==b[i[1]] && b[i[1]]==b[i[2]]) return true
}

return false
}

export const handler = async (m,{
sock,
from,
sender,
args,
reply,
isGroup
})=>{

/* ───── MODO ADMIN ───── */

let groupSettings = { enabled:false }
const modoadminPath = './data/modoadmin.json'

if(fs.existsSync(modoadminPath)){
const data = JSON.parse(fs.readFileSync(modoadminPath))
groupSettings = data[from] || { enabled:false }
}

if(groupSettings.enabled && isGroup){

let isAdmin = false

try{
const metadata = await sock.groupMetadata(from)

isAdmin = metadata.participants.some(
p => p.id === sender &&
(p.admin === 'admin' || p.admin === 'superadmin')
)

}catch{}

if(!isAdmin) return
}

/* ───────────────── */

if(!args[0] && !m.mentionedJid?.length){
return reply("🎮 Usa:\n.ttt @usuario")
}

/* ───── SALIR ───── */

if(args[0] === "salir"){
delete ttt[from]
return reply("❌ Juego terminado")
}

/* ───── INICIAR ───── */

if(m.mentionedJid?.length){

const enemy = m.mentionedJid[0]

ttt[from] = {
board:[
emojis[1],emojis[2],emojis[3],
emojis[4],emojis[5],emojis[6],
emojis[7],emojis[8],emojis[9]
],
players:[sender,enemy],
turn:0
}

return sock.sendMessage(from,{
text:`🎮 *TRES EN RAYA*

❌ @${sender.split('@')[0]}
⭕ @${enemy.split('@')[0]}

Turno:
@${sender.split('@')[0]}

${draw(ttt[from].board)}`,
mentions:[sender,enemy]
})
}

/* ───── JUGAR ───── */

const game = ttt[from]

if(!game) return reply("⚠️ No hay partida activa")

const pos = parseInt(args[0]) - 1

if(isNaN(pos) || pos < 0 || pos > 8)
return reply("⚠️ Usa un número del 1 al 9")

if(game.players[game.turn] !== sender)
return reply("⏳ No es tu turno")

if(game.board[pos] === "❌" || game.board[pos] === "⭕")
return reply("⚠️ Casilla ocupada")

game.board[pos] = game.turn ? "⭕" : "❌"

if(win(game.board)){

await sock.sendMessage(from,{
text:`🏆 Ganó @${sender.split('@')[0]}

${draw(game.board)}`,
mentions:[sender]
})

delete ttt[from]
return
}

game.turn = game.turn ? 0 : 1

await sock.sendMessage(from,{
text:`${draw(game.board)}

Turno:
@${game.players[game.turn].split('@')[0]}`,
mentions:[game.players[0],game.players[1]]
})

}

handler.command = ['ttt']
handler.tags = ['game']
handler.menu = true
handler.group = true

export default handler
