// ─────────────────────────────
// CONFIGURACIÓN GLOBAL CHAPPIEBOT
// ─────────────────────────────

// 🔧 Normalizador JID
const toJid = (n) => {
  if (!n) return null
  if (n.includes('@')) return n
  return n.length > 15
    ? `${n}@lid`
    : `${n}@s.whatsapp.net`
}

// ───── CONFIG PRINCIPAL ─────
const config = {

  // ───── BOT ─────
  bot: {
    name: 'CHAPPIEBOT',
    prefix: '.',
    public: true,
    version: '1.0.0'
  },

  // ───── OWNER ─────
  owner: {
    name: 'SoyGabo',

    // números crudos
    numbers: [
      '523310167470',
      '215590228750567'
    ],

    // JID base
    jid: [
      '523310167470@s.whatsapp.net',
      '215590228750567@lid'
    ]
  },

  // ───── LOGIN ─────
  login: {
    pairing: true // true = código | false = QR
  },

  // ───── MENSAJES GLOBALES PARA PLUGINS ─────
  messages: {
    error: '❌ Ocurrió un error, intenta nuevamente',
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

export default config
