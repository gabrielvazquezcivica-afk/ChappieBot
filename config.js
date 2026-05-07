// ─────────────────────────────
// CONFIGURACIÓN GLOBAL CHAPPIEBOT
// ─────────────────────────────

// 🔧 Normalizador JID REAL (Baileys safe)
const normalizeJid = (jid = '') => {
  return jid
    .split(':')[0]
    .replace('@lid', '@s.whatsapp.net')
    .replace('@broadcast', '')
}

// 🔧 obtener sender REAL (CLAVE)
const getSender = (m) => {
  return (
    m.key?.participant ||
    m.key?.remoteJid ||
    m.sender ||
    ''
  )
}

// ───── CONFIG PRINCIPAL ─────
const config = {

  bot: {
    name: '𝐂𝐡𝐚𝐩𝐩𝐢𝐞𝐁𝐨𝐭',
    prefix: '.',
    public: true,
    version: '1.0.0'
  },

  owner: {
    name: '𝑺𝒐𝒚𝑮𝒂𝒃𝒐',

    numbers: [
      '18252500344'
    ],

    jid: [
      '18252500344@s.whatsapp.net'
    ]
  },

  login: {
    pairing: true
  },

  messages: {
    error: '❌ Ocurrió un error',
    admin: '⚠️ Este comando es solo para administradores',
    owner: '⚠️ Este comando es solo para el propietario',
    group: '⚠️ Este comando solo funciona en grupos',
    botAdmin: '⚠️ Necesito ser administrador para ejecutar esto'
  }
}

// 🔥 normalizar owners finales
config.owner.jid = config.owner.jid
  .map(normalizeJid)
  .concat(config.owner.numbers.map(n => `${n}@s.whatsapp.net`))
  .filter(Boolean)


// ───── CHECK OWNER REAL (ESTO ES LO QUE TE FALTABA) ─────
export const isOwner = (m) => {

  const sender = normalizeJid(getSender(m))
  const number = sender.split('@')[0]

  return (
    config.owner.jid.includes(sender) ||
    config.owner.numbers.includes(number)
  )
}

export default config
