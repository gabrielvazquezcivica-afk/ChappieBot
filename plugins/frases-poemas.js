export const handler = async (m, { sock, from }) => {

  const poemas = [
{
  texto: `🌹 *Poema*

"Podrá nublarse el sol eternamente;
podrá secarse en un instante el mar;
podrá romperse el eje de la tierra
como un débil cristal."

— *Gustavo Adolfo Bécquer*`,
},
{
  texto: `🌙 *Poema*

"Es tan corto el amor y tan largo el olvido."

— *Pablo Neruda*`,
},
{
  texto: `✨ *Poema*

"Quien ama no teme,
quien teme no ama."

— *Aristóteles*`,
},
{
  texto: `🌌 *Poema*

"Andábamos sin buscarnos,
pero sabiendo que andábamos para encontrarnos."

— *Julio Cortázar*`,
},
{
  texto: `💫 *Poema*

"Donde no hay amor,
pon amor y encontrarás amor."

— *San Juan de la Cruz*`,
},
{
  texto: `🖤 *Poema*

"No llores porque terminó,
sonríe porque sucedió."

— *Gabriel García Márquez*`,
},
{
  texto: `🌠 *Poema*

"Aprendí que no se puede dar marcha atrás,
que la esencia de la vida es ir hacia adelante."

— *Agatha Christie*`,
},
{
  texto: `🔥 *Poema*

"Libertad es el derecho que tienen las personas
de actuar libremente, pensar y hablar sin hipocresía."

— *José Martí*`,
},
{
  texto: `🌺 *Poema*

"El amor no mira con los ojos,
sino con el alma."

— *William Shakespeare*`,
},
{
  texto: `🌊 *Poema*

"Caminante, no hay camino,
se hace camino al andar."

— *Antonio Machado*`,
}
  ]

  // 🎲 Elegir poema aleatorio
  const poema = poemas[Math.floor(Math.random() * poemas.length)].texto

  // 📜 Reacción
  await sock.sendMessage(from, {
    react: { text: '📜', key: m.key }
  })

  // 📩 Enviar poema
  await sock.sendMessage(
    from,
    { text: poema },
    { quoted: m }
  )
}

handler.command = ['poema']
handler.tags = ['frases']
handler.menu = true

export default handler
