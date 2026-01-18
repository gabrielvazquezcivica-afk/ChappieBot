import fs from 'fs'

export const handler = async (m, { sock, from, isGroup, sender, isAdmin, reply }) => {
  const msgs = global.config.messages || {}

  if (!isGroup) return reply(msgs.group || '⚠️ Este comando solo funciona en grupos')

  // Modo admin
  const modoadminSettings = fs.existsSync('./data/modoadmin.json')
    ? JSON.parse(fs.readFileSync('./data/modoadmin.json'))
    : {}
  const groupSettings = modoadminSettings[from] || { enabled: false }
  if (groupSettings.enabled && !isAdmin) return // silencioso si no es admin

  // Obtener usuario objetivo
  let targetJid = sender // por defecto quien ejecuta
  let targetName = m.pushName || 'Usuario'

  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (ctx?.mentionedJid?.length) {
    targetJid = ctx.mentionedJid[0]
    const contact = sock.store.contacts[targetJid]
    targetName = contact?.notify || targetJid.split('@')[0]
  } else if (ctx?.participant) {
    targetJid = ctx.participant
    const contact = sock.store.contacts[targetJid]
    targetName = contact?.notify || targetJid.split('@')[0]
  }

  // Porcentaje y frase
  const porcentaje = Math.floor(Math.random() * 101)
  const frases = [
    '🌈 Vive tu verdad',
    '🏳️‍🌈 Ama a quien quieras',
    '✨ El amor es libre',
    '💖 No hay etiquetas',
    '😎 Sé tú mismo'
  ]
  const frase = frases[Math.floor(Math.random() * frases.length)]

  const text = `🌈 *${targetName}* es ${porcentaje}% gay\n> ${frase}`
  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['gay']
handler.tags = ['fun','game']
handler.group = true
handler.admin = false
handler.menu = true

export default handler
