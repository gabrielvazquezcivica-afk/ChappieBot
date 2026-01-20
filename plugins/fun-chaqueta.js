import fs from 'fs'

let handler = async (m, { sock, from, sender, isGroup, reply }) => {

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

  // 👀 Detectar a quién va dirigido
  let who = m.quoted ? m.quoted.sender
    : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0]
    : m.fromMe ? sock.user.id
    : m.sender

  // 🌀 Animación "chaqueta"
  const chaqueta = [
    '_Iniciando chaqueta. . ._',
    '╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯',
    '╭━━╮.    ╭╭╭╮\n┃▔╲┣━━╈╈╈╈━━╮\n┃┈┈▏.    .╰╯╯╯╭╮┫\n┃┈--.╭━━━━━━╈╈╯\n╰━━╯-.           . ╰╯',
    `              .               .   ╭\n╭━━╮╭╭╭╮.           ╭ ╯\n┃▔╲┣╈╈╈╈━━━╮╭╯╭\n┃┈┈▏.╰╯╯╯╭╮━┫  \n┃┈--.╭━━━━╈╈━╯╰╮╰\n╰━━╯-.        ╰╯...-    ╰ ╮\n   .         . .  .  .. . . .  . .. .  ╰\n\n*[ 🔥 ] @${m.sender.split('@')[0]} SE HA CORRIDO GRACIAS A @${who.split('@')[0]}.*`
  ]

  // ⏳ Primer mensaje
  let { key } = await sock.sendMessage(from, { text: '_Iniciando Chaqueta. . ._' })

  // 🔁 Enviar animación editando el mensaje
  for (let i = 0; i < chaqueta.length; i++) {
    await sock.sendMessage(from, {
      text: chaqueta[i],
      edit: key,
      mentions: [sender, who]
    })
  }
}

handler.command = ['chaqueta']
handler.group = true
handler.menu = true

export default handler
