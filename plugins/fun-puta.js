import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 🔒 Modo admin silencioso
  let groupSettings = {}
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminSettings = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminSettings[from] || { enabled: false }
  }
  if (groupSettings.enabled && !isAdmin) return

  // 🔹 Usuario objetivo
  let targetJid = sender
  const mentions = []

  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (ctx?.mentionedJid?.length) {
    targetJid = ctx.mentionedJid[0]
  } else if (ctx?.participant) {
    targetJid = ctx.participant
  }

  mentions.push(targetJid)

  // 🔥 Porcentaje
  const porcentaje = Math.floor(Math.random() * 101)

  // 😈 FRASES
  const frases = [
    '😏 Nivel sospechoso',
    '🔥 Andas peligrosa',
    '💋 Modo coqueta activado',
    '😈 Demasiado poder',
    '👀 Todo mundo lo sabe',
    '💃 Reina del barrio',
    '⚡ Energía intensa',
    '😎 Sin explicación',
    '💥 Nivel legendario',
    '🖤 Nadie lo niega'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 🧠 TEXTO
  const text = `😈 *@${targetJid.split('@')[0]}* es ${porcentaje}% puta\n> ${frase}`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

// ⚙️ CONFIG
handler.command = ['puta']
handler.tags = ['juegos']
handler.group = true
handler.admin = false
handler.menu = true

export default handler
