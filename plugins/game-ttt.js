import fs from 'fs'

let ttt = {}

const emojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"]

function draw(board){
return `
${board[0]}${board[1]}${board[2]}
${board[3]}${board[4]}${board[5]}
${board[6]}${board[7]}${board[8]}
`
}

function win(b){

const wins = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
]

for(let w of wins){
if(b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]])
return true
}

return false
}

function empate(board){
return board.every(c => c === "❌" || c === "⭕")
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

/* ───── SALIR ───── */

if(args[0] === "salir"){
delete ttt[from]
return reply("❌ Juego terminado")
}

/* ───── INICIAR PARTIDA ───── */

if(m.mentionedJid && m.mentionedJid.length){

const enemy = m.mentionedJid[0]

if(enemy === sender)
return reply("⚠️ No puedes jugar contra ti mismo")

ttt[from] = {
board:[...emojis],
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

if(!game) return

const pos = parseInt(args[0]) - 1

if(isNaN(pos) || pos < 0 || pos > 8)
return reply("⚠️ Usa números del 1 al 9")

if(game.players[game.turn] !== sender)
return reply("⏳ No es tu turno")

if(game.board[pos] === "❌" || game.board[pos] === "⭕")
return reply("⚠️ Casilla ocupada")

game.board[pos] = game.turn ? "⭕" : "❌"

/* ───── GANADOR ───── */

if(win(game.board)){

await sock.sendMessage(from,{
text:`🏆 *Ganó* @${sender.split('@')[0]}

${draw(game.board)}`,
mentions:[sender]
})

delete ttt[from]
return
}

/* ───── EMPATE ───── */

if(empate(game.board)){

await sock.sendMessage(from,{
text:`🤝 *EMPATE*

${draw(game.board)}`
})

delete ttt[from]
return
}

/* ───── CAMBIAR TURNO ───── */

game.turn = game.turn ? 0 : 1

await sock.sendMessage(from,{
text:`${draw(game.board)}

Turno:
@${game.players[game.turn].split('@')[0]}`,
mentions:game.players
})

}

handler.command = ['ttt']
handler.tags = ['games']
handler.menu = true
handler.group = true

export default handler
