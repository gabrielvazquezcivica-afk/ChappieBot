import fs from 'fs'
import axios from 'axios'
import crypto from 'crypto'
import FormData from 'form-data'

/* ───── 🔒 MODO ADMIN SILENCIOSO (ChappieBot) ───── */
async function checkModoAdmin({ sock, from, sender, isGroup }) {
  if (!isGroup) return true

  let settings = { enabled: false }
  const path = './data/modoadmin.json'

  if (fs.existsSync(path)) {
    try {
      const data = JSON.parse(fs.readFileSync(path))
      settings = data[from] || { enabled: false }
    } catch {}
  }

  if (!settings.enabled) return true

  try {
    const meta = await sock.groupMetadata(from)
    return meta.participants.some(
      p => p.id === sender &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    )
  } catch {
    return false
  }
}
/* ─────────────────────────────────────────────── */

/* ───── ACRCloud CONFIG ───── */
const ACR = {
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'TU_ACR_KEY',
  access_secret: 'TU_ACR_SECRET'
}

/* ───── AUDD CONFIG ───── */
const AUDD_TOKEN = 'TU_AUDD_TOKEN'

export const handler = async (m, { sock, from, sender, isGroup, reply }) => {

  const allowed = await checkModoAdmin({ sock, from, sender, isGroup })
  if (!allowed) return // 🚫 bloqueo silencioso

  const quoted = m.quoted || m
  const msg = quoted.message || {}

  const audio =
    msg.audioMessage ||
    msg.videoMessage ||
    msg.voiceMessage

  if (!audio) {
    return reply('🎵 Responde a un audio o video con música para identificarlo')
  }

  await sock.sendMessage(from, {
    react: { text: '🎧', key: m.key }
  })

  const buffer = await quoted.download()
  const file = `./tmp/${Date.now()}.mp3`
  fs.writeFileSync(file, buffer)

  /* ───── INTENTO 1: ACRCloud ───── */
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const stringToSign = `POST\n/v1/identify\n${ACR.access_key}\naudio\n1\n${timestamp}`
    const signature = crypto
      .createHmac('sha1', ACR.access_secret)
      .update(stringToSign)
      .digest('base64')

    const form = new FormData()
    form.append('sample', fs.createReadStream(file))
    form.append('access_key', ACR.access_key)
    form.append('data_type', 'audio')
    form.append('signature', signature)
    form.append('signature_version', '1')
    form.append('timestamp', timestamp)

    const res = await axios.post(
      `https://${ACR.host}/v1/identify`,
      form,
      { headers: form.getHeaders() }
    )

    const music = res.data?.metadata?.music?.[0]

    if (music) {
      fs.unlinkSync(file)
      return reply(
`🎶 *Canción identificada*
━━━━━━━━━━━━━━
🎵 *Título:* ${music.title}
🎤 *Artista:* ${music.artists?.map(a => a.name).join(', ')}
💿 *Álbum:* ${music.album?.name || 'Desconocido'}
📆 *Año:* ${music.release_date || '—'}
━━━━━━━━━━━━━━
🤖 ChappieBot`
      )
    }
  } catch (e) {
    console.log('ACRCloud falló, usando Audd...')
  }

  /* ───── INTENTO 2: AUDD ───── */
  try {
    const form = new FormData()
    form.append('file', fs.createReadStream(file))
    form.append('api_token', AUDD_TOKEN)
    form.append('return', 'spotify,apple_music')

    const res = await axios.post(
      'https://api.audd.io/',
      form,
      { headers: form.getHeaders() }
    )

    const r = res.data?.result
    if (!r) throw 'No detectado'

    fs.unlinkSync(file)

    return reply(
`🎶 *Canción identificada*
━━━━━━━━━━━━━━
🎵 *Título:* ${r.title}
🎤 *Artista:* ${r.artist}
💿 *Álbum:* ${r.album || '—'}
📆 *Año:* ${r.release_date || '—'}
━━━━━━━━━━━━━━
🤖 ChappieBot`
    )
  } catch {
    fs.unlinkSync(file)
    return reply('❌ No pude identificar la canción 😔\nPrueba con un audio más claro')
  }
}

handler.command = ['whatmusic']
handler.tags = ['tools']
handler.menu = true
handler.group = true

export default handler
