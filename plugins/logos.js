import axios from 'axios'

export const handler = async (m, { sock, from, args, reply, command }) => {
  const text = args.join(' ').trim()
  if (!text) return reply(`❌ Escribe el texto para el logo.\nEjemplo: .${command} MiNombre`)

  try {
    // Ejemplo API FlamingText (cambia los parámetros según estilo)
    const logoUrl = `https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=${command}&text=${encodeURIComponent(text)}`

    const res = await axios.get(logoUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(res.data, 'binary')

    await sock.sendMessage(from, { image: buffer }, { quoted: m })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo, intenta de nuevo.')
  }
}

handler.command = ['logofreefire','logopubg','logominecraft']
handler.tags = ['logos']
handler.help = ['logofreefire <texto>', 'logopubg <texto>', 'logominecraft <texto>']
export default handler
