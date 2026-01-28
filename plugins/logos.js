import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'

/* ───── FUNCIÓN: DESCARGAR IMAGEN ───── */
async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(response.data, 'binary')
}

/* ───── COMANDO LOGO ───── */
export const handler = async (m, { sock, from, isGroup, sender, reply, args, command }) => {

  /* ───── MODO ADMIN SILENCIOSO ───── */
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
  /* ────────────────────────────── */

  if (!args || args.length === 0) return reply(`❌ Uso correcto:\n.${command} <texto>\nEjemplo: .${command} MiNombre`)

  const text = args.join(' ')
  let logoStyle = command.toLowerCase() // el nombre del comando será el estilo
  let imageUrl

  try {
    // API de logos (puedes cambiar a cualquier API real)
    imageUrl = `https://api.some-logo.com/create?style=${logoStyle}&text=${encodeURIComponent(text)}`
    
    const imageBuffer = await downloadImage(imageUrl)

    await sock.sendMessage(from, { image: imageBuffer, caption: `🎨 Logo ${logoStyle} generado para: ${text}` }, { quoted: m })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo. Intenta de nuevo más tarde.')
  }
}

// ───── COMANDOS DISPONIBLES ─────
handler.command = [
  'logofreefire',
  'logopubg',
  'logominecraft',
  'logofortnite',
  'logozelda',
  'logomario',
  'logospiderman',
  'logobatman',
  'logoharrypotter',
  'logojurassic',
  'logosonic',
  'logodragonball',
  'logoneon',
  'logoflowers',
  'logocute',
  'logofire',
  'logolava',
  'logowater',
  'logometal',
  'logomagic',
  'logocrypto',
  'logominecraft2',
  'logopokemon',
  'logofanart',
  'logotv',
  'logomovies',
  'logomusic',
  'logogaming',
  'logotwitch',
  'logoyoutube'
]

handler.tags = ['logos']
handler.help = ['logofreefire <texto>', 'logopubg <texto>', 'logominecraft <texto>', 'logofortnite <texto>']
handler.menu = true
handler.group = false

export default handler
