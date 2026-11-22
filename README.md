# Loopwork Games hub (`arcade`)
A tiny static hub that only links out to each game. Every game is its own repo and its own GitHub Pages site (`<host>/<slug>/`). The hub links with relative `../<slug>/` paths, so deploy it on the same Pages host (repo `arcade` → `riyaanb.github.io/arcade/`; Triangulate → `riyaanb.github.io/triangulate/`).

- **Add or retire a game:** edit `docs/games.js`, add `docs/img/<slug>.webp` (720×378, e.g. a downscaled copy of the game's og image), and update the `<noscript>` list in `docs/index.html`. `npm test` checks they all agree. Then run `npm run images` to rebuild `docs/og.png`.
- **Run locally:** `npm start`, then open http://127.0.0.1:8870/arcade/. This runs `../studio/pages-sim.mjs`, which maps `/<slug>/` to `../<slug>/docs/` the way the Pages host will. A plain `python3 -m http.server` won't work: every card link would 404.
- **Tests:** `npm test` checks the registry, the noscript list, the images and the copy rules (no dependencies). `npm run e2e` runs headless Chrome at 1280×800 and 390×844 (touch). It follows every card into its game, checks for a 200 response and the right page title, and runs the hostile-storage and no-JS cases. It uses the Playwright copy in `../triangulate/node_modules` and `/usr/bin/google-chrome`. Screenshots are written to `/workspace/arcade-shots/arcade/`.
- **Deploy:** GitHub Pages from `main`, `/docs` folder. No external requests, no tracking, no ads. MIT licensed.
- **Honesty rule:** any tag that mentions computer opponents must say "bot", and the hub never claims "live" or shows player counts.
