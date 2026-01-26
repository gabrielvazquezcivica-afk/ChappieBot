import fetch from 'node-fetch'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

function isNSFW(chatId) {
  if (!fs.existsSync(nsfwPath)) return false
  try {
    const data = JSON.parse(fs.readFileSync(nsfwPath))
    return data[chatId] || false
  } catch {
    return false
  }
}

export const handler = async (m, { sock, from, command, isGroup, sender, reply }) => {

  // obtener texto REAL del mensaje
  const query = m.text.split(' ').slice(1).join(' ').trim()

  if (isGroup && !isNSFW(from)) {
    return reply(
`🔞 *Comandos NSFW desactivados en este grupo*
Un administrador puede activarlos con:
.nsfw on`
    )
  }

  if (!query) return reply(`❗ Uso correcto: .${command} <término de búsqueda>`)

  try {
    if (!global.videoListXXX) global.videoListXXX = []
    if (global.videoListXXX[0]?.from === sender) global.videoListXXX = []

    const res = await xnxxsearch(query)
    if (!res.result.length) return reply('❌ No se encontraron resultados.')

    let cap = `🔍 *RESULTADOS:* ${query.toUpperCase()}\n\n`
    let count = 1

    for (const v of res.result) {
      cap += `*[${count}]*\n`
      cap += `🎬 Título: ${v.title}\n`
      cap += `🔗 Link: ${v.link}\n`
      cap += `❗ Info: ${v.info}\n\n`
      cap += `━━━━━━━━━━━━━━\n\n`
      count++
    }

    reply(cap)
    global.videoListXXX.push({ from: sender, urls: res.result.map(r => r.link) })

  } catch (e) {
    console.error(e)
    reply('❌ Error al buscar en la página.')
  }
}

handler.help = ['xnxxsearch <query>']
handler.tags = ['xvideos']
handler.menu = true
handler.command = ['xnxxsearch']
export default handler

async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com'
    fetch(`${baseurl}/search/${encodeURIComponent(query)}/${Math.floor(Math.random() * 3) + 1}`)
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res)
        const title = [], url = [], desc = [], results = []

        $('div.mozaique').each((i, b) => {
          $(b).find('div.thumb').each((j, d) => {
            const href = $(d).find('a').attr('href')
            if (href) url.push(baseurl + href.replace('/THUMBNUM/', '/'))
          })
        })

        $('div.mozaique').each((i, b) => {
          $(b).find('div.thumb-under').each((j, d) => {
            desc.push($(d).find('p.metadata').text() || 'Sin info')
            $(d).find('a').each((k, f) => {
              title.push($(f).attr('title') || 'Sin título')
            })
          })
        })

        for (let i = 0; i < title.length; i++) {
          results.push({
            title: title[i],
            info: desc[i],
            link: url[i]
          })
        }

        resolve({ status: true, result: results })
      })
      .catch(err => reject(err))
  })
}
