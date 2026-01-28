import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import cheerio from 'cheerio'

/* ───── FUNCIÓN: DESCARGAR IMAGEN ───── */
async function downloadImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(res.data, 'binary')
}

/* ───── COMANDO LOGO ───── */
export const handler = async (m, { sock, from, isGroup, sender, reply, args, command }) => {

  // ───── MODO ADMIN SILENCIOSO ─────
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'
  if (fs.existsSync(modoadminPath)) {
    const modoadminData = JSON.parse(fs.readFileSync(modoadminPath))
    groupSettings = modoadminData[from] || { enabled: false }
  }
  if (groupSettings.enabled && isGroup) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'))
    } catch {}
    if (!isAdmin) return // Silencioso
  }

  if (!args || args.length === 0) return reply(`❌ Uso correcto:\n.${command} <texto>\nEjemplo: .${command} MiNombre`)

  const text = args.join(' ')
  const textEncoded = encodeURIComponent(text)

  // ───── MAPA DE ESTILOS ─────
  const styles = {
    logofreefire: 'https://textpro.me/create-fire-logo-online-free-1001.html',
    logopubg: 'https://textpro.me/create-3d-pubg-text-effect-online-1033.html',
    logominecraft: 'https://textpro.me/create-3d-minecraft-text-effect-online-1006.html',
    logofortnite: 'https://textpro.me/create-3d-gradient-text-effect-online-1094.html',
    logospiderman: 'https://textpro.me/create-spiderman-text-effect-online-1013.html',
    logoharrypotter: 'https://textpro.me/create-harry-potter-text-effect-online-1036.html',
    logoneon: 'https://textpro.me/neon-text-effect-online-879.html',
    logorose: 'https://textpro.me/create-rose-gold-text-effect-online-1004.html',
    logobutterfly: 'https://textpro.me/butterfly-text-effect-online-1098.html',
    logocuphead: 'https://textpro.me/cuphead-text-effect-online-1063.html',
    logojoker: 'https://textpro.me/create-logo-joker-online-1007.html',
    logosilver: 'https://textpro.me/silver-text-effect-online-879.html',
    logogold: 'https://textpro.me/gold-text-effect-online-879.html',
    logoshadow: 'https://textpro.me/3d-glass-text-effect-1027.html',
    logorainbow: 'https://textpro.me/create-rainbow-text-effect-online-1001.html',
    logolaser: 'https://textpro.me/laser-text-effect-online-936.html',
    logoninja: 'https://textpro.me/ninja-logo-online-935.html',
    logocartoon: 'https://textpro.me/cartoon-text-effect-online-1061.html',
    logoflame: 'https://textpro.me/create-flaming-text-effect-online-free-1015.html',
    logomatrix: 'https://textpro.me/matrix-text-effect-online-1016.html',
    logorock: 'https://textpro.me/rock-text-effect-online-1022.html',
    logosky: 'https://textpro.me/sky-text-effect-online-1024.html',
    logospirit: 'https://textpro.me/3d-spirit-text-effect-online-1026.html',
    logosmoke: 'https://textpro.me/smoke-text-effect-online-1030.html',
    logosteel: 'https://textpro.me/steel-text-effect-online-1031.html',
    logocrystal: 'https://textpro.me/crystal-text-effect-online-1032.html',
    logoglow: 'https://textpro.me/glow-text-effect-online-1034.html',
    logoblood: 'https://textpro.me/blood-text-effect-online-1035.html',
    logosand: 'https://textpro.me/sand-text-effect-online-1037.html',
    logowater: 'https://textpro.me/water-text-effect-online-1038.html',
    logofirework: 'https://textpro.me/fireworks-text-effect-online-1039.html',
    logogame: 'https://textpro.me/game-text-effect-online-1040.html'
  }

  const url = styles[command.toLowerCase()]
  if (!url) return reply('❌ Estilo de logo no disponible.')

  try {
    // Generación de imagen (simulación simplificada)
    const imageUrl = url.replace('text-effect-online', 'download') + '?text=' + textEncoded
    const buffer = await downloadImage(imageUrl)

    await sock.sendMessage(
      from,
      { image: buffer, caption: `🎨 Logo ${command} generado para: ${text}` },
      { quoted: m }
    )

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo. Intenta de nuevo más tarde.')
  }
}

// ───── COMANDOS DISPONIBLES ─────
handler.command = Object.keys({
  logofreefire: 1, logopubg: 1, logominecraft: 1, logofortnite: 1, logospiderman: 1,
  logoharrypotter: 1, logoneon: 1, logorose: 1, logobutterfly: 1, logocuphead: 1,
  logojoker: 1, logosilver: 1, logogold: 1, logoshadow: 1, logorainbow: 1,
  logolaser: 1, logoninja: 1, logocartoon: 1, logoflame: 1, logomatrix: 1,
  logorock: 1, logosky: 1, logospirit: 1, logosmoke: 1, logosteel: 1,
  logocrystal: 1, logoglow: 1, logoblood: 1, logosand: 1, logowater: 1,
  logofirework: 1, logogame: 1
})

handler.tags = ['logos']
handler.help = ['logofreefire <texto>', 'logopubg <texto>', 'logominecraft <texto>']
handler.menu = true
handler.group = false

export default handler
