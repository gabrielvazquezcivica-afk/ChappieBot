import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'

export const handler = async (m, { sock, from, isGroup, reply }) => {
  const msgs = global.config?.messages || {}
  const botName = sock.user?.name || 'ChappieBot'

  if (!isGroup) return reply(msgs.group || '⚠️ ESTE COMANDO SOLO FUNCIONA EN GRUPOS')

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const admins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  if (!admins.includes(m.key.participant)) {
    return reply(msgs.admin || '⚠️ ESTE COMANDO ES SOLO PARA ADMINISTRADORES')
  }

  await sock.sendMessage(from, {
    react: { text: '🗣️', key: m.key }
  })

  const emoji = '🚀'

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

  await sock.sendMessage(
    from,
    { text, mentions },
    { quoted: m }
  )

  // 🔊 AUDIO FIX (RÁPIDO + ESTABLE)
  try {
    const res = await fetch('https://files.catbox.moe/y0jgrt.ogg')
    const buffer = Buffer.from(await res.arrayBuffer())

    await sock.sendMessage(from, {
      audio: buffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      fileName: 'chappie.ogg'
    }, { quoted: m })

  } catch (e) {
    console.log('❌ Error audio:', e)
  }
}

handler.command = ['todos']
handler.tags = ['group']
handler.menu = true
handler.group = true
handler.admin = true

export default handler
