// cargar_datos.js — carga los datos de la app en Node igual que el navegador.
//
// Lee index.html, toma sus <script src="data/..."> en el mismo orden y los ejecuta en un
// contexto aislado con `window`. Devuelve lo que la app recibe:
//   bankJson    texto del banco de alternativas (window.SYSTEMS_DATA_JSON)
//   bank        ese texto ya convertido en objeto
//   oral        ORAL_VOICE_BANK (Entrevista oral y Need to know)
//   englishJson texto del banco de Inglés OACI (window.ENGLISH_DATA_JSON)
//   english     ese texto ya convertido en objeto
//   estaciones  window.ESTACIONES_DATA (materias, estaciones y ruta del mapa)
//   scripts     rutas de data/ que se cargaron, en orden
//
// Uso desde otra herramienta (también desde Escritorio\APP):
//   const { cargarDatos } = require('C:/Users/yodie/A320-Interview-Trainer/tools/cargar_datos.js');
//   const d = cargarDatos();            // o cargarDatos('otra/carpeta/de/la/app')
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP_DIR = path.resolve(__dirname, '..');

function scriptsDeDatos(appDir) {
  const html = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"?#]+)[^"]*"/g)]
    .map(m => m[1])
    .filter(src => src.startsWith('data/'));
}

function cargarDatos(appDir = APP_DIR) {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  const scripts = scriptsDeDatos(appDir);
  for (const rel of scripts) {
    const file = path.join(appDir, rel);
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: rel });
  }
  // ORAL_VOICE_BANK es un const global: se lee desde el mismo contexto.
  const oral = vm.runInContext('typeof ORAL_VOICE_BANK === "undefined" ? null : ORAL_VOICE_BANK', ctx);
  const w = ctx.window;
  const parse = s => (typeof s === 'string' ? JSON.parse(s) : null);
  return {
    bankJson: w.SYSTEMS_DATA_JSON,
    bank: parse(w.SYSTEMS_DATA_JSON),
    oral,
    englishJson: w.ENGLISH_DATA_JSON,
    english: parse(w.ENGLISH_DATA_JSON),
    estaciones: w.ESTACIONES_DATA || null,
    scripts,
  };
}

/* Mismas funciones que js/app.js usa para identificar una pregunta de alternativas:
   id = "<clave del sistema>:<hash del enunciado normalizado>". */
function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i); return (h >>> 0).toString(36); }
function qid(sys, q) { return sys + ':' + hash(norm(q.q)); }

module.exports = { cargarDatos, scriptsDeDatos, qid, APP_DIR };
