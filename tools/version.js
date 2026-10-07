// version.js — sube la versión de la app en un solo paso.
//
//   node tools/version.js            muestra la versión y revisa que todo la use
//   node tools/version.js 1.23.0     cambia APP_VERSION (js/app.js) y cada ?v= de index.html
//
// Cada archivo local que carga index.html (css/, data/, js/) lleva ?v=APP_VERSION para que el
// navegador no use una copia vieja. Con muchos archivos es fácil olvidar uno: este script los cambia
// todos y la prueba ESTRUCTURA-01 lo confirma.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'js', 'app.js');
const INDEX = path.join(ROOT, 'index.html');

const app = fs.readFileSync(APP, 'utf8');
const html = fs.readFileSync(INDEX, 'utf8');
const cur = (/const APP_VERSION="([^"]+)"/.exec(app) || [])[1];
if (!cur) { console.error('No encuentro APP_VERSION en js/app.js'); process.exit(2); }
const REF = /(<(?:script|link)\b[^>]*?\b(?:src|href)="(?![a-z]+:|\/\/)[^"?]+\?v=)([^"]+)(")/g;
const refs = [...html.matchAll(REF)];

const next = process.argv[2];
if (!next) {
  const off = refs.filter(m => m[2] !== cur);
  console.log('APP_VERSION ' + cur + ' · ' + refs.length + ' archivos con ?v=' + (off.length ? ' · ' + off.length + ' con otra versión' : ' · todos al día'));
  process.exit(off.length ? 1 : 0);
}
if (!/^\d+\.\d+\.\d+$/.test(next)) { console.error('La versión debe ser como 1.23.0'); process.exit(2); }
fs.writeFileSync(APP, app.replace(/const APP_VERSION="[^"]+"/, 'const APP_VERSION="' + next + '"'), 'utf8');
fs.writeFileSync(INDEX, html.replace(REF, '$1' + next + '$3'), 'utf8');
console.log('APP_VERSION ' + cur + ' → ' + next + ' · ' + refs.length + ' archivos de index.html con ?v=' + next);
