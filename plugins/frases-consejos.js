export const handler = async (m, { sock, from }) => {

  const consejos = [
{
  texto: `💡 *Consejo*

"No cuentes los días, haz que los días cuenten."

— *Muhammad Ali*`,
},
{
  texto: `🧠 *Consejo*

"El éxito no es definitivo, el fracaso no es fatal:
lo que cuenta es el valor para continuar."

— *Winston Churchill*`,
},
{
  texto: `🌱 *Consejo*

"Nunca es demasiado tarde para ser lo que podrías haber sido."

— *George Eliot*`,
},
{
  texto: `🔥 *Consejo*

"Hazlo o no lo hagas, pero no lo intentes."

— *Yoda*`,
},
{
  texto: `🌊 *Consejo*

"No podemos dirigir el viento,
pero sí ajustar las velas."

— *Aristóteles*`,
},
{
  texto: `✨ *Consejo*

"La mejor forma de empezar
es dejar de hablar y empezar a hacer."

— *Walt Disney*`,
},
{
  texto: `🛤️ *Consejo*

"Ve con confianza en la dirección de tus sueños.
Vive la vida que has imaginado."

— *Henry David Thoreau*`,
},
{
  texto: `🧩 *Consejo*

"El hombre que mueve montañas
empieza cargando pequeñas piedras."

— *Confucio*`,
},
{
  texto: `💭 *Consejo*

"Si quieres algo que nunca tuviste,
tendrás que hacer algo que nunca hiciste."

— *Thomas Jefferson*`,
},
{
  texto: `🕊️ *Consejo*

"La paz comienza con una sonrisa."

— *Madre Teresa de Calcuta*`,
}
  ]

  // 🎲 Elegir consejo aleatorio
  const consejo = consejos[Math.floor(Math.random() * consejos.length)].texto

  // 💡 Reacción
  await sock.sendMessage(from, {
    react: { text: '💡', key: m.key }
  })

  // 📩 Enviar consejo
  await sock.sendMessage(
    from,
    { text: consejo },
    { quoted: m }
  )
}

handler.command = ['consejo']
handler.tags = ['frases']
handler.menu = true

export default handler
