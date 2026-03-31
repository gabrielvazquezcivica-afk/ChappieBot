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

// ───── TIEMPO PRO ─────
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
export const handler = async (m, { sock, sender, from }) => {

  const text =
    m.text ||
    m.body ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const reason = text.replace(/^\.?afk\s*/i, '') || 'Sin razón'

  afkDB[sender] = {
    reason,
    time: Date.now()
  }

  saveAFK()

  await sock.sendMessage(from, {
    react: { text: '😴', key: m.key }
  })

  await sock.sendMessage(from, {
    text: `😴 *AFK activado*\n📌 Razón: ${reason}`
  }, { quoted: await sistema(sock, from, 'AFK 💤') })
}

// ───── BEFORE GLOBAL (FIX TOTAL) ─────
handler.before = async (m, { sock }) => {

  try {
    const sender = m.sender
    const from = m.chat

    if (!sender || !from) return false

    // 👋 QUITAR AFK
    if (afkDB[sender]) {

      const tiempo = msToTime(Date.now() - afkDB[sender].time)

      delete afkDB[sender]
      saveAFK()

      await sock.sendMessage(from, {
        react: { text: '👋', key: m.key }
      })

      await sock.sendMessage(from, {
        text: `👋 *Ya no estás AFK*\n⏱️ Tiempo: ${tiempo}`
      }, { quoted: await sistema(sock, from, 'AFK OFF 👋') })

      return true
    }

    // 🔥 DETECCIÓN FULL (mención + reply)
    let mentioned = []

    if (m.mentionedJid) mentioned.push(...m.mentionedJid)

    const ctx = m.message?.extendedTextMessage?.contextInfo

    if (ctx?.mentionedJid) mentioned.push(...ctx.mentionedJid)

    if (ctx?.participant) mentioned.push(ctx.participant)

    // quitar duplicados
    mentioned = [...new Set(mentioned)]

    for (let user of mentioned) {

      if (afkDB[user]) {

        const tiempo = msToTime(Date.now() - afkDB[user].time)

        await sock.sendMessage(from, {
          text: `😴 *Usuario AFK*\n📌 Razón: ${afkDB[user].reason}\n⏱️ Tiempo: ${tiempo}`
        }, { quoted: await sistema(sock, from, 'Usuario AFK 💤') })
      }
    }

  } catch (e) {
    console.log('AFK error:', e)
  }

  return false
}

// ───── CONFIG ─────
handler.command = ['afk']
handler.tags = ['tools']
handler.help = ['afk <razón>']
handler.menu = true

export default handler
