import fs from 'fs'
import fetch from 'node-fetch'

// ───── DB ─────
const afkPath = './data/afk.json'
let afkDB = {}

if (!fs.existsSync(afkPath)) {
  fs.writeFileSync(afkPath, JSON.stringify({}))
}

try {
  afkDB = JSON.parse(fs.readFileSync(afkPath))
} catch {
  afkDB = {}
}

const saveAFK = () => {
  fs.writeFileSync(afkPath, JSON.stringify(afkDB, null, 2))
}

// ───── ANTI SPAM ─────
const cooldown = new Map()

// ───── FORMATO TIEMPO PRO ─────
const msToTime = (ms) => {
  let s = Math.floor(ms / 1000)
  let m = Math.floor(s / 60)
  let h = Math.floor(m / 60)

  s %= 60
  m %= 60

  return `${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`
}

// ───── QUOTED PRO ─────
const sistema = async (sock, from, titulo = 'ChappieBot 🏜️') => {
  let nombreGrupo = 'Chat'
  let thumbnail = null

  try {
    if (from.endsWith('@g.us')) {
      const metadata = await sock.groupMetadata(from)
      nombreGrupo = metadata.subject || 'Grupo'

      try {
        const pp = await sock.profilePictureUrl(from, 'image')
        const res = await fetch(pp)
        const buffer = await res.arrayBuffer()
        thumbnail = Buffer.from(buffer)
      } catch {}
    }
  } catch {}

  return {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: {
      extendedTextMessage: {
        text: titulo,
        title: 'ChappieBot',
        description: nombreGrupo,
        jpegThumbnail: thumbnail,
        previewType: 0
      }
    }
  }
}

// ───── COMANDO AFK ─────
export const handler = async (m, { sock, text, sender, from }) => {

  const reason = text || 'Sin razón'

  afkDB[sender] = {
    reason,
    time: Date.now()
  }

  saveAFK()

  await sock.sendMessage(from, {
    react: { text: '😴', key: m.key }
  })

  await sock.sendMessage(from, {
    text: `😴 *Modo AFK activado*\n📌 Razón: ${reason}`
  }, { quoted: await sistema(sock, from, 'AFK 💤') })
}


// ───── DETECCIÓN GLOBAL ─────
handler.before = async (m, { sock }) => {

  const sender = m.sender
  const from = m.chat

  // 👋 QUITAR AFK
  if (afkDB[sender]) {

    const time = Date.now() - afkDB[sender].time
    const tiempo = msToTime(time)

    delete afkDB[sender]
    saveAFK()

    await sock.sendMessage(from, {
      react: { text: '👋', key: m.key }
    })

    await sock.sendMessage(from, {
      text: `👋 *Volviste del AFK*\n⏱️ Tiempo: ${tiempo}`
    }, { quoted: await sistema(sock, from, 'AFK OFF 👋') })

    return false
  }

  // 🔍 MENCIONES
  let mentioned = m.mentionedJid || []

  for (let user of mentioned) {

    if (afkDB[user]) {

      // ⛔ anti spam (5s)
      const key = `${from}-${user}`
      if (cooldown.has(key) && Date.now() - cooldown.get(key) < 5000) continue

      cooldown.set(key, Date.now())

      const time = Date.now() - afkDB[user].time
      const tiempo = msToTime(time)

      await sock.sendMessage(from, {
        text: `😴 *Usuario AFK*\n📌 Razón: ${afkDB[user].reason}\n⏱️ Tiempo: ${tiempo}`
      }, { quoted: await sistema(sock, from, 'Usuario AFK 💤') })
    }
  }

  return false
}


// ───── CONFIG ─────
handler.command = ['afk']
handler.tags = ['tools']
handler.help = ['afk <razón>']
handler.menu = true

export default handler
