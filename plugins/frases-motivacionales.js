export const handler = async (m, { sock, from }) => {

  const frases = [
`🔥 *Motivación*
"El único límite es el que tú te pones."
— *Anónimo*`,

`🚀 *Motivación*
"No sueñes tu vida, vive tu sueño."
— *Anónimo*`,

`💪 *Motivación*
"Disciplina vence motivación."
— *Anónimo*`,

`🌟 *Motivación*
"El éxito es la suma de pequeños esfuerzos repetidos."
— *Robert Collier*`,

`🏆 *Motivación*
"Cree en ti incluso cuando nadie más lo haga."
— *Anónimo*`
  ]

  const frase = frases[Math.floor(Math.random() * frases.length)]

  await sock.sendMessage(from, { react: { text: '🔥', key: m.key } })
  await sock.sendMessage(from, { text: frase }, { quoted: m })
}

handler.command = ['motivacion']
handler.tags = ['frases']
handler.menu = true

export default handler
