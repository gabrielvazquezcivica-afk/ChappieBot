import fs from 'fs'
import path from 'path'
import axios from 'axios'

/* ───── MODO ADMIN ───── */
const modoadminPath = './data/modoadmin.json'
async function isGroupAdmin(from, sender, sock) {
  if (!fs.existsSync(modoadminPath)) return false
  const data = JSON.parse(fs.readFileSync(modoadminPath))
  const groupSettings = data[from] || { enabled: false }
  if (!groupSettings.enabled) return false
  try {
    const meta = await sock.groupMetadata(from)
    const participants = meta.participants || []
    return participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'))
  } catch {
    return false
  }
}

/* ───── COMANDOS DE LOGOS ───── */
const logoCommands = [
  'neon', 'flame', '3d', 'glitch', 'sky', 'matrix', 'bubble',
  'gold', 'ice', 'sand', 'heart', 'metal', 'shadow', 'firework',
  'wolf', 'tiger', 'dragon', 'joker', 'flower', 'comic', 'holo', 'sign'
]

export const handler = async (m, { sock, from, sender, args, command, reply, isGroup }) => {
  // 🚫 Verifica modo admin si es grupo
  if (isGroup && !await isGroupAdmin(from, sender, sock)) return

  const text = args.join(' ').trim()
  if (!text) return reply(`❌ Uso correcto: .${command} <texto>`)

  // 🎯 Reacción inicial
  await sock.sendMessage(from, { react: { text: '🎨', key: m.key } })

  try {
    // Llamada a TextPro API (gratuita) para generar logo
    const url = `https://api.textpro.me/${command}?text=${encodeURIComponent(text)}`
    const res = await axios.get(url, { responseType: 'arraybuffer' })

    if (!res.data || !res.data.byteLength) throw new Error('Respuesta vacía')

    const tmpFile = path.join('./tmp', `${command}_${Date.now()}.png`)
    fs.writeFileSync(tmpFile, res.data)

    // Enviar imagen
    await sock.sendMessage(from, { image: fs.readFileSync(tmpFile) }, { quoted: m })
    fs.unlinkSync(tmpFile)

    // ✅ Reacción final
    await sock.sendMessage(from, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ No se pudo generar el logo. Intenta otro comando o texto.')
  }
}

// ───── TODOS LOS COMANDOS EXPLÍCITOS ─────
handler.command = [
  'neon', 'flame', '3d', 'glitch', 'sky', 'matrix', 'bubble',
  'gold', 'ice', 'sand', 'heart', 'metal', 'shadow', 'firework',
  'wolf', 'tiger', 'dragon', 'joker', 'flower', 'comic', 'holo', 'sign'
]

handler.tags = ['logos']
handler.help = logoCommands.map(c => `${c} <texto>`)
handler.menu = true
handler.group = false

export default handler
