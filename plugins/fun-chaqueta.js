import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, reply, owner }) => {
  // ❌ Solo grupos
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
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

  // ───── Detectar objetivo ─────
  let who = null
  if (m.quoted?.sender) who = m.quoted.sender
  else if (m.mentionedJid?.length) who = m.mentionedJid[0]
  else if (m.sender) who = m.sender
  else who = sock.user?.id || ''

  const senderId = sender || m.sender || sock.user?.id || ''

  // 💞 Reacción inicial
  await sock.sendMessage(from, {
    react: { text: '🫦', key: m.key }
  })

  const name1 = senderId.split('@')[0]
  const name2 = who.split('@')[0]

  // ───── Texto final ─────
  const chaqueta = [
    '_Iniciando chaqueta. . ._',
    `╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯`,
    `╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯`,
    `╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯`,
    `              .               .   ╭\n╭━━╮╭╭╭╮.           ╭ ╯\n┃▔╲┣╈╈╈╈━━━╮╭╯╭\n┃┈┈▏.╰╯╯╯╭╮━┫  \n┃┈--.╭━━━━╈╈━╯╰╮╰\n╰━━╯-.        ╰╯...-    ╰ ╮\n   .         . .  .  .. . . .  . .. .  ╰\n\n*[ 🔥 ] @${name1} SE HA CORRIDO GRACIAS A @${name2}.*`
  ]

  // ───── Enviar animación / edición ─────
  let { key } = await sock.sendMessage(from, { text: chaqueta[0] })

  for (let i = 1; i < chaqueta.length; i++) {
    await sock.sendMessage(from, {
      text: chaqueta[i],
      edit: key,
      mentions: [senderId, who]
    })
  }
}

// ───── CONFIG ─────
handler.command = ['chaqueta']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
