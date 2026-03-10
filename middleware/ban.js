import fs from 'fs'
import path from 'path'

const banPath = path.join('./data/ban.json')

export const isBanned = (jid = '') => {

  const number = jid.replace(/[^0-9]/g, '')

  if (!fs.existsSync(banPath)) return false

  let banList = {}

  try {
    banList = JSON.parse(fs.readFileSync(banPath))
  } catch {
    banList = {}
  }

  return !!banList[number]
}
