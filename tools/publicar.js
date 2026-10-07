// publicar.js — arma la carpeta publicar/ con solo lo que la app necesita para funcionar.
//
//   node tools/publicar.js
//
// Lo corre Cloudflare Pages en cada publicación (Build command: node tools/publicar.js,
// Build output directory: publicar). Así el sitio no expone las pruebas, las herramientas,
// la documentación para IA ni data/manifest.json. Copia index.html, manifest.webmanifest y
// cada archivo local que index.html carga, más las imágenes de assets/.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'publicar');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const files = new Set(['index.html']);
for (const m of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g)) {
  const rel = m[1].split(/[?#]/)[0];
  if (!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(rel)) files.add(rel);
}
(function walk(dir) { // imágenes y audios que la app usa en tiempo de ejecución
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) walk(rel); else if (!/\.md$/i.test(e.name)) files.add(rel);
  }
})('assets');

fs.rmSync(OUT, { recursive: true, force: true });
let bytes = 0;
for (const rel of files) {
  const from = path.join(ROOT, rel);
  if (!fs.existsSync(from)) { console.error('index.html carga ' + rel + ', que no existe'); process.exit(1); }
  const to = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  bytes += fs.statSync(from).size;
}
console.log('publicar/: ' + files.size + ' archivos (' + Math.round(bytes / 1024) + ' KB)');
