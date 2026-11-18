/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- 8. Pulido de interfaz ---------- */
  T("8 verify-badge tiene estilo definido (7764f5c)",function(){
    var s=document.createElement("span");s.className="verify-badge";s.textContent="x";
    document.body.appendChild(s);
    var cs=getComputedStyle(s);
    var border=cs.borderTopWidth,margin=cs.marginLeft;
    document.body.removeChild(s);
    ok(border!=="0px","la insignia no tiene borde (sin estilo)");
    eq(margin,"7px","margen izquierdo de la insignia");
  });
  T("8 plural y conteos en singular (fafa386)",function(){
    eq(plural(1,"pregunta","preguntas"),"pregunta");eq(plural(0,"pregunta","preguntas"),"preguntas");eq(plural(2,"pregunta","preguntas"),"preguntas");
    reset();
    var q=fcomQ(0);
    appState.stats[q._id]={a:2,c:0,w:2,last:1,streak:0,lastResult:0};
    renderHome();
    eq(byId("homeWeakCount").textContent,"1 question to review","conteo de repaso en singular");
    appState.stats[q._id]={a:2,c:1,w:1,last:1,streak:0,lastResult:0};
    showWeak();
    ok(/1 mistake · 1 correct/.test(byId("weakList").textContent),"detalle de la pregunta debil: "+byId("weakList").textContent);
  });
  T("8 resumen del test: perfecto y casi perfecto (7764f5c)",function(){
    reset();currentSystemKey=null;startQuickTest();
    for(var i=0;i<session.questions.length;i++)session.answers[i]=session.questions[i].correct;
    finishTest();
    ok(/Perfect score/.test(byId("resultSummary").textContent),"20/20: "+byId("resultSummary").textContent);
    reset();currentSystemKey=null;startQuickTest();
    for(var j=0;j<session.questions.length;j++){
      var q=session.questions[j];
      session.answers[j]=j<18?q.correct:(q.correct+1)%q.options.length;
    }
    finishTest();
    ok(/Review the few mistakes/.test(byId("resultSummary").textContent),"18/20: "+byId("resultSummary").textContent);
  });
  T("8 renderHome reutiliza la integridad calculada al arrancar (82ba29c)",function(){
    reset();
    var orig=window.bankIntegrity,calls=0;
    window.bankIntegrity=function(){calls++;return orig()};
    try{renderHome();renderHome()}finally{window.bankIntegrity=orig}
    eq(calls,0,"renderHome recalculo la integridad del banco");
  });
  T("8 la autoevaluacion no se etiqueta ORAL y el puntaje propio queda marcado (fafa386, a60dd34)",function(){
    reset();currentSystemKey=null;
    startInterview(null);
    ok(/^SELF-ASSESSMENT/.test(byId("iMeta").textContent),"etiqueta: "+byId("iMeta").textContent);
    reset();
    startScenario();
    ok(/^SCENARIO/.test(byId("iMeta").textContent),"etiqueta de escenario: "+byId("iMeta").textContent);
    revealInterview();
    rateInterview(2);
    var active=document.querySelectorAll("#rateWrap .rate.active");
    ok(active.length===1&&active[0].classList.contains("yes"),"'La sabia' debe quedar marcado");
    rateInterview(0);
    active=document.querySelectorAll("#rateWrap .rate.active");
    ok(active.length===1&&active[0].classList.contains("no"),"cambiar la nota debe mover la marca");
    nextInterview();prevInterview();
    active=document.querySelectorAll("#rateWrap .rate.active");
    ok(active.length===1&&active[0].classList.contains("no"),"la nota debe verse al volver a la pregunta");
  });

  T("8 la descripcion de Entrevista tecnica no le habla al usuario de archivos que 'subio'",function(){
    reset();
    openSystem(INTERVIEW_TECH_KEY);
    var txt=byId("detailDesc").textContent;
    ok(!/subiste/i.test(txt),"texto de desarrollo visible para el usuario: "+txt);
    ok(/93 questions/.test(txt),"la descripcion perdio el conteo: "+txt);
  });

  T("8 DGAC-03 el banco DGAC se abre por las 11 secciones del examen, en el orden del documento; Study sigue ese orden y el progreso usa los mismos ids",function(){
    reset();openDgacFolder();
    ok(!byId("dgacFolder").classList.contains("hidden"),"se ve la lista de secciones DGAC");
    var secs=dgacSections(),want=["Air conditioning and pneumatic","Autoflight and FMS","Communications and oxygen","Electrical","Fire protection","Fuel and hydraulic","Indicating and recording","APU and powerplant","Flight controls","Ice and rain protection","Landing gear, lights and doors"];
    eq(secs.join("|"),want.join("|"),"secciones en el orden del examen");
    eq(byId("dgacList").querySelectorAll("[data-dgac-section]").length,11,"una tarjeta por seccion");
    var sum=0;secs.forEach(function(s){sum+=rawPool(DGAC_KEY+"|"+s).length});eq(sum,dgacTotal(),"las secciones suman todo el banco");
    var k=DGAC_KEY+"|Landing gear, lights and doors";
    byId("dgacList").querySelector('[data-dgac-section="Landing gear, lights and doors"]').click();
    eq(currentSystemKey,k,"la tarjeta abre su seccion");eq(byId("detailTitle").textContent,"Landing gear, lights and doors","titulo de la seccion");
    currentSystemKey=k;startTechnical("study");
    var file=rawPool(k).map(function(q){return q.q}),ses=session.questions.map(function(q){return q.q});
    eq(ses.join("\n"),file.join("\n"),"Study va en el orden del documento");
    ok(/^ALL CABIN SIGNS COME ON AUTOMATICALLY/.test(ses[0]),"primera pregunta de la seccion: "+ses[0]);
    var all=rawPool(DGAC_KEY).filter(function(q){return q.bank_section==="Landing gear, lights and doors"});
    eq(session.questions[0]._id,all[0]._id,"mismo id que en el banco completo (no se pierde el progreso)");
    exitSession();openSystem(DGAC_KEY+"|Electrical");detailBack();
    ok(!byId("dgacFolder").classList.contains("hidden"),"volver desde una seccion lleva a la lista DGAC");
    currentSystemKey=DGAC_KEY+"|Electrical";startTechnical("test");
    ok(session.questions.length===20&&session.questions.every(function(q){return q.bank_section==="Electrical"}),"el test de una seccion solo usa esa seccion");
    reset();
  });
