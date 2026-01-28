import { Maker } from 'imagemaker.js';

const logos = {
  logocorazon: 'https://en.ephoto360.com/text-heart-flashlight-188.html',
  logochristmas: 'https://en.ephoto360.com/christmas-effect-by-name-376.html',
  logopareja: 'https://en.ephoto360.com/sunlight-shadow-text-204.html',
  logoglitch: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  logosad: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
  logogaming: 'https://en.ephoto360.com/make-team-logo-online-free-432.html',
  logosolitario: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
  logodragonball: 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
  logoneon: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
  logogatito: 'https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html',
  logochicagamer: 'https://en.ephoto360.com/create-cute-girl-gamer-mascot-logo-online-687.html',
  logonaruto: 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html',
  logofuturista: 'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html',
  logonube: 'https://en.ephoto360.com/cloud-text-effect-139.html',
  logoangel: 'https://en.ephoto360.com/angel-wing-effect-329.html',
  logocielo: 'https://en.ephoto360.com/create-a-cloud-text-effect-in-the-sky-618.html',
  logograffiti3d: 'https://en.ephoto360.com/text-graffiti-3d-208.html',
  logomatrix: 'https://en.ephoto360.com/matrix-text-effect-154.html',
  logohorror: 'https://en.ephoto360.com/blood-writing-text-online-77.html',
  logoalas: 'https://en.ephoto360.com/the-effect-of-galaxy-angel-wings-289.html',
  logoarmy: 'https://en.ephoto360.com/free-gaming-logo-maker-for-fps-game-team-546.html',
  logopubg: 'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html',
  logopubgfem: 'https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html',
  logolol: 'https://en.ephoto360.com/make-your-own-league-of-legends-wallpaper-full-hd-442.html',
  logoamongus: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
  logovideopubg: 'https://en.ephoto360.com/lightning-pubg-video-logo-maker-online-615.html',
  logovideotiger: 'https://en.ephoto360.com/create-digital-tiger-logo-video-effect-723.html',
  logovideointro: 'https://en.ephoto360.com/free-logo-intro-video-maker-online-558.html',
  logovideogaming: 'https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html',
  logoguerrero: 'https://en.ephoto360.com/create-project-yasuo-logo-384.html',
  logoportadaplayer: 'https://en.ephoto360.com/create-the-cover-game-playerunknown-s-battlegrounds-401.html',
  logoportadaff: 'https://en.ephoto360.com/create-free-fire-facebook-cover-online-567.html',
  logoportadapubg: 'https://en.ephoto360.com/create-facebook-game-pubg-cover-photo-407.html',
  logoportadacounter: 'https://en.ephoto360.com/create-youtube-banner-game-cs-go-online-403.html'
};

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) {
    throw '*[❗] Ingresa un texto para el logo*';
  }

  const text = args.join(' ');

  if (!logos[command.toLowerCase()]) {
    return conn.reply(m.chat, '*[❗] Comando no reconocido*', m);
  }

  try {
    await conn.reply(m.chat, '*[❗] Elaborando logo, aguarda un momento...*', m);
    const res = await new Maker().Ephoto360(logos[command.toLowerCase()], [text]);
    await conn.sendFile(m.chat, res.imageUrl, 'logo.jpg', null, m);
  } catch (err) {
    console.log(err);
    await conn.reply(m.chat, '*[❗] Ocurrió un error, intenta más tarde*', m);
  }
};

handler.help = Object.keys(logos);
handler.tags = ['logos'];
handler.command = new RegExp(`^(${Object.keys(logos).join('|')})$`, 'i');

export default handler;
