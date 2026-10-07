// data-integrity.js — revisa la integridad de los datos de la app sin abrir el navegador.
//
//   node tests/data-integrity.js
//
// Comprueba que index.html carga todos los archivos de data/ (y ninguno que no exista), que cada
// archivo registra solo lo que dice su nombre, que cada pregunta, pregunta oral, ejercicio de inglés y
// estación tenga la forma correcta y un id único, y que data/manifest.json (cantidades por archivo)
// esté al día. No juzga el contenido aeronáutico: eso se revisa por separado contra las fuentes.
// tests/run.ps1 lo corre antes de la batería del navegador. Sale con 1 si algo falla.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cargarDatos, scriptsDeDatos, qid, APP_DIR } = require('../tools/cargar_datos.js');
const manifest = require('../tools/manifest.js');

const fails = [], warns = [];
const fail = m => fails.push(m), warn = m => warns.push(m);
const check = (name, fn) => { try { fn(); } catch (e) { fail(name + ': ' + e.message); } };
const rel = p => path.relative(APP_DIR, p).replace(/\\/g, '/');
const str = v => typeof v === 'string' && v.trim() !== '';

const scripts = scriptsDeDatos(APP_DIR);
let d = null;
check('carga', () => { d = cargarDatos(); });
if (!d) { console.error('FALLA  ' + fails.join('\n')); process.exit(1); }

// ---------- index.html ↔ archivos de data/ ----------
check('index.html', () => {
  const all = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else if (e.name.endsWith('.js')) all.push(rel(p));
    }
  })(path.join(APP_DIR, 'data'));
  for (const f of all) if (!scripts.includes(f)) fail('data: ' + f + ' existe pero index.html no lo carga');
  for (const f of scripts) if (!all.includes(f)) fail('index.html carga ' + f + ', que no existe');
  const dup = scripts.filter((f, i) => scripts.indexOf(f) !== i);
  if (dup.length) fail('index.html carga dos veces: ' + dup.join(', '));
  for (const dir of ['data/questions/', 'data/oral/', 'data/english/', 'data/stations/']) {
    const idx = scripts.indexOf(dir + 'index.js');
    if (idx < 0) { fail('index.html no carga ' + dir + 'index.js'); continue; }
    scripts.forEach((f, i) => { if (f.startsWith(dir) && i > idx) fail(f + ' se carga después de ' + dir + 'index.js, que lo reúne'); });
  }
});

/* Cada archivo, ejecutado solo, debe registrar exactamente lo que dice su nombre. */
function registra(f) {
  const ctx = { window: {}, console: { error() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(APP_DIR, f), 'utf8'), ctx, { filename: f });
  return ctx.window;
}
const base = f => path.basename(f, '.js');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
for (const f of scripts.filter(s => !s.endsWith('/index.js'))) {
  check(f, () => {
    const w = registra(f);
    const keys = g => Object.keys(w[g] || {});
    if (f.startsWith('data/questions/dgac/')) {
      if (keys('DGAC_SECTIONS').length !== 1 || slug(keys('DGAC_SECTIONS')[0]) !== base(f)) fail(f + ' debe registrar solo su sección DGAC (registra: ' + keys('DGAC_SECTIONS').join(', ') + ')');
      for (const [sec, qs] of Object.entries(w.DGAC_SECTIONS || {})) qs.forEach((q, i) => { if (q.bank_section !== sec) fail(f + ' pregunta ' + (i + 1) + ': bank_section «' + q.bank_section + '» no es «' + sec + '»'); });
    } else if (f.startsWith('data/questions/')) {
      if (keys('BANK_PARTS').join() !== base(f)) fail(f + ' debe registrar solo la categoría ' + base(f) + ' (registra: ' + keys('BANK_PARTS').join(', ') + ')');
    } else if (f.startsWith('data/oral/')) {
      if (keys('ORAL_PARTS').join() !== base(f)) fail(f + ' debe registrar solo el grupo ' + base(f));
    } else if (f.startsWith('data/english/')) {
      if (keys('ENGLISH_PARTS').join() !== base(f)) fail(f + ' debe registrar solo la parte ' + base(f));
    } else if (f === 'data/stations/route.js') {
      if (!w.STATION_ROUTE) fail(f + ' debe registrar STATION_ROUTE');
    } else if (f.startsWith('data/stations/')) {
      if (keys('STATION_PARTS').join() !== base(f)) fail(f + ' debe registrar solo la materia ' + base(f));
    } else fail(f + ': carpeta de datos desconocida');
  });
}

// ---------- banco de alternativas ----------
check('banco', () => {
  if (typeof d.bankJson !== 'string') throw new Error('data/questions/index.js no entregó el banco (falta o sobra una parte)');
  if (JSON.stringify(d.bank) !== d.bankJson) fail('el texto del banco no es JSON compacto: la huella cambiaría sin cambiar el contenido');
  const app = fs.readFileSync(path.join(APP_DIR, 'js', 'app.js'), 'utf8');
  const arr = name => { const m = new RegExp('const ' + name + '=(\\[[^\\]]*\\])').exec(app); return m ? JSON.parse(m[1]) : []; };
  const one = name => { const m = new RegExp('const ' + name + '="([^"]+)"').exec(app); return m ? m[1] : null; };
  const expected = [...arr('SYSTEM_ORDER'), ...arr('OPERATIONS_ORDER'), one('INTERVIEW_TECH_KEY'), one('DGAC_KEY')];
  for (const k of expected) if (!d.bank[k]) fail('js/app.js usa la categoría ' + k + ', que no está en el banco');
  for (const k of Object.keys(d.bank)) if (!expected.includes(k)) warn('la categoría ' + k + ' está en el banco pero js/app.js no la nombra');
  const seen = new Map();
  for (const [k, c] of Object.entries(d.bank)) {
    if (!str(c.name)) fail(k + ': falta name');
    if (!Array.isArray(c.questions) || !c.questions.length) { fail(k + ': sin preguntas'); continue; }
    c.questions.forEach((q, i) => {
      const at = k + ' #' + (i + 1);
      if (!str(q.q)) return fail(at + ': sin enunciado');
      if (!Array.isArray(q.options) || q.options.length < 2 || !q.options.every(str)) fail(at + ': alternativas inválidas');
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options || []).length) fail(at + ': correct fuera de rango');
      if (new Set((q.options || []).map(o => String(o).trim().toLowerCase())).size !== (q.options || []).length) fail(at + ': alternativas repetidas');
      if (k !== 'dgac_bank' && (!str(q.expl) || !str(q.cite))) fail(at + ': falta explicación o cita interna');
      const id = qid(k, q);
      if (seen.has(id)) fail('id repetido ' + id + ' (' + seen.get(id) + ' y ' + at + ')'); else seen.set(id, at);
    });
  }
});

