export const handler = async (m, { sock, from }) => {

  const text = m.text.toLowerCase()

  if (text.includes('audio')) {
    return sock.sendMessage(from, {
      text: '🎧 Descargando audio...\n\nUsa:\n.play nombre de la canción'
    }, { quoted: m })
  }

  if (text.includes('video')) {
    return sock.sendMessage(from, {
      text: '🎥 Descargando video...\n\nUsa:\n.playvid nombre de la canción'
    }, { quoted: m })
  }

}

handler.customPrefix = /audio|video/i
handler.command = new RegExp

export default handler
