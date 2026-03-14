import fs from 'fs'

const file = './data/ban.json'

export function isBanned(jid) {

  if (!jid) return false
  if (!fs.existsSync(file)) return false

  try {

    const banned = JSON.parse(fs.readFileSync(file))

    const number = jid.split('@')[0].split(':')[0]

    return banned.includes(number)

  } catch {
    return false
  }

}
