import fs from 'fs'

const mascotasPath = './data/mascotas.json'
const registroPath = './data/registro.json'
const modoadminPath = './data/modoadmin.json'

// ───── LOADERS ─────
function loadJSON(path) {
  if (!fs.existsSync(path)) return {}
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch {
    return {}
  }
}

function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

const COOLDOWN = 20 * 60 * 1000 // 20 minutos

export const handler = async (m, { sock, from, isGroup, sender, reply }) => {

  if (!isGroup) return reply('🐾 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }

  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (groupSettings.enabled) {
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
  /* ─────────────────────────────────── */

  const mascotasData = loadJSON(mascotasPath)
  const registroData = loadJSON(registroPath)

  const user = registroData[sender]
  if (!user?.registered) {
    return reply(
`╭─〔 ❌ NO REGISTRADO 〕
│ Usa primero:
│ .reg nombre edad
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  const mascota = mascotasData[from]

  if (!mascota) {
    return reply('🐾 Este grupo no tiene mascota, compra una primero')
  }

  // 🧑‍🌾 Solo el dueño puede alimentar
  if (mascota.owner !== sender) {
    return reply('❌ Solo el dueño de la mascota puede alimentarla')
  }

  const now = Date.now()

  // ⛔ Si murió por tiempo
  if (mascota.lastFeed && now - mascota.lastFeed > COOLDOWN) {
    delete mascotasData[from] // 🗑️ BORRAR MASCOTA DEL GRUPO
    saveJSON(mascotasPath, mascotasData)

    return reply(
`💀 La mascota ${mascota.name} murió de hambre...

❌ No fue alimentada en 20 minutos
🐾 La mascota fue eliminada del grupo
🛒 Deben comprar otra mascota`
    )
  }

  // 🍗 Alimentar
  mascota.lastFeed = now

  saveJSON(mascotasPath, mascotasData)

  await sock.sendMessage(from, { react: { text: '🍗', key: m.key } })

  reply(
`🐾 Mascota alimentada

🍖 ${mascota.name} comió feliz
⏰ Próxima comida en 20 minutos
❤️ Sigue con vida`
  )
}

handler.command = ['alimentar']
handler.tags = ['rpg']
handler.menu = true
handler.group = true

export default handler
