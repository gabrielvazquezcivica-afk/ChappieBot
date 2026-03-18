let handler = async (m, { conn }) => {

let menu = `
🎧 *MENÚ DE AUDIOS - CHAPPIEBOT*

Activa con:
*.audios on*

Desactiva con:
*.audios off*

📀 LISTA COMPLETA:

• bueno master
• tralalero tralala
• mudo
• maldito teni
• chambear
• conoces a miguel
• usted es feo
• como estan
• poco de gente
• viva el sexo
• juicioso
• tarado
• donde esta
• q onda
• bebesita
• tka
• takataka
• hey
• joder
• siuuu
• amongos
• teamo
• estoy triste
• un pato
• fiesta viernes
• wtf
• yokese
• vete a la vrg
• temazo
• :v
• freefire
• orale
• contexto
• pikachu
• pokemon
• rawr
• cagaste
• yoshi
• yamete
• FBI
• motivacion

⚡ Usa el texto EXACTO para activar el audio
`

await conn.sendMessage(m.chat, { text: menu }, { quoted: m })
}

handler.command = ['menu2']
handler.tags = ['info']

export default handler
