/* Reúne el banco de alternativas (sistemas, Operación Airbus, Entrevista técnica y DGAC).
   Cada categoría vive en su propio archivo (data/questions/<clave>.js; las del DGAC, en
   data/questions/dgac/). index.html los carga antes que este. Aquí se arma el mismo objeto de
   siempre, en el orden de ORDER, y se entrega como texto JSON en window.SYSTEMS_DATA_JSON: con ese
   texto exacto js/app.js calcula la huella del banco (BANK_FINGERPRINT). Si falta o sobra una
   parte, el banco no se entrega y la app muestra «Couldn’t load the question bank». */
(function(){
  var ORDER=["procedures","hydraulic","fire","ice_rain","comms_oxygen","indicating","dgac_bank","air_cond","electrical","flight_control","landing_gear","autoflight","apu_powerplant","fuel","operations_airbus","interview_technical"];
  var parts=window.BANK_PARTS||{},secs=window.DGAC_SECTIONS||{},secOrder=window.DGAC_SECTION_ORDER||[];
  var problems=[];
  ORDER.forEach(function(k){if(!parts[k])problems.push("falta la categoría "+k)});
  Object.keys(parts).forEach(function(k){if(ORDER.indexOf(k)<0)problems.push("categoría sin registrar en ORDER: "+k)});
  secOrder.forEach(function(s){if(!secs[s])problems.push("falta la sección DGAC "+s)});
  Object.keys(secs).forEach(function(s){if(secOrder.indexOf(s)<0)problems.push("sección DGAC sin registrar: "+s)});
  delete window.BANK_PARTS;delete window.DGAC_SECTIONS;delete window.DGAC_SECTION_ORDER;
  if(problems.length){console.error("Banco incompleto: "+problems.join("; "));return}
  var bank={};
  ORDER.forEach(function(k){bank[k]=parts[k]});
  bank.dgac_bank.questions=[].concat.apply([],secOrder.map(function(s){return secs[s]}));
  window.SYSTEMS_DATA_JSON=JSON.stringify(bank);
})();
