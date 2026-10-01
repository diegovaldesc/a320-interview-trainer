// Compara dos salidas de tests/pantallas.js (ver TESTING.md, seccion 13).
//   node tests\comparar_pantallas.js antes.json despues.json
// Sale con codigo 0 si todas las pantallas son iguales y 1 si alguna cambia (muestra la primera diferencia).
const fs = require('fs');

function load(file) {
  const buf = fs.readFileSync(file);
  // PowerShell 5.1 escribe con ">" en UTF-16; Out-File -Encoding utf8 agrega una marca al inicio.
  let text = buf[0] === 0xFF && buf[1] === 0xFE ? buf.toString('utf16le') : buf.toString('utf8');
  return JSON.parse(text.replace(/^﻿/, ''));
}
function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return '\n      antes:   ' + JSON.stringify(a.slice(Math.max(0, i - 60), i + 60)) +
         '\n      despues: ' + JSON.stringify(b.slice(Math.max(0, i - 60), i + 60));
}

const [fa, fb] = process.argv.slice(2);
if (!fa || !fb) { console.error('Uso: node tests\\comparar_pantallas.js antes.json despues.json'); process.exit(2); }
const a = load(fa), b = load(fb);
let bad = 0;
for (const run of [a, b]) {
  const errs = [...run.errors, ...run.errorsAfter];
  if (errs.length) { bad++; console.log('Errores de script: ' + errs.join(' | ')); }
  const failed = run.steps.filter(s => / (ERROR|FAILED) /.test(s));
  if (failed.length) { bad++; console.log('Pasos que fallaron: ' + failed.join(' | ')); }
}
for (const name of Object.keys(a.screens)) {
  const x = a.screens[name], y = b.screens[name];
  if (!y) { bad++; console.log(name + ': falta en la segunda version'); continue; }
  if (x.html !== y.html) { bad++; console.log(name + ': cambia el HTML' + firstDiff(x.html, y.html)); }
  if (x.css !== y.css) { bad++; console.log(name + ': cambian los estilos o la distribucion' + firstDiff(x.css, y.css)); }
  if (x.scrollH !== y.scrollH) { bad++; console.log(name + ': cambia el alto de la pagina (' + x.scrollH + ' -> ' + y.scrollH + ')'); }
}
for (const k of Object.keys(a.facts)) {
  if (a.facts[k] !== b.facts[k]) { bad++; console.log('dato ' + k + ': ' + a.facts[k] + ' -> ' + b.facts[k]); }
}
console.log(bad ? 'HAY DIFERENCIAS (' + bad + ')' : 'Iguales: ' + Object.keys(a.screens).length + ' pantallas con el mismo HTML, estilos y distribucion');
process.exit(bad ? 1 : 0);
