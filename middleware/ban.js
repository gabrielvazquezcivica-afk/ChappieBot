import fs from 'fs'

const file = './data/ban.json'

export function isBanned(user) {

  if (!fs.existsSync(file)) return false

  try {
    const banned = JSON.parse(fs.readFileSync(file))
    return banned.includes(user)
  } catch {
    return false
  }

}
