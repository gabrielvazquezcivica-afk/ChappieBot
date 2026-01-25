import fetch from 'node-fetch'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const nsfwPath = path.resolve('./data/nsfw.json')

// ───── FUNCION PARA CHECAR NSFW ─────
function isNSFW(chatId) {
  if (!fs.existsSync(nsfwPath)) return false
  try {
    const data = JSON.parse(fs.readFileSync(nsfwPath))
    return data[chatId] || false
  } catch {
    return false
  }
}

// ───── HANDLER ─────
export const handler = async (m, { sock, from, text, command, isGroup, sender, reply }) => {

  // ❌ Bloquear si NSFW no está activado en este chat
  if (isGroup && !isNSFW(from)) {
    return reply(
      `*[❗] Los comandos +18 están desactivados en este grupo*\n` +
      `Si eres admin y deseas activarlos, usa: .enable nsfw`
    )
  }

  if (!text) return reply(
    `*[❗ INFO ❗] Uso correcto del comando:*\n` +
    `${command} <término de búsqueda>`
  )

  try {
    const vids_ = { from: sender, urls: [] }
    if (!global.videoListXXX) global.videoListXXX = []
    if (global.videoListXXX[0]?.from === sender) global.videoListXXX.splice(0, global.videoListXXX.length)

    const res = await xnxxsearch(text)
    const json = res.result

    if (!json.length) return reply('❌ No se encontraron resultados')

    let cap = `*🔍 RESULTADOS DE LA BÚSQUEDA:* ${text.toUpperCase()}\n\n`
    let count = 1

    for (const v of json) {
      const linkXXX = v.link
      vids_.urls.push(linkXXX)
      cap += `*[${count}]*\n• *🎬 Título:* ${v.title}\n• *🔗 Link:* ${v.link}\n• *❗ Info:* ${v.info}`
      cap += '\n\n••••••••••••••••••••••••••••••••\n\n'
      count++
    }

    reply(cap)
    global.videoListXXX.push(vids_)

  } catch (e) {
    console.error(e)
    reply('❌ Error al contactar la página o procesar resultados')
  }
}

// ───── CONFIGURACIÓN DEL HANDLER ─────
handler.help = ['xnxxsearch'].map(v => v + ' <query>')
handler.tags = ['xvideos]
handler.command = ['xnxxsearch', 'xnxxs']
export default handler

// ───── FUNCIONES AUX ─────
async function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com'
    fetch(`${baseurl}/search/${encodeURIComponent(query)}/${Math.floor(Math.random() * 3) + 1}`, { method: 'get' })
      .then(res => res.text())
      .then(res => {
        const $ = cheerio.load(res, { xmlMode: false })
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
          results.push({ title: title[i], info: desc[i], link: url[i] })
        }

        resolve({ code: 200, status: true, result: results })
      }).catch(err => reject({ code: 503, status: false, result: err }))
  })
      }
