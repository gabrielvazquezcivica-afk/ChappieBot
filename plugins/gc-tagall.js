import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'

export const handler = async (m, { sock, from, isGroup, reply }) => {
  const msgs = global.config?.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  // ❌ SOLO GRUPOS
  if (!isGroup) return reply(msgs.group || '⚠️ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')

  // 📊 INFO GRUPO
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // 🔐 ADMINS
  const admins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply(msgs.admin || '⚠️ ESTE COMANDO ES SOLO PARA ADMINISTRADORES')
  }

  // 🔥 REACCIÓN
  await sock.sendMessage(from, {
    react: { text: '🗣️', key: m.key }
  })

  const emoji = '🗣️'

  // 🧠 PANEL
  let text = `╭━━━〔 ${emoji} TODOS 〕━━━⬣
┃ 👑 ${botName}
┃ 🏷️ ${metadata.subject}
┃ 👥 ${participants.length} miembros
╰━━━━━━━━━━━━⬣

╭━━━〔 ${emoji} ETIQUETAS 〕━━━⬣
`

  const mentions = []

  for (const p of participants) {
    const name = p.notify || p.id.split('@')[0]
    text += `┃ ${emoji} @${name}\n`
    mentions.push(p.id)
  }

  text += `╰━━━━━━━━━━━━⬣`

  // 📩 MENSAJE
  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )

  // 🔊 AUDIO MP3 (PLAYER COMO TU IMAGEN)
  try {
    const res = await fetch('https://files.catbox.moe/y0jgrt.ogg')
    const buffer = Buffer.from(await res.arrayBuffer())

    const input = `./audio_${Date.now()}.ogg`
    const output = `./audio_${Date.now()}`

    fs.writeFileSync(input, buffer)

    // 🔥 convertir a MP3
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -y -i ${input} -vn -ar 44100 -ac 2 -b:a 128k ${output}.mp3`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const finalAudio = fs.readFileSync(`${output}.mp3`)

    // 🚀 enviar como audio normal (NO ptt)
    await sock.sendMessage(from, {
      audio: finalAudio,
      mimetype: 'audio/mpeg',
      fileName: 'ChappieBot.mp3'
    }, { quoted: m })

    // ⏳ borrar después
    setTimeout(() => {
      try {
        fs.unlinkSync(input)
        fs.unlinkSync(`${output}.mp3`)
      } catch {}
    }, 10000)

  } catch (e) {
    console.log('❌ Error audio:', e)
  }
}

// ⚙️ CONFIG
handler.command = ['todos']
handler.tags = ['group']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
