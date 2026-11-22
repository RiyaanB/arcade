// The only list to edit when a game ships or retires (also update the <noscript> list in
// index.html; `npm test` checks they match). Each game is its own repo/site; the hub only
// links out, relative to the shared Pages host (e.g. riyaanb.github.io/<slug>/).
//   art:   docs/img/<slug>.webp (720x378). focus: object-position for the narrow phone/landscape crop,
//          or sq: true to use docs/img/<slug>-sq.webp there instead (when no crop of the wide art works).
//   tags:  short, honest facts. Anything involving computer opponents must say "bot".
//   status: 'new' shows a NEW badge; use it only for a game added after the others.
export const GAMES = [
  { slug: 'triangulate', name: 'Triangulate', genre: 'Geography battle royale', color: '#2bb673', status: 'live', sq: true,
    hook: 'Guess the country from its shape and clues; outlast 19 bots over 7 rounds.',
    tags: ['Daily', '🤖 vs 19 bots', '7 rounds'] },
  { slug: 'outnumber', name: 'Outnumber', genre: 'Trivia · higher or lower', color: '#f5a623', status: 'live', focus: '88% 50%',
    hook: 'Which is bigger? Keep the streak alive across real-world stats.',
    tags: ['Daily', '🤖 vs 5 bots', 'Endless streak'] },
  { slug: 'twotone', name: 'Twotone', genre: 'Logic puzzle', color: '#7b61ff', status: 'live', focus: '92% 50%',
    hook: 'A calm daily grid of suns and moons. One solution, no guessing.',
    tags: ['Daily', '🤖 race 3 bots', '6×6 to 10×10'] },
  { slug: 'orbithop', name: 'Orbit Hop', genre: 'One-tap arcade', color: '#ff7ad9', status: 'live', focus: '50% 50%',
    hook: 'Tap to launch from orbit to orbit. Chain PERFECT hops; don\u2019t drift off.',
    tags: ['Daily', '🤖 race 3 bots', 'One-tap'] },
  { slug: 'gridword', name: 'Gridword', genre: 'Word game', color: '#00a6ed', status: 'live', focus: '84% 50%',
    hook: 'Swipe words out of a letter grid in 90 seconds; race the bots.',
    tags: ['Daily', '🤖 vs 3–5 bots', '90 s rounds'] },
  { slug: 'hexclaim', name: 'Hexclaim', genre: 'Strategy duel', color: '#14b8a6', status: 'live', focus: '50% 50%',
    hook: 'Clone, jump, flip. A 3-minute hex strategy duel vs bots.',
    tags: ['Daily', '🤖 vs bot, 4 levels', 'Pass & play'] },
  { slug: 'kablock', name: 'KABLOCK!', genre: 'Voxel arena FPS', color: '#ff5a36', status: 'new', sq: true,
    hook: 'Every wall breaks. Slide, grapple and blast through arenas vs bots.',
    tags: ['🤖 vs 7 bots', '3D FPS', 'Daily'] },
];
