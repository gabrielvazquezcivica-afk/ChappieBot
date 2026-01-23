import fs from 'fs'
import path from 'path'
import Canvas from 'canvas'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')
const COOLDOWN = 25 * 60 * 1000 // 25 minutos

// ───── HELPERS ─────
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return def
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function expToNextLevel(level) {
  return 50 + level * 20
}

// Trabajos aleatorios
const trabajos = [
  'Carpintero','Panadero','Programador','Doctor','Profesor',
  'Ingeniero','Policía','Bombero','Músico','Granjero',
  'Chef','Diseñador','Piloto','Cajero','Periodista'
]

// ───── CREAR IMAGEN RPG ─────
async function generarImagen(user, trabajo, coinsGanar, expGanar, levelUpText) {
  const width = 600, height = 300
  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1e1e2f'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#fff'
  ctx.font = '28px Sans'
  ctx.fillText(`💼 Trabajo: ${trabajo}`, 20, 50)

  ctx.font = '22px Sans'
  ctx.fillText(`💰 Coins: ${user.money} (+${coinsGanar})`, 20, 90)
  ctx.fillText(`✨ Exp: ${user.exp} (+${expGanar})`, 20, 130)
  ctx.fillText(`⭐ Nivel: ${user.level}`, 20, 170)

  const expNext = expToNextLevel(user.level)
  const barWidth = 400
  const barHeight = 25
  const progress = Math.min(user.exp / expNext, 1)

  ctx.fillStyle = '#555'
  ctx.fillRect(20, 200, barWidth, barHeight)
  ctx.fillStyle = '#00ff99'
  ctx.fillRect(20, 200, barWidth * progress, barHeight)

  ctx.fillStyle = '#fff'
  ctx.font = '18px Sans'
  ctx.fillText(`${user.exp}/${expNext} EXP`, 220, 218)

  if (levelUpText) {
    ctx.fillStyle = '#ffcc00'
    ctx.font = '20px Sans'
    ctx.fillText(levelUpText, 20, 260)
  }

  return canvas.toBuffer()
}

// ───── HANDLER ─────
export const handler = async (m, { sock, sender, from, isGroup, reply }) => {
  // ───── MODO ADMIN SILENCIOSO ─────
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  // ──────────────────────────────

  const registros = loadJSON(registroPath)
  const user = registros[sender]

  if (!user?.registered) {
    return reply('❌ No estás registrado. Usa `.reg nombre edad` primero.')
  }

  const now = Date.now()
  if (user.lastWork && now - user.lastWork < COOLDOWN) {
    const next = Math.ceil((COOLDOWN - (now - user.lastWork)) / 60000)
    return reply(`⏳ Debes esperar ${next} minuto(s) antes de volver a trabajar.`)
  }

  const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
  const coinsGanar = Math.floor(Math.random() * 50) + 10
  const expGanar = Math.floor(Math.random() * 20) + 5

  user.money = (user.money || 0) + coinsGanar
  user.exp = (user.exp || 0) + expGanar
  user.lastWork = now

  let levelUpText = ''
  const expNext = expToNextLevel(user.level)
  if (user.exp >= expNext) {
    user.level += 1
    user.exp -= expNext
    const bonus = Math.floor(user.level * 10)
    user.money += bonus
    levelUpText = `¡Subiste a nivel ${user.level}! Bonus: +${bonus} coins`
  }

  saveJSON(registroPath, registros)

  const imgBuffer = await generarImagen(user, trabajo, coinsGanar, expGanar, levelUpText)

  await sock.sendMessage(m.key.remoteJid, {
    image: imgBuffer,
    caption: '✨ Trabajo completado'
  }, { quoted: m })
}

handler.command = ['work']
handler.tags = ['rpg']
handler.menu = true

export default handler
