import fs from 'fs'
import path from 'path'

export const handler = async (m, { sock, reply, plugins }) => {

  const start = Date.now()

  // reacción
  await sock.sendMessage(m.key.remoteJid, {
    react: { text: '🤖', key: m.key }
  })

  const botName = sock.user?.name || 'CHAPPIEBOT'

  // 🔹 NOMBRE DEL OWNER
  const ownerName = global.config.owner?.name || 'GABRIEL'

  // ───── TOTAL GRUPOS ─────
  let groups = await sock.groupFetchAllParticipating()
  let totalGroups = Object.keys(groups).length

  // ───── USUARIOS REGISTRADOS ─────
  let totalUsers = 0

  try {
    const file = path.join(process.cwd(), 'data/coins.json')

    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file))
      totalUsers = Object.keys(data).length
    }
  } catch {}

  // ───── VELOCIDAD ─────
  const ping = Date.now() - start

  // ───── PLUGINS ─────
  const totalPlugins = plugins.length

  let text = `╭━━━〔 🤖 INFORMACIÓN DEL BOT 〕━━━╮
┃
┃ 👑 CREADOR
┃ ${ownerName}
┃
┃ 👥 GRUPOS
┃ ${totalGroups}
┃
┃ 🪙 USUARIOS REGISTRADOS
┃ ${totalUsers}
┃
┃ ⚡ VELOCIDAD
┃ ${ping} ms
┃
┃ 🧩 PLUGINS
┃ ${totalPlugins}
┃
┃ 🤖 BOT
┃ ${botName}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`

  await reply(text)

}

handler.command = ['infobot']
handler.tags = ['info']
handler.menu = true

export default handler
