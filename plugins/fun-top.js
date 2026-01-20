import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, reply, args }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    try {
      const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = modoadminData[from] || { enabled: false }
    } catch { groupSettings = { enabled: false } }
  }

  if (groupSettings.enabled) {
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

  const category = args[0] ? args.join(' ') : 'del grupo'

  const metadata = await sock.groupMetadata(from)
  let participants = metadata.participants.map(p => p.id)
  if (participants.length === 0) return reply('❌ No hay miembros en el grupo')

  // Mezclar y tomar hasta 10
  participants = participants.sort(() => Math.random() - 0.5).slice(0, 10)

  const emojis = ['🔥','💥','✨','💫','🌟','🎉','😂','😎','🥳','💖','👑','💯']

  let texto = `🏆 Top ${category} del grupo:\n\n`
  let mentions = []

  participants.forEach((jid, i) => {
    const member = metadata.participants.find(p => p.id === jid)
    const name = member?.notify || member?.id.split('@')[0]
    const emoji = emojis[i % emojis.length]
    texto += `${emoji} @${name}\n`
    mentions.push(jid)
  })

  texto += `\n> ¡Felicidades a los top 10! 🎉`

  await sock.sendMessage(from, { text: texto, mentions }, { quoted: m })
}

handler.command = ['top']
handler.tags = ['juegos']
handler.menu = true
handler.group = true
handler.help = ['top <categoría>']

export default handler
