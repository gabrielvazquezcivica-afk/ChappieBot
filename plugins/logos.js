import fs from 'fs'
import path from 'path'
import os from 'os'
import { createCanvas, loadImage, registerFont } from 'canvas'

// ───── COMANDO LOGO MULTI-ESTILO ─────
export const handler = async (m, { sock, from, args, reply }) => {

  if (args.length < 2) return reply('❌ Uso correcto: .logo <estilo> <texto>\nEjemplo: `.logo neon Chappie`')

  const style = args[0].toLowerCase()
  const text = args.slice(1).join(' ').trim()
  
  if (!text) return reply('❌ Escribe un texto para el logo')

  try {
    const width = 800
    const height = 400
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // ───── FONDO SEGÚN ESTILO ─────
    switch(style){
      case 'neon':
        ctx.fillStyle = '#000'
        ctx.fillRect(0,0,width,height)
        ctx.shadowColor = '#0ff'
        ctx.shadowBlur = 25
        ctx.fillStyle = '#0ff'
        break
      case '3d':
        ctx.fillStyle = '#222'
        ctx.fillRect(0,0,width,height)
        ctx.shadowColor = '#444'
        ctx.shadowBlur = 15
        ctx.fillStyle = '#fff'
        break
      case 'fuego':
        const gradient = ctx.createLinearGradient(0,0,width,height)
        gradient.addColorStop(0,'#ff0000')
        gradient.addColorStop(0.5,'#ff9900')
        gradient.addColorStop(1,'#ffff00')
        ctx.fillStyle = gradient
        ctx.fillRect(0,0,width,height)
        ctx.shadowColor = '#ff6600'
        ctx.shadowBlur = 20
        ctx.fillStyle = '#fff'
        break
      case 'sombra':
        ctx.fillStyle = '#333'
        ctx.fillRect(0,0,width,height)
        ctx.shadowColor = '#000'
        ctx.shadowBlur = 20
        ctx.fillStyle = '#fff'
        break
      default:
        // Estilo por defecto: gradiente simple
        const grad = ctx.createLinearGradient(0,0,width,height)
        grad.addColorStop(0,'#ff5f6d')
        grad.addColorStop(1,'#ffc371')
        ctx.fillStyle = grad
        ctx.fillRect(0,0,width,height)
        ctx.fillStyle = '#fff'
        ctx.shadowBlur = 0
        break
    }

    // ───── TEXTO ─────
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Fuente personalizada opcional
    const fontPath = path.join(process.cwd(),'./data/fonts/Roboto-Bold.ttf')
    if (fs.existsSync(fontPath)) registerFont(fontPath, { family: 'Roboto' })

    ctx.font = 'bold 80px Roboto'
    ctx.fillText(text,width/2,height/2)

    // ───── GUARDAR TEMPORAL ─────
    const tmpFile = path.join(os.tmpdir(), `logo_${Date.now()}.png`)
    const out = fs.createWriteStream(tmpFile)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    await new Promise(resolve => out.on('finish', resolve))

    // ───── ENVIAR IMAGEN ─────
    await sock.sendMessage(from, { image: fs.readFileSync(tmpFile) }, { quoted: m })

    fs.unlinkSync(tmpFile)

  } catch(e){
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo')
  }
}

// Comando y configuración
handler.command = ['logo']
handler.tags = ['logos']
handler.help = ['logo <estilo> <texto>']
handler.menu = true
handler.group = false

export default handler
