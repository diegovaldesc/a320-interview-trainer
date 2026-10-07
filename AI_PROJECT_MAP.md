# AI project map — A320 Interview Trainer

Read this first, then open only the file you need. Rules for agents: `AGENTS.md`.

## What the app is

A static web app (no build, no framework, no backend) for A320 pilot interview prep. It is published on
GitHub Pages from `main`. It covers multiple-choice banks (FCOM systems, Airbus operations, technical
interview, the historical DGAC exam), a spoken oral interview with local scoring, ICAO English practice,
"Need to know" key questions, and a gamified training route (stations on a map). The UI is in English
and the lessons are in neutral Spanish. Progress lives in `localStorage`.

## How it loads

`index.html` loads **classic scripts** (not ES modules) in a fixed order. Every file writes into
`window` or the shared global scope:

1. `data/**` parts register pieces (`window.BANK_PARTS`, `ORAL_PARTS`, `ENGLISH_PARTS`, `STATION_PARTS`…).
2. Each folder's `index.js` joins its parts into the global the app reads, then deletes the parts.
3. `js/app.js` → `js/oral.js` → `js/needtoknow.js` → `js/ingles.js` → `js/inicio.js` (startup) → `js/ruta.js`.

The order matters. Function declarations are only visible to scripts that run later.

## Where things are

| What | Where |
|---|---|
| Multiple-choice questions, by category | `data/questions/<key>.js` (one question per line) |
| Category keys | `procedures, hydraulic, air_cond, electrical, flight_control, landing_gear, autoflight, apu_powerplant, fuel, fire, ice_rain, comms_oxygen, indicating, operations_airbus, interview_technical, dgac_bank` |
| DGAC exam questions, by section | `data/questions/dgac/<section>.js`; metadata and section order in `data/questions/dgac_bank.js` |
| Bank aggregator → `window.SYSTEMS_DATA_JSON` | `data/questions/index.js` |
| Oral interview questions → `ORAL_VOICE_BANK` | `data/oral/core.js`, `performance.js`, `automation_procedures.js`; joined by `data/oral/index.js` |
| ICAO English → `window.ENGLISH_DATA_JSON` | `data/english/mcq.js`, `images.js`, `listening.js`, `roleplays.js`, `pruebas.js`; joined by `data/english/index.js` |
| Training route → `window.ESTACIONES_DATA` | `data/stations/<subject>.js` (one station per line), `route.js` (map), `index.js`. **Generated**: see below |
| Counts and file of every part (metadata only) | `data/manifest.json` |
| Core logic: bank loading, state and backup, quizzes, home, integrity | `js/app.js` |
| Oral interview engine (mic, rubric scoring) | `js/oral.js` |
| Need to know section | `js/needtoknow.js` |
| ICAO English section | `js/ingles.js` |
| Startup (load state, integrity check, first render) | `js/inicio.js` |
| Route: cover, map, stations, stars | `js/ruta.js` (+ `css/ruta.css`, prefix `rt-`) |
| Screens (HTML) | `index.html`: `<section id="home|systemsFolder|detail|quiz|interview|oralVoice|ntk|ntkCard|results|weak|englishHub|englishPractice">`, route UI `id="rt…"` |
| Styles | `css/app.css`, `css/ruta.css` |
| PWA manifest and icons | `manifest.webmanifest`, `assets/icons/` |
| Images | `assets/estaciones/` (generated), `assets/ingles/`, `assets/*.png` |
| Tests | `tests/run.ps1` (all), `tests/data-integrity.js` (Node), `tests/suite/NN-*.js` (browser battery, by section), `TESTING.md` (each case) |
| Tools | `tools/buscar.js` (find anything), `tools/manifest.js`, `tools/version.js`, `tools/cargar_datos.js` (loads data in Node exactly like the browser) |

**Stations are generated.** Their source is outside this repo, in
`C:\Users\yodie\Desktop\APP\Estaciones\_fuente\<subject>.js`. `_herramientas\construir.js` then
`_herramientas\exportar_app.js` write `data/stations/` and `assets/estaciones/`. Never edit
`data/stations/` by hand. If you can't reach that folder, report the change you need instead.

## Identifiers

- **Multiple-choice question:** `<key>:<hash>`, for example `hydraulic:1tbt8ld`, from `qid()` in
  `js/app.js`. The hash comes from the normalized stem, so **editing a stem changes the id**. In that
  case add `old→new` to `QID_RENAMES` in `js/app.js`, or users lose their progress on that question.
- **Oral question:** `id` such as `ov_fc_laws`.
- **English item:** `en_q_NN`, `en_img_NN`, `en_lis_NN`, `en_rp_NN`; English tests are `n` 1–4.
- **Station:** such as `tren-6` or `ctl-repaso`; each card has its own `id`.

## How to find…

- **A question, station or exercise:** run `node tools/buscar.js "emergency descent"` or
  `node tools/buscar.js hydraulic:1tbt8ld`. It prints `file:line`, so you open only that line.
  Without Node, grep `data/` for a distinctive phrase; each line is one item.
- **A screen:** grep `index.html` for the section id, then grep `js/` for `show("<id>")` or for its render function.
- **A function:** grep `js/` for `function <name>` (or `<name>(` for call sites). In `js/ruta.js` the
  functions are inside one closure and are exposed via `window.RUTA`.
- **Which file holds what, and counts:** open `data/manifest.json`.
