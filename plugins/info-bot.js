import os from 'os'

export const handler = async (m, { sock, plugins, reply }) => {

  // ✍️ SIMULAR ESCRIBIENDO
  await sock.sendPresenceUpdate('composing', m.chat)

  const start = performance.now()

  // 📌 CONFIG
  const botName = sock.user?.name || 'ChappieBot'
  const ownerName = global.config.owner?.name || 'Owner'

  // ⚡ velocidad
  const speed = (performance.now() - start).toFixed(2)

  // 🧩 plugins
  const totalPlugins = plugins.length

  // 📊 RAM
  const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)

  // ⏱️ uptime
  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)

  // ⏳ pequeño delay para que se note
  await new Promise(resolve => setTimeout(resolve, 1200))

  // 🎨 MENSAJE
  const text = `
╭━━━〔 🤖 ${botName} 〕━━━⬣
┃
┃ 👑 Owner: ${ownerName}
┃ ⚡ Velocidad: ${speed} ms
┃ 🧩 Plugins: ${totalPlugins}
┃
┃ 📊 RAM: ${ram} MB / ${totalRam} GB
┃ ⏱️ Activo: ${hours}h ${minutes}m ${seconds}s
┃
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await sock.sendMessage(m.chat, { text }, { quoted: m })

  // 📴 quitar estado de escribiendo
  await sock.sendPresenceUpdate('paused', m.chat)
}

handler.command = ['botinfo']
handler.tags = ['info']
handler.menu = true

export default handler
