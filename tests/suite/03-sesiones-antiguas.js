/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- 2. Recuperar sesiones antiguas ---------- */
  T("2 A03 huella ausente, nula o distinta invalida la sesion; la vigente continua",function(){
    reset();currentSystemKey=null;
    startTechnical("study",rawPool(null).slice(0,2));
    var saved=JSON.parse(JSON.stringify(appState.resume));
    var variants=[null,"deadbeef",undefined];
    for(var i=0;i<variants.length;i++){
      session=null;
      appState.resume=Object.assign({},saved,{bankFingerprint:variants[i]});
      resumeSession();
      ok(appState.resume===null,"la sesion con huella "+variants[i]+" no se invalido");
      ok(session===null,"no debio iniciar sesion con huella "+variants[i]);
    }
    session=null;
    appState.resume=Object.assign({},saved,{bankFingerprint:BANK_FINGERPRINT});
    resumeSession();
    ok(session&&session.questions.length===2,"la sesion vigente no continuo");
  });
  T("2 A06 preguntas corruptas invalidan el resume; arreglos desalineados se descartan",function(){
    var base={mode:"technical",type:"study",systemKey:null,index:0,questions:[{q:"a",options:["x","y"],correct:0}],bankFingerprint:BANK_FINGERPRINT};
    eq(sanitizeResume(Object.assign({},base,{questions:[{q:"a",options:null,correct:0}]})),null,"options:null");
    eq(sanitizeResume(Object.assign({},base,{questions:[{q:"a",options:["x","y"],correct:5}]})),null,"correct fuera de rango");
    var r=sanitizeResume(Object.assign({},base,{answers:[],counted:[]}));
    ok(r&&!("answers" in r)&&!("counted" in r),"debio descartar arreglos de largo distinto");
    var r2=sanitizeResume({mode:"oral",type:"interview",kind:"scenario",index:0,questions:[{q:"solo texto"}],ratings:[null],revealed:[false]});
    ok(r2&&r2.ratings.length===1,"una pregunta de entrevista solo necesita texto");
  });
  T("2 un resume con arreglos desalineados igual se puede continuar",function(){
    reset();currentSystemKey=null;
    startTechnical("study",rawPool(null).slice(0,2));
    var saved=JSON.parse(JSON.stringify(appState.resume));
    session=null;
    appState.resume=sanitizeResume(Object.assign({},saved,{answers:[]}));
    resumeSession();
    ok(session&&session.answers.length===2,"debio regenerar answers del largo correcto");
  });

