/* Reúne la ruta de entrenamiento en window.ESTACIONES_DATA (la lee js/ruta.js): materias en el orden
   de SUBJECTS (cada una en data/stations/<materia>.js) y la ruta del mapa (data/stations/route.js).
   Lo exporta Escritorio\APP\Estaciones\_herramientas\exportar_app.js: no se edita a mano;
   la fuente está en Escritorio\APP\Estaciones\_fuente\. */
(function(){
  var SUBJECTS=["controles","electrico","hidraulico","performance","tren"];
  var parts=window.STATION_PARTS||{},subjects=[];
  SUBJECTS.forEach(function(id){if(parts[id])subjects.push(parts[id]);else console.error("Falta la materia "+id)});
  Object.keys(parts).forEach(function(id){if(SUBJECTS.indexOf(id)<0)console.error("Materia sin registrar en SUBJECTS: "+id)});
  window.ESTACIONES_DATA={format:1,generated:"2026-10-07",subjects:subjects,route:window.STATION_ROUTE};
  delete window.STATION_PARTS;delete window.STATION_ROUTE;
})();
