import fs from 'fs'
import path from 'path'

const nsfwFile = path.join(process.cwd(), './data/nsfw.json')

// Cargar o inicializar la base de datos
let nsfwDB = {}
try {
  if (fs.existsSync(nsfwFile)) {
    nsfwDB = JSON.parse(fs.readFileSync(nsfwFile))
  }
} catch (e) {
  console.error('Error cargando NSFW DB:', e)
  nsfwDB = {}
}

// Guardar la DB en disco
function saveDB() {
  fs.writeFileSync(nsfwFile, JSON.stringify(nsfwDB, null, 2))
}

// Plugin para activar/desactivar NSFW
export const handler = async (m, { sock, from, args, reply, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Este comando solo funciona en grupos')

  const option = args[0]?.toLowerCase()
  if (!option || !['on', 'off'].includes(option)) {
    return reply('⚠️ Uso: .nsfw on / off')
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
