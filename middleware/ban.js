import fs from 'fs'

const file = './data/ban.json'

export function isBanned(user) {

  if (!user) return false
  if (!fs.existsSync(file)) return false

  try {

    const banned = JSON.parse(fs.readFileSync(file))

    const cleanUser = user.split(':')[0]

    return banned.includes(cleanUser)

  } catch {
    return false
  }

}
