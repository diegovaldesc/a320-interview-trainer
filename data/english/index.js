/* Reúne el banco de Inglés OACI y lo entrega como texto JSON en window.ENGLISH_DATA_JSON, que
   js/app.js lee. Cada tipo de ejercicio vive en data/english/<tipo>.js. VERSION es la versión del
   banco de inglés. */
(function(){
  var VERSION="2026.09.24-v3";
  var KEYS=["mcq","images","listening","roleplays","pruebas"];
  var parts=window.ENGLISH_PARTS||{},out={version:VERSION};
  KEYS.forEach(function(k){if(parts[k])out[k]=parts[k];else console.error("Falta la parte de inglés "+k)});
  Object.keys(parts).forEach(function(k){if(KEYS.indexOf(k)<0)console.error("Parte de inglés sin registrar en KEYS: "+k)});
  delete window.ENGLISH_PARTS;
  window.ENGLISH_DATA_JSON=JSON.stringify(out);
})();
