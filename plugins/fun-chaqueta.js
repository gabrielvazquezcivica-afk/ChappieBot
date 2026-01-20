import fs from 'fs'

export const handler = async (m, { sock, from, sender, isGroup, reply, owner }) => {
  if (!isGroup) return reply('🚫 Este comando solo funciona en grupos')

  /* ───── MODO ADMIN SILENCIOSO ───── */
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
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      const isAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'))
      if (!isAdmin) return
    } catch {}
  }
  /* ──────────────────────────────── */

  // ───── Detectar objetivo ─────
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  let who = m.quoted?.sender || m.mentionedJid?.[0] || sender
  // Buscar nombre bonito en metadata
  const contact = participants.find(p => p.id === who)
  const name2 = contact?.notify || contact?.id.split('@')[0] || 'Desconocido'

  const senderContact = participants.find(p => p.id === sender)
  const name1 = senderContact?.notify || sender.split('@')[0]

  // 💞 Reacción inicial
  await sock.sendMessage(from, { react: { text: '🫦', key: m.key } })

  const chaqueta = [
    '_Iniciando chaqueta. . ._',
    `╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯`,
    `╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯`,
    `╭━━╮.    ╭╭╭╮\n┃▔╲┣━━╈╈╈╈━━╮\n┃┈┈▏.    .╰╯╯╯╭╮┫\n┃┈--.╭━━━━━━╈╈╯\n╰━━╯-.           . ╰╯`,
    `              .               .   ╭\n╭━━╮╭╭╭╮.           ╭ ╯\n┃▔╲┣╈╈╈╈━━━╮╭╯╭\n┃┈┈▏.╰╯╯╯╭╮━┫  \n┃┈--.╭━━━━╈╈━╯╰╮╰\n╰━━╯-.        ╰╯...-    ╰ ╮\n   .         . .  .  .. . . .  . .. .  ╰\n\n*[ 🔥 ] @${name1} SE HA CORRIDO GRACIAS A @${name2}.*`
  ]

  // ───── Enviar animación ─────
  let sent = await sock.sendMessage(from, { text: chaqueta[0] })
  for (let i = 1; i < chaqueta.length; i++) {
    await sock.sendMessage(from, {
      text: chaqueta[i],
      edit: sent.key,
      mentions: [sender, who]
    })
  }
}

handler.command = ['chaqueta']
handler.tags = ['juegos']
handler.group = true
handler.menu = true

export default handler
