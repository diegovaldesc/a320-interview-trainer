# A320 Interview Trainer — instructions for AI agents

Work narrowly and minimize context usage. Start with `AI_PROJECT_MAP.md`.

## Search first, read second

1. Search for the text, ID, function or system name (`node tools/buscar.js "<text or id>"`, or grep).
2. Identify the one file that holds it (`data/manifest.json` lists every data file).
3. Read only the relevant line range.
4. Check only its direct dependencies.
5. Edit.

Never open every file, read everything, and only then look for the problem.

## Context rules

- Never read the entire repository unless explicitly necessary.
- Never read all question-bank files to solve a task about one system: open `data/questions/<key>.js` only.
- Data files hold one item per line: read the matching line, not the whole file.
- Do not inspect images (`assets/`) unless the task concerns those images.
- Do not read `data/stations/` to change a lesson: it is generated (see below).
- Prefer small line ranges over complete files. `js/app.js` and `tests/suite/11-ingles.js` are the largest code files.

## Editing rules

- Modify only the files the task needs, usually 1–3. Do not refactor unrelated code.
- Preserve IDs and data schemas. A question's ID comes from its stem (`qid()` in `js/app.js`). If you
  must edit a stem, add the old→new pair to `QID_RENAMES` so users keep their progress.
- Data files are plain JavaScript: keep the `window.…_PARTS[...] = …` wrapper and one item per line.
- Never edit `data/stations/` or `assets/estaciones/` by hand. Lessons come from
  `C:\Users\yodie\Desktop\APP\Estaciones\_fuente\` through `_herramientas\construir.js` and
  `_herramientas\exportar_app.js`.
- After adding or removing items, run `node tools/manifest.js`. The integrity test fails if `data/manifest.json` is stale.
- Adding a new data file needs a `<script>` tag in `index.html` placed before that folder's
  `index.js`. A new bank category also goes into `ORDER` in `data/questions/index.js`.
- Releasing: run `node tools/version.js X.Y.Z`. It updates `APP_VERSION` and every `?v=` in
  `index.html`; browsers otherwise keep stale copies.
- Never open `.codex` (credentials). Never commit `.claude/`.

## Aeronautical content

- Do not change technical A320 content (questions, correct answers, distractors, explanations,
  procedures, limitations, numbers, FCOM/DGAC references) merely because it looks unusual, or to make
  a refactor easier.
- Report potential technical inaccuracies separately, for human review.
- Every lesson fact must come from the source documents in `C:\Users\yodie\Desktop\APP`, not from
  general knowledge.
- DGAC questions are the official exam: keep their stems as written. The key marks the answer that is
  right for the real aircraft.
- Nothing user-visible in new content may cite a manual, section, page or document (FCOM, FCTM, PDF, §,
  AIP…). Sources go in internal fields (`cite`, `src`, `refs`) that are never shown.

## Language and style

- UI and route titles are in English. Lessons and explanations are in neutral Spanish (no Chilean wording).
- Keep aviation terms in English (for example TOD, ASD, stopway, screen height); never write «altura de pantalla».
- Write «PTU» with no article. Say «estación», never «misión».

## Tests

Run targeted checks first, then the full set:

- `node tests/data-integrity.js` checks data structure, unique IDs, files vs `index.html`, and the manifest (Node only, about 1 s).
- `powershell -ExecutionPolicy Bypass -File tests\run.ps1` runs the integrity check, then the full
  browser battery, inside the real app (headless Chrome or Edge, about 10 s). Run it before every commit
  that touches the app.
- A new bug gets a new case in the matching `tests/suite/NN-*.js` section, with its finding ID. Confirm
  it fails without the fix. Each case is documented in `TESTING.md`.
