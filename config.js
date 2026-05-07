// ─────────────────────────────
// CONFIGURACIÓN GLOBAL CHAPPIEBOT
// ─────────────────────────────

// 🔧 Normalizador JID (CORREGIDO)
const toJid = (n) => {
  if (!n) return null
  if (n.includes('@')) return n.split(':')[0].replace('@lid', '@s.whatsapp.net')
  return `${n}@s.whatsapp.net`
}

// 🔥 Normalizador universal de sender
const normalizeJid = (jid = '') => {
  return jid.split(':')[0].replace('@lid', '@s.whatsapp.net')
}

// ───── CONFIG PRINCIPAL ─────
const config = {

  // ───── BOT ─────
  bot: {
    name: '𝐂𝐡𝐚𝐩𝐩𝐢𝐞𝐁𝐨𝐭',
    prefix: '.',
    public: true,
    version: '1.0.0'
  },

  // ───── OWNER ─────
  owner: {
    name: '𝑺𝒐𝒚𝑮𝒂𝒃𝒐',

    numbers: [
      '18252500344'
    ],

    jid: [
      '18252500344@s.whatsapp.net'
    ]
  },

  // ───── LOGIN ─────
  login: {
    pairing: true
  },

  // ───── MENSAJES GLOBALES ─────
  messages: {
    error: '❌ Ocurrió un error',
    admin: '⚠️ Este comando es solo para administradores',
    owner: '⚠️ Este comando es solo para el propietario',
    group: '⚠️ Este comando solo funciona en grupos',
    botAdmin: '⚠️ Necesito ser administrador para ejecutar esto'
  }
}

// 🔥 Normalizar owner JIDs finales
config.owner.jid = config.owner.jid
  .concat(config.owner.numbers.map(toJid))
  .filter(Boolean)


// ───── FUNCIÓN GLOBAL DE OWNER CHECK (CLAVE) ─────
export const isOwner = (sender) => {
  const jid = normalizeJid(sender)
  const number = jid.split('@')[0]

  return (
    config.owner.jid.includes(jid) ||
    config.owner.numbers.includes(number)
  )
}

export default config
