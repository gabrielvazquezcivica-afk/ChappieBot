import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO ───── */
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

  if (groupSettings.enabled) {
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
    if (!isAdmin) return
  }
  /* ─────────────────────────────────── */

  // Detectar mención o respuesta
  const ctx =
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo

  const target = ctx?.mentionedJid?.[0] || ctx?.participant
  if (!target) return reply('⚠️ Menciona a alguien o responde a un mensaje')

  // ✅ Construir menciones correctamente
  const mentions = [sender, target]

  // Nombre visibles para el texto
  const name1 = sender.split('@')[0]
  const name2 = target.split('@')[0]

  // 📝 Texto con @menciones
  const text = `🤤👅🥵 *ACABAS DE FOLLAR!* 🥵👅🤤

@${name1} se acaba de follar a la perra de @${name2} a 4 patas mientras gemía como una maldita perra (Aaah...Aaah, no pares, sigue, sigue) y la has dejado tan reventada que no puede ni sostener su propio cuerpo la maldita perra

🤤 @${name2} ya te han follado! 🥵`

  // Enviar mensaje
  await sock.sendMessage(from, {
    text,
    mentions
  }, { quoted: m })
}

handler.command = ['follar']
handler.tags = ['juegos']
handler.group = true
handler.menu = true
handler.help = ['follar @usuario']

export default handler