// ---------- Entrevista oral ----------
check('oral', () => {
  if (!Array.isArray(d.oral) || !d.oral.length) throw new Error('ORAL_VOICE_BANK vacío');
  const ids = new Set();
  d.oral.forEach((q, i) => {
    const at = 'oral #' + (i + 1) + ' ' + (q && q.id);
    if (!q || !str(q.id)) return fail(at + ': sin id');
    if (ids.has(q.id)) fail('id oral repetido ' + q.id); ids.add(q.id);
    if (!str(q.question) || !str(q.reference)) fail(at + ': falta pregunta o respuesta de referencia');
    const rubric = Array.isArray(q.steps) && q.steps.length ? q.steps : q.concepts;
    if (!Array.isArray(rubric) || !rubric.length) return fail(at + ': sin rúbrica');
    rubric.forEach((it, j) => {
      if (!it || !Array.isArray(it.accepted) || !it.accepted.length || !it.accepted.every(str)) fail(at + ' rúbrica ' + (j + 1) + ': accepted inválido');
      if (it && it.weight !== undefined && !(Number.isFinite(it.weight) && it.weight > 0)) fail(at + ' rúbrica ' + (j + 1) + ': weight inválido');
    });
  });
});

// ---------- Inglés OACI ----------
check('inglés', () => {
  const e = d.english;
  if (!e) throw new Error('data/english/index.js no entregó el banco');
  const ids = new Set();
  for (const k of ['mcq', 'images', 'listening', 'roleplays']) {
    if (!Array.isArray(e[k]) || !e[k].length) { fail('inglés: falta ' + k); continue; }
    e[k].forEach((x, i) => { if (!str(x.id)) fail('inglés ' + k + ' #' + (i + 1) + ': sin id'); else if (ids.has(x.id)) fail('id de inglés repetido ' + x.id); else ids.add(x.id); });
  }
  (e.mcq || []).forEach(x => { if (!Array.isArray(x.options) || !Number.isInteger(x.correct) || x.correct < 0 || x.correct >= x.options.length) fail('inglés ' + x.id + ': correct fuera de rango'); });
  (e.pruebas || []).forEach(p => {
    for (const k of ['mcq', 'images', 'listening']) (p[k] || []).forEach(id => { if (!ids.has(id)) fail('prueba ' + p.n + ' nombra ' + id + ', que no existe'); });
    if (p.roleplay && !ids.has(p.roleplay)) fail('prueba ' + p.n + ' nombra ' + p.roleplay + ', que no existe');
  });
});

// ---------- estaciones ----------
check('estaciones', () => {
  const E = d.estaciones;
  if (!E || !Array.isArray(E.subjects)) throw new Error('data/stations/index.js no entregó la ruta');
  const ids = new Set();
  for (const s of E.subjects) for (const st of s.stations || []) {
    if (!str(st.id)) { fail(s.id + ': estación sin id'); continue; }
    if (ids.has(st.id)) fail('id de estación repetido ' + st.id); ids.add(st.id);
    if (st.subject !== s.id) fail(st.id + ': subject «' + st.subject + '» no es ' + s.id);
  }
  for (const m of (E.route && E.route.missions) || []) if (!ids.has(m.id)) fail('la ruta nombra ' + m.id + ', que no existe');
});

// ---------- manifiesto y tamaños ----------
check('manifest', () => {
  const have = fs.existsSync(manifest.OUT) ? fs.readFileSync(manifest.OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (have !== manifest.text()) fail('data/manifest.json está desactualizado: corre  node tools/manifest.js');
});
for (const f of scripts) {
  const kb = fs.statSync(path.join(APP_DIR, f)).size / 1024;
  if (kb > 160) warn(f + ' pesa ' + Math.round(kb) + ' KB: conviene dividirlo por un criterio de contenido');
}

const n = d.bank ? Object.values(d.bank).reduce((a, c) => a + c.questions.length, 0) : 0;
const st = d.estaciones ? d.estaciones.subjects.reduce((a, s) => a + s.stations.length, 0) : 0;
for (const w of warns) console.log('AVISO  ' + w);
if (fails.length) {
  console.log('FALLA  integridad de datos: ' + fails.length + ' problema(s)');
  for (const f of fails.slice(0, 40)) console.log('  - ' + f);
  process.exit(1);
}
console.log('OK  integridad de datos: ' + scripts.length + ' archivos, ' + n + ' preguntas de alternativas, ' + d.oral.length +
  ' orales, ' + (d.english.mcq.length + d.english.images.length + d.english.listening.length + d.english.roleplays.length) +
  ' ejercicios de inglés, ' + st + ' estaciones');
