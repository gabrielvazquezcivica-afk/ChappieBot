import axios from 'axios'

export const handler = async (m, { sock, from, args, reply, command }) => {
  const text = args.join(' ').trim()
  if (!text) return reply(`❌ Escribe el texto para el logo.\nEjemplo: .${command} MiNombre`)

  try {
    const scriptMap = {
      logofreefire: 'free-fire-logo',
      logopubg: 'pubg-logo',
      logominecraft: 'minecraft-logo'
    }
    const script = scriptMap[command] || 'free-fire-logo'

    // FlamingText con user-agent para evitar bloqueos
    const logoUrl = `https://www6.flamingtext.com/net-fu/proxy_form.cgi?imageoutput=true&script=${script}&text=${encodeURIComponent(text)}`

    const res = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })

    if (!res.data || !res.data.byteLength) {
      return reply('❌ No se pudo generar el logo. Intenta con otro texto.')
    }

    await sock.sendMessage(from, { image: Buffer.from(res.data, 'binary') }, { quoted: m })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo.')
  }
}

handler.command = ['logofreefire','logopubg','logominecraft']
handler.tags = ['logos']
handler.help = ['logofreefire <texto>', 'logopubg <texto>', 'logominecraft <texto>']
export default handler
