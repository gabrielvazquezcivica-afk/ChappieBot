import axios from 'axios'
import fs from 'fs'

/* ───── 📸 OBTENER PERFIL (MOLLYGRAM) ───── */
const obtenerPerfilMollygram = async (usuario) => {
  const { data } = await axios.get(
    `https://media.mollygram.com/?url=${encodeURIComponent(usuario)}`,
    {
      headers: {
        'accept': '*/*',
        'accept-language': 'es-ES,es;q=0.9',
        'origin': 'https://mollygram.com',
        'referer': 'https://mollygram.com/',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari'
      }
    }
  )

  const html = data.html || ''
  const get = (r) => html.match(r)?.[1]?.trim() || 'No disponible'

  return {
    usuario: get(/<h4 class="mb-0">([^<]+)</),
    nombre: get(/<p class="text-muted">([^<]+)</),
    bio: get(/<p class="text-dark"[^>]*>([^<]+)</),
    posts: get(/posts<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    seguidores: get(/followers<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    siguiendo: get(/following<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    foto: html.match(/rounded-circle[^>]*src="([^"]+)"/i)?.[1] || null
  }
}

/* ───── 🧩 COMANDO IGSTALK ───── */
export const handler = async (m, {
  sock,
  from,
  args,
  reply,
  isGroup,
  sender
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (isGroup && groupSettings.enabled) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  if (!args[0]) {
    return reply('🕵️‍♂️ *Uso:* `.igstalk usuario`')
  }

  // 🔍 reacción
  await sock.sendMessage(from, {
    react: { text: '🕵️‍♂️', key: m.key }
  })

  let p
  try {
    p = await obtenerPerfilMollygram(args[0])
  } catch (e) {
    console.error(e)
    return reply('❌ No pude obtener información de ese perfil')
  }

  const texto = `
╭──〔 📸 IG STALK 〕──╮
│ 👤 @${p.usuario}
│ 📛 ${p.nombre}
│
│ 📝 Bio:
│ ${p.bio}
│
│ 📊 Estadísticas
│ 📸 Posts: ${p.posts}
│ 👥 Seguidores: ${p.seguidores}
│ ➕ Siguiendo: ${p.siguiendo}
╰──〔 🤖 ChappieBot 〕──╯
`.trim()

  if (p.foto) {
    await sock.sendMessage(
      from,
      {
        image: { url: p.foto },
        caption: texto
      },
      { quoted: m }
    )
  } else {
    await reply(texto)
  }
}

/* ───── 📋 CONFIG ───── */
handler.command = ['igstalk']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
