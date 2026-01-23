import fs from 'fs'

const banPath = './data/ban.json'

function loadBans() {
  if (!fs.existsSync(banPath)) return {}
  try {
    return JSON.parse(fs.readFileSync(banPath))
  } catch {
    return {}
  }
}

function saveBans(data) {
  fs.writeFileSync(banPath, JSON.stringify(data, null, 2))
}

function normalize(jid = '') {
  return jid.toString().replace(/[^0-9]/g, '')
}

// ───── API ─────
export function isBanned(jid) {
  const bans = loadBans()
  return !!bans[normalize(jid)]
}

export function banUser(jid, reason = 'Sin motivo') {
  const bans = loadBans()
  bans[normalize(jid)] = {
    reason,
    time: Date.now()
  }
  saveBans(bans)
}

export function unbanUser(jid) {
  const bans = loadBans()
  delete bans[normalize(jid)]
  saveBans(bans)
}

export function listBans() {
  return loadBans()
}
