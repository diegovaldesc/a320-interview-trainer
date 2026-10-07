/* Arranque de la app: se carga después de js/app.js, js/oral.js, js/needtoknow.js y js/ingles.js, y antes
   de js/ruta.js. Recupera el progreso guardado, revisa la integridad de los bancos y pinta el inicio. */
appState=loadState();
const BANK_HEALTH=bankIntegrity();
if(!BANK_HEALTH.ok)console.warn("A320 Trainer · bank integrity",BANK_HEALTH);
renderHome();
