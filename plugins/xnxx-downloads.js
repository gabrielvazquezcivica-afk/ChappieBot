import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const nsfwPath = path.resolve('./data/nsfw.json')

function isNSFW(chatId) {
  if (!fs.existsSync(nsfwPath)) return false
  try {
    const data = JSON.parse(fs.readFileSync(nsfwPath))
    return data[chatId] || false
  } catch {
    return false
  }
}

export const handler = async (m, { sock, from, isGroup, reply }) => {

  // 🔞 NSFW
  if (isGroup && !isNSFW(from)) {
    return reply(
`🔞 *Comandos NSFW desactivados*
Activa con:
.nsfw on`
    )
  }

  // ✅ EXTRAER TEXTO REAL DEL MENSAJE
  const body =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = body.trim().split(/\s+/)
  args.shift() // quita el comando
  const url = args.join(' ').trim()

  if (!url) return reply('❌ Usa: .xnxxdl <link>')

  if (!url.includes('xnxx.com')) {
    return reply('❌ El link no es de xnxx')
  }

  await sock.sendMessage(from, { react: { text: '⏳', key: m.key } })

  const file = `./tmp/xnxx_${Date.now()}.mp4`

  const cmd = `yt-dlp -f "best[ext=mp4]/best" -S res:360,codec:h264 --no-playlist -o "${file}" "${url}"`

  exec(cmd, async (err) => {
    if (err) {
      console.log(err)
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      return reply('❌ Error al descargar')
    }

    if (!fs.existsSync(file)) {
      await sock.sendMessage(from, { react: { text: '❌', key: m.key } })
      return reply('❌ No se descargó el archivo')
    }

    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

    await sock.sendMessage(from, {
      video: fs.readFileSync(file),
      caption: '🔥 Video descargado',
      mimetype: 'video/mp4'
    }, { quoted: m })

    fs.unlinkSync(file)
  })
}

handler.command = ['xnxxdl']
handler.tags = ['xvideos']
handler.menu = true
handler.group = true

export default handler
