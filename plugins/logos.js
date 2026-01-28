import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import * as cheerio from 'cheerio'

/* ───── FUNCIÓN: DESCARGAR IMAGEN ───── */
async function downloadImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(res.data, 'binary')
}

/* ───── FUNCIÓN: CREAR STICKER ───── */
async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `logo_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `logo_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process')
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      tmpOut
    ])
    ff.on('close', code => {
      if (code === 0) {
        const result = fs.readFileSync(tmpOut)
        fs.unlinkSync(tmpIn)
        fs.unlinkSync(tmpOut)
        resolve(result)
      } else reject(new Error('FFMPEG Error'))
    })
    ff.on('error', reject)
  })
}

/* ───── MAPA DE ESTILOS + URL ───── */
const logoStyles = {
  logofreefire: 'https://textpro.me/create-3d-fire-text-effect-online-free-1033.html?text=',
  logopubg: 'https://textpro.me/create-3d-glowing-text-effect-online-1031.html?text=',
  logominecraft: 'https://textpro.me/create-a-minecraft-logo-online-1025.html?text=',
  logo3d: 'https://textpro.me/3d-gradient-text-effect-online-free-1003.html?text=',
  logoneon: 'https://textpro.me/neon-text-effect-online-879.html?text=',
  logofire: 'https://textpro.me/fire-text-effect-online-808.html?text=',
  logosky: 'https://textpro.me/sky-text-effect-online-911.html?text=',
  logorainbow: 'https://textpro.me/rainbow-text-effect-online-933.html?text=',
  logometal: 'https://textpro.me/metal-text-effect-online-999.html?text=',
  logocrystal: 'https://textpro.me/crystal-text-effect-online-1011.html?text=',
  logoflow: 'https://textpro.me/fluid-text-effect-online-989.html?text=',
  logoblock: 'https://textpro.me/block-text-effect-872.html?text=',
  logobubble: 'https://textpro.me/bubble-text-effect-907.html?text=',
  logocircuit: 'https://textpro.me/circuit-text-effect-online-930.html?text=',
  logoglass: 'https://textpro.me/glass-text-effect-online-960.html?text=',
  logospace: 'https://textpro.me/space-text-effect-1004.html?text=',
  logosilver: 'https://textpro.me/silver-text-effect-1022.html?text=',
  logogold: 'https://textpro.me/gold-text-effect-1010.html?text=',
  logoflame: 'https://textpro.me/flame-text-effect-999.html?text=',
  logocool: 'https://textpro.me/cool-text-effect-921.html?text=',
  logotext3d: 'https://textpro.me/3d-text-effect-online-1006.html?text=',
  logodark: 'https://textpro.me/dark-magic-text-effect-946.html?text=',
  logohorror: 'https://textpro.me/horror-text-effect-online-981.html?text=',
  logowood: 'https://textpro.me/wood-text-effect-1017.html?text=',
  logolux: 'https://textpro.me/luxury-text-effect-online-1007.html?text=',
  logoflower: 'https://textpro.me/flower-text-effect-online-936.html?text=',
  logofantasy: 'https://textpro.me/fantasy-text-effect-online-970.html?text=',
  logofire2: 'https://textpro.me/fire-text-effect-online-995.html?text=',
  logoneon2: 'https://textpro.me/neon-text-effect-923.html?text=',
  logomagic: 'https://textpro.me/magic-text-effect-989.html?text=',
  logobright: 'https://textpro.me/bright-text-effect-online-1020.html?text=',
  logoshadow: 'https://textpro.me/shadow-text-effect-online-1024.html?text='
}

/* ───── HANDLER PRINCIPAL ───── */
export const handler = async (m, { sock, from, args, reply }) => {
  if (!args || args.length < 1) {
    return reply(
      '❌ Uso correcto:\n' +
      '.logofreefire <texto>\n' +
      '.logopubg <texto>\n' +
      '.logominecraft <texto>\n' +
      '...y más estilos'
    )
  }

  const style = args[0].toLowerCase()
  const text = args.slice(1).join(' ')

  if (!text) return reply('❌ Debes escribir el texto que quieres en el logo.')
  if (!logoStyles[style]) return reply('❌ Estilo de logo no válido.')

  try {
    const apiUrl = logoStyles[style] + encodeURIComponent(text)
    const page = await axios.get(apiUrl)
    const $ = cheerio.load(page.data)
    let imgUrl = $('img').first().attr('src') || $('img').first().attr('data-src')

    if (!imgUrl) return reply('❌ No se pudo generar el logo.')

    const buffer = await downloadImage(imgUrl)
    const sticker = await createSticker(buffer)

    await sock.sendMessage(from, { sticker }, { quoted: m })
  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo.')
  }
}

/* ───── CONFIGURACIÓN DEL HANDLER ───── */
handler.command = [
  'logofreefire','logopubg','logominecraft','logo3d','logoneon','logofire','logosky','logorainbow','logometal','logocrystal',
  'logoflow','logoblock','logobubble','logocircuit','logoglass','logospace','logosilver','logogold','logoflame','logocool',
  'logotext3d','logodark','logohorror','logowood','logolux','logoflower','logofantasy','logofire2','logoneon2','logomagic','logobright','logoshadow'
]
handler.tags = ['logos']
handler.help = [
  'logofreefire <texto>','logopubg <texto>','logominecraft <texto>','logo3d <texto>','logoneon <texto>','logofire <texto>','logosky <texto>',
  'logorainbow <texto>','logometal <texto>','logocrystal <texto>','logoflow <texto>','logoblock <texto>','logobubble <texto>','logocircuit <texto>','logoglass <texto>','logospace <texto>',
  'logosilver <texto>','logogold <texto>','logoflame <texto>','logocool <texto>','logotext3d <texto>','logodark <texto>','logohorror <texto>','logowood <texto>','logolux <texto>','logoflower <texto>','logofantasy <texto>','logofire2 <texto>','logoneon2 <texto>','logomagic <texto>','logobright <texto>','logoshadow <texto>'
]
handler.menu = true
handler.group = false

export default handler
