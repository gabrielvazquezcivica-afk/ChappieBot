export const handler = async (m, { sock }) => {

  const text = (m.text || '').toLowerCase().trim()

  const audios = {
    'bueno master': 'https://cdn.russellxz.click/51d555db.mp3',
    'tralalero tralala': 'https://cdn.russellxz.click/8d3290f3.mp3',
    'mudo': 'https://cdn.russellxz.click/155f5cc4.mp3',
    'maldito teni': 'https://cdn.russellxz.click/d9e48f07.mp3',
    'chambear': 'https://cdn.russellxz.click/fb415e7d.mp3',
    'conoces a miguel': 'https://qu.ax/ygNqu.mp3',
    'usted es feo': 'https://cdn.russellxz.click/96fa6e44.mp3',
    'como estan': 'https://qu.ax/OfgjC.opus',
    'poco de gente': 'https://f.uguu.se/YxAfrAnj.opus',
    'viva el sexo': 'https://cdn.russellxz.click/1c2a4ccd.mp3',
    'juicioso': 'https://f.uguu.se/QGdfsqyV.opus',
    'lo paltimos': 'https://f.uguu.se/sxXCZcBQ.opus',
    'tarado': 'https://qu.ax/CoOd.mp3',
    'donde esta': 'https://qu.ax/kCWg.mp3',
    'q onda': 'https://qu.ax/YpsR.mp3',
    'bebesita': 'https://qu.ax/Ouwp.mp3',
    'tka': 'https://qu.ax/jakw.mp3',
    'takataka': 'https://qu.ax/rxvq.mp3',
    'hey': 'https://qu.ax/AaBt.mp3',
    'joder': 'https://qu.ax/lSgD.mp3',
    'siuuu': 'https://cdn.russellxz.click/05336e28.mp3',
    'amongos': 'https://qu.ax/Mnrz.mp3',
    'teamo': 'https://cdn.russellxz.click/9321ffdc.mp3',
    'estoy triste': 'https://cdn.russellxz.click/b0d14bfc.mp3',
    'un pato': 'https://qu.ax/pmOm.mp3',
    'fiesta viernes': 'https://cdn.russellxz.click/745f7caa.mp3',
    'wtf': 'https://cdn.russellxz.click/95894271.mp3',
    'yokese': 'https://qu.ax/PWgf.mp3',
    'vete a la vrg': 'https://cdn.russellxz.click/98d99914.mp3',
    'se pubrio': 'https://qu.ax/keKg.mp3',
    'temazo': 'https://cdn.russellxz.click/a8f5df5a.mp3',
    ':v': 'https://cdn.russellxz.click/7fdd7ce1.mp3',
    'freefire': 'https://qu.ax/Dwqp.mp3',
    'es viernes': 'https://qu.ax/LcdD.mp3',
    'feriado': 'https://qu.ax/mFCT.mp3',
    'delibery': 'https://qu.ax/WGzN.mp3',
    'aguanta': 'https://qu.ax/Qmz.mp3',
    'moshi moshi': 'https://qu.ax/JAyd.mp3',
    'nadie te pregunto': 'https://qu.ax/MrGg.mp3',
    'feliz navidad': 'https://cdn.russellxz.click/2d8778d7.mp3',
    'niconico': 'https://qu.ax/YdVq.mp3',
    'no chupala': 'https://qu.ax/iCRk.mp3',
    'no me hables': 'https://qu.ax/xxtz.mp3',
    'no me hagas usar esto': 'https://qu.ax/bzDa.mp3',
    'no digas eso papus': 'https://qu.ax/jsb.mp3',
    'noche de paz': 'https://cdn.russellxz.click/8e6bd672.mp3',
    'omg': 'https://qu.ax/PfuN.mp3',
    'onichan': 'https://qu.ax/sEFj.mp3',
    'orale': 'https://qu.ax/Epen.mp3',
    'pasa pack': 'https://cdn.russellxz.click/496776f1.mp3',
    'contexto': 'https://qu.ax/YBzh.mp3',
    'pero esto': 'https://qu.ax/javz.mp3',
    'pikachu': 'https://qu.ax/wbAf.mp3',
    'pokemon': 'https://qu.ax/kWLh.mp3',
    'quien es tu botsito': 'https://qu.ax/uyqQ.mp3',
    'rawr': 'https://qu.ax/YnoG.mp3',
    'hablame': 'https://cdn.russellxz.click/69fca661.mp3',
    'cagaste': 'https://qu.ax/FAVP.mp3',
    'yoshi': 'https://qu.ax/ZgKT.mp3',
    'verdad que te engañe': 'https://qu.ax/yTid.mp3',
    'vivan los novios': 'https://cdn.russellxz.click/9e1167d5.mp3',
    'yamete': 'https://cdn.russellxz.click/284e70a5.mp3',
    'usted está detenido': 'https://qu.ax/UWqX.mp3',
    'una pregunta': 'https://qu.ax/NHOM.mp3',
    'chiste': 'https://cdn.russellxz.click/f87ff38f.mp3'
  }

  if (audios[text]) {
    await sock.sendPresenceUpdate('recording', m.chat)

    await sock.sendMessage(m.chat, {
      audio: { url: audios[text] },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m })
  }
}

handler.command = [
  'bueno master','tralalero tralala','mudo','maldito teni','chambear',
  'conoces a miguel','usted es feo','como estan','poco de gente','viva el sexo',
  'juicioso','lo paltimos','tarado','donde esta','q onda','bebesita','tka','takataka',
  'hey','joder','siuuu','amongos','teamo','estoy triste','un pato','fiesta viernes',
  'wtf','yokese','vete a la vrg','se pubrio','temazo',':v','freefire','es viernes',
  'feriado','delibery','aguanta','moshi moshi','nadie te pregunto','feliz navidad',
  'niconico','no chupala','no me hables','no me hagas usar esto','no digas eso papus',
  'noche de paz','omg','onichan','orale','pasa pack','contexto','pero esto','pikachu',
  'pokemon','quien es tu botsito','rawr','hablame','cagaste','yoshi',
  'verdad que te engañe','vivan los novios','yamete','usted está detenido',
  'una pregunta','chiste'
]

handler.tags = ['audios']
handler.help = ['audios']

export default handler
