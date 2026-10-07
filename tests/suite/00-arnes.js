/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
/* Bateria de regresion de A320 Interview Trainer (ver TESTING.md).
   La inyecta tests/run.ps1 al final de una copia temporal de index.html,
   asi corre dentro de la propia app con acceso a sus funciones y a su
   estado. Cada caso lleva el ID del hallazgo que lo origino. No forma parte
   de la app publicada. */
(function(){
  var tests=[];
  function T(name,fn){tests.push({name:name,fn:fn})}
  function ok(cond,msg){if(!cond)throw new Error(msg||"la condicion no se cumple")}
  function eq(actual,expected,msg){
    if(actual!==expected)throw new Error((msg||"valor inesperado")+": esperado "+JSON.stringify(expected)+", obtenido "+JSON.stringify(actual));
  }
  function byId(id){return document.getElementById(id)}
  function oral(id){var q=ORAL_VOICE_BANK.find(function(x){return x.id===id});ok(q,"no existe la pregunta oral "+id);return q}
  function det(text,item){var s=normalizeAeroText(text);return itemDetected(s.split(" ").filter(Boolean),s,item)}
  function fcomQ(i){return rawPool(null)[i||0]}
  function reset(){
    try{localStorage.clear()}catch(e){}
    appState=defaultState();session=null;currentSystemKey=null;
    stateSaveWarned=false;oralMicPermissionGranted=false;
    try{enSession=null;enHubNote=""}catch(e){}
    try{stopEverythingOral()}catch(e){}
    try{ntkSession=null;ntkRestoreOralBox()}catch(e){}
    byId("toast").textContent="";
    show("home");
  }
  function roundTrip(state){return sanitizeState(JSON.parse(JSON.stringify(state)))}
  function FakeSR(){FakeSR.instances.push(this);this.startCalls=0}
  FakeSR.instances=[];
  FakeSR.prototype.start=function(){this.startCalls++};
  FakeSR.prototype.stop=function(){this.stopped=true};
  FakeSR.prototype.abort=function(){this.aborted=true};
  function setupMic(getUserMedia){
    FakeSR.instances=[];
    window.SpeechRecognition=FakeSR;
    Object.defineProperty(window,"isSecureContext",{value:true,configurable:true});
    Object.defineProperty(navigator,"mediaDevices",{value:{getUserMedia:getUserMedia},configurable:true});
  }
  function teardownMic(){
    delete window.SpeechRecognition;
    try{delete navigator.mediaDevices}catch(e){}
  }
  function okStream(){return Promise.resolve({getTracks:function(){return[]}})}

