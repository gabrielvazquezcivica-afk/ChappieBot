import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, reply, owner }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

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

  if (groupSettings.enabled && isGroup) {
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const isAdmin = participants.some(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return // 🚫 bloqueo silencioso
    } catch {}
  }
  /* ─────────────────────────────────── */

  // ───── Detectar objetivo ─────
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  let who
  if (m.message?.extendedTextMessage?.contextInfo?.participant) {
    who = m.message.extendedTextMessage.contextInfo.participant
  } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  } else {
    who = sender
  }

  // Obtener nombres bonitos
  const target = participants.find(p => p.id === who)
  const name2 = target?.notify || target?.id.split('@')[0] || 'Desconocido'
  const senderContact = participants.find(p => p.id === sender)
  const name1 = senderContact?.notify || sender.split('@')[0]

  // 💞 Reacción inicial
  await sock.sendMessage(from, { react: { text: '🫦', key: m.key } })

  const chaqueta = [
    '_Iniciando chaqueta..._',
    '╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯',
    '╭━━╮.    ╭╭╭╮\n┃▔╲┣━━╈╈╈╈━━╮\n┃┈┈▏.    .╰╯╯╯╭╮┫\n┃┈--.╭━━━━━━╈╈╯\n╰━━╯-.           . ╰╯',
    `              .               .   ╭
╭━━╮╭╭╭╮.           ╭ ╯
┃▔╲┣╈╈╈╈━━━╮╭╯╭
┃┈┈▏.╰╯╯╯╭╮━┫  
┃┈--.╭━━━━╈╈━╯╰╮╰
╰━━╯-.        ╰╯...-    ╰ ╮
   .         . .  .  .. . . .  . .. .  ╰

*[ 🔥 ] @${name1} SE HA CORRIDO GRACIAS A @${name2}.*`
  ]

  // 📤 Mensaje inicial
  let sent = await sock.sendMessage(from, { text: chaqueta[0] })

  // 🎬 Animación por edición
  for (let i = 1; i < chaqueta.length; i++) {
    await new Promise(r => setTimeout(r, 700))
    await sock.sendMessage(from, {
      text: chaqueta[i],
      edit: sent.key,
      mentions: [sender, who]
    })
  }
}

// 📋 CONFIG
handler.command = ['chaqueta']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
