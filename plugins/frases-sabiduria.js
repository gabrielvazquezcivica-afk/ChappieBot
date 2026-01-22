export const handler = async (m, { sock, from }) => {

  const frases = [
`🧠 *Sabiduría*
"Conócete a ti mismo."
— *Sócrates*`,

`📘 *Sabiduría*
"Solo sé que no sé nada."
— *Sócrates*`,

`🌿 *Sabiduría*
"La paciencia es amarga,
pero su fruto es dulce."
— *Aristóteles*`,

`🪶 *Sabiduría*
"La vida es simple,
pero insistimos en complicarla."
— *Confucio*`
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  await sock.sendMessage(from, { react: { text: '🧠', key: m.key } })
  await sock.sendMessage(from, { text: frase }, { quoted: m })
}

handler.command = ['sabiduria']
handler.tags = ['frases']
handler.menu = true

export default handler
