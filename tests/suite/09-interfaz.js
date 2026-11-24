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
  T("8 DGAC-04 una pregunta se puede reportar (motivos y nota), queda guardada, sale en My mistakes y en el texto para enviar; se puede borrar",function(){
    reset();var id="dgac_bank:2q5dyv";startSingle(id);
    ok(byId("reportPanel").classList.contains("hidden"),"el panel parte cerrado");
    openReport();ok(!byId("reportPanel").classList.contains("hidden"),"el boton abre el panel");
    eq(byId("reportPanel").querySelectorAll(".report-chip").length,5,"cinco motivos");
    saveReport();ok(!appState.reports[id],"sin motivo ni nota no se guarda");
    byId("reportPanel").querySelector("[data-reason=\"key\"]").click();byId("reportNote").value="AVAIL del APU";saveReport();
    var r=appState.reports[id];ok(r&&r.r.join()==="key"&&r.n==="AVAIL del APU","reporte guardado: "+JSON.stringify(r));
    ok(byId("reportBtn").classList.contains("active"),"la bandera queda marcada");
    var back=sanitizeState(JSON.parse(JSON.stringify(appState)));ok(back.reports[id]&&back.reports[id].n==="AVAIL del APU","el reporte sobrevive a guardar y cargar");
    exitSession();renderHome();ok(/1 reported/.test(byId("homeWeakCount").textContent),"la portada cuenta el reporte: "+byId("homeWeakCount").textContent);
    showWeak();ok(!byId("reportsWrap").classList.contains("hidden"),"se ve la lista de reportados");
    eq(byId("reportsList").querySelectorAll(".report-item").length,1,"un reporte en la lista");
    var txt=reportsText();
    ok(txt.indexOf("DGAC · APU and powerplant · "+id)>=0&&txt.indexOf("Problem: Wrong answer")>=0&&txt.indexOf("Note: AVAIL del APU")>=0&&txt.indexOf("App answer: THE APU.")>=0,"texto para enviar: "+txt);
    byId("reportsList").querySelector(".report-del").click();
    ok(!appState.reports[id]&&byId("reportsWrap").classList.contains("hidden"),"borrar quita el reporte");
    reset();
  });
  T("8 DGAC-05 Autoflight and FMS revisada contra las fuentes: claves corregidas (D20, D22, D39, D68), explicaciones sin nombres de manuales y sin el recuadro de referencia",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Autoflight and FMS");eq(sec.length,78,"78 preguntas en la seccion");
    function by(s){return sec.find(function(q){return q.q.indexOf(s)===0})}
    var want=[["FOR AUTOLAND, BOTH A/PS","FALSE."],["HOW DOES THE FMGC COMPUTE RADIO POSITION","VOR/DME AND DME/DME."],["THE CAPTAIN","THE CAPTAIN"],["WHEN CAN MANAGED VERTICAL NAVIGATION","ONLY AFTER MANAGED LATERAL NAVIGATION HAS BEEN ENGAGED."]];
    want.forEach(function(w){var q=by(w[0]);ok(q&&q.options[q.correct].indexOf(w[1])===0&&Number.isInteger(q.exam_key)&&q.exam_key!==q.correct,"clave de «"+w[0]+"»: "+(q&&q.options[q.correct]))});
    var REF=/FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/,mal=sec.filter(function(q){return (!q.fcom_review&&q.q.indexOf("DISPLAY MANAGEMENT COMPUTERS")<0)||REF.test(q.expl)});
    eq(mal.length,0,"sin revisar o con manual visible: "+mal.map(function(q){return q.q.slice(0,40)}).join(" | "));
    var h=answerHtml(by("FOR AUTOLAND, BOTH A/PS"),true);
    var qa=by("FOR AUTOLAND, BOTH A/PS");ok(h.indexOf("citation")<0&&h.indexOf("TECHNICAL REFERENCE")<0&&h.indexOf(qa.cite.slice(0,30))<0,"la respuesta DGAC no muestra la cita textual");
    reset();
  });  T("8 DGAC-06 Air conditioning revisada (A40: CRUISE y CAB PRESS) y la respuesta DGAC muestra de que parte del manual sale, sin cita textual ni fecha de revision",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Air conditioning and pneumatic");eq(sec.length,85,"85 preguntas");
    eq(sec.filter(function(q){return !q.fcom_review}).length,0,"todas revisadas");
    var REF=/FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/;eq(sec.filter(function(q){return REF.test(q.expl)}).length,0,"ninguna explicacion nombra un manual");
    var q=sec.find(function(x){return x.q.indexOf("PRESSURIZATION INDICATIONS ARE FOUND")===0});
    ok(q&&q.options[q.correct].indexOf("THE INFLIGHT ECAM CRUISE PAGE AND THE CAB PRESS PAGE")===0&&q.exam_key===3,"A40 marca CRUISE y CAB PRESS: "+(q&&q.options[q.correct]));
    var h=answerHtml(q,true);
    ok(/class="src-line"/.test(h)&&h.indexOf("FCOM · DSC-21-20-40")>=0,"muestra la parte del manual: "+h.slice(-200));
    ok(!/15 SEP 25|examen oficial/.test(h)&&h.indexOf(q.cite.slice(0,30))<0&&h.indexOf("blockquote")<0,"sin fecha de revision, sin nota del examen y sin cita textual");
    var sinFuente=rawPool(DGAC_KEY).find(function(x){return x.q.indexOf("THE STANDBY ATTITUDE INDICATION")===0});
    ok(sinFuente&&!/src-line/.test(answerHtml(sinFuente,true)),"sin respaldo no se inventa una fuente");
    reset();
  });  T("8 DGAC-07 Communications and oxygen revisada: todas con fuente, el RMP en ELEC EMER CONFIG por MSN y el NAV del RMP quita la sintonia de los dos FMGC",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Communications and oxygen");eq(sec.length,51,"51 preguntas");
    eq(sec.filter(function(q){return !q.fcom_review}).length,0,"todas revisadas");
    eq(sec.filter(function(q){return /FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/.test(q.expl)}).length,0,"ninguna explicacion nombra un manual");
    function by(s){return sec.find(function(q){return q.q.indexOf(s)===0})}
    var e=by("WHEN THE AIRCRAFTT IS IN THE EMERGENCY ELECTRICAL");ok(e&&/01143 a 11293/.test(e.expl)&&/11482 a 12910/.test(e.expl),"RMP en ELEC EMER CONFIG explicado por MSN");
    var n=by("WHEN SELECTING THE GUARDED RMP NAV KEY");ok(n&&/dos FMGC/.test(n.expl)&&n.options[n.correct].indexOf("FMGC AUTO TUNING IS INHIBITED")===0,"NAV del RMP: inhibe el autotuning de los dos FMGC");
    var c=by("APPROXIMATELY HOW LONG ARE THE PASSENGER OXYGEN");ok(c&&/13, 15 o hasta 22/.test(c.expl),"se conserva la explicacion auditada antes (v1.31.1)");
    reset();
  });  T("8 DGAC-08 Electrical revisada: todas con fuente, el EMER GEN no depende del tren y las del estandar antiguo quedan explicadas",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Electrical");eq(sec.length,63,"63 preguntas");
    eq(sec.filter(function(q){return !q.fcom_review}).length,0,"todas revisadas");
    eq(sec.filter(function(q){return /FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/.test(q.expl)}).length,0,"ninguna explicacion nombra un manual");
    function by(s){return sec.find(function(q){return q.q.indexOf(s)===0})}
    var g=by("FOR THE A-320 THE EMERGENCY GENERATOR SUPPLIES POWER");ok(g&&g.options[g.correct].indexOf("IF THE RAT STALLS")===0&&g.exam_key===2,"EMER GEN: clave B (stall del RAT o bajo 100 kt), la del examen queda en exam_key");
    var f=by("WHEN WILL THE RAT & EMER GEN RED FAULT");ok(f&&/est.ndar antiguo/.test(f.expl)&&f.correct===0,"luz FAULT: la mas cercana, explicada como estandar antiguo");
    ["WHICH FLIGHT CONTROL COMPUTER WILL BE INOPERATIVE","WHICH RADIOS ARE INOPERATIVE WITH GEAR"].forEach(function(s){var q=by(s);ok(q&&/est.ndar antiguo/.test(q.expl),"tren en ELEC EMER: "+s.slice(0,30))});
    var c=by("HOW MANY TIMES CAN YOU RESET");ok(c&&/C\/B TRIPPED/.test(c.expl),"se conserva la explicacion auditada antes (v1.36.0)");
    reset();
  });  T("8 DGAC-09 Fire protection revisada: todas con fuente, detectores de la bodega trasera por MSN y APU en vuelo sin extincion automatica",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Fire protection");eq(sec.length,33,"33 preguntas");
    eq(sec.filter(function(q){return !q.fcom_review}).length,0,"todas revisadas");
    eq(sec.filter(function(q){return /FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/.test(q.expl)}).length,0,"ninguna explicacion nombra un manual");
    eq(sec.filter(function(q){return q.exam_key!==undefined}).length,0,"ninguna cambia de clave");
    function by(s){return sec.find(function(q){return q.q.indexOf(s)===0})}
    var a=by("THE AFT CARGO COMPARTMENT SMOKE DETECTION SYSTEM");ok(a&&/cuatro/.test(a.expl)&&/seis/.test(a.expl)&&/MSN/.test(a.expl),"bodega trasera: cuatro o seis detectores segun MSN");
    var f=by("IF THERE IS AN APU FIRE IN FLIGHT");ok(f&&/solo en tierra/.test(f.expl),"APU en vuelo: apagado y descarga manuales");
    var c=by("WILL AN APU FIRE TEST SHUT");ok(c&&/marcaba/.test(c.expl),"se conserva la explicacion auditada antes (v1.28.1)");
    reset();
  });  T("8 DGAC-10 Fuel and hydraulic revisada: todas con fuente, la logica del center tank por MSN y la safety valve del tren a 264 kt",function(){
    reset();var sec=rawPool(DGAC_KEY+"|Fuel and hydraulic");eq(sec.length,43,"43 preguntas");
    eq(sec.filter(function(q){return !q.fcom_review}).length,0,"todas revisadas");
    eq(sec.filter(function(q){return /FCOM|FCTM|DSC-|PRO-[A-Z]|PDF|§|respuesta verificada/.test(q.expl)}).length,0,"ninguna explicacion nombra un manual");
    eq(sec.filter(function(q){return q.exam_key!==undefined}).length,0,"ninguna cambia de clave");
    function by(s){return sec.find(function(q){return q.q.indexOf(s)===0})}
    ["AFTER ENGINE START, CENTER TANK FUEL PUMPS","THE MESSAGE CTR TK FEEDG","WHY DO THE CENTER TANK PUPS STOP"].forEach(function(s){var q=by(s);ok(q&&/06183/.test(q.expl)&&/06286/.test(q.expl),"center tank por MSN: "+s.slice(0,28))});
    var v=by("AS LONG AS THE LANDING GEAR LEVER IS UP");ok(v&&/264 kt/.test(v.expl),"safety valve del tren: 264 kt");
    var c=by("THERE ARE ________ FUEL PUMPS");ok(c&&/06183/.test(c.expl)&&/Respuesta del examen/.test(c.expl),"se conserva la explicacion auditada antes (v1.25.1)");
    reset();
  });





