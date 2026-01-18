import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}

  // 🔹 Solo grupos
  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // 🔹 Verificar modo admin
  const modoadminSettings = fs.existsSync('./data/modoadmin.json')
    ? JSON.parse(fs.readFileSync('./data/modoadmin.json'))
    : {}
  const groupSettings = modoadminSettings[from] || { enabled: false }
  if (groupSettings.enabled && !isAdmin) return // silencioso si no es admin

  // 🔹 Usuario objetivo (mención o reply)
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const user = ctx?.mentionedJid?.[0] || ctx?.participant || sender
  const userName = ctx?.mentionedJid?.[0]
    ? ctx.mentionedJid[0].split('@')[0]
    : (m.pushName || 'Usuario')

  // 🔹 Generar porcentaje y frase aleatoria
  const porcentaje = Math.floor(Math.random() * 101) // 0 a 100
  const frases = [
    '🌈 Vive tu verdad',
    '🏳️‍🌈 Ama a quien quieras',
    '✨ El amor es libre',
    '💖 No hay etiquetas',
    '😎 Sé tú mismo'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 🔹 Enviar mensaje
  const text = `🌈 *${userName}* es ${porcentaje}% gay\n> ${frase}`
  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['gay']
handler.tags = ['fun','game']
handler.group = true
handler.admin = false
handler.menu = true

export default handler
