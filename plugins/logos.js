import { createCanvas, registerFont } from 'canvas'

/* ───── HANDLER ───── */
export const handler = async (m, { sock, from, args, reply, command }) => {
  const text = args.join(' ').trim()
  if (!text) return reply(`❌ Escribe el texto para el logo.\nEjemplo: .${command} MiNombre`)

  // Canvas
  const width = 800
  const height = 400
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fondo según el comando (cada “logo” tiene su estilo)
  if (command === 'logofreefire') {
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#ff4e00')
    grad.addColorStop(1, '#ffcc00')
    ctx.fillStyle = grad
  } else if (command === 'logopubg') {
    ctx.fillStyle = '#0a0a0a'
  } else {
    ctx.fillStyle = '#5555ff'
  }
  ctx.fillRect(0, 0, width, height)

  // Texto
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 10
  ctx.font = 'bold 80px Sans'

  // Sombra o borde
  ctx.strokeStyle = '#000000'
  ctx.strokeText(text, width / 2, height / 2)
  ctx.fillText(text, width / 2, height / 2)

  // Mandar la imagen
  const buffer = canvas.toBuffer('image/png')
  await sock.sendMessage(from, { image: buffer }, { quoted: m })
}

/* ───── CONFIG DE COMANDOS ───── */
handler.command = ['logofreefire', 'logopubg', 'logominecraft']
handler.tags = ['logos']
handler.help = ['logofreefire <texto>', 'logopubg <texto>', 'logominecraft <texto>']
handler.menu = true
handler.group = false

export default handler
