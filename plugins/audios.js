export const handler = async (m, { sock, command }) => {

  const audios = {
    'buenomaster': 'https://cdn.russellxz.click/51d555db.mp3',
    'tralalero': 'https://cdn.russellxz.click/8d3290f3.mp3',
    'mudo': 'https://cdn.russellxz.click/155f5cc4.mp3',
    'malditoteni': 'https://cdn.russellxz.click/d9e48f07.mp3',
    'chambear': 'https://cdn.russellxz.click/fb415e7d.mp3',
    'miguel': 'https://qu.ax/ygNqu.mp3',
    'feo': 'https://cdn.russellxz.click/96fa6e44.mp3',
    'comoestan': 'https://qu.ax/OfgjC.opus',
    'pocodegente': 'https://f.uguu.se/YxAfrAnj.opus',
    'sex': 'https://cdn.russellxz.click/1c2a4ccd.mp3',
    'juicioso': 'https://f.uguu.se/QGdfsqyV.opus',
    'paltimos': 'https://f.uguu.se/sxXCZcBQ.opus',
    'tarado': 'https://qu.ax/CoOd.mp3',
    'donde': 'https://qu.ax/kCWg.mp3',
    'onda': 'https://qu.ax/YpsR.mp3',
    'bebesita': 'https://qu.ax/Ouwp.mp3',
    'tka': 'https://qu.ax/jakw.mp3',
    'takataka': 'https://qu.ax/rxvq.mp3',
    'hey': 'https://qu.ax/AaBt.mp3',
    'joder': 'https://qu.ax/lSgD.mp3',
    'siuuu': 'https://cdn.russellxz.click/05336e28.mp3',
    'amongos': 'https://qu.ax/Mnrz.mp3',
    'teamo': 'https://cdn.russellxz.click/9321ffdc.mp3',
    'triste': 'https://cdn.russellxz.click/b0d14bfc.mp3',
    'pato': 'https://qu.ax/pmOm.mp3',
    'viernes': 'https://cdn.russellxz.click/745f7caa.mp3',
    'wtf': 'https://cdn.russellxz.click/95894271.mp3',
    'yokese': 'https://qu.ax/PWgf.mp3',
    'vrg': 'https://cdn.russellxz.click/98d99914.mp3',
    'pubrio': 'https://qu.ax/keKg.mp3',
    'temazo': 'https://cdn.russellxz.click/a8f5df5a.mp3',
    'freefire': 'https://qu.ax/Dwqp.mp3',
    'feriado': 'https://qu.ax/mFCT.mp3',
    'moshi': 'https://qu.ax/JAyd.mp3',
    'navidad': 'https://cdn.russellxz.click/2d8778d7.mp3',
    'omg': 'https://qu.ax/PfuN.mp3',
    'orale': 'https://qu.ax/Epen.mp3',
    'pack': 'https://cdn.russellxz.click/496776f1.mp3',
    'contexto': 'https://qu.ax/YBzh.mp3',
    'pikachu': 'https://qu.ax/wbAf.mp3',
    'pokemon': 'https://qu.ax/kWLh.mp3',
    'rawr': 'https://qu.ax/YnoG.mp3',
    'hablame': 'https://cdn.russellxz.click/69fca661.mp3',
    'cagaste': 'https://qu.ax/FAVP.mp3',
    'yoshi': 'https://qu.ax/ZgKT.mp3',
    'yamete': 'https://cdn.russellxz.click/284e70a5.mp3',
    'detenido': 'https://qu.ax/UWqX.mp3',
    'pregunta': 'https://qu.ax/NHOM.mp3',
    'chiste': 'https://cdn.russellxz.click/f87ff38f.mp3'
  }

  if (!audios[command]) return

  await sock.sendPresenceUpdate('recording', m.chat)

  await sock.sendMessage(m.chat, {
    audio: { url: audios[command] },
    mimetype: 'audio/mp4',
    ptt: true
  }, { quoted: m })
}

handler.command = [
  'buenomaster','tralalero','mudo','malditoteni','chambear','miguel','feo',
  'comoestan','pocodegente','sex','juicioso','paltimos','tarado','donde','onda',
  'bebesita','tka','takataka','hey','joder','siuuu','amongos','teamo','triste',
  'pato','viernes','wtf','yokese','vrg','pubrio','temazo','freefire','feriado',
  'moshi','navidad','omg','orale','pack','contexto','pikachu','pokemon','rawr',
  'hablame','cagaste','yoshi','yamete','detenido','pregunta','chiste'
]

handler.tags = ['audios']
handler.help = handler.command

export default handler
