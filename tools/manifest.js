// manifest.js — escribe data/manifest.json: solo metadatos (qué archivo tiene qué y cuántos), nunca
// el contenido. Sirve para saber dónde mirar sin abrir los datos.
//
//   node tools/manifest.js           reescribe data/manifest.json
//   node tools/manifest.js --check   solo compara (sale con 1 si está desactualizado)
//
// tests/data-integrity.js también lo compara: si agregas o quitas preguntas, corre este script.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cargarDatos, scriptsDeDatos, APP_DIR } = require('./cargar_datos.js');

const OUT = path.join(APP_DIR, 'data', 'manifest.json');

/* Ejecuta un solo archivo de datos en un contexto vacío y devuelve lo que registró. */
function registra(rel) {
  const ctx = { window: {}, console: { error() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(APP_DIR, rel), 'utf8'), ctx, { filename: rel });
  return ctx.window;
}

function build() {
  const d = cargarDatos();
  const scripts = scriptsDeDatos(APP_DIR);
  const inDir = dir => scripts.filter(s => s.startsWith(dir) && !s.endsWith('/index.js'));

  const categories = {};
  for (const rel of inDir('data/questions/')) {
    const w = registra(rel);
    for (const [key, c] of Object.entries(w.BANK_PARTS || {})) {
      categories[key] = { name: c.name, file: rel, count: key === 'dgac_bank' ? d.bank[key].questions.length : c.questions.length, idPrefix: key + ':' };
      if (key === 'dgac_bank') categories[key].sections = {};
    }
    for (const [sec, qs] of Object.entries(w.DGAC_SECTIONS || {})) {
      categories.dgac_bank.sections[sec] = { file: rel, count: qs.length };
    }
  }
  const ordered = {};
  for (const key of Object.keys(d.bank)) ordered[key] = categories[key];

  const oralGroups = {};
  for (const rel of inDir('data/oral/')) {
    for (const [g, list] of Object.entries(registra(rel).ORAL_PARTS || {})) {
      oralGroups[g] = { file: rel, count: list.length, ids: list.map(q => q.id) };
    }
  }

  const englishParts = {};
  for (const rel of inDir('data/english/')) {
    for (const [k, list] of Object.entries(registra(rel).ENGLISH_PARTS || {})) {
      englishParts[k] = { file: rel, count: list.length, ids: list.map(x => x.id != null ? x.id : x.n) };
    }
  }

  const subjects = {};
  let routeFile = null;
  for (const rel of inDir('data/stations/')) {
    const w = registra(rel);
    for (const [id, s] of Object.entries(w.STATION_PARTS || {})) {
      subjects[id] = { title: s.title, file: rel, count: s.stations.length,
        stations: s.stations.map(st => st.id + ' · ' + st.title) };
    }
    if (w.STATION_ROUTE) routeFile = rel;
  }

  return {
    about: 'Solo metadatos de data/ (archivo y cantidad de cada parte). Lo escribe tools/manifest.js: no se edita a mano.',
    questions: {
      aggregator: 'data/questions/index.js', global: 'window.SYSTEMS_DATA_JSON',
      idFormat: '<category key>:<hash of the normalized stem> (tools/buscar.js finds it)',
      total: Object.values(d.bank).reduce((n, c) => n + c.questions.length, 0),
      categories: ordered,
    },
    oral: { aggregator: 'data/oral/index.js', global: 'ORAL_VOICE_BANK', total: d.oral.length, groups: oralGroups },
    english: { aggregator: 'data/english/index.js', global: 'window.ENGLISH_DATA_JSON', version: d.english.version, parts: englishParts },
    stations: {
      aggregator: 'data/stations/index.js', global: 'window.ESTACIONES_DATA',
      generatedBy: 'Escritorio\\APP\\Estaciones\\_herramientas\\exportar_app.js (source: Escritorio\\APP\\Estaciones\\_fuente, outside this repo)',
      total: d.estaciones.subjects.reduce((n, s) => n + s.stations.length, 0),
      subjects, route: { file: routeFile, stations: d.estaciones.route.missions.length },
    },
  };
}

const text = () => JSON.stringify(build(), null, 1) + '\n';
module.exports = { build, text, OUT };

if (require.main === module) {
  const want = text();
  if (process.argv.includes('--check')) {
    const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
    if (have !== want) { console.error('data/manifest.json está desactualizado: corre  node tools/manifest.js'); process.exit(1); }
    console.log('data/manifest.json al día');
  } else {
    fs.writeFileSync(OUT, want, 'utf8');
    console.log('data/manifest.json escrito (' + Math.round(want.length / 1024) + ' KB)');
  }
}
