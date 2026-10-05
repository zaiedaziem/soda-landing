# Soda — Diet Soda landing page

A 3D soda can floats and follows your cursor while berries scatter from your touch
and the whole world shifts color when you pick a flavor.

Plain HTML, CSS and JavaScript — no build step. GSAP and Google's `<model-viewer>`
load from CDNs; every model and image lives in `assets/` (the path is `ASSET_BASE_URL` in `js/main.js`).

## Requirements

- Python 3 (only to serve the files — nothing to install, no build step)
- A modern browser with WebGL (Chrome, Edge, Firefox, Safari)
- An internet connection for the libraries and fonts (GSAP, model-viewer, Google Fonts) — all models and images are local, in `assets/`

## Run it

Serve the folder rather than double-clicking `index.html` — the 3D models are loaded
with `fetch`, which browsers block for pages opened from `file://`.

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
- Scroll down, or use the nav: **Ingredients**, **Taste**, **Eco** and **Reviews** reveal
  as they come into view, and the nav highlights the section you're in.
- In **Taste**, the "Try …" button scrolls back up and switches the flavor through the hero.

## Layout

```
index.html          markup: header, hero, then the Ingredients / Taste / Eco / Reviews
                    sections, CTA and footer
css/styles.css      the hero, exactly as specified (theme variables, glass nav, cards, keyframes)
css/sections.css    everything below the hero, plus the change that lets the page scroll
js/main.js          hero: can tilt, flavor switch, berry repulsion/float, leaves, bubbles
js/sections.js      nav scrolling + active state, scroll reveals, count-ups, Taste buttons
assets/             3D models, can images and textures, bubble
notes/              the original build spec
```
