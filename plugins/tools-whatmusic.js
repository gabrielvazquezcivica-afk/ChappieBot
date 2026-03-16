import fs from 'fs'
import acrcloud from 'acrcloud'

const TMP_DIR = './tmp'

// crear carpeta tmp si no existe
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR)
}

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

export const handler = async (m, { sock, from, reply }) => {

  await sock.sendMessage(from, {
    react: { text: '🎵', key: m.key }
  })

  const q = m.quoted ? m.quoted : m

  const mime =
    q.message?.audioMessage?.mimetype ||
    q.message?.videoMessage?.mimetype ||
    ''

  if (!/audio|video/.test(mime))
    return reply('❌ RESPONDE A UN AUDIO O VIDEO')

  const seconds =
    q.message?.audioMessage?.seconds ||
    q.message?.videoMessage?.seconds ||
    0

  if (seconds > 20)
    return reply('⚠️ EL AUDIO O VIDEO NO DEBE DURAR MÁS DE 20 SEGUNDOS')

  try {

    const media = await sock.downloadMediaMessage(q)

    const ext = mime.split('/')[1] || 'mp3'
    const file = `${TMP_DIR}/${m.key.id}.${ext}`

    fs.writeFileSync(file, media)

    const res = await acr.identify(fs.readFileSync(file))
    const { code, msg } = res.status

    if (code !== 0) throw msg

    const data = res.metadata.music[0]

    const title = data.title
    const artists = data.artists?.map(v => v.name).join(', ') || 'NO ENCONTRADO'
    const album = data.album?.name || 'NO ENCONTRADO'
    const genres = data.genres?.map(v => v.name).join(', ') || 'NO ENCONTRADO'
    const release = data.release_date || 'NO ENCONTRADO'

    const text = `╭━━━〔 🎵 CANCIÓN DETECTADA 〕━━━╮
┃
┃ 🎤 ARTISTA
┃ ${artists}
┃
┃ 🎶 CANCIÓN
┃ ${title}
┃
┃ 💿 ÁLBUM
┃ ${album}
┃
┃ 🎧 GÉNERO
┃ ${genres}
┃
┃ 📅 PUBLICADO
┃ ${release}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`

    fs.unlinkSync(file)

    await reply(text)

  } catch (e) {

    reply('❌ NO SE PUDO IDENTIFICAR LA CANCIÓN')

  }

}

handler.command = ['whatmusic']
handler.tags = ['tools']
handler.group = true
handler.menu = true

export default handler
