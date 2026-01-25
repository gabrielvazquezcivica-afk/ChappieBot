import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const COOLDOWN = 25 * 60 * 1000 // 25 min

const enemigos = [
  'Goblin', 'Orco', 'Banda de ladrones', 'Lobo feroz', 'Fantasma'
]

function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export const handler = async (m, { reply, sender, from, isGroup, sock }) => {
  // ───── MODO ADMIN SILENCIOSO ─────
  const modoadminPath = './data/modoadmin.json'
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
    if (!isAdmin) return
  }

  const registros = loadJSON(registroPath)
  const user = registros[sender]
  if (!user?.registered) return reply('❌ No estás registrado. Usa `.reg nombre edad`.')

  const now = Date.now()
  if (user.lastFight && now - user.lastFight < COOLDOWN) {
    const next = Math.ceil((COOLDOWN - (now - user.lastFight))/60000)
    return reply(`⏳ Debes esperar ${next} minuto(s) antes de pelear de nuevo.`)
  }

  const enemigo = enemigos[Math.floor(Math.random() * enemigos.length)]
  const exito = Math.random() < 0.6

  let msg = `⚔️ Te enfrentaste a un ${enemigo}\n`
  if (exito) {
    const expGanada = Math.floor(Math.random() * 30 + 20)
    const coinsGanados = Math.floor(Math.random() * 80 + 30)
    user.exp = (user.exp || 0) + expGanada
    user.money = (user.money || 0) + coinsGanados
    msg += `✅ Ganaste la pelea!\n✨ EXP: ${expGanada}\n💰 Coins: ${coinsGanados}\n💰 Saldo actual: ${user.money}`
  } else {
    const coinsPerdidos = Math.min(user.money || 0, Math.floor(Math.random() * 50 + 10))
    user.money = (user.money || 0) - coinsPerdidos
    msg += `❌ Perdiste la pelea!\n💸 Perdiste ${coinsPerdidos} coins\n💰 Saldo actual: ${user.money}`
  }

  user.lastFight = now
  saveJSON(registroPath, registros)
  reply(msg)
}

handler.command = ['pelear']
handler.tags = ['rpg']
handler.menu = true

export default handler
