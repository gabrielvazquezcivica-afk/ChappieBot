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
  if (groupSettings.enabled && !isAdmin) return // silencioso si no es admin

  // 🔹 Determinar usuario objetivo
  let targetJid = sender
  let targetName = m.pushName || 'Usuario'
  const mentions = []

  const ctx = m.message?.extendedTextMessage?.contextInfo
  if (ctx?.mentionedJid?.length) {
    targetJid = ctx.mentionedJid[0]
    targetName = 'Usuario'
  } else if (ctx?.participant) {
    targetJid = ctx.participant
    targetName = 'Usuario'
  }

  mentions.push(targetJid)

  // 🔥 Porcentaje random
  const porcentaje = Math.floor(Math.random() * 101)

  // 🇵🇪 FRASES PERUANAS
  const frases = [
    '🇵🇪 Causa confirmado',
    '🍗 Le gusta su pollito a la brasa',
    '🥔 Más peruano que la papa',
    '🔥 Modo Perú activado',
    '🎶 Se sabe todas las de cumbia',
    '😎 Causa nivel dios',
    '🌶️ Picante como ají',
    '🏔️ Directo de los Andes',
    '🥤 Fan del Inca Kola',
    '🎉 Listo para la fiesta'
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  // 🧠 TEXTO FINAL
  const text = `🇵🇪 *@${targetJid.split('@')[0]}* es ${porcentaje}% peruano\n> ${frase}`

  await sock.sendMessage(from, { text, mentions }, { quoted: m })
}

// ⚙️ CONFIG
handler.command = ['peruano']
handler.tags = ['juegos']
handler.group = true
handler.admin = false
handler.menu = true

export default handler
