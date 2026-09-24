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

  /* ---------- 10. Ingles OACI: 4 pruebas de una sola parte ---------- */
  function visibleScreens(){return Array.prototype.slice.call(document.querySelectorAll("main > section")).filter(function(s){return !s.classList.contains("hidden")}).map(function(s){return s.id})}
  function noScore(scope,msg){ok(!scope.querySelector(".oral-score,.oral-grade,.score-circle,#resultPct"),msg||"no debe haber nota ni nivel")}
  /* Sustituye la voz del navegador por una de mentira (con las voces que se pidan) y devuelve lo que se le mando decir. */
  function fakeSpeech(voices){
    var spoken=[],cancelled={n:0};
    var dSyn=Object.getOwnPropertyDescriptor(window,"speechSynthesis"),dUtt=Object.getOwnPropertyDescriptor(window,"SpeechSynthesisUtterance");
    var fake={speak:function(u){spoken.push(u)},cancel:function(){cancelled.n++},getVoices:function(){return voices||[]}};
    Object.defineProperty(window,"speechSynthesis",{value:fake,configurable:true});
    if(voices)Object.defineProperty(window,"SpeechSynthesisUtterance",{value:function(t){this.text=t},configurable:true,writable:true});
    return{spoken:spoken,cancelled:cancelled,restore:function(){
      if(dSyn)Object.defineProperty(window,"speechSynthesis",dSyn);else delete window.speechSynthesis;
      if(voices){if(dUtt)Object.defineProperty(window,"SpeechSynthesisUtterance",dUtt);else delete window.SpeechSynthesisUtterance}
    }};
  }
  /* Hace que Math.random devuelva valores conocidos mientras corre fn. */
  function withRandom(values,fn){
    var orig=Math.random,i=0;
    Math.random=function(){var v=values[Math.min(i,values.length-1)];i++;return v};
    try{return fn()}finally{Math.random=orig}
  }
  function enTestDef(n){return ENGLISH.pruebas.filter(function(t){return t.n===n})[0]}
  /* Deja la prueba n en curso con orden conocido (los ejercicios indicados primero) y muestra el primero. */
  function enOpenUnit(n,firstRefs){
    var t=enTestDef(n),order=enUnitRefs(t),first=[].concat(firstRefs);
    first.forEach(function(r){order.splice(order.indexOf(r),1)});
    appState.englishTests=sanitizeEnglishTests({done:[],current:{n:n,order:first.concat(order),i:0},cycle:0});
    enStartOrContinue();
  }
  function voice(name,lang){return{name:name,lang:lang,voiceURI:name}}
  var EN_VOICES=[voice("Test George","en-GB"),voice("Test Susan","en-GB"),voice("Test Aria","en-US"),voice("Zarvox","en-US"),voice("Paulina","es-MX")];
  function optionButtons(){return Array.prototype.slice.call(document.querySelectorAll("#epWork .option"))}
  function optionText(b){return b.querySelector(".otxt").textContent}
  /* Contesta la alternativa que se ve en pantalla: bien (con clic en la opcion correcta) o mal (con clic en otra). */
  function answerMcq(right){
    var s=enSession,q=s.items[0],btns=optionButtons();
    var pick=btns.filter(function(b){return (optionText(b)===q.options[q.correct])===right})[0];
    ok(pick,"no hay una opcion "+(right?"correcta":"incorrecta")+" para pulsar");
    pick.click();
  }

  T("10 el banco de Ingles OACI: 4 pruebas de 8 alternativas, 4 audios, 2 imagenes y 1 role-play, sin incidencias",function(){
    var h=bankIntegrity();
    eq(h.englishIssues,0,"incidencias de Ingles OACI");
    ok(h.ok,"bankIntegrity: "+JSON.stringify(h));
    eq(ENGLISH.mcq.length,32,"alternativas");eq(ENGLISH.images.length,8,"imagenes");eq(ENGLISH.listening.length,16,"audios");eq(ENGLISH.roleplays.length,4,"role-plays");eq(ENGLISH.pruebas.length,4,"pruebas");
    ok(!("english_icao" in SYSTEMS),"las alternativas de ingles no deben estar en el banco tecnico");
    ok(allLookupPool().every(function(q){return q.bank!=="english_icao"}),"ni en la busqueda");
    eq(totalQuestions(),415,"las alternativas de ingles no deben contarse como preguntas FCOM");
    ENGLISH.mcq.forEach(function(q){
      eq(q.options.length,4,"opciones de "+q.id);ok(q.correct>=0&&q.correct<4,"indice correcto de "+q.id);
      ok(String(q.expl).length>40,"explicacion de "+q.id);
      ok(String(q.cite).length>10&&/^(ICAO Doc 9432|FCTM|FCOM) /.test(q.src),"la fuente interna de "+q.id+" se conserva para poder verificarla");
    });
    ENGLISH.pruebas.forEach(function(t){
      eq(t.mcq.length,8,"alternativas de la prueba "+t.n);eq(t.images.length,2,"imagenes de la prueba "+t.n);eq(t.listening.length,4,"audios de la prueba "+t.n);
      eq(enUnitRefs(t).length,15,"ejercicios de la prueba "+t.n);
      eq(enRoleplayItems(enById(ENGLISH.roleplays,t.roleplay)).length,3,"turnos del role-play de la prueba "+t.n);
      eq(t.listening.map(function(id){return enById(ENGLISH.listening,id).type}).join(),"atis,clearance,atis,clearance","tipos de audio de la prueba "+t.n);
    });
    var all=[];ENGLISH.pruebas.forEach(function(t){all=all.concat(t.mcq,t.images,t.listening,[t.roleplay])});
    eq(new Set(all).size,all.length,"ningun ejercicio puede estar en dos pruebas");
    eq(all.length,60,"32 alternativas + 8 imagenes + 16 audios + 4 role-plays, todo asignado");
  });
  T("10 ningun texto de Ingles OACI cita un manual, una seccion o una carpeta (ni en los datos ni en pantalla)",function(){
    var checks=[["mcq",ENGLISH.mcq],["listening",ENGLISH.listening],["image",ENGLISH.images],["roleplay",ENGLISH.roleplays]];
    checks.forEach(function(c){c[1].forEach(function(x){enVisibleTexts(c[0],x).forEach(function(t){ok(!enSourceRef(t),c[0]+" "+x.id+" cita una fuente: "+t.slice(0,90))})})});
    /* y lo que realmente se dibuja: se recorren las 4 pruebas completas, alternativas contestadas y modelos revelados */
    reset();
    [1,2,3,4].forEach(function(n){
      appState.englishTests=sanitizeEnglishTests({done:[],current:{n:n,order:enOrderFor(enTestDef(n)),i:0},cycle:0});
      openEnglish();
      ok(!enSourceRef(byId("englishHub").textContent)&&!/Doc 9432|FCTM|FCOM/.test(byId("englishHub").textContent),"el menu cita una fuente");
      enStartOrContinue();
      var guard=0;
      while(visibleScreens().join()==="englishPractice"&&guard++<60){
        if(enSession.kind==="mcq")answerMcq(guard%2===0);else byId("epRevealBtn").click();
        var txt=byId("englishPractice").textContent;
        ok(!enSourceRef(txt)&&!/Doc 9432|FCTM|FCOM|Referencia|VERIFICADO/.test(txt),"la prueba "+n+" muestra una fuente: "+(txt.match(/.{0,50}(manual|§|9432|FCTM|FCOM|Referencia|VERIFICADO).{0,50}/i)||[""])[0]);
        byId("epNextBtn").click();
      }
      ok(guard>15,"la prueba "+n+" no se recorrio entera");
    });
    /* la deteccion funciona */
    ok(enSourceRef("According to the note in the manual, when must ROGER NOT be used?"),"manual");
    ok(enSourceRef("§2.6 y p. 2-7 (PDF 24)")&&enSourceRef("Doc 9432")&&enSourceRef("El FCTM pide")&&enSourceRef("no están en tu carpeta APP"),"secciones, paginas y carpetas");
    ok(!enSourceRef("Las cifras se dicen una por una: el avión está estable y las cifras según el país varían."),"no debe marcar frases normales");
  });
  T("10 englishIntegrity detecta ejercicios rotos, ids repetidos, pruebas mal armadas y textos que citan un manual",function(){
    eq(englishIntegrity(),0,"base");
    var l=ENGLISH.listening[0];
    l.keys.push({label:"X",value:"x",accept:[["dos palabras"]]});
    try{eq(englishIntegrity(),1,"alternativa con espacios (los atomos son minusculas y digitos)")}finally{l.keys.pop()}
    var savedType=l.type;l.type="otro";
    try{eq(englishIntegrity(),1,"tipo de audio invalido")}finally{l.type=savedType}
    ENGLISH.images.push(ENGLISH.images[0]);
    try{eq(englishIntegrity(),1,"id repetido")}finally{ENGLISH.images.pop()}
    var q0=ENGLISH.mcq[0],savedCorrect=q0.correct;q0.correct=9;
    try{eq(englishIntegrity(),1,"alternativa con la respuesta correcta fuera de rango")}finally{q0.correct=savedCorrect}
    var savedQ=q0.q;q0.q="According to the note in the manual, when must ROGER NOT be used?";
    try{eq(englishIntegrity(),1,"enunciado que cita el manual")}finally{q0.q=savedQ}
    var savedOpt=q0.options[1];q0.options[1]="See §2.6";
    try{eq(englishIntegrity(),1,"opcion que cita una seccion")}finally{q0.options[1]=savedOpt}
    var savedExpl=q0.expl;q0.expl="Según el manual (p. 2-7): ROGER solo confirma la recepción.";
    try{eq(englishIntegrity(),1,"explicacion que cita el manual")}finally{q0.expl=savedExpl}
    var savedNotes=l.notes;l.notes=["Formato de práctica; el orden exacto está en el Anexo 11 y en la AIP, que no están en tu carpeta APP."];
    try{eq(englishIntegrity(),1,"nota de un audio que cita una carpeta")}finally{l.notes=savedNotes}
    var rp=ENGLISH.roleplays[0],savedNote=rp.turns[0].note;rp.turns[0].note="Después de V1 se continúa el despegue (FCTM).";
    try{eq(englishIntegrity(),1,"nota de un role-play que cita el FCTM")}finally{rp.turns[0].note=savedNote}
    var savedRefs=rp.turns[0].refs;rp.turns[0].refs=[{src:"ICAO Doc 9432 · §9.2.1.1",cite:"cita interna"}];
    try{eq(englishIntegrity(),0,"las fuentes internas (refs) si se pueden conservar: no se muestran")}finally{rp.turns[0].refs=savedRefs}
    var savedHeard=rp.turns[1].heard;delete rp.turns[1].heard;
    try{eq(englishIntegrity(),1,"un turno que responde a ATC necesita audio")}finally{rp.turns[1].heard=savedHeard}
    rp.turns[0].refs=[];
    try{eq(englishIntegrity(),1,"un turno sin fuente interna")}finally{rp.turns[0].refs=savedRefs}
    var t1=ENGLISH.pruebas[0],pristine=t1.mcq.slice();
    t1.mcq=pristine.slice();t1.mcq[0]="en_q_inexistente";
    try{eq(englishIntegrity(),1,"alternativa que no existe")}finally{t1.mcq=pristine.slice()}
    t1.mcq=pristine.slice();t1.mcq[0]=ENGLISH.pruebas[1].mcq[0];
    try{ok(englishIntegrity()>=1,"la misma alternativa en dos pruebas")}finally{t1.mcq=pristine.slice()}
    var savedRp=t1.roleplay;t1.roleplay="en_rp_99";
    try{eq(englishIntegrity(),1,"role-play que no existe")}finally{t1.roleplay=savedRp}
    var savedPruebas=ENGLISH.pruebas;ENGLISH.pruebas=[];
    try{ok(englishIntegrity()>=1,"sin pruebas")}finally{ENGLISH.pruebas=savedPruebas}
    eq(englishIntegrity(),0,"restaurado");
  });
  T("10 el estado guardado sanea y respalda las pruebas de Ingles OACI (orden, avance y aciertos)",function(){
    var s=sanitizeState({english:{a:{r:2,a:3,last:5},b:{r:9,a:"x"},c:null,d:"no"}});
    eq(JSON.stringify(s.english.a),JSON.stringify({r:2,a:3,last:5}));
    eq(s.english.b.r,null,"valoracion fuera de rango");eq(s.english.b.a,0);
    ok(!("c" in s.english)&&!("d" in s.english),"entradas invalidas");
    eq(looksLikeValidBackup({english:null}),false,"campo con tipo equivocado");
    eq(looksLikeValidBackup({englishTests:"no"}),false,"pruebas con tipo equivocado");
    eq(looksLikeValidBackup({stats:{}}),true,"un respaldo antiguo sin ingles sigue siendo valido");
    eq(JSON.stringify(sanitizeState({}).english),"{}");
    eq(JSON.stringify(defaultState().englishTests),JSON.stringify({done:[],current:null,cycle:0,last:null}));
    var t=sanitizeEnglishTests({done:[1,1,2,"x",0,100,-3,2.5],current:{n:3,order:["q:en_q_01","l:en_lis_01","x:no","q:con espacio",7,"r:en_rp_03"],i:2,mcq:{c:5,t:8}},cycle:2,last:2});
    eq(t.done.join(),"1,2","solo enteros de 1 a 99 y sin repetir");eq(t.current.n,3);
    eq(t.current.order.join(),"q:en_q_01,l:en_lis_01,r:en_rp_03","solo referencias con la forma letra:id");
    eq(t.current.i,2);eq(t.current.mcq.c,5);eq(t.current.mcq.t,8);eq(t.cycle,2);eq(t.last,2);
    eq(sanitizeEnglishTests({current:{n:2,order:["q:a","q:b"],i:9}}).current.i,0,"avance fuera de rango");
    eq(sanitizeEnglishTests({done:[3],current:{n:3,order:["q:a"],i:0}}).current,null,"una prueba ya terminada no puede estar en curso");
    eq(sanitizeEnglishTests({current:{n:2,order:["q:a"],i:0,mcq:{c:9,t:8}}}).current.mcq,undefined,"aciertos mayores que el total");
    var old=sanitizeEnglishTests({done:[1],current:{n:3,part:2,mcq:{c:9,t:12}},cycle:1,last:1}).current;
    eq(JSON.stringify(old),JSON.stringify({n:3,order:[],i:0,mcq:{c:9,t:12}}),"el formato anterior (por partes) se acepta y se vuelve a mezclar al entrar");
    eq(JSON.stringify(sanitizeEnglishTests(null)),JSON.stringify({done:[],current:null,cycle:0,last:null}));
    var rt=roundTrip({englishTests:{done:[1],current:{n:2,order:["q:en_q_06","r:en_rp_02"],i:1,mcq:{c:1,t:1}},cycle:1,last:1}});
    eq(JSON.stringify(rt.englishTests),JSON.stringify({done:[1],current:{n:2,order:["q:en_q_06","r:en_rp_02"],i:1,mcq:{c:1,t:1}},cycle:1,last:1}),"ida y vuelta");
    reset();appState.englishTests=sanitizeEnglishTests({current:{n:3,part:1}});
    var cur=enAssign();
    ok(enValidOrder(enTestDef(3),cur.order)&&cur.i===0&&cur.n===3,"al entrar con el formato anterior se conserva la prueba y se mezcla de nuevo");
    ok(cur.mcq===undefined,"y no se arrastran aciertos de otro orden");
  });
  T("10 mezcla: los 15 ejercicios de cada prueba salen en orden aleatorio, repartidos, sin bloques ni secciones",function(){
    ENGLISH.pruebas.forEach(function(t){
      var firstKinds={},rpPositions={},maxRun=0;
      for(var i=0;i<200;i++){
        var o=enOrderFor(t);
        ok(enValidOrder(t,o),"el orden debe traer los 15 ejercicios una sola vez");
        var run=0;
        o.forEach(function(r,k){
          if(r[0]==="q"){run++;if(run>maxRun)maxRun=run}else{
            run=0;
            if(k>0)ok(o[k-1][0]==="q","dos ejercicios que no son alternativas seguidos: "+o[k-1]+" "+r);
          }
        });
        firstKinds[o[0][0]]=1;rpPositions[o.indexOf("r:"+t.roleplay)]=1;
      }
      ok(maxRun<=3,"bloque de "+maxRun+" alternativas seguidas: se estaria armando una seccion");
      ok(Object.keys(firstKinds).length>=2,"el primer ejercicio siempre es del mismo tipo");
      ok(Object.keys(rpPositions).length>=5,"el role-play casi siempre cae en el mismo lugar");
    });
    /* sin hueco para alternar (pocas alternativas) igual se mezcla todo */
    var raro={mcq:["a"],listening:["b","c","d"],images:[],roleplay:"r"},o2=enOrderFor(raro);
    ok(enValidOrder(raro,o2),"una prueba con pocas alternativas tambien debe quedar completa");
    ok(!enValidOrder(ENGLISH.pruebas[0],enOrderFor(ENGLISH.pruebas[0]).slice(1)),"un orden incompleto no vale");
    ok(!enValidOrder(ENGLISH.pruebas[0],enOrderFor(ENGLISH.pruebas[1])),"un orden de otra prueba no vale");
  });
  T("10 al entrar te toca una prueba al azar, con su orden mezclado, y se conserva sin volver a sortear",function(){
    reset();
    withRandom([0],function(){openEnglish()});
    eq(visibleScreens().join(),"englishHub");
    var cur=appState.englishTests.current;
    eq(cur.n,1,"con azar 0 sale la primera pendiente");eq(cur.i,0);
    ok(enValidOrder(enTestDef(1),cur.order),"la prueba trae su orden mezclado de los 15 ejercicios");
    var order=cur.order.join();
    ok(/Prueba 1/.test(byId("enHubBody").textContent)&&/TE TOCÓ AL AZAR/.test(byId("enHubBody").textContent),"el menu debe decir cual te toco: "+byId("enHubBody").textContent.slice(0,120));
    ok(/8 alternativas, 4 audios, 2 fotos y 1 role-play, mezclados al azar/.test(byId("enHubBody").textContent),"el menu describe la tanda: "+byId("enHubBody").textContent);
    eq(document.querySelectorAll("#enHubBody li").length,0,"no hay lista de partes: es una sola tanda");
    ok(!/Parte|parte/.test(byId("enHubBody").textContent),"no debe hablar de partes");
    ok(/Comenzar prueba/.test(byId("enHubBody").textContent),"boton de comenzar");
    withRandom([0.99],function(){openEnglish()});
    eq(appState.englishTests.current.n,1,"al volver a entrar no se sortea de nuevo");
    eq(appState.englishTests.current.order.join(),order,"ni se vuelve a mezclar");
    eq(loadState().englishTests.current.order.join(),order,"la prueba y su orden se guardan");
    noScore(byId("englishHub"));
  });
  T("10 tras terminar una prueba te toca una de las que faltan; al terminar las 4 se ofrece otra vuelta",function(){
    reset();
    withRandom([0],function(){openEnglish()});
    eq(appState.englishTests.current.n,1);
    withRandom([0.99],function(){enFinishTest()});
    eq(appState.englishTests.done.join(),"1");eq(appState.englishTests.current.n,4,"con azar 0.99 sale la ultima de las 3 pendientes");
    ok(enValidOrder(enTestDef(4),appState.englishTests.current.order),"y llega con su propio orden mezclado");
    ok(/Prueba 1 completada/.test(byId("enHubBody").textContent),"aviso de prueba completada: "+byId("enHubBody").textContent.slice(0,140));
    withRandom([0],function(){openEnglish()});
    ok(!/Prueba 1 completada/.test(byId("enHubBody").textContent),"el aviso solo se ve al terminar la prueba, no en las entradas siguientes");
    eq(appState.englishTests.current.n,4,"y volver a entrar no cambia la prueba asignada");
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.done.join(),"1,4");eq(appState.englishTests.current.n,2);
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.current.n,3,"queda una sola");
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.done.length,4);eq(appState.englishTests.current,null,"ya no hay pendientes");
    ok(/Completaste las 4 pruebas/.test(byId("enHubBody").textContent)&&/Empezar otra vuelta/.test(byId("enHubBody").textContent),"aviso de vuelta completa");
    eq(document.querySelector("#enHubBody .en-test-go").getAttribute("onclick"),"enStartNewRound()");
    eq(appState.englishTests.last,3);
    withRandom([0],function(){enStartNewRound()});
    eq(appState.englishTests.done.length,0,"la vuelta nueva empieza de cero");eq(appState.englishTests.cycle,1);
    ok(appState.englishTests.current&&appState.englishTests.current.n!==3,"la primera de la vuelta nueva no repite la ultima que hiciste");
    ok(enValidOrder(enTestByN(appState.englishTests.current.n),appState.englishTests.current.order),"y con orden nuevo");
    ok(/vuelta 2/.test(byId("enHubBody").textContent),"el menu indica la vuelta: "+byId("enHubBody").textContent.slice(0,80));
  });
  T("10 el sorteo reparte de verdad entre las 4 pruebas",function(){
    var seen={};
    for(var i=0;i<300;i++){appState=defaultState();enAssign();seen[appState.englishTests.current.n]=(seen[appState.englishTests.current.n]||0)+1}
    eq(Object.keys(seen).sort().join(),"1,2,3,4","deben salir las 4 pruebas");
    Object.keys(seen).forEach(function(k){ok(seen[k]>=30,"la prueba "+k+" salio muy pocas veces: "+seen[k])});
  });
  T("10 una prueba es una sola tanda: 15 ejercicios mezclados sin pasar por el menu, con el resultado de las alternativas",function(){
    reset();
    withRandom([0],function(){openEnglish()});
    var n=appState.englishTests.current.n,order=appState.englishTests.current.order.slice();
    enStartOrContinue();
    var units=[],screens=0,guard=0,mcqDone=0;
    while(visibleScreens().join()==="englishPractice"&&guard++<100){
      var s=enSession;
      if(!units.length||units[units.length-1].pos!==s.pos)units.push({pos:s.pos,kind:s.kind});
      ok(new RegExp("^PRUEBA "+n+" · "+(s.pos+1)+" / 15$").test(byId("epMeta").textContent),"encabezado: "+byId("epMeta").textContent);
      eq(byId("epNextBtn").disabled,true,"no se puede avanzar sin contestar o revelar");
      ok(!byId("epPrevBtn"),"no hay boton Anterior: la prueba avanza siempre hacia adelante");
      if(s.kind==="mcq"){answerMcq(mcqDone<5);mcqDone++}
      else byId("epRevealBtn").click();
      eq(byId("epNextBtn").disabled,false,"tras contestar o revelar se puede avanzar");
      eq(byId("epNextBtn").textContent,(s.pos===14&&s.index===s.items.length-1)?"Terminar prueba":"Siguiente");
      eq(appState.resume,null,"una prueba no se guarda como sesion suelta");
      noScore(byId("englishPractice"));
      byId("epNextBtn").click();
      screens++;
      if(visibleScreens().join()==="englishPractice"&&enSession.index===0)eq(loadState().englishTests.current.i,enSession.pos,"el avance se guarda en el dispositivo al terminar cada ejercicio");
    }
    eq(units.length,15,"ejercicios distintos");eq(screens,17,"15 ejercicios; el role-play trae 3 turnos");
    eq(JSON.stringify(units.map(function(u){return u.kind})),JSON.stringify(order.map(function(r){return {q:"mcq",l:"listening",i:"image",r:"roleplay"}[r[0]]})),"salen en el orden mezclado que se sorteo");
    var count=function(k){return units.filter(function(u){return u.kind===k}).length};
    eq(count("mcq"),8);eq(count("listening"),4);eq(count("image"),2);eq(count("roleplay"),1);
    eq(visibleScreens().join(),"englishHub","solo al terminar la prueba se vuelve al menu");
    eq(appState.englishTests.done.join(),String(n),"la prueba queda completada");
    ok(appState.englishTests.current&&appState.englishTests.current.n!==n,"y te toca otra");
    ok(new RegExp("Prueba "+n+" completada · alternativas: 5 de 8 correctas").test(byId("enHubBody").textContent),"aviso: "+byId("enHubBody").textContent.slice(0,160));
    noScore(byId("englishHub"));
  });
  T("10 salir a mitad de la prueba la deja en curso: al volver sigues en el mismo ejercicio, con el mismo orden y tus aciertos",function(){
    reset();
    openEnglish();
    var cur=appState.englishTests.current,order=cur.order.slice(),n=cur.n;
    enStartOrContinue();
    var wantMcq=0,guard=0;
    while(enSession.pos<5&&guard++<30){
      if(enSession.kind==="mcq"){answerMcq(true);wantMcq++}else byId("epRevealBtn").click();
      byId("epNextBtn").click();
    }
    eq(enSession.pos,5,"vas en el sexto ejercicio");
    exitEnglishPractice();
    eq(visibleScreens().join(),"englishHub");
    cur=appState.englishTests.current;
    eq(cur.n,n);eq(cur.i,5);eq(cur.order.join(),order.join(),"el orden no cambia");
    eq(wantMcq>0?cur.mcq.t:0,wantMcq,"las alternativas ya contestadas se cuentan");
    ok(/EN CURSO/.test(byId("enHubBody").textContent)&&/Vas en el ejercicio 6 de 15/.test(byId("enHubBody").textContent)&&/Continuar prueba/.test(byId("enHubBody").textContent),"menu: "+byId("enHubBody").textContent);
    ok(document.querySelector("#enHubBody .progress"),"barra de avance");
    /* al reabrir la app desde cero (recargar) tambien */
    appState=loadState();
    openEnglish();
    eq(appState.englishTests.current.i,5,"el avance sobrevive a recargar");
    enStartOrContinue();
    eq(enSession.pos,5,"se retoma en el mismo ejercicio");
    eq(enSession.n,n);
    /* salir a mitad de una alternativa: no cuenta y vuelve a empezar */
    var before=JSON.stringify(appState.englishTests.current.mcq||null);
    if(enSession.kind==="mcq")optionButtons()[0].click();
    exitEnglishPractice();
    eq(JSON.stringify(appState.englishTests.current.mcq||null),before,"una alternativa que no se termino no cuenta");
    eq(appState.englishTests.current.i,5);
    /* salir a mitad de un role-play: vuelve al primer turno */
    reset();
    enOpenUnit(2,["r:en_rp_02"]);
    byId("epRevealBtn").click();byId("epNextBtn").click();
    eq(enSession.index,1,"segundo turno");
    exitEnglishPractice();
    eq(appState.englishTests.current.i,0);
    enStartOrContinue();
    eq(enSession.index,0,"el role-play vuelve a empezar en el primer turno");
    eq(appState.resume,null);
  });
  T("10 alternativas: cuatro opciones mezcladas, una sola respuesta, explicacion sin citas y no se puede cambiar",function(){
    reset();
    enOpenUnit(1,["q:en_q_01"]);
    var q=enSession.items[0];
    eq(visibleScreens().join(),"englishPractice");
    ok(/ALTERNATIVA/.test(byId("epTag").textContent),byId("epTag").textContent);
    eq(byId("epTitle").textContent,q.q);
    var btns=optionButtons();
    eq(btns.length,4);
    eq(btns.map(function(b){return b.querySelector(".letter").textContent}).join(""),"ABCD");
    eq(btns.map(optionText).sort().join("|"),q.options.slice().sort().join("|"),"estan las 4 opciones");
    ok(byId("epRevealBtn").classList.contains("hidden"),"no hay boton de mostrar modelo");
    ok(byId("epRateWrap").classList.contains("hidden"),"ni autocalificacion");
    ok(byId("epReveal").classList.contains("hidden"),"la explicacion no se ve antes de contestar");
    eq(byId("epNextBtn").disabled,true);
    ok(document.querySelector("#epWork .dontknow"),"hay «No la sé»");
    nextEnglish();
    eq(enSession.pos,0,"sin contestar no se puede pasar a la siguiente (ni por codigo)");
    answerMcq(false);
    var after=optionButtons();
    eq(after.filter(function(b){return b.classList.contains("correct")}).length,1,"una opcion correcta marcada");
    eq(after.filter(function(b){return b.classList.contains("wrong")}).length,1,"y la elegida marcada como incorrecta");
    ok(after.every(function(b){return b.disabled}),"las opciones se bloquean");
    eq(optionText(after.filter(function(b){return b.classList.contains("correct")})[0]),q.options[q.correct]);
    ok(byId("epReveal").querySelector(".feedback-head.bad")&&byId("epReveal").textContent.indexOf(q.expl)>=0,"explicacion");
    ok(!byId("epReveal").querySelector(".citation")&&!/Referencia|VERIFICADO/.test(byId("epReveal").textContent),"sin bloque de citas");
    ok(!document.querySelector("#epWork .dontknow"),"«No la sé» desaparece");
    after.filter(function(b){return b.classList.contains("correct")})[0].disabled=false;
    after.filter(function(b){return b.classList.contains("correct")})[0].click();
    eq(enSession.state[0].chosen===q.correct,false,"la respuesta no se puede cambiar");
    eq(byId("epNextBtn").disabled,false);
    /* «No la sé» cuenta como incorrecta y muestra la respuesta */
    reset();
    enOpenUnit(1,["q:en_q_01"]);
    document.querySelector("#epWork .dontknow").click();
    eq(enSession.state[0].chosen,-1);
    ok(byId("epReveal").querySelector(".feedback-head.bad")&&/Respuesta correcta/.test(byId("epReveal").textContent),"muestra la respuesta correcta");
    eq(document.querySelectorAll("#epWork .option.wrong").length,0);
    eq(document.querySelectorAll("#epWork .option.correct").length,1);
    byId("epNextBtn").click();
    eq(appState.englishTests.current.mcq.c,0);eq(appState.englishTests.current.mcq.t,1);
    /* acertar */
    reset();
    enOpenUnit(1,["q:en_q_01"]);
    answerMcq(true);
    ok(byId("epReveal").querySelector(".feedback-head.ok")&&/Correcta/.test(byId("epReveal").textContent));
    byId("epNextBtn").click();
    eq(appState.englishTests.current.mcq.c,1);eq(appState.englishTests.current.mcq.t,1);
    /* el orden de las opciones cambia de una vez a otra */
    var pos={};
    for(var i=0;i<60;i++){enOpenUnit(1,["q:en_q_01"]);var b=optionButtons();pos[b.map(optionText).indexOf(enSession.items[0].options[enSession.items[0].correct])]=1}
    ok(Object.keys(pos).length>=3,"la respuesta correcta casi siempre cae en el mismo lugar: "+Object.keys(pos));
    /* la alternativa no toca las estadisticas del banco tecnico */
    eq(overall().a,0);eq(weakQuestions(null).length,0);
  });
  T("10 describir imagenes: las 2 fotos de la prueba, el titulo y el tema solo al revelar, y no hay nota",function(){
    reset();
    enOpenUnit(1,["i:en_img_01","i:en_img_05"]);
    eq(visibleScreens().join(),"englishPractice");
    eq(byId("epNextBtn").disabled,true,"no se puede avanzar sin revelar");
    nextEnglish();
    eq(enSession.pos,0,"sin revelar el modelo no se puede pasar a la siguiente (ni por codigo)");
    ok(byId("epReveal").classList.contains("hidden"),"el modelo debe estar oculto");
    ok(/^assets\/ingles\/.+\.jpg$/.test(byId("epStimulus").querySelector("img").getAttribute("src")),"foto");
    ok(byId("epStimulus").querySelector("img").getAttribute("alt").length>20,"la foto necesita texto alternativo");
    var im=enById(ENGLISH.images,"en_img_01");
    ok((byId("epTag").textContent+" "+byId("epTitle").textContent+" "+byId("epStimulus").textContent).indexOf(im.title)<0&&byId("epTag").textContent.indexOf(im.topic)<0,"ni el titulo ni el tema de la foto deben verse antes de describirla");
    eq(byId("epTitle").textContent,"Describe the picture.");
    byId("epRevealBtn").click();
    ok(!byId("epReveal").classList.contains("hidden"),"el modelo debe verse");
    ok(/Descripción modelo/i.test(byId("epReveal").textContent),"falta la descripcion modelo");
    ok(byId("epReveal").textContent.indexOf(im.title)>=0&&byId("epReveal").textContent.indexOf(im.topic)>=0,"el titulo y el tema aparecen al revelar");
    eq(byId("epNextBtn").disabled,false,"tras revelar se puede avanzar");
    rateEnglish(1);eq(appState.english["en_img_01"].r,1);eq(appState.english["en_img_01"].a,1);
    rateEnglish(2);eq(appState.english["en_img_01"].r,2);eq(appState.english["en_img_01"].a,2);
    noScore(byId("englishPractice"));
    byId("epNextBtn").click();
    eq(enSession.kind,"image","la segunda foto sigue a la primera");eq(enSession.items[0].id,"en_img_05");eq(enSession.pos,1);
  });
  T("10 role-play: 3 turnos seguidos dentro de la misma tanda, con la situacion a la vista, audio de ATC solo donde responde y lo que ya paso",function(){
    reset();
    enOpenUnit(1,["r:en_rp_01"]);
    eq(enSession.kind,"roleplay");
    var rp=ENGLISH.roleplays[0];
    ok(/^PRUEBA 1 · 1 \/ 15$/.test(byId("epMeta").textContent),byId("epMeta").textContent);
    /* turno 1: el piloto abre, sin audio */
    ok(/ROLE-PLAY · TURNO 1 DE 3/.test(byId("epTag").textContent),byId("epTag").textContent);
    ok(byId("epStimulus").textContent.indexOf(rp.scenario)>=0,"la situacion debe verse");
    ok(!byId("enPlayBtn"),"el primer turno no tiene audio");
    ok(byId("enTranscript"),"hay donde responder");
    ok(!/Hasta ahora/.test(byId("epStimulus").textContent),"el primer turno no tiene historia");
    byId("epRevealBtn").click();
    ok(/Mayday, mayday, mayday, Walden Tower, Fastair three four five, engine failure/.test(byId("epReveal").textContent),"modelo del turno 1");
    ok(!byId("epReveal").querySelector(".citation")&&!/Referencia/.test(byId("epReveal").textContent),"el role-play no muestra citas");
    ok(byId("epReveal").querySelectorAll(".en-check label").length>=4,"lista para compararte");
    ok(byId("epReveal").querySelectorAll(".en-chip").length>=3,"vocabulario");
    ok(/turnos de ATC son de práctica/.test(byId("epReveal").textContent),"se avisa que los turnos de ATC son de practica");
    eq(byId("epNextBtn").textContent,"Siguiente");
    byId("epNextBtn").click();
    /* turno 2: ATC habla (audio con el texto oculto) y aparece lo que ya paso; sigue siendo el mismo ejercicio de la prueba */
    ok(/TURNO 2 DE 3/.test(byId("epTag").textContent));
    ok(/^PRUEBA 1 · 1 \/ 15$/.test(byId("epMeta").textContent),"el turno no cuenta como otro ejercicio");
    ok(byId("enPlayBtn"),"el segundo turno tiene audio");
    ok(byId("enHeardText").classList.contains("hidden"),"el texto de lo que escuchas empieza oculto");
    ok(byId("epStimulus").textContent.indexOf(rp.scenario)>=0,"la situacion sigue a la vista");
    ok(/Hasta ahora/.test(byId("epStimulus").textContent)&&/Tú:.*Mayday, mayday, mayday/.test(byId("epStimulus").textContent),"historia del turno 1: "+byId("epStimulus").textContent.slice(-220));
    enToggleHeard();ok(!byId("enHeardText").classList.contains("hidden"));
    ok(/roger Mayday/.test(byId("enHeardText").textContent));
    byId("epRevealBtn").click();byId("epNextBtn").click();
    /* turno 3: la historia trae los dos turnos anteriores */
    eq(byId("epStimulus").querySelectorAll(".en-tr").length,3,"turno 1 (tu respuesta), turno 2 (ATC y tu respuesta)");
    ok(/persons on board and endurance/.test(byId("enHeardText").textContent));
    byId("epRevealBtn").click();
    eq(byId("epNextBtn").textContent,"Siguiente","el role-play no es el ultimo ejercicio");
    byId("epNextBtn").click();
    eq(enSession.pos,1,"tras el ultimo turno sigue el ejercicio siguiente de la prueba, sin pasar por el menu");
    eq(visibleScreens().join(),"englishPractice");
  });
  T("10 role-play: los 4 escenarios (V1, rechazado, urgencia, descenso) traen indicativo y fuentes internas, y ninguna se muestra",function(){
    var m=function(i,t){return ENGLISH.roleplays[i].turns[t]};
    ok(/^Mayday, mayday, mayday, Walden Tower, Fastair three four five, engine failure after take-off\./.test(m(0,0).model[0]),"despues de V1: MAYDAY");
    ok(m(0,0).refs.some(function(r){return /^FCTM/.test(r.src)&&/must continue the takeoff/.test(r.cite)}),"despues de V1: la fuente interna se conserva");
    eq(m(1,0).model[0],"Fastair three four five, stopping.","antes de V1: stopping");
    ok(/^Mayday, mayday, mayday, Kennington Tower/.test(m(1,1).model[0])&&/engine fire/.test(m(1,1).model[0]),"antes de V1: MAYDAY por fuego");
    ok(/^Pan-pan, pan-pan, pan-pan, Walden Tower/.test(m(2,0).model[0]),"urgencia: PAN PAN");
    eq(m(3,0).model.length,2,"descenso de emergencia: version estandar y version con MAYDAY");
    ENGLISH.roleplays.forEach(function(rp){
      rp.turns.forEach(function(t,i){
        t.model.forEach(function(x){ok(/Fastair three four five/.test(x),rp.id+" turno "+(i+1)+": el modelo debe llevar el indicativo")});
        t.refs.forEach(function(r){ok(/^(ICAO Doc 9432|FCTM|FCOM) /.test(r.src)&&/PDF \d+/.test(r.src)&&r.cite.length>10,rp.id+": fuente interna sin documento o sin pagina")});
        if(i>0)ok(t.heard&&t.heard[0].who==="atc","el turno "+(i+1)+" responde a ATC");
      });
    });
  });
  T("10 apuntes libres: se entienden digitos, palabras, mil/cien y decimales escritos de muchas formas",function(){
    var d=function(s){return enNoteTokens(s).digits.join("|")};
    eq(d("RWY 27 WIND 200/12 QNH1018 T16 D10"),"27|200|12|1018|16|10");
    eq(d("wind two zero zero degrees one two knots"),"200|12");
    eq(d("Visibility eight thousand metres"),"8000");
    eq(d("two thousand five hundred feet"),"2500");
    eq(d("three thousand four hundred"),"3400");
    eq(d("one two thousand"),"12000");
    eq(d("seven hundred"),"700");
    eq(d("one one eight decimal seven"),"1187");
    eq(d("118.7"),"1187");eq(d("118,7"),"1187");eq(d("13:55Z"),"1355");
    eq(d("temperature one six, dew point one zero"),"16|10","dew point no debe unir las cifras");
    eq(d("tree fower fife niner"),"3459");
    var t=enNoteTokens("A1 FL280");
    ok(t.compact.indexOf("a1")>=0&&t.digits.indexOf("280")>=0,"A1 FL280");
  });
  T("10 apuntes libres: un dato se da por anotado si aparece de cualquiera de sus formas, y no por casualidad",function(){
    var f=function(text,accept){return enKeyFound({accept:accept},enNoteTokens(text))};
    ok(f("WIND 200/12KT",[["200","12"]]),"viento con barra");
    ok(f("w/v 20012kt",[["200","12"]]),"viento pegado (20012)");
    ok(!f("WIND 200 KT",[["200","12"]]),"falta la velocidad");
    ok(f("RWY27",[["27"]]),"pista pegada");
    ok(f("runway 06",[["6"]])&&f("rwy 6",[["06"]]),"ceros a la izquierda");
    ok(!f("QNH 1018",[["1019"]]),"otro valor");
    ok(!f("1018",[["10"]]),"10 no debe salir de 1018");
    ok(f("VIS 8KM",[["8000"],["8","km"]]),"visibilidad en km");
    ok(f("A one",[["a1"],["a","1"]])&&f("A1",[["a1"],["a","1"]]),"ruta A1");
    ok(f("INFO B",[["bravo"],["b"]])&&f("information Bravo",[["bravo"],["b"]]),"letra del ATIS");
    ok(!f("",[["27"]]),"vacio");
    ok(!f("hello world",[["hello","27"]]),"todas las partes son obligatorias");
  });
  T("10 audios: cada dato clave se reconoce en la propia transcripcion y no en un texto ajeno (los 16 audios)",function(){
    eq(ENGLISH.listening.length,16);
    ENGLISH.listening.forEach(function(it){
      var tok=enNoteTokens(it.lines.map(function(l){return l.text}).join(" ")),other=enNoteTokens("hello world nothing to see");
      it.keys.forEach(function(k){
        ok(enKeyFound(k,tok),it.id+": el dato «"+k.label+"» no se reconoce ni en la transcripcion exacta");
        ok(!enKeyFound(k,other),it.id+": el dato «"+k.label+"» se da por anotado con un texto que no tiene nada que ver");
      });
    });
  });
  T("10 audios: unos apuntes abreviados al estilo de cabina se reconocen y unos parciales solo marcan lo anotado",function(){
    var it=ENGLISH.listening[0];
    var tok=enNoteTokens("GEORGETOWN INFO B 1455\nRWY 27 ILS TL 50\nW/V 200/12\nVIS 8KM FEW 2500\nT16 D10\nQNH 1018\nADVISE INFO B");
    it.keys.forEach(function(k){ok(enKeyFound(k,tok),"no reconoce «"+k.label+"» en apuntes abreviados")});
    var partial=enNoteTokens("RWY 27 QNH 1018");
    eq(it.keys.filter(function(k){return enKeyFound(k,partial)}).map(function(k){return k.label}).join("|"),"Pista en uso|QNH","solo debe reconocer lo anotado");
    var fog=ENGLISH.listening.filter(function(x){return x.id==="en_lis_16"})[0];
    var tf=enNoteTokens("COLINTON DEP INFO I 0645 RWY 24 LVP W/V 240/4 VIS 400 FG RVR 350/300/250 VV100 T2 D2 QNH1031 ADVISE");
    fog.keys.forEach(function(k){ok(enKeyFound(k,tf),"no reconoce «"+k.label+"» en apuntes abreviados de la niebla")});
  });
  T("10 audios: los apuntes son libres (sin campos que den el orden), una sola opcion de audio y la comparacion no da nota",function(){
    reset();
    enOpenUnit(1,["l:en_lis_01"]);
    var notes=byId("enNotes");
    ok(notes&&notes.tagName==="TEXTAREA","debe haber un cuadro libre de apuntes");
    eq(document.querySelectorAll("#epWork input,#epWork select").length,0,"no debe haber campos etiquetados, selectores ni casillas");
    ok(!byId("enRate")&&!byId("enVoice")&&!byId("enRadio")&&!byId("enReplayBtn"),"el audio no tiene velocidad, voz, digitos ni ultima frase");
    eq(document.querySelectorAll("#epWork .en-audio button").length,1,"un solo boton de audio");
    ok(!/viento|pista|qnh|wind|runway|temperatura|visibilidad|frecuencia/i.test(notes.placeholder+" "+byId("epTip").textContent+" "+byId("epStimulus").textContent),"las instrucciones no deben adelantar el orden ni los datos");
    byId("epRevealBtn").click();
    ok(/No escribiste nada/.test(byId("epReveal").textContent)&&document.querySelectorAll("#epReveal .en-key.ok").length===0,"sin apuntes no se marca nada");
    retryEnglish();
    notes=byId("enNotes");
    notes.value="RWY 27 QNH 1018 ILS";enTextChanged(notes.value);
    byId("epRevealBtn").click();
    eq(document.querySelectorAll("#epReveal .en-key").length,ENGLISH.listening[0].keys.length,"una fila por dato clave");
    eq(document.querySelectorAll("#epReveal .en-key.ok").length,3,"pista, ILS y QNH");
    ok(/Transcripci/.test(byId("epReveal").textContent)&&/Georgetown information Bravo/.test(byId("epReveal").textContent),"transcripcion");
    ok(!byId("epReveal").querySelector(".citation")&&!/Referencia/.test(byId("epReveal").textContent),"el audio no muestra citas");
    ok(byId("enNotes").readOnly,"los apuntes quedan bloqueados al comprobar");
    noScore(byId("englishPractice"));
    retryEnglish();
    eq(byId("enNotes").value,"","volver a intentarlo borra los apuntes");
    ok(byId("epReveal").classList.contains("hidden"),"y oculta la comparacion");
    eq(byId("enNotes").readOnly,false);
  });
  T("10 radioSay: digitos de radio y siglas deletreadas",function(){
    eq(radioSay("Runway three four five nine, QNH one zero one eight."),"Runway tree fower fife niner, Q N H one zero one eight.");
    eq(radioSay("Three thousand four hundred",false),"Three thousand four hundred");
    eq(radioSay("Nineteen and fourteen"),"Nineteen and fourteen","no debe tocar palabras que solo contienen un digito");
    eq(radioSay("ILS runway two four"),"I L S runway two fower");
    eq(radioSay("ILS runway two four",false),"I L S runway two four");
  });
  T("10 el audio se lee con la voz del dispositivo, con los digitos de radio, y se detiene al cambiar de pantalla",function(){
    reset();
    var sp=fakeSpeech();
    try{
      enOpenUnit(2,["l:en_lis_07"]);
      enPlayCurrent();
      return new Promise(function(resolve,reject){
        setTimeout(function(){
          try{
            ok(sp.spoken.length>=1,"no se pidio hablar");
            ok(/^Fastair tree fower fife heavy, Georgetown Departure/.test(sp.spoken[0].text),"la autorizacion debe decir tree fower fife: "+sp.spoken[0].text);
            eq(sp.spoken[0].rate,1,"una sola velocidad");
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
  T("10 audios: una sola velocidad y una voz al azar por audio, sin voces de novedad, estable al repetir y otra tras reintentar",function(){
    reset();
    var sp=fakeSpeech(EN_VOICES);
    try{
      eq(enVoices().map(function(v){return v.name}).join(),"Test George,Test Susan,Test Aria","solo inglés y sin Zarvox");
      var seenAtc={},bad=0;
      for(var i=0;i<200;i++){var p=enPickVoices();seenAtc[p.atc]=1;if(p.atc===p.pilot)bad++}
      eq(Object.keys(seenAtc).length,3,"con el azar de verdad deben salir las 3 voces");eq(bad,0,"ATC y piloto suenan con voces distintas cuando hay mas de una");
      enOpenUnit(2,["l:en_lis_02","l:en_lis_07"]);
      withRandom([0,0.99],function(){enVoiceFor("atc")});
      enPlay(enPlayableLines());
      var u;
      return new Promise(function(resolve,reject){
        setTimeout(function(){
          try{
            u=sp.spoken[0];
            eq(u.voice.name,"Test George","con azar 0 la voz de ATC es la primera");eq(u.lang,"en-GB");eq(u.rate,1,"velocidad unica");eq(u.pitch,1,"con dos voces distintas no se altera el tono");
            eq(enSession.state[0].voices.pilot,"Test Aria");
            var before=sp.spoken.length,voicesBefore=JSON.stringify(enSession.state[0].voices);
            withRandom([0.5,0.5],function(){enPlay(enPlayableLines())});
            setTimeout(function(){
              try{
                eq(sp.spoken[before].voice.name,"Test George","al repetir el audio suena la misma voz");
                eq(JSON.stringify(enSession.state[0].voices),voicesBefore,"y no se vuelve a sortear");
                /* siguiente audio: otra voz */
                byId("epRevealBtn").click();byId("epNextBtn").click();
                eq(enSession.items[0].id,"en_lis_07");
                withRandom([0.99,0],function(){enVoiceFor("atc")});
                enPlay(enPlayableLines());
                setTimeout(function(){
                  try{
                    var last=sp.spoken[sp.spoken.length-1];
                    eq(last.voice.name,"Test Aria","el audio siguiente puede tener otra voz");
                    /* la voz del piloto en la colacion modelo */
                    byId("epRevealBtn").click();
                    var btn=document.querySelector('#epReveal .en-say[data-who="pilot"]');
                    ok(btn,"la colacion modelo tiene boton de escuchar");
                    enPlayFromBtn(btn);
                    setTimeout(function(){
                      try{
                        eq(sp.spoken[sp.spoken.length-1].voice.name,"Test George","la colacion se dice con la voz del piloto de ese audio");
                        retryEnglish();
                        eq(enSession.state[enSession.index].voices,null,"al reintentar se sortea de nuevo");
                        goHome();sp.restore();resolve();
                      }catch(e){sp.restore();reject(e)}
                    },200);
                  }catch(e){sp.restore();reject(e)}
                },200);
              }catch(e){sp.restore();reject(e)}
            },200);
          }catch(e){sp.restore();reject(e)}
        },250);
      });
    }catch(e){sp.restore();throw e}
  });
  T("10 audios: con una sola voz en el dispositivo, ATC y piloto se distinguen por el tono",function(){
    reset();
    var sp=fakeSpeech([voice("Unica","en-US")]);
    try{
      enOpenUnit(1,["l:en_lis_01"]);
      enPlay([{who:"atc",text:"Hello.",pause:0}]);
      return new Promise(function(resolve,reject){
        setTimeout(function(){
          try{
            eq(sp.spoken[0].voice.name,"Unica");eq(sp.spoken[0].pitch,0.9,"ATC mas grave");
            enPlay([{who:"pilot",text:"Hello.",pause:0}]);
            setTimeout(function(){
              try{eq(sp.spoken[1].pitch,1.15,"piloto mas agudo");goHome();sp.restore();resolve()}catch(e){sp.restore();reject(e)}
            },200);
          }catch(e){sp.restore();reject(e)}
        },200);
      });
    }catch(e){sp.restore();throw e}
  });
  T("10 microfono en ingles: goHome detiene la escucha y un permiso tardio no la inicia en otra pantalla",async function(){
    reset();setupMic(okStream);
    try{
      enMedia.micOk=true;
      enOpenUnit(1,["r:en_rp_01"]);
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
      enOpenUnit(1,["r:en_rp_01"]);
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
      enOpenUnit(1,["r:en_rp_01"]);
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
      byId("epRevealBtn").click();
      ok(!byId("epReveal").classList.contains("hidden"),"el modelo debe verse");
    }finally{teardownMic()}
  });
  T("10 la tarjeta del inicio cuenta las pruebas y las alternativas cargadas",function(){
    reset();renderHome();
    ok(/4 pruebas al azar/.test(byId("homeEnglishCount").textContent),byId("homeEnglishCount").textContent);
    ok(!/hechas/.test(byId("homeEnglishCount").textContent));
    enOpenUnit(1,[]);enFinishTest();renderHome();
    ok(/1 de 4 hechas/.test(byId("homeEnglishCount").textContent),byId("homeEnglishCount").textContent);
    ok(/32 inglés OACI \(alternativas en 4 pruebas\)/.test(byId("appMeta").textContent),byId("appMeta").textContent);
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
      minH("#englishHub .back","el enlace Inicio");minH("#englishHub .en-test-go","el boton de comenzar");
      enOpenUnit(1,["q:en_q_01"]);
      minH("#englishPractice .back","el enlace Salir");minH("#epWork .option","las alternativas");minH("#epWork .dontknow","el boton No la se");
      answerMcq(true);
      minH("#epNextBtn","el boton Siguiente");
      enOpenUnit(1,["r:en_rp_01"]);
      byId("epRevealBtn").click();byId("epNextBtn").click();
      minH("#enPlayBtn","el boton de escuchar");minH("#enMicBtn","el boton de grabar");minH("#epRevealBtn","el boton de mostrar modelo");
      byId("epRevealBtn").click();
      minH("#epReveal .en-say","los botones de escuchar el modelo");minH("#epRateWrap .rate","los botones de autocalificacion");minH("#epReveal .en-check label","las casillas de autoevaluacion");
      enOpenUnit(1,["l:en_lis_01"]);
      minH("#enNotes","el cuadro de apuntes");
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
