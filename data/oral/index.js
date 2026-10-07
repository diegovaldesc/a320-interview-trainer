/* Reúne el banco de Entrevista oral en ORAL_VOICE_BANK (lo usan Entrevista oral, Need to know y
   la ruta). Cada grupo vive en data/oral/<grupo>.js; index.html los carga antes que este y antes
   que js/app.js. El orden de PARTS es el orden de las preguntas en la app. */
const ORAL_VOICE_BANK=(function(){
  var PARTS=["core","performance","automation_procedures"];
  var parts=window.ORAL_PARTS||{},list=[];
  PARTS.forEach(function(p){if(parts[p])list=list.concat(parts[p]);else console.error("Falta el grupo oral "+p)});
  Object.keys(parts).forEach(function(p){if(PARTS.indexOf(p)<0)console.error("Grupo oral sin registrar en PARTS: "+p)});
  delete window.ORAL_PARTS;
  return list;
})();
