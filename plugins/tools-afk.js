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
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const reason = text.replace(/^\.?afk\s*/i, '') || 'Sin razón'

  if (!afkDB[from]) afkDB[from] = {}

  afkDB[from][sender] = {
    reason,
    time: Date.now()
  }

  saveAFK()

  await sock.sendMessage(from, {
    react: { text: '😴', key: m.key }
  })

  await sock.sendMessage(from, {
    text: `😴 *AFK activado (solo en este grupo)*\n📌 Razón: ${reason}`
  }, { quoted: await sistema(sock, from, 'AFK 💤') })
}

// ───── BEFORE ─────
handler.before = async (m, ctx) => {

  const { sock, sender, from } = ctx

  try {
    if (!sender || !from) return false

    if (!afkDB[from]) return false

    // 👋 QUITAR AFK SOLO EN ESTE GRUPO
    if (afkDB[from][sender]) {

      const tiempo = msToTime(Date.now() - afkDB[from][sender].time)

      delete afkDB[from][sender]
      saveAFK()

      await sock.sendMessage(from, {
        react: { text: '👋', key: m.key }
      })

      await sock.sendMessage(from, {
        text: `👋 *Ya no estás AFK en este grupo*\n⏱️ Tiempo: ${tiempo}`
      }, { quoted: await sistema(sock, from, 'AFK OFF 👋') })

      return true
    }

    // 🔥 MENCIONES
    let mentioned = []

    if (m.mentionedJid) mentioned.push(...m.mentionedJid)

    const ctxMsg = m.message?.extendedTextMessage?.contextInfo

    if (ctxMsg?.mentionedJid) mentioned.push(...ctxMsg.mentionedJid)

    if (ctxMsg?.participant) mentioned.push(ctxMsg.participant)

    mentioned = [...new Set(mentioned)]

    for (let user of mentioned) {

      if (afkDB[from][user]) {

        const tiempo = msToTime(Date.now() - afkDB[from][user].time)

        await sock.sendMessage(from, {
          text: `😴 *Usuario AFK (en este grupo)*\n📌 Razón: ${afkDB[from][user].reason}\n⏱️ Tiempo: ${tiempo}`
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
