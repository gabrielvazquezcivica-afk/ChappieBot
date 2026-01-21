export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup,
  isAdmin,
  reply
}) => {

  // 🛑 Solo grupos
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // 🔒 Solo admins
  if (!isAdmin) return reply('🚫 Solo administradores pueden usar este comando')

  /* ───── DB SAFE ───── */
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = { lastcofre: 0 }
  }

  const user = global.db.data.users[sender]

  /* ───── ⏱ COOLDOWN (0 ms = sin espera, ajusta si quieres) ───── */
  const cooldown = 0 // ejemplo: 10 horas = 36000000
  const now = Date.now()

  if (now - user.lastcofre < cooldown) {
    const restante = cooldown - (now - user.lastcofre)
    return reply(
      `❗ *YA RECLAMASTE TU COFRE*\n\n` +
      `⏳ Vuelve en *${msToTime(restante)}*`
    )
  }

  /* ───── 📸 CONTENIDO ───── */
  const img = 'https://cdn.russellxz.click/b7a5b400.jpeg'
  const texto = `» 🗺️ MAPA DE KALAHARI FREE FIRE ✅`

  // 📤 Enviar imagen
  await sock.sendMessage(
    from,
    {
      image: { url: img },
      caption: texto
    },
    { quoted: m }
  )

  // 🧠 Guardar tiempo
  user.lastcofre = now
}

/* ───── CONFIG ───── */
handler.command = ['kalahari']
handler.tags = ['ff']
handler.help = ['kalahari']
handler.group = true
handler.admin = true
handler.menu = true

export default handler

/* ───── ⏱ UTIL ───── */
function msToTime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${h}h ${m}m ${s}s`
                }
