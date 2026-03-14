import fs from 'fs'

const file = './data/ban.json'

export default async function banMiddleware(m) {

  if (!fs.existsSync(file)) return

  const banned = JSON.parse(fs.readFileSync(file))

  const user = m.key.participant || m.key.remoteJid

  if (banned.includes(user)) return false

}
