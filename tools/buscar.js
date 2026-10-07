// buscar.js — encuentra una pregunta, una pregunta oral, un ejercicio de inglés o una estación y dice
// en qué archivo y en qué línea está, sin abrir los datos completos.
//
//   node tools/buscar.js "emergency descent"     texto (sin importar mayúsculas ni tildes)
//   node tools/buscar.js hydraulic:1tbt8ld       id de una pregunta de alternativas (como lo guarda la app)
//   node tools/buscar.js ov_fc_laws              id de una pregunta oral, de inglés o de una estación
//   node tools/buscar.js "ptu" --max 50          muestra hasta 50 resultados (por defecto 20)
//
// Busca en el enunciado, las alternativas, la explicación y el tema de cada pregunta; en la pregunta y
// la respuesta de referencia de las orales; en los textos de inglés; y en el título y las fichas de
// cada estación. Cada resultado trae archivo:línea para abrir solo ese tramo.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { scriptsDeDatos, qid, APP_DIR } = require('./cargar_datos.js');

const args = process.argv.slice(2);
const maxAt = args.indexOf('--max');
const MAX = maxAt >= 0 ? +args[maxAt + 1] || 20 : 20;
const query = args.filter((a, i) => maxAt < 0 || (i !== maxAt && i !== maxAt + 1)).join(' ').trim();
if (!query) { console.log('Uso: node tools/buscar.js <texto o id> [--max N]'); process.exit(2); }

const fold = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ');
const q = fold(query);
const flat = v => typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : String(v == null ? '' : v);

/* Cada archivo se ejecuta solo, para saber exactamente qué registra y en qué línea. */
const hits = [];
for (const rel of scriptsDeDatos(APP_DIR).filter(s => !s.endsWith('/index.js'))) {
  const text = fs.readFileSync(path.join(APP_DIR, rel), 'utf8');
  const lines = text.split('\n');
  const lineOf = (needle, from = 0) => { for (let i = from; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1; return 0; };
  const ctx = { window: {}, console: { error() {} } };
  vm.createContext(ctx);
  vm.runInContext(text, ctx, { filename: rel });
  const w = ctx.window;
  const add = (kind, id, line, preview, haystack) => {
    if (fold(id) === q || fold(haystack).includes(q)) hits.push({ kind, id, where: rel + ':' + line, preview: String(preview).slice(0, 110), exact: fold(id) === q });
  };
  for (const [key, c] of Object.entries(w.BANK_PARTS || {})) {
    c.questions.forEach(x => add('alternativas · ' + key, qid(key, x), lineOf(JSON.stringify(x.q)), x.q, [x.q, x.options, x.expl, x.topic]));
  }
  for (const [sec, qs] of Object.entries(w.DGAC_SECTIONS || {})) {
    qs.forEach(x => add('DGAC · ' + sec, qid('dgac_bank', x), lineOf(JSON.stringify(x.q)), x.q, [x.q, x.options, x.expl]));
  }
  for (const list of Object.values(w.ORAL_PARTS || {})) {
    list.forEach(x => add('oral', x.id, lineOf('{id:' + JSON.stringify(x.id)), x.question, [x.question, x.reference, x.short]));
  }
  for (const [k, list] of Object.entries(w.ENGLISH_PARTS || {})) {
    list.forEach(x => { const id = x.id != null ? x.id : 'prueba ' + x.n; add('inglés · ' + k, id, x.id != null ? lineOf('"id": ' + JSON.stringify(x.id)) : lineOf('"n": ' + x.n), x.q || x.title || id, flat(x)); });
  }
  for (const [subj, s] of Object.entries(w.STATION_PARTS || {})) {
    s.stations.forEach(st => add('estación · ' + subj, st.id, lineOf('{"id":' + JSON.stringify(st.id)), st.title, [st.title, st.cards]));
  }
}
hits.sort((a, b) => b.exact - a.exact);
if (!hits.length) { console.log('Sin resultados para «' + query + '».'); process.exit(1); }
console.log(hits.length + ' resultado(s) para «' + query + '»' + (hits.length > MAX ? ' (se muestran ' + MAX + '; usa --max)' : '') + ':');
for (const h of hits.slice(0, MAX)) console.log('  ' + h.where + '  [' + h.kind + ']  ' + h.id + '\n      ' + h.preview);
