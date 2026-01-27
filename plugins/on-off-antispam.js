import fs from 'fs'
import path from 'path'

const antispamPath = path.resolve('./data/antispam.json')
if (!fs.existsSync(antispamPath)) fs.writeFileSync(antispamPath, '{}')

// Cargar y guardar configuración
function loadAntiSpam() {
  return JSON.parse(fs.readFileSync(antispamPath))
}
function saveAntiSpam(data) {
  fs.writeFileSync(antispamPath, JSON.stringify(data, null, 2))
}

// Datos temporales por usuario
const spamData = {}

/* ───── COMANDO ON/OFF ───── */
export const handler = async (m, { sock, from, sender, isGroup, isAdmin, args, reply }) => {
  if (!isGroup) return reply('❌ Solo funciona en grupos')
  if (!isAdmin) return reply('❌ Solo admins pueden usarlo')

  const db = loadAntiSpam()
  if (!args[0]) return reply(`📛 Uso:\n.antispam on\n.antispam off`)

  if (args[0].toLowerCase() === 'on') {
    if (db[from]) return reply('⚠️ Anti-spam ya estaba activado')
    db[from] = true
    saveAntiSpam(db)
    return reply('✅ Anti-spam activado con advertencias y kick automático')
  }

  if (args[0].toLowerCase() === 'off') {
    if (!db[from]) return reply('⚠️ Anti-spam ya estaba desactivado')
    db[from] = false
    saveAntiSpam(db)
    return reply('❌ Anti-spam desactivado')
  }

  return reply('❌ Opción inválida. Usa on/off')
}

handler.command = ['antispam']
handler.tags = ['on-off']
handler.group = true
handler.admin = true
export default handler

/* ───── DETECTOR + ADVERTENCIAS ───── */
export async function before(m, { sock, from, sender, isGroup }) {
  if (!isGroup) return true
  if (!m.text) return true

  const db = loadAntiSpam()
  if (!db[from]) return true

  if (!spamData[sender]) spamData[sender] = { count: 0, last: 0, warn: 0 }
  const now = Date.now()
  const diff = now - spamData[sender].last
  spamData[sender].last = now

  if (diff < 3000) spamData[sender].count++
  else spamData[sender].count = 1

  // ⚠️ Manejo de advertencias
  if (spamData[sender].count >= 5) {
    spamData[sender].count = 0
    spamData[sender].warn++

    if (spamData[sender].warn === 1) {
      await sock.sendMessage(from, {
        text: `⚠️ @${sender.split('@')[0]}, no hagas spam en el grupo!`,
        mentions: [sender]
      })
    } else if (spamData[sender].warn === 2) {
      await sock.sendMessage(from, {
        text: `🚨 @${sender.split('@')[0]}, esta es tu última advertencia!`,
        mentions: [sender]
      })
    } else if (spamData[sender].warn >= 3) {
      try {
        await sock.sendMessage(from, {
          text: `❌ @${sender.split('@')[0]} fue expulsado por spam`,
          mentions: [sender]
        })
        await sock.groupParticipantsUpdate(from, [sender], 'remove')
      } catch (e) {
        console.error('ANTI-SPAM KICK ERROR:', e)
        await sock.sendMessage(from, {
          text: `❌ No pude expulsar a @${sender.split('@')[0]}`,
          mentions: [sender]
        })
      }
      spamData[sender].warn = 0
    }
  }

  return true
      }
