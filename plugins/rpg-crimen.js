import fs from 'fs'
import path from 'path'

const registroPath = path.resolve('./data/registro.json')
const modoadminPath = path.resolve('./data/modoadmin.json')
const COOLDOWN = 20 * 60 * 1000 // 20 minutos

// Lista de crímenes
const crimenes = [
  'Robo de cartera', 'Atraco a tienda', 'Robo de banco',
  'Fraude en línea', 'Hurto de joyas', 'Estafa telefónica',
  'Contrabando', 'Robo de moto', 'Robo de auto', 'Robo de comida'
]

// Funciones de carga/guardado
function loadJSON(file, def = {}) {
  if (!fs.existsSync(file)) return def
  try { return JSON.parse(fs.readFileSync(file)) } catch { return def }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// Generar multa aleatoria según nivel
function calcularMulta(level) {
  return Math.floor(Math.random() * 50 + level * 10)
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

  // Checar cooldown
  if (user.lastCrime && now - user.lastCrime < COOLDOWN) {
    const next = Math.ceil((COOLDOWN - (now - user.lastCrime)) / 60000)
    return reply(`⏳ Debes esperar ${next} minuto(s) antes de intentar otro crimen.`)
  }

  // Seleccionar crimen
  const crimen = crimenes[Math.floor(Math.random() * crimenes.length)]
  const exito = Math.random() < 0.7 // 70% éxito

  let msg = `🚨 Crimen: ${crimen}\n`

  if (exito) {
    const ganancia = Math.floor(Math.random() * 100 + 20)
    user.money = (user.money || 0) + ganancia
    msg += `✅ ¡Lo lograste! Ganaste ${ganancia} coins.\n💰 Saldo actual: ${user.money}`
  } else {
    const multa = calcularMulta(user.level || 1)
    if ((user.money || 0) < multa) {
      // Bloqueo x 30 min si no tiene coins suficientes
      user.lastCrime = now + 30 * 60 * 1000
      msg += `❌ Fuiste atrapado y necesitas pagar ${multa} coins, pero no tienes suficiente.\n🚫 Comando bloqueado 30 minutos.`
    } else {
      user.money -= multa
      msg += `❌ Fuiste atrapado y pagaste una multa de ${multa} coins.\n💰 Saldo actual: ${user.money}`
    }
  }

  user.lastCrime = now
  saveJSON(registroPath, registros)

  await reply(msg)
}

handler.command = ['crimen']
handler.tags = ['rpg']
handler.menu = true

export default handler
