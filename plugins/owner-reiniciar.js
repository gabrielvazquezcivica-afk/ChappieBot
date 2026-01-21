// owner-reiniciar.js
export const handler = async (m, { sock, from, sender, reply, owner }) => {
  const owners = global.config.owner?.numbers || [];
  const senderNum = sender.split('@')[0];

  if (!owners.includes(senderNum)) {
    return reply('⚠️ Este comando es solo para el OWNER');
  }

  // ✅ Aviso antes de reiniciar
  await sock.sendMessage(from, {
    react: { text: '🔄', key: m.key }
  });

  await reply('♻️ Reiniciando el bot, espera unos segundos...');

  // Espera 2 segundos para que el mensaje se vea
  setTimeout(() => {
    process.exit(0); // Esto cierra el bot y tu start.sh lo reiniciará
  }, 2000);
};

// ───── CONFIG ─────
handler.command = ['reiniciar'];
handler.tags = ['owner'];
handler.owner = true;

export default handler;
