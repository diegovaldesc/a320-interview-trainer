/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- 4. Responder preguntas y conservar las claves ---------- */
  T("4 A02 DGAC nunca reordena alternativas y la clave correcta se conserva en todo el banco",function(){
    var moved=0,wrong=0;
    rawPool(DGAC_KEY).forEach(function(q){
      var b=buildSessionQ(q);
      if(JSON.stringify(b.options)!==JSON.stringify(q.options)||b.correct!==q.correct)moved++;
    });
    eq(moved,0,"preguntas DGAC reordenadas");
    allVerifiedPool().forEach(function(q){
      for(var i=0;i<3;i++){var b=buildSessionQ(q);if(b.options[b.correct]!==correctText(q))wrong++}
    });
    eq(wrong,0,"la clave correcta apunta al texto equivocado tras mezclar");
  });
  T("4 el resto del banco si mezcla el orden",function(){
    var q=allVerifiedPool().find(function(x){return x.options.length>=4});
    var orders={};
    for(var i=0;i<40;i++)orders[JSON.stringify(buildSessionQ(q).options)]=true;
    ok(Object.keys(orders).length>1,"la mezcla no cambia el orden");
  });
  T("4 MCQ-01 IDs unicos y un duplicado inyectado se detecta",function(){
    var ids={},dup=0;
    Object.keys(SYSTEMS).forEach(function(k){rawPool(k).forEach(function(q){if(ids[q._id])dup++;ids[q._id]=true})});
    eq(dup,0,"IDs repetidos en el banco");
    var arr=SYSTEMS.hydraulic.questions,before=bankIntegrity().issues;
    arr.push(Object.assign({},arr[0]));
    var during=bankIntegrity().issues;
    arr.pop();
    ok(during>before,"el duplicado no se detecto");
    eq(bankIntegrity().issues,before,"el banco no volvio a su estado");
  });
  T("4 A14 enrich tolera un sistema nulo o questions que no es arreglo",function(){
    var orig=RAW_SYSTEMS;
    try{
      RAW_SYSTEMS=Object.assign({},orig,{hydraulic:null});
      var out=enrich();ok(!("hydraulic" in out),"debio omitir el sistema nulo");
      RAW_SYSTEMS=Object.assign({},orig,{hydraulic:{name:"x",questions:{}}});
      out=enrich();ok(Array.isArray(out.hydraulic.questions)&&out.hydraulic.questions.length===0,"questions {} debe quedar []");
      RAW_SYSTEMS=Object.assign({},orig,{hydraulic:{name:"x",questions:[null,{q:"a"}]}});
      out=enrich();eq(out.hydraulic.questions.length,2,"debe conservar los elementos");
    }finally{RAW_SYSTEMS=orig}
  });
  T("4 responder registra el intento; DGAC no toca las estadisticas",function(){
    reset();currentSystemKey=null;
    var q=fcomQ(0);
    startTechnical("study",[q]);
    selectOption(session.questions[0].correct);
    var s=appState.stats[q._id];
    ok(s&&s.a===1&&s.c===1&&s.lastResult===1,"intento correcto no registrado: "+JSON.stringify(s));
    reset();currentSystemKey=DGAC_KEY;
    var d=rawPool(DGAC_KEY)[0];
    startTechnical("study",[d]);selectOption(0);
    ok(!appState.stats[d._id],"un intento DGAC no debe entrar a las estadisticas");
  });
  T("4 preguntas DGAC guardadas aparecen en Guardadas (7764f5c)",function(){
    reset();
    var d=rawPool(DGAC_KEY)[3];
    appState.bookmarks[d._id]=true;
    ok(savedQuestions(null).some(function(x){return x._id===d._id}),"savedQuestions no incluye la pregunta DGAC");
    currentSystemKey=null;startSavedSession();
    ok(session&&session.questions[0]._id===d._id,"startSavedSession no arranco con la pregunta DGAC");
  });
  T("4 un test DGAC no cambia precision pero guarda el mejor puntaje y lo muestra (fafa386)",function(){
    reset();currentSystemKey=DGAC_KEY;
    startTechnical("test",rawPool(DGAC_KEY).slice(0,10));
    for(var i=0;i<session.questions.length;i++)session.answers[i]=session.questions[i].correct;
    finishTest();
    eq(Object.keys(appState.stats).length,0,"el test DGAC modifico las estadisticas");
    ok(appState.best[DGAC_KEY]&&appState.best[DGAC_KEY].score===10,"no se guardo el mejor puntaje");
    openSystem(DGAC_KEY);
    ok(/best test/.test(byId("detailStats").textContent),"no se muestra el mejor test: "+byId("detailStats").textContent);
  });
  T("4 la precision del inicio incluye Entrevista tecnica y Operacion Airbus (fafa386)",function(){
    reset();
    var q=rawPool(INTERVIEW_TECH_KEY)[0];
    appState.stats[q._id]={a:4,c:2,w:2,last:1,streak:0,lastResult:0};
    var ov=overall();
    eq(ov.a,4,"intentos");eq(ov.p,50,"precision");eq(ov.wq,1,"por repasar");
  });

