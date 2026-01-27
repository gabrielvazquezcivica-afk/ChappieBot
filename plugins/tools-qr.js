import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export const handler = async (m, {
  sock,
  from,
  args,
  reply
}) => {

  // 👉 si escriben texto o responden a un mensaje
  const text = args.join(' ').trim() || m.quoted?.text

  if (!text) {
    return reply('❌ Escribe o responde a un texto/link\n\nEjemplo:\n.qr Hola mundo\n.qr https://google.com')
  }

  const filePath = path.join('./tmp', `qr_${Date.now()}.png`)

  try {
    await QRCode.toFile(filePath, text, {
      width: 512,
      margin: 2
    })

    await sock.sendMessage(from, {
      image: fs.readFileSync(filePath),
      caption: `📷 QR generado`
    }, { quoted: m })

    fs.unlinkSync(filePath)

  } catch (e) {
    console.error('QR ERROR:', e)
    reply('❌ Error al generar el QR')
  }
}

handler.command = ['qr']
handler.tags = ['tools']
handler.help = ['qr <texto/link>']
handler.menu = true

export default handler
