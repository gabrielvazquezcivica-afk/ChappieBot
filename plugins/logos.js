import fs from 'fs'
import axios from 'axios'
import * as cheerio from 'cheerio'

/* ───── FUNCIÓN PARA DESCARGAR IMAGEN ───── */
async function downloadImage(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  return Buffer.from(res.data, 'binary')
}

/* ───── COMANDO LOGOS ───── */
export const handler = async (m, { sock, from, args, command, reply }) => {

  const logos = {
    logofreefire: 'https://api-to-create-logos.com/freefire?text=',
    logopubg: 'https://api-to-create-logos.com/pubg?text=',
    logominecraft: 'https://api-to-create-logos.com/minecraft?text=',
    logocod: 'https://api-to-create-logos.com/cod?text=',
    logofortnite: 'https://api-to-create-logos.com/fortnite?text=',
    logolol: 'https://api-to-create-logos.com/lol?text=',
    logoragnarok: 'https://api-to-create-logos.com/ragnarok?text=',
    logogenshin: 'https://api-to-create-logos.com/genshin?text=',
    logonike: 'https://api-to-create-logos.com/nike?text=',
    logoadidas: 'https://api-to-create-logos.com/adidas?text=',
    logomcdonalds: 'https://api-to-create-logos.com/mcdonalds?text=',
    logopizza: 'https://api-to-create-logos.com/pizza?text=',
    logomc: 'https://api-to-create-logos.com/minecraft2?text=',
    logohacker: 'https://api-to-create-logos.com/hacker?text=',
    logopokemon: 'https://api-to-create-logos.com/pokemon?text=',
    logospider: 'https://api-to-create-logos.com/spiderman?text=',
    logosonic: 'https://api-to-create-logos.com/sonic?text=',
    logofacebook: 'https://api-to-create-logos.com/facebook?text=',
    logotwitter: 'https://api-to-create-logos.com/twitter?text=',
    logoinstagram: 'https://api-to-create-logos.com/instagram?text=',
    logoyoutube: 'https://api-to-create-logos.com/youtube?text=',
    logodc: 'https://api-to-create-logos.com/discord?text=',
    logopikachu: 'https://api-to-create-logos.com/pikachu?text=',
    logobatman: 'https://api-to-create-logos.com/batman?text=',
    logosuperman: 'https://api-to-create-logos.com/superman?text=',
    logospiderman2: 'https://api-to-create-logos.com/spiderman2?text=',
    logojoker: 'https://api-to-create-logos.com/joker?text=',
    logofire: 'https://api-to-create-logos.com/fire?text=',
    logowater: 'https://api-to-create-logos.com/water?text=',
    logomagic: 'https://api-to-create-logos.com/magic?text=',
    logomusic: 'https://api-to-create-logos.com/music?text=',
    logogamer: 'https://api-to-create-logos.com/gamer?text='
  }

  const text = args.join(' ').trim()
  if (!text) {
    return reply(
      `❌ Debes escribir el texto que quieres en el logo.\n` +
      `Ejemplo: .${command} MiLogo`
    )
  }

  if (!logos[command]) return reply('❌ Estilo de logo no válido.')

  try {
    const apiUrl = logos[command] + encodeURIComponent(text)
    const page = await axios.get(apiUrl)
    const $ = cheerio.load(page.data)
    const imgUrl = $('img').first().attr('src') || $('img').first().attr('data-src')

    if (!imgUrl) return reply('❌ No se pudo generar el logo.')

    const buffer = await downloadImage(imgUrl)

    // ✅ Envía como imagen normal
    await sock.sendMessage(from, {
      image: buffer,
      caption: `Logo de ${command} para: ${text}`
    }, { quoted: m })

  } catch (e) {
    console.error('LOGO ERROR:', e)
    reply('❌ Error al generar el logo.')
  }
}

// Comandos disponibles
handler.command = [
  'logofreefire','logopubg','logominecraft','logocod','logofortnite','logolol',
  'logoragnarok','logogenshin','logonike','logoadidas','logomcdonalds','logopizza',
  'logomc','logohacker','logopokemon','logospider','logosonic','logofacebook',
  'logotwitter','logoinstagram','logoyoutube','logodc','logopikachu','logobatman',
  'logosuperman','logospiderman2','logojoker','logofire','logowater','logomagic',
  'logomusic','logogamer'
]

handler.tags = ['logos']
handler.help = ['logofreefire <texto>','logopubg <texto>','logominecraft <texto>']
