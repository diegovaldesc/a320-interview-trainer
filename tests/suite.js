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
    try{stopEverythingOral()}catch(e){}
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

  /* ---------- 0. Arranque ---------- */
  T("0 la app carga sin errores de script",function(){
    ok(window.__errs&&window.__errs.length===0,"errores al cargar: "+(window.__errs||[]).join(" | "));
  });
  T("0 el banco reporta integridad estructural OK",function(){
    var h=bankIntegrity();ok(h.ok,"bankIntegrity: "+JSON.stringify(h));
    eq(totalQuestions(),415,"preguntas FCOM");
    eq(dgacTotal(),573,"preguntas DGAC");
    eq(interviewTechnicalTotal(),93,"preguntas entrevista tecnica");
    eq(ORAL_VOICE_BANK.length,23,"preguntas orales");
  });
  T("0 A08 el encabezado ya no promete OFFLINE",function(){
    ok(!/OFFLINE/i.test(document.querySelector(".topbar").textContent),"el encabezado dice OFFLINE");
  });

  /* ---------- 1. Guardar, cerrar y recuperar el progreso ---------- */
  T("1 A07 saveState informa el fallo y avisa una sola vez",function(){
    reset();
    var orig=Storage.prototype.setItem;
    Storage.prototype.setItem=function(){throw new Error("cuota")};
    try{
      eq(saveState(),false,"saveState debe devolver false");
      ok(/No se pudo guardar/.test(byId("toast").textContent),"falta el aviso: "+byId("toast").textContent);
      byId("toast").textContent="centinela";
      eq(saveState(),false);
      eq(byId("toast").textContent,"centinela","no debe repetir el aviso");
    }finally{Storage.prototype.setItem=orig}
  });
  T("1 REG-01 lastResult y racha sobreviven guardar/recargar",function(){
    reset();
    var q=fcomQ(0);
    for(var i=0;i<10;i++)recordTechnical(q,true);
    recordTechnical(q,false);
    appState=roundTrip(appState);
    var s=appState.stats[q._id];
    ok(s&&s.a===11&&s.c===10&&s.w===1,"conteos: "+JSON.stringify(s));
    eq(s.lastResult,0,"lastResult");
    ok(weakQuestions(null).some(function(x){return x._id===q._id}),"Mis errores perdio la pregunta al recargar");
    recordTechnical(q,true);
    appState=roundTrip(appState);
    recordTechnical(q,true);
    eq(appState.stats[q._id].streak,2,"la racha debe seguir sumando despues de recargar");
  });
  T("1 A01/A06 stats:null y best:null no rompen el arranque",function(){
    reset();
    var s=sanitizeState({stats:null,best:null,bookmarks:null,oral:null,oralVoice:null});
    ok(isPlainObject(s.stats)&&Object.keys(s.stats).length===0,"stats no quedo vacio");
    appState=s;renderHome();
  });
  T("1 guardar y cargar conserva marcadores y mejores puntajes",function(){
    reset();
    var q=fcomQ(0);
    appState.bookmarks[q._id]=true;appState.best.all={score:5,total:10,date:1};
    ok(saveState());
    var l=loadState();
    ok(l.bookmarks[q._id]===true&&l.best.all.score===5,"se perdio informacion: "+JSON.stringify(l.best));
  });

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

  /* ---------- 3. Importar datos danados ---------- */
  T("3 looksLikeValidBackup rechaza tipos equivocados y acepta copias parciales",function(){
    eq(looksLikeValidBackup({stats:null}),false,"stats:null");
    eq(looksLikeValidBackup({best:[]}),false,"best:[]");
    eq(looksLikeValidBackup({resume:"x"}),false,"resume texto");
    eq(looksLikeValidBackup({lastSystem:5}),false,"lastSystem numero");
    eq(looksLikeValidBackup(null),false,"null");
    eq(looksLikeValidBackup({}),true,"copia vacia");
    eq(looksLikeValidBackup({stats:{},bookmarks:{}}),true,"copia parcial");
  });
  T("3 A01 HTML inyectado en datos importados no se ejecuta",function(){
    reset();
    appState.resume={mode:"technical",type:"study",systemKey:null,questions:[{q:"a",options:["x","y"],correct:0}],index:0,total:1,label:"<img src=x onerror=window.__pwn=1>",bankFingerprint:BANK_FINGERPRINT};
    renderHome();
    var html=byId("resumeWrap").innerHTML;
    ok(!/<img/i.test(html),"la etiqueta se inserto sin escapar: "+html.slice(0,120));
    ok(!window.__pwn,"se ejecuto codigo inyectado");
    var s=sanitizeState({resume:{mode:"technical",type:"study",questions:[{q:"a",options:["x","y"],correct:0}],index:"<b>x","total":"<i>"}});
    ok(s.resume&&s.resume.index===0&&s.resume.total===1,"index/total no se normalizaron: "+JSON.stringify(s.resume&&[s.resume.index,s.resume.total]));
  });

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
    ok(/mejor test/.test(byId("detailStats").textContent),"no se muestra el mejor test: "+byId("detailStats").textContent);
  });
  T("4 la precision del inicio incluye Entrevista tecnica y Operacion Airbus (fafa386)",function(){
    reset();
    var q=rawPool(INTERVIEW_TECH_KEY)[0];
    appState.stats[q._id]={a:4,c:2,w:2,last:1,streak:0,lastResult:0};
    var ov=overall();
    eq(ov.a,4,"intentos");eq(ov.p,50,"precision");eq(ov.wq,1,"por repasar");
  });

  /* ---------- 5. Microfono ---------- */
  T("5 A05 goHome detiene el reconocimiento activo",async function(){
    reset();setupMic(okStream);
    try{
      oralMicPermissionGranted=true;
      startOralVoice();
      await toggleOralAnswer();
      ok(oralState.listening===true,"no quedo escuchando");
      var inst=FakeSR.instances[FakeSR.instances.length-1];
      ok(inst&&inst.startCalls===1,"no se inicio el reconocimiento");
      goHome();
      eq(oralState.listening,false,"siguio escuchando despues de goHome");
      ok(inst.aborted===true,"no se aborto el reconocimiento");
    }finally{teardownMic()}
  });
  T("5 A05 un permiso que llega tarde no inicia reconocimiento en otra pantalla",async function(){
    reset();
    var resolvePermission;
    setupMic(function(){return new Promise(function(r){resolvePermission=r})});
    try{
      startOralVoice();
      var pending=toggleOralAnswer();
      goHome();
      resolvePermission({getTracks:function(){return[]}});
      await pending;
      eq(oralState.listening,false,"quedo escuchando en una pantalla abandonada");
      eq(FakeSR.instances.length,0,"se creo un reconocimiento fuera de la pantalla oral");
    }finally{teardownMic()}
  });
  T("5 el permiso del microfono se pide una sola vez por sesion",async function(){
    reset();
    var calls=0;
    setupMic(function(){calls++;return okStream()});
    try{
      startOralVoice();
      await toggleOralAnswer();
      ok(oralState.listening,"no empezo a escuchar");
      await toggleOralAnswer();
      ok(!oralState.listening,"no se pudo terminar la respuesta");
      await toggleOralAnswer();
      eq(calls,1,"getUserMedia se llamo mas de una vez");
    }finally{teardownMic()}
  });
  T("5 A05 compartir progreso y cancelar no fuerza una descarga (fafa386)",async function(){
    reset();
    var clicks=0,origClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){clicks++};
    Object.defineProperty(navigator,"canShare",{value:function(){return true},configurable:true});
    try{
      Object.defineProperty(navigator,"share",{value:function(){var e=new Error("cancelado");e.name="AbortError";return Promise.reject(e)},configurable:true});
      await exportProgress();
      eq(clicks,0,"cancelar el panel de compartir disparo una descarga");
      Object.defineProperty(navigator,"share",{value:function(){return Promise.reject(new Error("fallo real"))},configurable:true});
      await exportProgress();
      eq(clicks,1,"un fallo real debe seguir cayendo a la descarga");
    }finally{
      HTMLAnchorElement.prototype.click=origClick;
      try{delete navigator.share;delete navigator.canShare}catch(e){}
    }
  });

  /* ---------- 6. Evaluacion oral ---------- */
  T("6 las 23 preguntas orales puntuan >=9.5 contra su propia referencia",function(){
    var bad=ORAL_VOICE_BANK.map(function(q){return{id:q.id,s:evaluateLocally(q,q.reference).score}}).filter(function(r){return r.s<9.5});
    eq(bad.length,0,"preguntas bajo 9.5: "+JSON.stringify(bad));
  });
  T("6 una respuesta sin relacion puntua bajo en las 23 preguntas",function(){
    var bad=ORAL_VOICE_BANK.map(function(q){return{id:q.id,s:evaluateLocally(q,"No se, algo relacionado con el motor tal vez.").score}}).filter(function(r){return r.s>3.5});
    eq(bad.length,0,"respuestas sin sentido con puntaje alto: "+JSON.stringify(bad));
    ok(evaluateLocally(ORAL_VOICE_BANK[0],"").score<=1,"una respuesta vacia debe puntuar ~0");
  });
  T("6 A04 ENG FIRE negando los cinco pasos no obtiene credito",function(){
    var r=evaluateLocally(oral("ov_engfire"),"No pondria thrust lever a idle. No pondria eng master a off. No presionaria fire pushbutton. No esperaria 10 segundos. No creo que n1 disminuye.");
    ok(r.score<3,"puntaje "+r.score);
    eq(r.detected.length,0,"detecto pasos negados: "+JSON.stringify(r.detected));
  });
  T("6 A04 autobrake: afirmar presion fija no cumple el concepto que la niega",function(){
    var r=evaluateLocally(oral("ov_autobrake"),"Aplica presion fija automaticamente segun el modo seleccionado y condiciones de pista.");
    ok(!r.detected.some(function(l){return /desaceler/i.test(l)}),"detecto el concepto de desaceleracion: "+JSON.stringify(r.detected));
    ok(r.score<=4.5,"puntaje "+r.score);
  });
  T("6 A04 microburst: la correccion legitima 'no es X, es Y' no se penaliza",function(){
    var q=oral("ov_microburst");
    var r=evaluateLocally(q,"No es una corriente ascendente, es una corriente descendente intensa y localizada que se expande horizontalmente al llegar al terreno, genera windshear y es peligrosa cerca del terreno");
    ok(r.score>=9,"puntaje "+r.score+" faltan: "+JSON.stringify(r.missing));
    eq(r.errors.length,0,"errores: "+JSON.stringify(r.errors));
    ok(evaluateLocally(q,q.reference+" No es una corriente ascendente.").score>=9.5,"la referencia mas una negacion aislada no debe bajar");
  });
  T("6 A04 la ventana de negacion cubre hasta 5 palabras",function(){
    eq(negatedBeforeMatch(["no","es","un","fenomeno","localizado"],"no es un fenomeno localizado","localizado"),true,"marcador a 4 palabras");
    eq(negatedBeforeMatch(["no","a","b","c","d","e","localizado"],"no a b c d e localizado","localizado"),false,"marcador a 6 palabras no debe negar");
    ok(significantWords("no presion fija").indexOf("no")!==-1,"significantWords debe conservar la negacion");
  });
  T("6 A09 repeticiones y limites de palabra",function(){
    var item={accepted:["mayday mayday mayday"]};
    eq(det("mayday",item),false,"una repeticion");
    eq(det("mayday mayday",item),false,"dos repeticiones");
    eq(det("mayday mayday mayday",item),true,"tres repeticiones");
    eq(det("desconectar el piloto automatico",{accepted:["conectar"]}),false,"desconectar no cumple conectar");
    eq(det("debo conectar el piloto automatico",{accepted:["conectar"]}),true,"conectar si cumple conectar");
  });
  T("6 A10 la jerga se normaliza sin danar palabras en espanol",function(){
    eq(normalizeAeroText("los vientos son fuertes"),"los vientos son fuertes","vientos");
    eq(normalizeAeroText("una operativa normal"),"una operativa normal","operativa");
    ok(normalizeAeroText("thrust levers to ga").indexOf("toga")!==-1,"to ga -> toga");
    ok(normalizeAeroText("alerta tos").indexOf("taws")!==-1,"tos -> taws");
    ok(normalizeAeroText("revisa el efe com").indexOf("fcom")!==-1,"efe com -> fcom");
  });
  T("6 el resultado oral usa lenguaje de cobertura y colores por tramo (3aa2fae)",function(){
    reset();
    startOralVoice();
    var cases=[[9.6,"Cobertura muy alta","good"],[8,"Cobertura alta","good"],[6.5,"Cobertura media","mid"],[4.5,"Cobertura parcial","mid"],[2,"Cobertura baja","low"]];
    cases.forEach(function(c){
      showOralEvaluation({score:c[0],detected:["a"],missing:["b"],errors:["c"]},"texto");
      eq(byId("oralGrade").textContent,c[1],"etiqueta para "+c[0]);
      ok(byId("oralGrade").classList.contains(c[2]),"clase de color para "+c[0]);
    });
    eq(document.querySelector(".oral-result-label").textContent,"ESTIMACIÓN","etiqueta sobre el puntaje");
    ok(/no reemplaza tu propio juicio/.test(document.querySelector(".oral-score-note").textContent),"falta la nota aclaratoria");
    ok(byId("oralFeedback").querySelector(".oral-feedback-title.ok")&&byId("oralFeedback").querySelector(".oral-feedback-title.warn")&&byId("oralFeedback").querySelector(".oral-feedback-title.bad"),"faltan los titulos con color");
  });

  /* ---------- 7. Integridad del banco oral ---------- */
  T("7 A15 la integridad oral detecta items nulos, terminos vacios, ids repetidos y pesos invalidos",function(){
    var base=oralBankIntegrity(),added=0;
    function probe(item,label){
      ORAL_VOICE_BANK.push(item);added++;
      var n;
      try{n=oralBankIntegrity()}finally{ORAL_VOICE_BANK.pop();added--}
      ok(n>base,label+" no se detecto (base "+base+", con item "+n+")");
    }
    probe({id:"__t1",question:"q",reference:"r",concepts:[null]},"item nulo");
    probe({id:"__t2",question:"q",reference:"r",concepts:[{label:"a",accepted:[""]}]},"termino vacio");
    probe(Object.assign({},ORAL_VOICE_BANK[0]),"id repetido");
    probe({id:"__t3",question:"q",reference:"r",concepts:[{label:"a",accepted:["x"],weight:-1}]},"peso negativo");
    eq(oralBankIntegrity(),base,"el banco oral no volvio a su estado");
  });

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
    eq(byId("homeWeakCount").textContent,"1 pregunta por repasar","conteo de repaso en singular");
    appState.stats[q._id]={a:2,c:1,w:1,last:1,streak:0,lastResult:0};
    showWeak();
    ok(/1 error · 1 correcta/.test(byId("weakList").textContent),"detalle de la pregunta debil: "+byId("weakList").textContent);
  });
  T("8 resumen del test: perfecto y casi perfecto (7764f5c)",function(){
    reset();currentSystemKey=null;startQuickTest();
    for(var i=0;i<session.questions.length;i++)session.answers[i]=session.questions[i].correct;
    finishTest();
    ok(/Puntaje perfecto/.test(byId("resultSummary").textContent),"20/20: "+byId("resultSummary").textContent);
    reset();currentSystemKey=null;startQuickTest();
    for(var j=0;j<session.questions.length;j++){
      var q=session.questions[j];
      session.answers[j]=j<18?q.correct:(q.correct+1)%q.options.length;
    }
    finishTest();
    ok(/Revisa los pocos errores/.test(byId("resultSummary").textContent),"18/20: "+byId("resultSummary").textContent);
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
    ok(/^AUTOEVALUACIÓN/.test(byId("iMeta").textContent),"etiqueta: "+byId("iMeta").textContent);
    reset();
    startScenario();
    ok(/^ESCENARIO/.test(byId("iMeta").textContent),"etiqueta de escenario: "+byId("iMeta").textContent);
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
    ok(/93 preguntas/.test(txt),"la descripcion perdio el conteo: "+txt);
  });

  /* ---------- 9. Accesibilidad ---------- */
  function cssColor(name){
    var v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var m=/^#([0-9a-f]{6})$/i.exec(v);
    ok(m,"la variable "+name+" no es un color #RRGGBB: "+v);
    return{r:parseInt(m[1].slice(0,2),16),g:parseInt(m[1].slice(2,4),16),b:parseInt(m[1].slice(4,6),16)};
  }
  function luminance(c){
    function f(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);
  }
  function contrast(a,b){
    var la=luminance(a),lb=luminance(b);
    return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05);
  }
  T("9 el gris secundario y el ambar cumplen contraste AA (4.5:1) sobre los fondos de la app",function(){
    var bgs=["--bg","--panel","--panel3","--panel2"],fgs=["--muted","--amber"];
    fgs.forEach(function(fg){
      bgs.forEach(function(bg){
        var r=contrast(cssColor(fg),cssColor(bg));
        ok(r>=4.5,fg+" sobre "+bg+" tiene contraste "+r.toFixed(2)+":1");
      });
    });
  });
  T("9 los controles de uso frecuente miden al menos 44 px de alto",function(){
    reset();
    function minHeight(sel,label){
      var els=Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function(e){return e.getClientRects().length});
      ok(els.length,"no hay "+label+" visible");
      els.forEach(function(e){ok(e.getBoundingClientRect().height>=43.5,label+" mide "+Math.round(e.getBoundingClientRect().height)+" px de alto")});
    }
    minHeight(".brand","el boton de marca");
    minHeight(".data-action","los botones de copia de progreso");
    openSystem("hydraulic");
    minHeight("#detail .back","el enlace Volver");
    currentSystemKey=null;startScenario();revealInterview();
    minHeight("#rateWrap .rate","los botones de autocalificacion");
  });

  /* ---------- 10. Ingles OACI ---------- */
  function visibleScreens(){return Array.prototype.slice.call(document.querySelectorAll("main > section")).filter(function(s){return !s.classList.contains("hidden")}).map(function(s){return s.id})}
  function noScore(scope,msg){ok(!scope.querySelector(".oral-score,.oral-grade,.score-circle,#resultPct"),msg||"no debe haber nota ni nivel")}
  function fakeSpeech(){
    var spoken=[],cancelled={n:0},desc=Object.getOwnPropertyDescriptor(window,"speechSynthesis");
    var fake={speak:function(u){spoken.push(u)},cancel:function(){cancelled.n++},getVoices:function(){return[]}};
    Object.defineProperty(window,"speechSynthesis",{value:fake,configurable:true});
    return{spoken:spoken,cancelled:cancelled,restore:function(){if(desc)Object.defineProperty(window,"speechSynthesis",desc);else delete window.speechSynthesis}};
  }
  T("10 el banco de Ingles OACI carga completo, con fuente y cita en cada alternativa, sin incidencias",function(){
    var h=bankIntegrity();
    eq(h.englishIssues,0,"incidencias de Ingles OACI");
    ok(h.ok,"bankIntegrity: "+JSON.stringify(h));
    eq(ENGLISH.mcq.length,74,"alternativas");eq(ENGLISH.images.length,8,"imagenes");eq(ENGLISH.speaking.length,17,"respuestas orales");eq(ENGLISH.listening.length,11,"audios");
    eq(SYSTEMS[ENGLISH_KEY].questions.length,74,"alternativas dentro de SYSTEMS");
    eq(totalQuestions(),415,"las alternativas de ingles no deben contarse como preguntas FCOM");
    SYSTEMS[ENGLISH_KEY].questions.forEach(function(q,i){
      ok(/^ICAO Doc 9432 · /.test(q.src)&&String(q.cite).length>10&&String(q.expl).length>30,"la alternativa "+i+" no tiene fuente, cita y explicacion");
      eq(q.bank,"english_icao","banco de la alternativa "+i);
    });
  });
  T("10 englishIntegrity detecta ejercicios rotos e ids repetidos",function(){
    eq(englishIntegrity(),0,"base");
    var l=ENGLISH.listening[0];
    l.fields.push({id:"x",label:"X",kind:"choice",options:["a","b"],answer:"c"});
    try{eq(englishIntegrity(),1,"respuesta fuera de las opciones")}finally{l.fields.pop()}
    ENGLISH.images.push(ENGLISH.images[0]);
    try{eq(englishIntegrity(),1,"id repetido")}finally{ENGLISH.images.pop()}
    var saved=ENGLISH.speaking[0].model;ENGLISH.speaking[0].model=[];
    try{eq(englishIntegrity(),1,"modelo vacio")}finally{ENGLISH.speaking[0].model=saved}
    eq(englishIntegrity(),0,"restaurado");
  });
  T("10 las alternativas usan el motor de preguntas: etiqueta, cita, y salir vuelve al menu de ingles",function(){
    reset();
    openEnglish();
    eq(visibleScreens().join(),"englishHub");
    startEnglishMcq("study");
    eq(visibleScreens().join(),"quiz");
    ok(/ICAO DOC 9432/.test(byId("qSource").textContent),"etiqueta: "+byId("qSource").textContent);
    selectOption(session.questions[0].correct);
    var a=byId("answerWrap").textContent;
    ok(/CONTENIDO VERIFICADO CONTRA ICAO DOC 9432/.test(a),"cabecera: "+a.slice(0,80));
    ok(/ICAO DOC 9432 · VERIFICADO/.test(a),"referencia: "+a.slice(0,160));
    exitSession();
    eq(visibleScreens().join(),"englishHub","salir de la sesion debe volver al menu de ingles");
    openSystem(ENGLISH_KEY);
    eq(visibleScreens().join(),"englishHub","abrir el sistema de ingles debe llevar al menu de ingles");
    eq(overall().a,0,"las alternativas de ingles no entran en la precision del inicio");
    eq(weakQuestions(null).length,0,"ni en los errores del inicio");
  });
  T("10 una sesion de alternativas de Ingles OACI se guarda y se puede continuar",function(){
    reset();startEnglishMcq("study");
    var first=session.questions[0].q;
    persistResume();
    ok(/Inglés OACI/.test(appState.resume.label),"etiqueta: "+appState.resume.label);
    session=null;show("home");
    resumeSession();
    eq(visibleScreens().join(),"quiz");eq(byId("qText").textContent,first);
  });
  T("10 el estado guardado sanea y respalda los avances de Ingles OACI",function(){
    var s=sanitizeState({english:{a:{r:2,a:3,last:5},b:{r:9,a:"x"},c:null,d:"no"}});
    eq(JSON.stringify(s.english.a),JSON.stringify({r:2,a:3,last:5}));
    eq(s.english.b.r,null,"valoracion fuera de rango");eq(s.english.b.a,0);
    ok(!("c" in s.english)&&!("d" in s.english),"entradas invalidas");
    eq(looksLikeValidBackup({english:null}),false,"campo con tipo equivocado");
    eq(looksLikeValidBackup({stats:{}}),true,"un respaldo antiguo sin ingles sigue siendo valido");
    eq(JSON.stringify(sanitizeState({}).english),"{}");
    eq(JSON.stringify(defaultState().english),"{}");
  });
  T("10 describir imagenes: el modelo aparece al revelar, el autoexamen se guarda y no hay nota",function(){
    reset();
    startEnglishPractice("image");
    eq(visibleScreens().join(),"englishPractice");
    eq(byId("epNextBtn").disabled,true,"no se puede avanzar sin revelar");
    ok(byId("epReveal").classList.contains("hidden"),"el modelo debe estar oculto");
    ok(/^assets\/ingles\/.+\.jpg$/.test(byId("epStimulus").querySelector("img").getAttribute("src")),"foto");
    ok(byId("epStimulus").querySelector("img").getAttribute("alt").length>20,"la foto necesita texto alternativo");
    revealEnglish();
    ok(!byId("epReveal").classList.contains("hidden"),"el modelo debe verse");
    ok(/Descripción modelo/i.test(byId("epReveal").textContent),"falta la descripcion modelo");
    eq(byId("epNextBtn").disabled,false,"tras revelar se puede avanzar");
    var id=ENGLISH.images[0].id;
    rateEnglish(1);eq(appState.english[id].r,1);eq(appState.english[id].a,1);
    rateEnglish(2);eq(appState.english[id].r,2);eq(appState.english[id].a,2);
    noScore(byId("englishPractice"));
    nextEnglish();eq(enSession.index,1);
    exitEnglishPractice();
    eq(visibleScreens().join(),"englishHub");
    ok(/1 de 8 practicadas/.test(byId("enImgCount").textContent),"conteo del menu: "+byId("enImgCount").textContent);
    noScore(byId("englishHub"));
  });
  T("10 al empezar se abre el primer ejercicio que aun no marcaste como Bien, y se puede saltar",function(){
    reset();
    appState.english[ENGLISH.speaking[0].id]={r:2,a:1,last:1};
    startEnglishPractice("speaking");
    eq(enSession.index,1);
    jumpEnglish(5);eq(enSession.index,5);
    jumpEnglish(999);eq(enSession.index,5,"un salto fuera de rango se ignora");
    prevEnglish();eq(enSession.index,4);
  });
  T("10 audios: los campos se comparan uno a uno, sin nota global",function(){
    var f=function(kind,answer){return{kind:kind,answer:answer}};
    ok(enFieldOk(f("num","27"),"27"),"igual");
    ok(enFieldOk(f("num","6"),"06"),"pista con cero a la izquierda");
    ok(enFieldOk(f("num","129.1"),"129,1"),"frecuencia con coma");
    ok(!enFieldOk(f("code","0700"),"700"),"un codigo debe coincidir exacto");
    ok(enFieldOk(f("code","1018"),"1 0 1 8"),"espacios");
    ok(!enFieldOk(f("num","27"),""),"vacio");
    ok(!enFieldOk(f("num","27"),"veintisiete"),"texto sin digitos");
    ok(enFieldOk(f("choice","Bravo"),"Bravo")&&!enFieldOk(f("choice","Bravo"),"bravo"),"opcion exacta");
    reset();
    startEnglishPractice("listening");
    var fields=ENGLISH.listening[0].fields;
    enFieldChanged("d1","3");enFieldChanged("rwy","27");enFieldChanged("fl","999");
    revealEnglish();
    eq(document.querySelectorAll("#enFieldsWrap .en-field").length,fields.length,"filas");
    eq(document.querySelectorAll("#enFieldsWrap .en-field.ok").length,2,"campos correctos");
    eq(document.querySelectorAll("#enFieldsWrap .en-field.bad").length,fields.length-2,"campos incorrectos");
    ok(/Transcripci/.test(byId("epReveal").textContent),"transcripcion");
    noScore(byId("englishPractice"));
  });
  T("10 radioSay: digitos de radio y siglas deletreadas",function(){
    eq(radioSay("Runway three four five nine, QNH one zero one eight."),"Runway tree fower fife niner, Q N H one zero one eight.");
    eq(radioSay("Three thousand four hundred",false),"Three thousand four hundred");
    eq(radioSay("Nineteen and fourteen"),"Nineteen and fourteen","no debe tocar palabras que solo contienen un digito");
    eq(radioSay("ILS runway two four"),"I L S runway two fower");
    eq(radioSay("ILS runway two four",false),"I L S runway two four");
  });
  T("10 el audio se lee con la voz del dispositivo y se detiene al cambiar de pantalla",function(){
    reset();
    var sp=fakeSpeech();
    try{
      startEnglishPractice("listening");
      enPlayCurrent();
      return new Promise(function(resolve,reject){
        setTimeout(function(){
          try{
            ok(sp.spoken.length>=1,"no se pidio hablar");
            eq(sp.spoken[0].text,"tree.","el primer digito (Three.) debe decirse tree");
            ok(enMedia.speaking,"debe figurar como reproduciendo");
            goHome();
            ok(sp.cancelled.n>=1,"no se cancelo la voz al salir");
            eq(enMedia.speaking,false,"siguio reproduciendo");
            sp.restore();resolve();
          }catch(e){sp.restore();reject(e)}
        },250);
      });
    }catch(e){sp.restore();throw e}
  });
  T("10 microfono en ingles: goHome detiene la escucha y un permiso tardio no la inicia en otra pantalla",async function(){
    reset();setupMic(okStream);
    try{
      enMedia.micOk=true;
      startEnglishPractice("speaking");
      await enToggleMic();
      ok(enMedia.listening===true,"no quedo escuchando");
      var inst=FakeSR.instances[FakeSR.instances.length-1];
      ok(inst&&inst.startCalls===1,"no se inicio el reconocimiento");
      eq(inst.lang,"en-US","el reconocimiento debe ser en ingles");
      goHome();
      eq(enMedia.listening,false,"siguio escuchando despues de goHome");
      ok(inst.aborted===true,"no se aborto el reconocimiento");
    }finally{teardownMic()}
    reset();
    var resolvePermission;
    setupMic(function(){return new Promise(function(r){resolvePermission=r})});
    try{
      enMedia.micOk=false;
      startEnglishPractice("speaking");
      var pending=enToggleMic();
      goHome();
      resolvePermission({getTracks:function(){return[]}});
      await pending;
      eq(enMedia.listening,false,"quedo escuchando en otra pantalla");
      eq(FakeSR.instances.length,0,"se creo un reconocimiento fuera de la practica");
    }finally{teardownMic()}
  });
  T("10 microfono en ingles: el texto reconocido va al cuadro, se conserva y no se puntua",async function(){
    reset();setupMic(okStream);
    try{
      enMedia.micOk=true;
      startEnglishPractice("speaking");
      await enToggleMic();
      var inst=FakeSR.instances[FakeSR.instances.length-1];
      var res=function(text,fin){var r=[{transcript:text}];r.isFinal=fin;return r};
      inst.onresult({resultIndex:0,results:[res("say again",false)]});
      eq(byId("enTranscript").value,"say again","texto provisional");
      inst.onresult({resultIndex:0,results:[res("say again QNH",true)]});
      eq(byId("enTranscript").value,"say again QNH","texto final");
      enFinishMic();
      inst.onend();
      eq(enSession.state[0].text,"say again QNH","el texto se conserva en la sesion");
      noScore(byId("englishPractice"));
      revealEnglish();
      ok(!byId("epReveal").classList.contains("hidden"),"el modelo debe verse");
    }finally{teardownMic()}
  });
  T("9 los controles de Ingles OACI miden al menos 44 px de alto",function(){
    reset();
    function minH(sel,label){
      var els=Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function(e){return e.getClientRects().length});
      ok(els.length,"no hay "+label+" visible");
      els.forEach(function(e){ok(e.getBoundingClientRect().height>=43.5,label+" mide "+Math.round(e.getBoundingClientRect().height)+" px de alto")});
    }
    setupMic(okStream);
    try{
      openEnglish();
      minH("#englishHub .mode-card","las tarjetas de alternativas");minH("#englishHub .module-card","las tarjetas de practica");
      startEnglishPractice("speaking");jumpEnglish(1);
      minH("#englishPractice .back","el enlace Salir");minH("#epJump","el selector de ejercicio");minH("#enPlayBtn","el boton de escuchar");minH("#enRate","el selector de velocidad");minH("#enMicBtn","el boton de grabar");
      revealEnglish();
      minH("#epReveal .en-say","los botones de escuchar el modelo");minH("#epRateWrap .rate","los botones de autocalificacion");minH("#epReveal .en-check label","las casillas de autoevaluacion");
      startEnglishPractice("listening");
      minH("#enFieldsWrap input","los campos numericos");
    }finally{teardownMic()}
  });

  /* ---------- Ejecucion ---------- */
  async function run(){
    var res={total:tests.length,passed:0,failed:0,failures:[],errs:(window.__errs||[]).slice()};
    for(var i=0;i<tests.length;i++){
      try{await tests[i].fn();res.passed++}
      catch(e){res.failed++;res.failures.push({name:tests[i].name,message:String(e&&e.message||e)})}
    }
    try{reset()}catch(e){}
    res.errs=(window.__errs||[]).slice();
    return res;
  }
  run().then(function(res){
    byId("__test_results").textContent=JSON.stringify(res);
  },function(e){
    byId("__test_results").textContent=JSON.stringify({total:tests.length,passed:0,failed:tests.length,failures:[{name:"suite",message:String(e&&e.message||e)}],errs:[]});
  });
})();
