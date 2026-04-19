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

// ───── TIEMPO ─────
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

// ───── 🔒 MODO ADMIN FUNCION ─────
const checkModoAdmin = async (sock, from, sender, isGroup) => {
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
    if (!isAdmin) return false
  }

  return true
}

// ───── COMANDO AFK ─────
export const handler = async (m, { sock, sender, from, isGroup }) => {

  // 🔒 MODO ADMIN
  if (!(await checkModoAdmin(sock, from, sender, isGroup))) return

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
    text: `😴 *AFK activado*\n📌 Razón: ${reason}`
  }, { quoted: await sistema(sock, from, 'AFK 💤') })
}

// ───── BEFORE ─────
handler.before = async (m, ctx) => {

  const { sock, sender, from, isGroup } = ctx

  try {
    if (!sender || !from) return false

    // 🔒 MODO ADMIN
    if (!(await checkModoAdmin(sock, from, sender, isGroup))) return false

    if (!afkDB[from]) return false

    // 👋 QUITAR AFK
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

    // 🔍 MENCIONES + REPLY
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
          text: `😴 *Usuario AFK*\n📌 Razón: ${afkDB[from][user].reason}\n⏱️ Tiempo: ${tiempo}`
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
