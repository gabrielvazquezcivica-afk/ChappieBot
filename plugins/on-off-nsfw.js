import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Cargar o inicializar la DB
let nsfwDB = {}
try {
  if (fs.existsSync(nsfwFile)) {
    nsfwDB = JSON.parse(fs.readFileSync(nsfwFile))
  }
} catch (e) {
  console.error('Error cargando NSFW DB:', e)
  nsfwDB = {}
}

// Guardar DB
function saveDB() {
  fs.writeFileSync(nsfwFile, JSON.stringify(nsfwDB, null, 2))
}

// Plugin NSFW ON/OFF
export const handler = async (m, { sock, from, args, reply, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  // ⚡ Obtener metadata del grupo
  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  // ⚡ Verificar si es admin
  const isAdmin = participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  )
  if (!isAdmin) return reply('🚫 Solo administradores del grupo pueden activar o desactivar NSFW')

  const option = args[0]?.toLowerCase()
  if (!option || !['on', 'off'].includes(option)) {
    return reply('⚠️ Uso: .nsfw on / off')
  }

  // Estado actual
  const current = nsfwDB[from] || false
  if ((option === 'on' && current) || (option === 'off' && !current)) {
    return reply(`⚠️ NSFW ya está ${option === 'on' ? 'activado' : 'desactivado'} en este grupo`)
  }

  nsfwDB[from] = option === 'on' ? true : false
  saveDB()

  return reply(`✅ NSFW se ha ${option === 'on' ? 'activado' : 'desactivado'} en este grupo`)
}

handler.command = ['nsfw']
handler.tags = ['on-off']
handler.group = true
handler.help = ['nsfw on/off']

export default handler
