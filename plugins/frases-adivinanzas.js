import fs from 'fs'

const adivinanzas = [
{ p:"Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.", r:"pera"},
{ p:"Oro parece, plata no es.", r:"platano"},
{ p:"Tiene dientes pero no come.", r:"peine"},
{ p:"Vuelo sin alas, lloro sin ojos.", r:"nube"},
{ p:"Sube llena y baja vacía.", r:"cuchara"},
{ p:"Tiene agujas pero no cose.", r:"reloj"},
{ p:"Cuanto más le quitas más grande es.", r:"agujero"},
{ p:"Tiene patas pero no camina.", r:"mesa"},
{ p:"Tiene ojos pero no ve.", r:"aguja"},
{ p:"Siempre cae pero nunca se lastima.", r:"lluvia"},
{ p:"Va al campo y no come.", r:"zapato"},
{ p:"Tiene boca pero no habla.", r:"rio"},
{ p:"Corre sin pies.", r:"agua"},
{ p:"Tiene corona pero no es rey.", r:"piña"},
{ p:"Mientras más seco más moja.", r:"toalla"},
{ p:"Tiene hojas pero no es árbol.", r:"libro"},
{ p:"Tiene cuello pero no cabeza.", r:"botella"},
{ p:"Vuela sin alas.", r:"tiempo"},
{ p:"Tiene llave pero no abre puerta.", r:"piano"},
{ p:"Siempre sube pero nunca baja.", r:"edad"}
]

// duplicar para pasar de 100
while(adivinanzas.length < 110){
adivinanzas.push(...adivinanzas.slice(0,10))
}

let juego = {}

export const handler = async (m,{ sock, from, sender, isGroup, isAdmin, reply }) => {

if(!isGroup) return reply('⚠️ Este juego solo funciona en grupos')

/* 🔒 MODO ADMIN */
let groupSettings = { enabled:false }
const modoadminPath = './data/modoadmin.json'

if(fs.existsSync(modoadminPath)){
const data = JSON.parse(fs.readFileSync(modoadminPath))
groupSettings = data[from] || { enabled:false }
}

if(groupSettings.enabled && !isAdmin) return

if(juego[from]){
return reply('⏳ Ya hay una adivinanza activa')
}

const rand = adivinanzas[Math.floor(Math.random()*adivinanzas.length)]

juego[from] = rand.r

await sock.sendMessage(from,{
text:
`╭─❖ 「 🧠 ADIVINANZA 」 ❖─╮
│ ❓ ${rand.p}
│
│ ⏳ Tienen *30 segundos*
│ para responder
╰────────────────`
},{ quoted:m })

setTimeout(async ()=>{

if(!juego[from]) return

await sock.sendMessage(from,{
text:
`⌛ *Tiempo terminado*

💡 Respuesta: *${rand.r}*`
})

delete juego[from]

},30000)

}

handler.command = ['adivinanza']
handler.tags = ['juegos']
handler.help = ['adivinanza']
handler.menu = true
handler.group = true

export default handler


export async function before(m,{ sock, from }){

const text = (m.message?.conversation ||
m.message?.extendedTextMessage?.text ||
'').toLowerCase()

if(!juego[from]) return

if(text === juego[from]){

const user = m.key.participant || m.key.remoteJid

await sock.sendMessage(from,{
text:
`🎉 *ADIVINANZA RESUELTA*

👤 @${user.split('@')[0]}

🏆 ¡Respuesta correcta!`,
mentions:[user]

},{ quoted:m })

delete juego[from]

}

  }
