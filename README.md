# Soda — Diet Soda landing page

A 3D soda can floats and follows your cursor while berries scatter from your touch
and the whole world shifts color when you pick a flavor.

Plain HTML, CSS and JavaScript — no build step. GSAP and Google's `<model-viewer>`
load from CDNs; every model and image loads from `ASSET_BASE_URL` in `js/main.js`.

## Requirements

- Python 3 (only to serve the files — nothing to install, no build step)
- A modern browser with WebGL (Chrome, Edge, Firefox, Safari)
- An internet connection: fonts, GSAP, model-viewer and every model/image load from CDNs

## Run it

Serve the folder rather than double-clicking `index.html` — the 3D models are fetched
from another origin, which browsers handle reliably only over `http://`.

1. Open a terminal in the project folder.
2. Start a static server:

   ```bash
   python -m http.server 5179
   ```

   On Windows, if `python` isn't found, use the launcher:

   ```bash
   py -m http.server 5179
   ```

3. Open http://localhost:5179 in your browser.
4. Stop the server with `Ctrl+C`.

Any other static server works too (`npx serve`, VS Code Live Server, GitHub Pages).

## What to try

- Move the cursor — the can tilts toward it and the berries drift with parallax.
- Hover near a berry — it's pushed away and spins faster.
- Click **Zero Lime** or **Diet Classic** — the background morphs, the can spins 720°
  and changes its label, and the berries implode, swap (cherry ↔ blueberry) and burst back out.

## Layout

```
index.html        markup: header, hero columns, 3D models, flavor cards
css/styles.css    theme variables, layout, glass nav, cards, keyframes
js/main.js        can tilt, flavor switch, berry repulsion/float, leaves, bubbles
notes/            the original build spec
```
