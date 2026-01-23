import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')
const COOLDOWN = 25 * 60 * 1000

const trabajos = [
  'Carpintero','Panadero','Programador','Doctor','Profesor',
  'Ingeniero','Policía','Bombero','Músico','Granjero',
  'Chef','Diseñador','Piloto','Cajero','Periodista'
]

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function expToNextLevel(level) {
  return 50 + level * 20
}

export const handler = async (m, { sock, sender, from, isGroup, reply }) => {
  // ───── MODO ADMIN SILENCIOSO ─────
  let groupSettings = { enabled: false }
  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {}
  }

  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {}
    if (!isAdmin) return // bloqueo silencioso
  }

  const registros = loadJSON(registroPath)
  const user = registros[sender]

  if (!user?.registered) return reply('❌ No estás registrado. Usa `.reg nombre edad`.')

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
    levelUpText = `⭐ ¡Subiste a nivel ${user.level}! Bonus: +${bonus} coins`
  }

  saveJSON(registroPath, registros)

  let msg = `💼 Trabajo: ${trabajo}\n💰 Ganaste: ${coinsGanar} coins\n✨ Exp: ${expGanar}\n⭐ Nivel: ${user.level}`
  if (levelUpText) msg += `\n${levelUpText}`

  await reply(msg)
}

handler.command = ['work']
handler.tags = ['rpg']
handler.menu = true

export default handler
