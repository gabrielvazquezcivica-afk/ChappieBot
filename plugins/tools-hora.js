import fs from 'fs'

export const handler = async (m, {
  sock,
  from,
  sender,
  isGroup
}) => {

  /* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
  let groupSettings = { enabled: false }
  const modoadminPath = './data/modoadmin.json'

  if (fs.existsSync(modoadminPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(modoadminPath))
      groupSettings = data[from] || { enabled: false }
    } catch {
      groupSettings = { enabled: false }
    }
  }

  if (isGroup && groupSettings.enabled) {
    let isAdmin = false
    try {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants || []
      isAdmin = participants.some(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
    } catch {
      isAdmin = false
    }

    if (!isAdmin) return // 🚫 bloqueo silencioso
  }
  /* ─────────────────────────────────────────────── */

  // ⏰ Reacción
  await sock.sendMessage(from, {
    react: { text: '⏰', key: m.key }
  })

  const now = new Date()

  const format12 = (date, locale) =>
    date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })

  const hora = {
    'México 🇲🇽': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })), 'es-MX'),
    'Colombia 🇨🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' })), 'es-CO'),
    'Venezuela 🇻🇪': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' })), 'es-VE'),
    'República Dominicana 🇩🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' })), 'es-DO'),
    'Guatemala 🇬🇹': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' })), 'es-GT'),
    'Honduras 🇭🇳': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' })), 'es-HN'),
    'Perú 🇵🇪': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' })), 'es-PE'),
    'Ecuador 🇪🇨': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Guayaquil' })), 'es-EC'),
    'Bolivia 🇧🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/La_Paz' })), 'es-BO'),
    'Paraguay 🇵🇾': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Asuncion' })), 'es-PY'),
    'Chile 🇨🇱': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' })), 'es-CL'),
    'Argentina 🇦🇷': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })), 'es-AR'),
    'Uruguay 🇺🇾': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Montevideo' })), 'es-UY'),
    'Cuba 🇨🇺': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Havana' })), 'es-CU'),
    'Costa Rica 🇨🇷': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' })), 'es-CR'),
    'Panamá 🇵🇦': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Panama' })), 'es-PA'),
    'Nicaragua 🇳🇮': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Managua' })), 'es-NI'),
    'El Salvador 🇸🇻': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/El_Salvador' })), 'es-SV')
  }

  let text = '📍 *Hora actual en LATAM (12h)*\n\n'
  for (const [pais, h] of Object.entries(hora)) {
    text += `${pais}: ${h}\n`
  }
  text += '\n> 🤖 ChappieBot 🌎'

  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['hora']
handler.help = ['hora']
handler.tags = ['tools']
handler.menu = true

export default handler
