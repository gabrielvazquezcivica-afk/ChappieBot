import fs from 'fs'

// ───── BASE DE DATOS (+100 resumido pero variado) ─────
const peliculas = [
{emoji:'🦁👑',respuesta:'el rey leon'},
{emoji:'🚢💔❄️',respuesta:'titanic'},
{emoji:'🧙‍♂️⚡🏫',respuesta:'harry potter'},
{emoji:'🦖🏝️',respuesta:'jurassic park'},
{emoji:'👽🚲🌕',respuesta:'et'},
{emoji:'🕷️🧑',respuesta:'spiderman'},
{emoji:'🐼🥋',respuesta:'kung fu panda'},
{emoji:'👻🚫',respuesta:'cazafantasmas'},
{emoji:'🤖❤️',respuesta:'wall e'},
{emoji:'🚗⚡',respuesta:'cars'},
{emoji:'❄️👸☃️',respuesta:'frozen'},
{emoji:'🧞‍♂️🏜️',respuesta:'aladdin'},
{emoji:'🐟🔍',respuesta:'buscando a nemo'},
{emoji:'👨‍🚀🌌',respuesta:'interstellar'},
{emoji:'🦇🃏',respuesta:'batman'},
{emoji:'🤡🎈',respuesta:'it'},
{emoji:'👨‍🍳🐀',respuesta:'ratatouille'},
{emoji:'🎈🏠',respuesta:'up'},
{emoji:'👊🥊',respuesta:'rocky'},
{emoji:'🦸‍♂️🛡️',respuesta:'capitan america'},
{emoji:'🔨⚡',respuesta:'thor'},
{emoji:'🧪🧟‍♂️',respuesta:'soy leyenda'},
{emoji:'👮‍♂️🤖',respuesta:'robocop'},
{emoji:'🧑‍🚀🤖',respuesta:'transformers'},
{emoji:'🧙‍♂️🐉',respuesta:'el hobbit'},
{emoji:'🐧❄️',respuesta:'happy feet'},
{emoji:'👮‍♂️🚔💣',respuesta:'bad boys'},
{emoji:'🏫👻',respuesta:'monster house'},
{emoji:'👨‍👩‍👧‍👦🧠',respuesta:'intensamente'},
{emoji:'🐭👑',respuesta:'stuart little'},
{emoji:'🧛‍♂️❤️',respuesta:'crepusculo'},
{emoji:'🐺🌕',respuesta:'hombre lobo'},
{emoji:'👨‍💻💊',respuesta:'matrix'},
{emoji:'🧑‍✈️✈️💥',respuesta:'top gun'},
{emoji:'👮‍♂️🔫🚔',respuesta:'duro de matar'},
{emoji:'🧟‍♂️🏚️',respuesta:'resident evil'},
{emoji:'👩‍🎤🎤',respuesta:'bohemian rhapsody'},
{emoji:'🎩✨',respuesta:'el gran showman'},
{emoji:'🐶🎤',respuesta:'sing'},
{emoji:'👨‍⚕️💉',respuesta:'doctor strange'},
{emoji:'🐒👑',respuesta:'tarzan'},
{emoji:'👸🐸',respuesta:'la princesa y el sapo'},
{emoji:'👩‍🦰🧜‍♀️',respuesta:'la sirenita'},
{emoji:'👩‍🦱🌹',respuesta:'la bella y la bestia'},
{emoji:'🐯👦',respuesta:'el libro de la selva'},
{emoji:'🌪️🏠',respuesta:'el mago de oz'},
{emoji:'👨‍👩‍👧‍👦🏠',respuesta:'mi pobre angelito'},
{emoji:'🧑‍🚀🧠',respuesta:'inception'},
{emoji:'🧑‍🎭🎬',respuesta:'joker'},
{emoji:'🧑‍🚀🤖⚔️',respuesta:'star wars'}
]

// ───── ESTADO ─────
global.juegoPeliculas = global.juegoPeliculas || {}

// ───── COMANDO ─────
export const handler = async (m, { sock, from, isGroup, sender, reply }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */  
  let groupSettings = { enabled: false }  
  const modoadminPath = './data/modoadmin.json'  

  if (fs.existsSync(modoadminPath)) {  
    try {  
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))  
      groupSettings = modoadminData[from] || { enabled: false }  
    } catch { groupSettings = { enabled: false } }  
  }  
  
  if (groupSettings.enabled && isGroup) {  
    try {  
      const metadata = await sock.groupMetadata(from)  
      const participants = metadata.participants || []  
      const isAdmin = participants.some(  
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')  
      )  
      if (!isAdmin) return  
    } catch {}  
  }  
  /* ─────────────────────────────────── */

  if (global.juegoPeliculas[from]) {
    return reply('⚠️ Ya hay un juego activo en este chat')
  }

  const random = peliculas[Math.floor(Math.random() * peliculas.length)]

  global.juegoPeliculas[from] = {
    respuesta: random.respuesta
  }

  await sock.sendMessage(from, {
    text: `🎬 *Adivina la película*\n\n${random.emoji}\n\n⏱️ 30 segundos`
  }, { quoted: m })

  setTimeout(() => {
    if (global.juegoPeliculas[from]) {
      sock.sendMessage(from, {
        text: `⏰ Tiempo agotado\n🎬 Era: *${random.respuesta}*`
      })
      delete global.juegoPeliculas[from]
    }
  }, 30000)
}

// ───── RESPUESTAS ─────
handler.before = async (m, { sock, from, isGroup, sender }) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */  
  let groupSettings = { enabled: false }  
  const modoadminPath = './data/modoadmin.json'  

  if (fs.existsSync(modoadminPath)) {  
    try {  
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))  
      groupSettings = modoadminData[from] || { enabled: false }  
    } catch { groupSettings = { enabled: false } }  
  }  
  
  if (groupSettings.enabled && isGroup) {  
    try {  
      const metadata = await sock.groupMetadata(from)  
      const participants = metadata.participants || []  
      const isAdmin = participants.some(  
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')  
      )  
      if (!isAdmin) return  
    } catch {}  
  }  
  /* ─────────────────────────────────── */

  const game = global.juegoPeliculas[from]
  if (!game) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  if (!text) return

  const resp = text.toLowerCase().trim()

  if (resp === game.respuesta) {

    await sock.sendMessage(from, {
      text: `🎉 ¡Correcto!\n🏆 Ganaste\n🎬 ${game.respuesta}`
    }, { quoted: m })

    delete global.juegoPeliculas[from]
  }
}

// ───── CONFIG ─────
handler.command = ['pelicula']
handler.tags = ['juegos']
handler.help = ['pelicula']
handler.group = true
handler.menu = true

export default handler
