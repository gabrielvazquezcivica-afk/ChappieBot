import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

function isNSFW(chatId) {
  if (!fs.existsSync(nsfwPath)) return false
  const data = JSON.parse(fs.readFileSync(nsfwPath))
  return data[chatId] || false
}

export const handler = async (m, { sock, from, sender, reply, isGroup, command }) => {

  // 🔞 SISTEMA NSFW
  if (isGroup && !isNSFW(from)) {
    return reply(`🔞 *Comandos NSFW desactivados en este grupo*\n\nUn admin puede activarlos con:\n.nsfw on`)
  }

  // 💬 Obtener texto real
  const body =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = body.split(' ').slice(1)
  const url = args[0]

  if (!url) return reply(`❗ Uso correcto:\n.${command} <link xnxx>`)

  if (!url.includes('xnxx.com')) {
    return reply('❌ El link no parece ser de XNXX')
  }

  // 🔥 Reacción al recibir comando
  await sock.sendMessage(from, { react: { text: '🔞', key: m.key } })

  const file = path.resolve(`./tmp/xnxx_${Date.now()}.mp4`)

  reply('⏳ Descargando video...')

  exec(`yt-dlp -f mp4 -o "${file}" "${url}"`, async (err) => {
    if (err) {
      console.error(err)
      return reply('❌ Error al descargar el video.')
    }

    if (!fs.existsSync(file)) {
      return reply('❌ No se pudo obtener el archivo.')
    }

    // ✅ Enviar video
    await sock.sendMessage(
      from,
      {
        video: fs.readFileSync(file),
        caption: '✅ Video descargado'
      },
      { quoted: m }
    )

    // 🧹 borrar archivo
    fs.unlinkSync(file)

    // ✅ Reacción final
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })
  })
}

handler.command = ['xnxxdl']
handler.tags = ['xvideos']
handler.menu = true

export default handler
