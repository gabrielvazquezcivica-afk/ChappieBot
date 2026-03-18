let handler = async (m, { conn, text }) => {
  let chat = global.db.data.chats[m.chat]

  if (!chat.audios) return

  let t = (text || '').toLowerCase()

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
    'temazo': 'https://cdn.russellxz.click/a8f5df5a.mp3',
    ':v': 'https://cdn.russellxz.click/7fdd7ce1.mp3',
    'freefire': 'https://qu.ax/Dwqp.mp3',
    'orale': 'https://qu.ax/Epen.mp3',
    'contexto': 'https://qu.ax/YBzh.mp3',
    'pikachu': 'https://qu.ax/wbAf.mp3',
    'pokemon': 'https://qu.ax/kWLh.mp3',
    'rawr': 'https://qu.ax/YnoG.mp3',
    'cagaste': 'https://qu.ax/FAVP.mp3',
    'yoshi': 'https://qu.ax/ZgKT.mp3',
    'yamete': 'https://cdn.russellxz.click/284e70a5.mp3',
    'FBI': 'https://qu.ax/wFbD.mp3',
    'motivacion': 'https://qu.ax/MXnK.mp3'
  }

  if (audios[t]) {
    await conn.sendPresenceUpdate('recording', m.chat)
    await conn.sendFile(
      m.chat,
      audios[t],
      `${t}.mp3`,
      null,
      m,
      true,
      { type: 'audioMessage', ptt: true }
    )
  }
}

handler.customPrefix = /^(.*)$/i
handler.command = new RegExp

export default handler
