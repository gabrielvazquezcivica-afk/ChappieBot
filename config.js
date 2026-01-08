export default {
  // ───── BOT ─────
  bot: {
    name: 'Chappie Bot',
    prefix: '.',
    mode: 'public' // public | private
  },

  // ───── OWNER ─────
  owner: {
    number: ['523310167470'], // tu número con código país
    name: 'SoyGabo'
  },

  // ───── MENSAJES GLOBALES ─────
  messages: {
    owner: '👑 Este comando es solo para el owner.',
    admin: '🛡️ Este comando es solo para administradores.',
    group: '👥 Este comando solo funciona en grupos.',
    private: '📩 Este comando solo funciona en privado.',
    botAdmin: '⚠️ Necesito ser administrador para usar este comando.',
    error: '❌ Ocurrió un error al ejecutar el comando.',
    wait: '⏳ Procesando...',
    done: '✅ Listo.'
    // ❌ Sin mensajes de "comando ejecutado"
  },

  // ───── STICKERS ─────
  sticker: {
    packname: 'Chappie Bot',
    author: 'soyGabo'
  },

  // ───── APIS (opcional) ─────
  APIs: {
    example: 'https://api.example.com'
  },

  APIKeys: {
    'https://api.example.com': 'API_KEY_AQUI'
  }
}
