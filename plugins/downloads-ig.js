import fs from 'fs'
import { igdl } from 'ruhend-scraper'

export const handler = async (m, { sock, from, args, reply, sender, isGroup }) => {

  /* ───── 🔒 MODO ADMIN (data/modoadmin.json) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

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
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }
    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  // ❌ Sin link
  if (!args[0]) return reply('🤍 Ingresa el link del video de Instagram')

  try {
    // 🕑 Reacción cargando
    await sock.sendMessage(from, {
      react: { text: '🕑', key: m.key }
    })

    const res = await igdl(args[0])
    const data = res.data

    if (!data || !data.length) throw new Error('Sin resultados')

    for (const media of data) {
      // ⏱️ Espera para no spamear
      await new Promise(r => setTimeout(r, 2000))

      // ✅ Reacción éxito
      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      })

      await sock.sendMessage(
        from,
        {
          video: { url: media.url },
          caption: '📥 Video descargado desde Instagram\n🤖 ChappieBot'
        },
        { quoted: m }
      )
    }

  } catch (e) {
    // ❌ Error
    await sock.sendMessage(from, {
      react: { text: '❌', key: m.key }
    })
    reply('❌ Error al descargar el video')
  }
}

handler.command = ['ig']
handler.tags = ['descargas']
handler.help = ['ig <link>']
handler.group = false
handler.menu = true

export default handler
