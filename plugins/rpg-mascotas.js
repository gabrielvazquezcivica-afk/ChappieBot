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

// 🐾 Lista de mascotas
const listaMascotas = [
  { name: '🐶 Perro guardián', price: 200 },
  { name: '🐱 Gato cazador', price: 180 },
  { name: '🦊 Zorro veloz', price: 250 },
  { name: '🐼 Panda fuerte', price: 300 },
  { name: '🐯 Tigre salvaje', price: 350 },
  { name: '🐸 Rana mágica', price: 150 },
  { name: '🐵 Mono ladrón', price: 220 },
  { name: '🦅 Águila exploradora', price: 280 },
  { name: '🐲 Dragón bebé', price: 500 },
  { name: '🐺 Lobo oscuro', price: 320 }
]

export const handler = async (m, { sock, from, args, isGroup, sender, reply }) => {

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

  // ❌ No registrado
  if (!user?.registered) {
    return reply(
`╭─〔 ❌ NO REGISTRADO 〕
│ Usa primero:
│ .reg nombre edad
╰─〔 🤖 ChappieBot RPG 〕`
    )
  }

  // 🐾 Si ya hay mascota
  if (mascotasData[from]) {
    return reply(
`🐾 Este grupo ya tiene mascota:
👉 ${mascotasData[from].name}

❌ No se pueden comprar más mascotas aquí.`
    )
  }

  // 📜 Mostrar lista
  if (!args[0]) {
    let text = `╭──〔 🐾 TIENDA DE MASCOTAS 〕──╮\n`
    listaMascotas.forEach((m, i) => {
      text += `│ ${i + 1}. ${m.name} — 💰 ${m.price} coins\n`
    })
    text += `│\n│ Usa: .mascotas <número>\n`
    text += `╰──〔 🤖 ChappieBot RPG 〕──╯`

    await sock.sendMessage(from, { react: { text: '🐾', key: m.key } })
    return reply(text)
  }

  // 🛒 Comprar
  const num = parseInt(args[0])
  if (isNaN(num) || num < 1 || num > listaMascotas.length) {
    return reply('❌ Número inválido')
  }

  const mascota = listaMascotas[num - 1]

  // 💰 Verificar coins
  if (user.money < mascota.price) {
    return reply(
`💸 No tienes suficientes coins

Precio: ${mascota.price}
Tu saldo: ${user.money}`
    )
  }

  // 💰 Restar coins
  user.money -= mascota.price

  // 💾 Guardar mascota
  mascotasData[from] = {
    name: mascota.name,
    price: mascota.price,
    owner: sender,
    time: Date.now()
  }

  saveJSON(mascotasPath, mascotasData)
  saveJSON(registroPath, registroData)

  await sock.sendMessage(from, { react: { text: '🎉', key: m.key } })

  reply(
`🎉 Mascota comprada

🐾 Mascota: ${mascota.name}
💰 Costo: ${mascota.price} coins
💳 Saldo restante: ${user.money}

📢 Aviso:
Este grupo ya tiene mascota.
❌ No se pueden comprar más.`
  )
}

handler.command = ['mascotas']
handler.tags = ['rpg']
handler.menu = true
handler.group = true

export default handler
