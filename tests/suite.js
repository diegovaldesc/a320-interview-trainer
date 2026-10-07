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

  /* ---------- 0. Arranque ---------- */
  T("0 la app carga sin errores de script",function(){
    ok(window.__errs&&window.__errs.length===0,"errores al cargar: "+(window.__errs||[]).join(" | "));
  });
  T("0 el banco reporta integridad estructural OK",function(){
    var h=bankIntegrity();ok(h.ok,"bankIntegrity: "+JSON.stringify(h));
    eq(totalQuestions(),415,"preguntas FCOM");
    eq(dgacTotal(),573,"preguntas DGAC");
    eq(interviewTechnicalTotal(),93,"preguntas entrevista tecnica");
    eq(ORAL_VOICE_BANK.length,53,"preguntas orales");
  });
  T("0 DGAC-01 la pregunta de la PTU con parking brake esta en el banco DGAC con respuesta TRUE (logica real de los master levers)",function(){
    var hit=rawPool(DGAC_KEY).filter(function(q){return /PRESSURIZE THE GREEN HYDRAULIC SYSTEM ON THE GROUND VIA THE PTU/i.test(q.q)});
    eq(hit.length,1,"preguntas de la PTU con parking brake");
    eq(correctText(hit[0]),"TRUE.","respuesta");
    ok(/master levers[^.]*en OFF/i.test(hit[0].expl)&&/parking brake suelto/i.test(hit[0].expl),"la explicacion debe dar la logica de los master levers y del parking brake");
    ok(!/\b(FCOM|FCTM|AFM|PDF)\b/.test(hit[0].expl+" "+hit[0].cite),"la explicacion y la referencia no citan manuales");
  });
  T("0 DGAC-02 la pregunta DGAC de los SFCC marca dos SFCC (trabajan los dos a la vez) y las explicaciones de alpha floor y de los ELAC calzan con su respuesta",function(){
    var pool=rawPool(DGAC_KEY);function one(re){var h=pool.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]}
    var s=one(/^WHICH OF THE FOLLOWING CONTROLS AND MONITORS FLAPS AND SLATS/);
    eq(correctText(s),"TWO SLAT FLAP CONTROL COMPUTER (SFCC'S).","respuesta: dos SFCC");
    ok(/los dos a la vez/.test(s.expl)&&/media velocidad/.test(s.expl)&&!/uno solo/.test(s.expl),"la explicacion dice que trabajan los dos y que con uno van a media velocidad");
    var a=one(/^WHEN IS ALPHA FLOOR NOT AVAILABLE/);eq(correctText(a),"OUT OF NORMAL LAW.","alpha floor: fuera de normal law");
    ok(!/cualquiera de estas tres/.test(a.expl)&&/solo en normal law/.test(a.expl),"la explicacion de alpha floor no contradice su respuesta");
    var e=one(/^WHICH OF THE FOLLOWING STATEMENTS IS CORRECT CONCERNING THE ELEVATOR AILERON/);
    ok(/stabilizer/.test(e.expl)&&!/no asumen el control normal del THS/.test(e.expl),"la explicacion de los ELAC incluye el stabilizer");
  });
  T("0 QID-01 al corregir un enunciado (PTU) el progreso, las guardadas, la autoevaluacion y Need to know pasan al id nuevo",function(){
    var olds=Object.keys(QID_RENAMES);eq(olds.length,42,"ids antiguos (11 de los enunciados de PTU y 31 de operaciones sin la mencion a los Tutorials)");
    olds.forEach(function(k){ok(findById(QID_RENAMES[k]),"existe "+QID_RENAMES[k]);ok(!findById(k),"ya no existe "+k)});
    var o=olds[0],n=QID_RENAMES[o];
    var st={stats:{},bookmarks:{},oral:{},needToKnow:{added:["q:"+o],removed:["q:"+olds[1]]}};
    st.stats[o]={a:3,c:2,w:1,last:5,streak:1,lastResult:1};st.bookmarks[o]=true;st.oral[o]={a:2,total:3,low:0,last:5};
    var r=roundTrip(st);
    ok(r.stats[n]&&r.stats[n].a===3&&!r.stats[o],"estadisticas trasladadas");
    ok(r.bookmarks[n]===true&&!r.bookmarks[o],"guardada trasladada");
    ok(r.oral[n]&&r.oral[n].total===3&&!r.oral[o],"autoevaluacion trasladada");
    eq(r.needToKnow.added.join(),"q:"+n,"Need to know (agregadas) trasladado");
    eq(r.needToKnow.removed.join(),"q:"+QID_RENAMES[olds[1]],"Need to know (quitadas) trasladado");
    var both={stats:{}};both.stats[o]={a:1,c:0,w:1,last:1,streak:0,lastResult:0};both.stats[n]={a:9,c:9,w:0,last:9,streak:9,lastResult:1};
    eq(roundTrip(both).stats[n].a,9,"si ya hay datos en el id nuevo, se conservan");
    ok(!rawPool(null).concat(rawPool(DGAC_KEY)).some(function(q){return /\b(el|del|al) PTU\b|\b[Ll]a PTU\b/.test(q.q+" "+q.options.join(" ")+" "+(q.expl||"")+" "+(q.cite||""))}),"ningun texto dice el PTU ni la PTU (se dice PTU, sin articulo)");
  });
  T("0 ESTRUCTURA-01 index.html carga sus partes (css/, data/, js/) en orden, una vez y con la version actual",function(){
    var want=["css/app.css","css/ruta.css","data/questions/index.js","data/english/index.js","data/oral/index.js","data/stations/index.js","js/app.js","js/oral.js","js/needtoknow.js","js/ingles.js","js/inicio.js","js/ruta.js"];
    var refs=[].map.call(document.querySelectorAll('link[rel="stylesheet"][href],script[src]'),function(el){return el.getAttribute(el.tagName==="LINK"?"href":"src")}).filter(function(r){return !/^(https?:)?\/\//.test(r)});
    var paths=refs.map(function(r){return r.split("?")[0]});
    paths.forEach(function(p,k){
      eq(paths.filter(function(x){return x===p}).length,1,"veces que index.html carga "+p);
      eq(refs[k],p+"?v="+APP_VERSION,"version en la ruta de "+p+" (debe ser APP_VERSION para que el navegador no use una copia vieja)");
    });
    want.forEach(function(p,k){
      ok(paths.indexOf(p)>=0,"index.html debe cargar "+p);
      if(k>0)ok(paths.indexOf(p)>paths.indexOf(want[k-1]),p+" debe cargarse despues de "+want[k-1]);
    });
    ["data/questions/","data/english/","data/oral/","data/stations/"].forEach(function(dir){
      var idx=paths.indexOf(dir+"index.js"),parts=paths.filter(function(p){return p.indexOf(dir)===0&&p!==dir+"index.js"});
      ok(parts.length>0,dir+" no carga ninguna parte");
      parts.forEach(function(p){ok(paths.indexOf(p)<idx,p+" debe cargarse antes de "+dir+"index.js, que lo reune")});
    });
    ["data/banco.js","data/ingles.js","data/oral.js","data/estaciones.js"].forEach(function(p){ok(paths.indexOf(p)<0,p+" ya no existe (se dividio en modulos): no debe cargarse")});
    ok(!document.querySelector("style"),"no debe quedar un bloque <style> dentro de index.html");
    ok(!document.getElementById("systems-data")&&!document.getElementById("english-data"),"los bancos ya no van dentro de index.html");
    eq(typeof SYSTEMS_DATA_JSON,"string","texto del banco (lo arma data/questions/index.js)");
    eq(BANK_FINGERPRINT,cheapHash(SYSTEMS_DATA_JSON),"la huella sale del texto exacto del banco");
    ["BANK_PARTS","DGAC_SECTIONS","DGAC_SECTION_ORDER","ENGLISH_PARTS","ORAL_PARTS","STATION_PARTS","STATION_ROUTE"].forEach(function(g){ok(!(g in window),"la parte suelta "+g+" debe reunirse y borrarse")});
    ok(ENGLISH.pruebas.length===4&&ENGLISH.mcq.length===32,"banco de ingles cargado desde data/english/");
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
      ok(/Couldn't save/.test(byId("toast").textContent),"falta el aviso: "+byId("toast").textContent);
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
    ok(/best test/.test(byId("detailStats").textContent),"no se muestra el mejor test: "+byId("detailStats").textContent);
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
  T("6 todas las preguntas orales puntuan >=9.5 contra su propia referencia",function(){
    var bad=ORAL_VOICE_BANK.map(function(q){return{id:q.id,s:evaluateLocally(q,q.reference).score}}).filter(function(r){return r.s<9.5});
    eq(bad.length,0,"preguntas bajo 9.5: "+JSON.stringify(bad));
  });
  T("6 una respuesta sin relacion puntua bajo en todas las preguntas orales",function(){
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
    var cases=[[9.6,"Very high coverage","good"],[8,"High coverage","good"],[6.5,"Medium coverage","mid"],[4.5,"Partial coverage","mid"],[2,"Low coverage","low"]];
    cases.forEach(function(c){
      showOralEvaluation({score:c[0],detected:["a"],missing:["b"],errors:["c"]},"texto");
      eq(byId("oralGrade").textContent,c[1],"etiqueta para "+c[0]);
      ok(byId("oralGrade").classList.contains(c[2]),"clase de color para "+c[0]);
    });
    eq(document.querySelector(".oral-result-label").textContent,"ESTIMATE","etiqueta sobre el puntaje");
    ok(/doesn't replace your own judgment/.test(document.querySelector(".oral-score-note").textContent),"falta la nota aclaratoria");
    ok(byId("oralFeedback").querySelector(".oral-feedback-title.ok")&&byId("oralFeedback").querySelector(".oral-feedback-title.warn")&&byId("oralFeedback").querySelector(".oral-feedback-title.bad"),"faltan los titulos con color");
  });

  T("6 REG-03 el error critico respeta el orden: 'MAYDAY es mas grave que PAN PAN' no se penaliza, la afirmacion invertida si",function(){
    var q=oral("ov_pan_mayday");
    var r=evaluateLocally(q,"El MAYDAY es más grave que el PAN PAN: MAYDAY es socorro con peligro grave e inminente y PAN PAN es urgencia. En el MAYDAY se dice tres veces, la naturaleza de la emergencia, intenciones, posición, nivel, rumbo, personas a bordo y combustible remanente.");
    eq(r.errors.length,0,"una respuesta correcta se penalizo: "+JSON.stringify(r.errors));
    ok(r.score>=8.5,"puntaje "+r.score);
    eq(evaluateLocally(q,"PAN PAN es menos grave que MAYDAY, porque es urgencia y MAYDAY es socorro").errors.length,0,"'PAN PAN es menos grave que MAYDAY' es correcto");
    ok(evaluateLocally(q,"PAN PAN es más grave que MAYDAY").errors.length===1,"la afirmacion invertida debe penalizarse");
    ok(evaluateLocally(q,"Mayday es menos grave que pan pan").errors.length===1,"'MAYDAY es menos grave' debe penalizarse");
  });
  T("6 REG-03 una negacion dentro del error critico lo anula: 'el flex no esta permitido en pista contaminada'",function(){
    var q=oral("ov_flex_derate_contam");
    ["El flex no está permitido en pista contaminada, pero el derated sí está permitido.",
     "En pista contaminada no se puede usar flex y el derated no está prohibido en pista contaminada.",
     "No se puede usar flex en pista contaminada porque la norma no lo permite; el derated en cambio sí."].forEach(function(a){
      eq(evaluateLocally(q,a).errors.length,0,"se penalizo una respuesta correcta: "+a);
    });
    ok(evaluateLocally(q,"El flex está permitido en pista contaminada, no hay ningún problema.").errors.length===1,"la afirmacion equivocada debe penalizarse");
    eq(criticalItemDetected(normalizeAeroText("no digo nada al comandante").split(" "),{accepted:["no digo nada"]}),true,"un termino que ya es una negacion sigue funcionando");
  });
  T("6 REG-04 un concepto se reconoce aunque sus palabras ya hayan aparecido antes, y una negacion previa no anula la mencion afirmativa",function(){
    eq(det("el flex no esta permitido en pista contaminada y el derated si esta permitido",{accepted:["derated esta permitido"]}),true,"'derated si esta permitido' tras 'flex no esta permitido'");
    eq(det("nunca hay que bajar de green dot; si hay montanas uso drift down a green dot",{accepted:["green dot"]}),true,"mencion afirmativa posterior de green dot");
    eq(det("nunca hay que bajar de green dot",{accepted:["green dot"]}),false,"la unica mencion esta negada");
    eq(det("mayday mayday",{accepted:["mayday mayday mayday"]}),false,"repeticiones: sigue exigiendo tres");
  });
  T("6 REG-04 la busqueda complementaria de conceptos solo suma detecciones (nunca quita las de la busqueda original)",function(){
    var lost=[];
    var corpus=ORAL_VOICE_BANK.map(function(x){return x.reference}).concat(["No se, algo relacionado con el motor tal vez.","No es una corriente ascendente, es una corriente descendente intensa y localizada."]);
    ORAL_VOICE_BANK.forEach(function(Q){(Q.concepts||[]).forEach(function(c){corpus.forEach(function(txt){
      var s=normalizeAeroText(txt),tk=s.split(" ").filter(Boolean);
      var before=(c.accepted||[]).some(function(term){return phraseFuzzyMatch(tk,s,term)&&!negatedBeforeMatch(tk,s,term)});
      if(before&&!itemDetected(tk,s,c))lost.push(Q.id+" / "+c.label);
    })})});
    eq(lost.length,0,"detecciones perdidas: "+JSON.stringify(lost.slice(0,5)));
  });
  T("6 REG-05 ov_elec_arch no penaliza decir que las baterias estan desconectadas en operacion normal (el manual lo dice asi), y si penaliza que solo se conectan si fallan los generadores",function(){
    var q=oral("ov_elec_arch");
    var r=evaluateLocally(q,q.reference+" En operación normal las baterías están desconectadas del DC BAT BUS la mayor parte del tiempo: el BCL las conecta solo para cargarlas. Las baterias estan desconectadas en operacion normal.");
    eq(r.errors.length,0,"se penalizo una frase correcta: "+JSON.stringify(r.errors));
    ok(evaluateLocally(q,"Las baterías solo se conectan si fallan los generadores.").errors.length===1,"el error de verdad debe seguir penalizado");
    ok(!/compartir la alimentaci/.test(q.reference),"la referencia no debe sugerir generadores en paralelo");
  });
  T("6 REG-06 ninguna pregunta oral cita un manual en lo que se ve (pregunta, referencia, resumen, conceptos y avisos)",function(){
    var CITA=/(fuera del|que da el|seg[uú]n el|explica el|dice el|lo dice el|que el) (FCOM|FCTM|manual)|\bFCTM\b|Getting to Grips|Tutorial|\bAFM\b|\bPDF\b|§|en prosa/i;
    var bad=[];
    ORAL_VOICE_BANK.forEach(function(q){
      var visible=[q.question,q.reference,q.short||""].concat((q.concepts||[]).map(function(c){return c.label}),(q.steps||[]).map(function(c){return c.label||c.concept||""}),(q.criticalErrors||[]).map(function(e){return e.feedback}));
      visible.forEach(function(s){if(CITA.test(String(s)))bad.push(q.id+": "+String(s).match(CITA)[0])});
    });
    eq(bad.length,0,"orales que citan un manual: "+bad.slice(0,6).join(" | "));
    ok(/EDTO/.test(oral("ov_etops").reference),"ETOPS dice su nombre en la norma OACI (EDTO)");
    var c=oral("ov_v1_continue").reference;ok(/no es obligatorio/.test(c)&&/nunca bajo la velocidad F/.test(c),"despues de V1: con FLEX el TOGA no es obligatorio y con derated nunca bajo F");
  });
  T("6 entrevista oral, performance y operacion: las 9 preguntas nuevas reconocen respuestas correctas dichas con otras palabras",function(){
    [["ov_mac_envelope","Es la posición del CG expresada en porcentaje de la cuerda media aerodinámica. La envolvente define los límites del CG según el peso: si está muy adelante cuesta rotar, si está muy atrás pierde estabilidad. El A320 tiene CG básico, T1, y extended forward. La escala del volante de trim va más o menos de 15 a 41 por ciento. Se carga el ZFWCG en el FMS y con eso se pone el trim.",7.5],
     ["ov_weights","Primero está el peso de fábrica, el manufacturer empty weight, que es la estructura, motores y sistemas. Después el peso vacío operativo que suma los ítems del operador. El DOW es el avión listo para volar sin combustible utilizable ni carga paga. El ZFW es el DOW más la carga paga. Luego con el combustible está el peso de despegue y el de aterrizaje, y cada uno tiene su máximo: MZFW, MTOW, MLW.",7.5],
     ["ov_cost_index","Es un número que pone la compañía por ruta para minimizar el costo total del vuelo, equilibrando tiempo y combustible. Con CI 0 vuelas a máximo alcance; con el máximo vas a máxima velocidad.",6.5],
     ["ov_fuel_dan121","Taxi, trip, contingencia, alternativa y reserva final de 30 minutos, más el adicional si hace falta por falla de motor o despresurización. En vuelo se declara combustible mínimo y si vas a aterrizar bajo la reserva final, mayday combustible.",7.5],
     ["ov_contaminated_rwy","Cuando una parte significativa de la pista en uso tiene contaminante de más de tres milímetros, agua o nieve, o hielo. Si es menos es pista mojada. Afecta el frenado y la aceleración y en el despegue el screen height es 15 pies.",7.5],
     ["ov_flex_derate_contam","En pista contaminada el flex no está permitido, porque es una temperatura asumida calculada desde TOGA. El derated sí está permitido porque es un rating certificado con su propia performance para pista contaminada. Además baja la VMCG, entonces la V1 es menor y mejora la distancia de aceleración parada. Con derated no se puede poner TOGA hasta la velocidad F, y no se combinan.",8.5],
     ["ov_appr_ldg_climb","Approach climb: un motor fallado, tren retraído, 2.1 por ciento. Landing climb: los dos motores operando, tren extendido, flaps full, 3.2 por ciento, con el empuje disponible a los 8 segundos.",7.5],
     ["ov_improve_takeoff","Cambiando la configuración, sacando los packs, usando TOGA, buscando una pista con viento de frente o esperando a que baje la temperatura.",6.5],
     ["ov_eng_fail_cruise","Nunca hay que bajar de green dot. MCT, autothrust off, rumbo, y descenso en open des. Si no hay obstáculos uso la estrategia estándar a 300 nudos; si hay montañas uso drift down a green dot. La trayectoria neta tiene que pasar 2000 pies sobre el terreno.",6.5]
    ].forEach(function(c){
      var r=evaluateLocally(oral(c[0]),c[1]);
      ok(r.score>=c[2],c[0]+": puntaje "+r.score+" (minimo "+c[2]+"), faltan "+JSON.stringify(r.missing));
      eq(r.errors.length,0,c[0]+": se penalizo una respuesta correcta: "+JSON.stringify(r.errors));
    });
    ok(evaluateLocally(oral("ov_cost_index"),"El cost index es el fuel flow del avión, cuántos kilos por minuto consume.").errors.length===1,"el cost index confundido con fuel flow debe penalizarse");
  });
  T("6 entrevista oral, performance y operacion: fuentes internas en cada pregunta nueva y ningun texto visible cita un manual",function(){
    var ids=["ov_mac_envelope","ov_weights","ov_cost_index","ov_fuel_dan121","ov_contaminated_rwy","ov_flex_derate_contam","ov_appr_ldg_climb","ov_improve_takeoff","ov_eng_fail_cruise"];
    ids.forEach(function(id){
      var q=oral(id);
      ok(Array.isArray(q.refs)&&q.refs.length>=5&&q.refs.every(function(r){return r&&typeof r.src==="string"&&/\(PDF \d+/.test(r.src)&&typeof r.cite==="string"&&r.cite.trim()}),id+": refs incompletas");
      var visible=[q.question,q.reference].concat((q.concepts||[]).map(function(c){return c.label}),(q.criticalErrors||[]).map(function(e){return e.feedback}));
      visible.forEach(function(s){ok(!enSourceRef(s)&&!/Getting to Grips|Tutorials|\bAFM\b/i.test(s),id+": texto visible con cita: "+s)});
    });
    reset();
    startOralVoice();
    var seen=0;
    for(var i=0;i<oralState.pool.length;i++){
      oralState.index=i;loadOralVoiceQuestion();
      if(ids.indexOf(oralVoiceQuestion().id)===-1)continue;
      seen++;
      var cur=oralVoiceQuestion();
      /* lo que se ve: la pregunta y, tras responder, conceptos, avisos y la respuesta de referencia
         (el area de resultado conserva la referencia de otra pregunta hasta que se evalua, por eso se evalua aqui) */
      showOralEvaluation(evaluateLocally(cur,"Respuesta parcial: el flex esta permitido en pista contaminada y el cost index es el fuel flow."),"x");
      var txt=byId("oralQuestion").textContent+" "+byId("oralFeedback").textContent;
      var fbText=byId("oralFeedback").textContent;
      cur.reference.split("\n").map(function(l){return l.replace(/^\s*(-|\d+\.)\s+/,"").trim()}).filter(Boolean).forEach(function(l){ok(fbText.indexOf(l)!==-1,"no se muestra la referencia de "+cur.id+": "+l.slice(0,60))});
      ok(!/\bFCOM\b|\bFCTM\b|\bPDF\b|Getting to Grips|Tutorials/.test(txt),"la pantalla oral muestra una fuente en "+cur.id);
    }
    eq(seen,9,"preguntas nuevas recorridas en la entrevista oral");
    stopEverythingOral();
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
    ok(/Test 1/.test(byId("enHubBody").textContent)&&/PICKED AT RANDOM/.test(byId("enHubBody").textContent),"el menu debe decir cual te toco: "+byId("enHubBody").textContent.slice(0,120));
    ok(/8 multiple choice, 4 audio clips, 2 pictures and 1 role-play, randomly mixed/.test(byId("enHubBody").textContent),"el menu describe la tanda: "+byId("enHubBody").textContent);
    eq(document.querySelectorAll("#enHubBody li").length,0,"no hay lista de partes: es una sola tanda");
    ok(!/Parte|parte/.test(byId("enHubBody").textContent),"no debe hablar de partes");
    ok(/Start test/.test(byId("enHubBody").textContent),"boton de comenzar");
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
    ok(/Test 1 complete/.test(byId("enHubBody").textContent),"aviso de prueba completada: "+byId("enHubBody").textContent.slice(0,140));
    withRandom([0],function(){openEnglish()});
    ok(!/Test 1 complete/.test(byId("enHubBody").textContent),"el aviso solo se ve al terminar la prueba, no en las entradas siguientes");
    eq(appState.englishTests.current.n,4,"y volver a entrar no cambia la prueba asignada");
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.done.join(),"1,4");eq(appState.englishTests.current.n,2);
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.current.n,3,"queda una sola");
    withRandom([0],function(){enFinishTest()});
    eq(appState.englishTests.done.length,4);eq(appState.englishTests.current,null,"ya no hay pendientes");
    ok(/You completed all 4 tests/.test(byId("enHubBody").textContent)&&/Start another round/.test(byId("enHubBody").textContent),"aviso de vuelta completa");
    eq(document.querySelector("#enHubBody .en-test-go").getAttribute("onclick"),"enStartNewRound()");
    eq(appState.englishTests.last,3);
    withRandom([0],function(){enStartNewRound()});
    eq(appState.englishTests.done.length,0,"la vuelta nueva empieza de cero");eq(appState.englishTests.cycle,1);
    ok(appState.englishTests.current&&appState.englishTests.current.n!==3,"la primera de la vuelta nueva no repite la ultima que hiciste");
    ok(enValidOrder(enTestByN(appState.englishTests.current.n),appState.englishTests.current.order),"y con orden nuevo");
    ok(/round 2/.test(byId("enHubBody").textContent),"el menu indica la vuelta: "+byId("enHubBody").textContent.slice(0,80));
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
      ok(new RegExp("^TEST "+n+" · "+(s.pos+1)+" / 15$").test(byId("epMeta").textContent),"encabezado: "+byId("epMeta").textContent);
      eq(byId("epNextBtn").disabled,true,"no se puede avanzar sin contestar o revelar");
      ok(!byId("epPrevBtn"),"no hay boton Anterior: la prueba avanza siempre hacia adelante");
      if(s.kind==="mcq"){answerMcq(mcqDone<5);mcqDone++}
      else byId("epRevealBtn").click();
      eq(byId("epNextBtn").disabled,false,"tras contestar o revelar se puede avanzar");
      eq(byId("epNextBtn").textContent,(s.pos===14&&s.index===s.items.length-1)?"Finish test":"Next");
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
    ok(new RegExp("Test "+n+" complete · multiple choice: 5 of 8 correct").test(byId("enHubBody").textContent),"aviso: "+byId("enHubBody").textContent.slice(0,160));
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
    ok(/IN PROGRESS/.test(byId("enHubBody").textContent)&&/You're on exercise 6 of 15/.test(byId("enHubBody").textContent)&&/Continue test/.test(byId("enHubBody").textContent),"menu: "+byId("enHubBody").textContent);
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
    ok(/MULTIPLE CHOICE/.test(byId("epTag").textContent),byId("epTag").textContent);
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
    ok(byId("epReveal").querySelector(".feedback-head.bad")&&/Correct answer/.test(byId("epReveal").textContent),"muestra la respuesta correcta");
    eq(document.querySelectorAll("#epWork .option.wrong").length,0);
    eq(document.querySelectorAll("#epWork .option.correct").length,1);
    byId("epNextBtn").click();
    eq(appState.englishTests.current.mcq.c,0);eq(appState.englishTests.current.mcq.t,1);
    /* acertar */
    reset();
    enOpenUnit(1,["q:en_q_01"]);
    answerMcq(true);
    ok(byId("epReveal").querySelector(".feedback-head.ok")&&/Correct/.test(byId("epReveal").textContent));
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
    ok(/Model description/i.test(byId("epReveal").textContent),"falta la descripcion modelo");
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
    ok(/^TEST 1 · 1 \/ 15$/.test(byId("epMeta").textContent),byId("epMeta").textContent);
    /* turno 1: el piloto abre, sin audio */
    ok(/ROLE-PLAY · TURN 1 OF 3/.test(byId("epTag").textContent),byId("epTag").textContent);
    ok(byId("epStimulus").textContent.indexOf(rp.scenario)>=0,"la situacion debe verse");
    ok(!byId("enPlayBtn"),"el primer turno no tiene audio");
    ok(byId("enTranscript"),"hay donde responder");
    ok(!/So far/.test(byId("epStimulus").textContent),"el primer turno no tiene historia");
    byId("epRevealBtn").click();
    ok(/Mayday, mayday, mayday, Walden Tower, Fastair three four five, engine failure/.test(byId("epReveal").textContent),"modelo del turno 1");
    ok(!byId("epReveal").querySelector(".citation")&&!/Referencia/.test(byId("epReveal").textContent),"el role-play no muestra citas");
    ok(byId("epReveal").querySelectorAll(".en-check label").length>=4,"lista para compararte");
    ok(byId("epReveal").querySelectorAll(".en-chip").length>=3,"vocabulario");
    ok(/ATC turns are for practice/.test(byId("epReveal").textContent),"se avisa que los turnos de ATC son de practica");
    eq(byId("epNextBtn").textContent,"Next");
    byId("epNextBtn").click();
    /* turno 2: ATC habla (audio con el texto oculto) y aparece lo que ya paso; sigue siendo el mismo ejercicio de la prueba */
    ok(/TURN 2 OF 3/.test(byId("epTag").textContent));
    ok(/^TEST 1 · 1 \/ 15$/.test(byId("epMeta").textContent),"el turno no cuenta como otro ejercicio");
    ok(byId("enPlayBtn"),"el segundo turno tiene audio");
    ok(byId("enHeardText").classList.contains("hidden"),"el texto de lo que escuchas empieza oculto");
    ok(byId("epStimulus").textContent.indexOf(rp.scenario)>=0,"la situacion sigue a la vista");
    ok(/So far/.test(byId("epStimulus").textContent)&&/You:.*Mayday, mayday, mayday/.test(byId("epStimulus").textContent),"historia del turno 1: "+byId("epStimulus").textContent.slice(-220));
    enToggleHeard();ok(!byId("enHeardText").classList.contains("hidden"));
    ok(/roger Mayday/.test(byId("enHeardText").textContent));
    byId("epRevealBtn").click();byId("epNextBtn").click();
    /* turno 3: la historia trae los dos turnos anteriores */
    eq(byId("epStimulus").querySelectorAll(".en-tr").length,3,"turno 1 (tu respuesta), turno 2 (ATC y tu respuesta)");
    ok(/persons on board and endurance/.test(byId("enHeardText").textContent));
    byId("epRevealBtn").click();
    eq(byId("epNextBtn").textContent,"Next","el role-play no es el ultimo ejercicio");
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
    ok(/You didn't write anything/.test(byId("epReveal").textContent)&&document.querySelectorAll("#epReveal .en-key.ok").length===0,"sin apuntes no se marca nada");
    retryEnglish();
    notes=byId("enNotes");
    notes.value="RWY 27 QNH 1018 ILS";enTextChanged(notes.value);
    byId("epRevealBtn").click();
    eq(document.querySelectorAll("#epReveal .en-key").length,ENGLISH.listening[0].keys.length,"una fila por dato clave");
    eq(document.querySelectorAll("#epReveal .en-key.ok").length,3,"pista, ILS y QNH");
    ok(/Transcript/.test(byId("epReveal").textContent)&&/Georgetown information Bravo/.test(byId("epReveal").textContent),"transcripcion");
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
    ok(/4 tests at random/.test(byId("homeEnglishCount").textContent),byId("homeEnglishCount").textContent);
    ok(!/done/.test(byId("homeEnglishCount").textContent));
    enOpenUnit(1,[]);enFinishTest();renderHome();
    ok(/1 of 4 done/.test(byId("homeEnglishCount").textContent),byId("homeEnglishCount").textContent);
    ok(/32 ICAO English \(multiple choice across 4 tests\)/.test(byId("appMeta").textContent),byId("appMeta").textContent);
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

  /* ---------- 11. Need to know (seccion destacada, 2026-10-01) ---------- */
  var NTK_NEW_IDS=["ov_cg_effects","ov_flex_derate_def","ov_balanced_unbalanced","ov_improved_climb","ov_takeoff_segments","ov_tailwind_takeoff","ov_vmc_cg_weight","ov_limit_speeds","ov_green_dot","ov_srs","ov_gs_mini","ov_coffin_corner","ov_fmgs_functions","ov_fc_laws","ov_dual_ra_direct","ov_rvsm_equipment","ov_ecam_priorities","ov_ecam_handling","ov_ecam_after","ov_emergency_atc","ov_golden_rules"];
  var NTK_CITE_RE=/\bFCOM\b|\bFCTM\b|\bPDF\b|Getting to Grips|Tutorials|\bAFM\b|§|\bAIP\b|seg[uú]n el manual|del manual/i;
  /* Revisar FCOM "si hay tiempo" es un paso del procedimiento ECAM, no una cita: se permite solo ahi. */
  function ntkVisibleTexts(q){
    var t=[q.question,q.short||"",q.reference].concat((q.concepts||[]).map(function(c){return c.label}),(q.steps||[]).map(function(s){return s.concept}),(q.criticalErrors||[]).map(function(e){return e.feedback}));
    if(q.id==="ov_ecam_priorities"||q.id==="ov_ecam_after")t=t.map(function(s){return s.replace(/\bFCOM\b/g,"")});
    return t;
  }
  function visible(el){return !!el&&el.getClientRects().length>0}
  T("11 Need to know: 31 preguntas base que existen, con idea corta, respuesta en parrafos o listas y sin citas visibles",function(){
    eq(ntkDefaults().length,31,"preguntas base");
    eq(ORAL_VOICE_BANK.length,53,"preguntas orales");
    ntkDefaults().forEach(function(r){
      var it=ntkResolve(r);ok(it&&it.kind==="oral",r+": no resuelve a una pregunta oral");
      var q=it.q;
      ok(typeof q.short==="string"&&q.short.length>40,q.id+": falta la idea corta");
      ok(/\n/.test(q.reference),q.id+": la respuesta no esta separada en parrafos o listas");
      var h=formatRefHtml(q.reference);
      ok(/<p>|<li>/.test(h),q.id+": formatRefHtml no armo parrafos ni listas");
      var box=document.createElement("div");box.innerHTML=h;
      Array.prototype.forEach.call(box.querySelectorAll("p,li"),function(n){ok(!/^\s*(-|\d+\.)\s/.test(n.textContent),q.id+": queda una marca de lista suelta: "+n.textContent.slice(0,40))});
      ntkVisibleTexts(q).forEach(function(s){ok(!NTK_CITE_RE.test(s),q.id+": texto visible que cita una fuente: "+s.slice(0,90))});
      ok(!/altura de pantalla/i.test(q.reference+q.short),q.id+": usa un termino prohibido");
    });
    NTK_NEW_IDS.forEach(function(id){
      var q=oral(id);
      ok(Array.isArray(q.refs)&&q.refs.length>=5&&q.refs.every(function(r){return r&&/\(PDF \d+/.test(r.src)&&typeof r.cite==="string"&&r.cite.trim()}),id+": fuentes internas incompletas");
    });
  });
  T("11 Need to know: el estado se sanea, viaja en el respaldo y un tipo invalido rechaza el respaldo",function(){
    reset();
    eq(JSON.stringify(defaultState().needToKnow),JSON.stringify({added:[],removed:[]}),"estado inicial");
    var s=sanitizeState({needToKnow:{added:["o:ov_srs","ref con espacios","q:hydraulic:abc1",5,"o:ov_srs"],removed:"x"}}).needToKnow;
    eq(JSON.stringify(s),JSON.stringify({added:["o:ov_srs","q:hydraulic:abc1"],removed:[]}),"saneo de referencias");
    eq(JSON.stringify(sanitizeState({}).needToKnow),JSON.stringify({added:[],removed:[]}),"un respaldo antiguo sin el campo");
    eq(looksLikeValidBackup({needToKnow:[]}),false,"un arreglo en lugar de objeto debe rechazarse");
    eq(looksLikeValidBackup({needToKnow:{added:[],removed:[]}}),true,"un objeto valido se acepta");
    appState.needToKnow={added:["o:ov_srs"],removed:["o:ov_green_dot"]};
    var back=roundTrip(appState).needToKnow;
    eq(JSON.stringify(back),JSON.stringify({added:["o:ov_srs"],removed:["o:ov_green_dot"]}),"ida y vuelta por JSON");
  });
  T("11 Need to know: agregar, quitar y restaurar combinan la lista base con los cambios del usuario",function(){
    reset();
    eq(ntkRefs().length,31,"lista inicial");
    ntkRemove("o:ov_srs");
    ok(!ntkHas("o:ov_srs"),"quitar una pregunta base");eq(ntkRefs().length,30);
    var q=fcomQ(0),ref="q:"+q._id;
    ntkAdd(ref);
    ok(ntkHas(ref),"agregar una pregunta de alternativas");eq(ntkRefs()[ntkRefs().length-1],ref,"las agregadas van al final");
    var saved=JSON.parse(localStorage.getItem(KEY)).needToKnow;
    ok(saved.added.indexOf(ref)!==-1&&saved.removed.indexOf("o:ov_srs")!==-1,"los cambios se guardan: "+JSON.stringify(saved));
    appState.needToKnow.added.push("o:no_existe");
    ok(ntkRefs().indexOf("o:no_existe")===-1,"una referencia que ya no existe se ignora");
    openNeedToKnow();
    var labels=Array.prototype.map.call(document.querySelectorAll("#ntkBody .section-label"),function(e){return e.textContent});
    ok(labels.indexOf("Takeoff")!==-1&&labels.indexOf("Added by you")!==-1,"grupos de la lista: "+labels.join(" | "));
    ok(visible(byId("ntkRestoreBtn")),"con una pregunta base quitada se ofrece restaurar");
    byId("ntkRestoreBtn").click();
    ok(ntkHas("o:ov_srs"),"restaurar vuelve a poner las preguntas base");
    ok(!visible(byId("ntkRestoreBtn")),"sin preguntas base quitadas no se ofrece restaurar");
    ok(ntkHas(ref),"restaurar no borra las que agrego el usuario");
    var rm=document.querySelector('#ntkBody .ntk-remove[data-ref="'+ref+'"]');ok(rm,"falta el boton Quitar");
    rm.click();
    ok(!ntkHas(ref),"Quitar desde la lista");
    ok(!document.querySelector('#ntkBody .ntk-open[data-ref="'+ref+'"]'),"la pregunta quitada sigue en la lista");
  });
  T("11 el boton + Need to know aparece en alternativas, autoevaluacion y entrevista oral, y agrega o quita",function(){
    reset();
    var q=fcomQ(0),ref="q:"+q._id;
    startSingle(q._id);
    var b=byId("ntkQuizBtn");
    ok(visible(b),"no se ve el boton en alternativas");eq(b.textContent,"+ Need to know");
    b.click();
    ok(ntkHas(ref),"no se agrego desde alternativas");eq(b.getAttribute("aria-pressed"),"true");ok(/★/.test(b.textContent),"el boton no muestra que ya esta: "+b.textContent);
    b.click();
    ok(!ntkHas(ref),"no se quito desde alternativas");
    reset();
    startInterview(null);
    var bi=byId("ntkInterviewBtn"),iq=iQuestion();
    ok(visible(bi),"no se ve el boton en autoevaluacion");eq(bi.dataset.ref,"q:"+iq._id,"referencia de la autoevaluacion");
    bi.click();ok(ntkHas("q:"+iq._id),"no se agrego desde autoevaluacion");
    reset();
    startOralVoice();
    var bo=byId("ntkOralBtn"),cur=oralVoiceQuestion(),was=ntkHas("o:"+cur.id);
    ok(visible(bo),"no se ve el boton en entrevista oral");
    eq(bo.textContent,was?"★ Need to know":"+ Need to know","estado inicial del boton oral");
    bo.click();eq(ntkHas("o:"+cur.id),!was,"el boton oral no alterno");
    stopEverythingOral();
  });
  T("11 tarjeta oral de Need to know: pregunta, microfono en la tarjeta, evaluacion guardada, respuesta con idea y explicacion; al salir el microfono vuelve",function(){
    reset();
    openNeedToKnow();
    ntkStart("o:ov_green_dot");
    ok(visibleScreens().indexOf("ntkCard")!==-1,"no se abrio la tarjeta");
    var q=oral("ov_green_dot");
    eq(byId("ntkQuestion").textContent,q.question,"pregunta de la tarjeta");
    ok(byId("ntkOralSlot").contains(byId("oralMicBtn")),"el microfono no esta en la tarjeta");
    ok(!visible(byId("ntkReveal")),"la respuesta no debe verse antes de pedirla");
    byId("ntkRevealBtn").click();
    var rv=byId("ntkReveal");
    ok(visible(rv),"no se muestra la respuesta");
    ok(rv.textContent.indexOf(q.short)!==-1&&/Explanation/.test(rv.textContent)&&rv.querySelector("li"),"la respuesta no trae idea corta, explicacion y lista");
    ok(!NTK_CITE_RE.test(rv.textContent),"la respuesta muestra una fuente");
    showOralTextFallback();
    byId("oralTextFallbackInput").value="Es la velocidad de máxima fineza en configuración limpia con un motor fallado; se usa en el drift down con la obstacle strategy.";
    submitOralTextFallback();
    ok(appState.oralVoice.ov_green_dot&&appState.oralVoice.ov_green_dot.score>0,"la evaluacion no se guardo");
    ok(visible(byId("oralResult")),"no se ve el resultado de la evaluacion");
    var refs=ntkRefs(),i=refs.indexOf("o:ov_green_dot");
    ntkNext();eq(byId("ntkQuestion").textContent,ntkResolve(refs[i+1]).q.question,"Siguiente");
    ok(!visible(byId("oralResult")),"el resultado anterior sigue visible en la pregunta nueva");
    ntkPrev();eq(byId("ntkQuestion").textContent,q.question,"Anterior");
    ntkExitCard();
    ok(visibleScreens().indexOf("ntk")!==-1,"no volvio a la lista");
    ok(byId("oralVoice").contains(byId("oralMicBtn")),"el microfono no volvio a Entrevista oral");
    ok(/last time/.test(document.querySelector('#ntkBody .ntk-open[data-ref="o:ov_green_dot"]').textContent),"la lista no muestra el ultimo puntaje");
    startOralVoice();
    ok(byId("oralVoice").contains(byId("oralMicBtn")),"Entrevista oral sin microfono");
    stopEverythingOral();
  });
  T("11 una pregunta de alternativas en Need to know se practica con sus alternativas, sin citas ni insignias",function(){
    reset();
    var q=rawPool(null)[0],ref="q:"+q._id;
    ntkAdd(ref);
    openNeedToKnow();ntkStart(ref);
    var opts=document.querySelectorAll("#ntkMcq .option");
    eq(opts.length,q.options.length,"alternativas");
    ok(!visible(byId("ntkRevealBtn")),"una pregunta de alternativas no usa Ver respuesta");
    ok(!byId("ntkOralSlot").contains(byId("oralMicBtn")),"una pregunta de alternativas no usa el microfono");
    var right=Array.prototype.filter.call(opts,function(o){return o.querySelector(".otxt").textContent===correctText(q)})[0];
    ok(right,"no encontre la alternativa correcta");
    right.click();
    var fb=byId("ntkMcq").textContent;
    ok(/Correct/.test(fb),"no se marca como correcta");
    ok(!/\bFCOM\b|VERIFICADO|Airbus Tutorials/i.test(fb)&&!byId("ntkMcq").querySelector("blockquote,.citation,.verified-line"),"la explicacion muestra citas o insignias");
    eq(appState.stats[q._id].a,1,"el intento no se registro");
  });
  T("11 la tarjeta Need to know va primero en el inicio, destaca y cuenta las preguntas",function(){
    reset();renderHome();
    var card=byId("ntkHomeCard");ok(visible(card),"no se ve la tarjeta");
    ok(document.querySelector("#home .home-section").contains(card),"no es la primera seccion del inicio");
    ok(/linear-gradient/.test(getComputedStyle(card).backgroundImage),"la tarjeta no tiene su color propio");
    ok(/31 key questions/.test(byId("homeNtkCount").textContent),"conteo: "+byId("homeNtkCount").textContent);
    appState.oralVoice.ov_srs={score:8,attempts:1,last:Date.now()};renderHome();
    ok(/1 practiced/.test(byId("homeNtkCount").textContent),"no cuenta las practicadas: "+byId("homeNtkCount").textContent);
    card.click();
    ok(visibleScreens().indexOf("ntk")!==-1,"la tarjeta no abre la seccion");
  });
  T("11 las preguntas nuevas de Need to know reconocen respuestas correctas dichas con otras palabras, y el orden del ECAM cuenta",function(){
    [["ov_cg_effects","Con el CG adelantado el avión es más estable pero cuesta rotar, la rotación es lenta y se penaliza la performance porque necesitas más pista. Con el CG atrasado el avión es menos estable, puede rotar solo antes de VR y hay riesgo de tail strike; hay que corregir sin sobrerreaccionar.",8],
     ["ov_flex_derate_def","El flex es un despegue con empuje reducido usando una temperatura asumida, parte del empuje máximo y puedes poner TOGA en cualquier momento; solo en pista seca o mojada. El derated es un rating de empuje certificado más bajo, D04 o D08, que baja la VMCG y la VMCA, por eso sirve en pistas cortas o contaminadas, y no se pone TOGA antes de la velocidad F.",8],
     ["ov_balanced_unbalanced","Es un concepto para elegir la V1. En la pista balanceada la V1 hace que la ASD sea igual a la TOD, o sea la distancia para parar es igual a la distancia para despegar con un motor fallado. En la descompensada la ASD y la TOD son distintas: usando stopway o clearway, o si sobra pista, se sube o se baja la V1 para ganar peso.",7],
     ["ov_improved_climb","Es subir la V2 y las velocidades de despegue usando la pista que sobra, para tener mejor gradiente en el segundo segmento y librar obstáculos. Conviene cuando estás limitado por ascenso y tienes pista larga. El límite son los frenos y la velocidad de los neumáticos, 195 nudos.",7],
     ["ov_takeoff_segments","El primer segmento va desde el despegue hasta que el tren está arriba, con gradiente positivo. El segundo segmento va del tren arriba hasta la altitud de aceleración, mínimo 400 pies, a V2, y exige 2,4 por ciento en bimotor; es el más limitante. El tercer segmento es de aceleración retrayendo flaps, con TOGA máximo 10 minutos, y el segmento final es limpio, a green dot, con MCT hasta 1500 pies, con 1,2 por ciento.",8.5],
     ["ov_tailwind_takeoff","Con viento de cola se ponen las palancas a 50 por ciento de N1, sidestick todo adelante, se sueltan frenos y se lleva el empuje rápido a 70 por ciento y luego progresivamente hasta el empuje de despegue a 40 nudos de velocidad sobre el suelo. El sidestick se mantiene hasta 80 kt y neutro a 100 kt. Máximo 15 kt de viento de cola.",7.5],
     ["ov_vmc_cg_weight","Si falla el motor crítico con el otro a empuje máximo, la VMCG y la VMCA son las velocidades mínimas para controlar con el rudder. Con el CG atrasado el brazo del rudder es más corto y suben, y con peso liviano también suben porque el bank de 5 grados ayuda menos. El peor caso es CG atrasado y peso liviano.",6.5],
     ["ov_limit_speeds","VMO 350 nudos y MMO 0.82, la VFE de cada configuración de flaps, por ejemplo 230 en CONF 1 y 177 en FULL, la VLE 280 con el tren abajo, la VLO 250 para extender y 220 para retraer, y las mínimas de control VMCG, VMCA y VMCL.",7.5],
     ["ov_green_dot","Es la velocidad de mejor sustentación resistencia, máxima fineza, en configuración limpia, y la velocidad de operación con un motor fallado. Se usa en el segmento final del despegue con MCT y en el drift down con la estrategia obstacle. En la estándar se baja a 0.78 o 300 nudos.",6.5],
     ["ov_srs","Es el speed reference system, el modo vertical managed de despegue y go around que controla la velocidad con el pitch. En tierra busca V2 y en el aire V2 más 10 kt; si falla un motor mantiene la velocidad que tenía entre V2 y V2 más 15 kt.",7],
     ["ov_gs_mini","Funciona en aproximación con velocidad managed: aprovecha la inercia del avión para mantener una energía mínima, la de tocar la pista a VAPP con el viento de la torre. Si aumenta el viento de frente, sube la velocidad objetivo, nunca baja de VAPP.",8],
     ["ov_coffin_corner","En el coffin corner se juntan el buffet de baja velocidad, la pérdida, y el high speed buffet. El límite de arriba es el MMO, 0.82. El Mach crítico es donde aparecen las primeras ondas de choque y no es un límite, se vuela por encima. Si pasas el MMO suena el overspeed y actúa la high speed protection con orden de nariz arriba.",7.5],
     ["ov_fmgs_functions","El flight management hace la navegación y la posición, el plan de vuelo y la performance con el cost index. El flight guidance maneja el autopilot, el flight director y el autothrust. El flight augmentation, el FAC, hace el yaw damper, el rudder trim, la flight envelope con las velocidades y el alpha floor, y la detección de windshear.",8],
     ["ov_fc_laws","En normal law el sidestick manda factor de carga con todas las protecciones. En alternate law se mantiene el factor de carga pero con protecciones reducidas, y al bajar el tren pasa a direct law. En direct law hay relación directa entre el sidestick y las superficies, sin protecciones y con trim manual. En alterna y directa el máximo es 320 nudos.",7],
     ["ov_dual_ra_direct","La doble falla de radio altímetros. El avión sigue en normal law y al bajar el tren pasa a direct law, sin pasar por alterna. Se aterriza en CONF 3 con VREF más 10 y se calcula la landing distance; quedan inoperativos el GPWS y el TCAS.",8],
     ["ov_rvsm_equipment","Dos ADR y dos DMC, un transponder, un autopilot, un canal de la FCU, dos PFD para la altitud y un FWC para la alerta de altitud. RVSM es separación de mil pies entre FL290 y FL410.",8.5],
     ["ov_ecam_priorities","Primero volar el avión. Después los memory items o acciones inmediatas del OEB, luego el OEB, luego el ECAM y después el QRH con las summaries, y si el tiempo lo permite el FCOM.",8.5],
     ["ov_ecam_handling","El primero que ve la alerta apaga el master warning. El PM lee el título de la falla y la confirma. El PF con el avión controlado dice ECAM actions. El PM hace las acciones y pide clear con confirmación. Al llegar a status se dice stop ECAM, después continue ECAM y al final ECAM actions complete.",8.5],
     ["ov_ecam_after","Volver al reparto normal de tareas, revisar el FCOM si hay tiempo sin alargar el vuelo, evaluar la situación con el status, el combustible y la distancia de aterrizaje, tomar una decisión e informar a ATC, a la cabina, a los pasajeros y a operaciones.",8.5],
     ["ov_emergency_atc","Mayday tres veces, el callsign, la naturaleza de la emergencia, las intenciones, la posición, el nivel y el rumbo, las almas a bordo, el combustible en horas y minutos y si hay mercancías peligrosas. Squawk 7700.",8.5],
     ["ov_golden_rules","Fly, navigate, communicate en ese orden; usar el nivel de automatización apropiado; entender el FMA siempre; y actuar si las cosas no salen como se espera, por ejemplo pasar de managed a selected.",8.5],
     ["ov_stab_appr","Trayectoria correcta, configuración de aterrizaje, potencia sobre ralentí, velocidad entre VAPP y VAPP más 20, razón de descenso menor a mil pies por minuto y checklist de aterrizaje completado, a 1000 pies en IMC o 500 en VMC; si no, go around.",8.5]
    ].forEach(function(c){
      var r=evaluateLocally(oral(c[0]),c[1]);
      ok(r.score>=c[2],c[0]+": puntaje "+r.score+" (minimo "+c[2]+"), faltan "+JSON.stringify(r.missing));
      eq(r.errors.length,0,c[0]+": se penalizo una respuesta correcta: "+JSON.stringify(r.errors));
    });
    var own=evaluateLocally(oral("ov_ecam_priorities"),"Recall items, OEB immediate actions, ECAM actions, QRH summaries y FCOM si el tiempo lo permite.");
    ok(own.score>=7&&own.errors.length===0,"el orden tipico (recall items, OEB, ECAM, QRH, FCOM) debe aprobar: "+JSON.stringify(own));
    var wrong=evaluateLocally(oral("ov_ecam_priorities"),"Primero el ECAM, despues los memory items, luego el QRH y el OEB.");
    ok(wrong.errors.some(function(e){return /order/.test(e)}),"un orden equivocado debe avisarse: "+JSON.stringify(wrong.errors));
    eq(evaluateLocally(oral("ov_flex_derate_def"),"El flex se puede usar en pista contaminada sin problema.").errors.length,1,"FLEX en pista contaminada debe penalizarse");
  });
  T("11 ningun texto de la app usa el termino que se reemplazo por screen height",function(){
    var banned=new RegExp("altura de "+"pantalla","i");
    ok(!banned.test(JSON.stringify(ORAL_VOICE_BANK)),"aparece en el banco oral");
    ok(!banned.test(JSON.stringify(RAW_SYSTEMS)),"aparece en el banco de preguntas");
    ok(!banned.test(JSON.stringify(ENGLISH)),"aparece en Ingles OACI");
    ok(!banned.test(document.querySelector("main").innerText),"aparece en la pantalla");
  });
  T("9 los controles de Need to know miden al menos 44 px de alto",function(){
    reset();
    function minH(sel,label){
      var els=Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function(e){return e.getClientRects().length});
      ok(els.length,"no hay "+label+" visible");
      els.forEach(function(e){ok(e.getBoundingClientRect().height>=43.5,label+" mide "+Math.round(e.getBoundingClientRect().height)+" px de alto")});
    }
    minH("#ntkHomeCard","la tarjeta del inicio");
    openNeedToKnow();
    minH("#ntk .back","el enlace Inicio");minH("#ntkStartBtn","el boton Practicar");minH(".ntk-open","las preguntas de la lista");minH(".ntk-remove","los botones Quitar");
    ntkStart();
    minH("#ntkCard .back","el enlace Need to know");minH("#ntkRevealBtn","el boton Ver respuesta");minH("#ntkPrevBtn","el boton Anterior");minH("#ntkNextBtn","el boton Siguiente");
    ntkExitCard();
    startSingle(fcomQ(0)._id);
    minH("#ntkQuizBtn","el boton + Need to know");
  });

  /* ---------- 14. Ruta de entrenamiento (portada, mapa y misiones) ---------- */
  function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  T("14 RUTA-01 la app abre en la portada con el titulo de la app; Banco de preguntas lleva al inicio de siempre y Portada vuelve",function(){
    reset();RUTA.showCover();
    var c=byId("rtCover");ok(!c.hidden,"la portada se ve");
    ok(/A320/.test(c.querySelector("h1").textContent)&&/Interview Trainer/.test(c.querySelector("h1").textContent),"el titulo es el nombre de la app");
    ok(!/misi[oó]n por misi[oó]n/i.test(c.textContent),"sin la frase anterior");
    byId("rtGoBank").click();
    ok(c.hidden&&!byId("home").classList.contains("hidden"),"Banco de preguntas muestra el inicio de siempre");
    eq(document.querySelector("#home .home-hero h1").textContent,"Question bank","titulo del banco");
    document.querySelector("#home .rt-back-cover").click();
    ok(!c.hidden,"el boton Portada vuelve a la portada");
    RUTA.showBank();
  });
  T("14 RUTA-02 contenido: las estaciones de Hidraulico, Electrico, Controles de vuelo, Performance y Tren de aterrizaje, cada pregunta se enseña en su estacion, es la del banco y nada visible cita un manual",function(){
    eq(RUTA.missions.length,window.ESTACIONES_DATA.route.missions.length,"estaciones de la ruta");ok(RUTA.missions.length>=54,"al menos las 54 estaciones de Hidraulico, Electrico, Controles de vuelo, Performance y Tren de aterrizaje");
    var subj={};RUTA.missions.forEach(function(m){subj[m.subject]=1});eq(Object.keys(subj).sort().join(),"controles,electrico,hidraulico,performance,tren","materias");
    var cards={};Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].cards.forEach(function(c){cards[c.id]=k})});
    var REF=/\b(FCOM|FCTM|AFM|PDF)\b|DSC-\d|PRO-[A-Z]{3}|§/;
    Object.keys(RUTA.stations).forEach(function(k){
      var st=RUTA.stations[k];ok(!st.internalRefs,"sin fuentes internas en "+k);
      [st.title,st.goal,st.intro].concat(st.cards.map(function(c){return [c.title,c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" ")})).forEach(function(s){ok(!REF.test(s),"texto con cita en "+k+": "+String(s).slice(0,60))});
      st.test.forEach(function(t){
        t.taughtIn.forEach(function(c){ok(cards[c],"existe la ficha "+c);if(st.kind==="lesson")eq(cards[c],k,"la pregunta "+t.id+" se enseña en su estacion")});
        ok(!REF.test([t.question,t.explanation||"",t.reference||""].concat(t.options||[]).join(" ")),"pregunta con cita: "+t.id);
        if(t.type==="mcq"){var q=findById(t.source.appId);ok(q,"la pregunta "+t.id+" existe en el banco");if(q){eq(t.options.join("|"),q.options.join("|"),"mismas alternativas y orden: "+t.id);eq(t.correct,q.correct,"misma respuesta: "+t.id)}}
        else ok(ORAL_VOICE_BANK.some(function(o){return o.id===t.source.id}),"existe la oral "+t.source.id);
      });
    });
    ok(!JSON.stringify(window.ESTACIONES_DATA).match(/\b(el|del|al) PTU\b(?! pb)|\b[Ll]a PTU\b/),"las clases dicen PTU, sin articulo (el PTU pb es el pushbutton)");
  });
  T("14 RUTA-03 el avance de la ruta se sanea, viaja en el respaldo y un tipo invalido rechaza el respaldo",function(){
    var r=roundTrip({ruta:{stars:{"hid-1":3,"ele-2":2,"no-existe":3,"hid-2":7,"hid-3":"3"},streak:{last:"2026-10-01",days:4},unlockAll:true}});
    eq(JSON.stringify(r.ruta.stars),JSON.stringify({"hid-1":3,"ele-2":2}),"solo estaciones que existen, con 1 a 3 estrellas");
    eq(r.ruta.streak.days,4,"racha");ok(r.ruta.unlockAll===true,"abrir todas");
    eq(JSON.stringify(roundTrip({}).ruta),JSON.stringify(defaultState().ruta),"un respaldo antiguo sin ruta queda vacio");
    eq(roundTrip({ruta:{streak:{last:"ayer",days:2}}}).ruta.streak.days,0,"una fecha invalida se descarta");
    ok(!looksLikeValidBackup({ruta:[1]}),"una ruta con tipo invalido rechaza el respaldo");
    ok(looksLikeValidBackup({ruta:{stars:{}}}),"una ruta valida se acepta");
  });
  T("14 RUTA-04 una mision completa da estrellas, abre la siguiente, suma racha y sus respuestas cuentan en las estadisticas",function(){
    reset();
    eq(RUTA.currentIndex(),0,"empieza en la mision 1");ok(!RUTA.isUnlocked(1),"la 2 parte cerrada");
    var m=RUTA.missions[0],st=RUTA.stations[m.id];
    RUTA.startMission(0);ok(!byId("rtPlayer").hidden,"se abre la mision");
    var S=RUTA.state();S.view="question";
    st.test.forEach(function(t,i){S.q=i;if(t.type==="mcq")RUTA.answer(t.correct);else RUTA.answerOral(t.reference,false)});
    S.q=st.test.length-1;RUTA.nextQuestion();
    eq(RUTA.state().view,"result","pantalla de resultado");
    eq(appState.ruta.stars[m.id],3,"3 estrellas");
    ok(RUTA.isUnlocked(1),"la mision 2 se abre");eq(RUTA.currentIndex(),1,"ahora toca la 2");
    eq(appState.ruta.streak.last,today(),"racha de hoy");ok(appState.ruta.streak.days>=1,"dias de racha");
    var mcq=st.test.filter(function(t){return t.type==="mcq"&&t.source.system!==DGAC_KEY});ok(mcq.length,"hay preguntas de alternativas");
    mcq.forEach(function(t){var s=appState.stats[t.source.appId];ok(s&&s.a===1&&s.c===1,"cuenta en estadisticas: "+t.id)});
    eq(JSON.parse(localStorage.getItem(KEY)).ruta.stars[m.id],3,"guardado en el dispositivo");
    RUTA.showCover();
  });
  T("14 RUTA-05 una DGAC de la ruta no toca las estadisticas y una oral se evalua con el motor de Entrevista oral",function(){
    reset();appState.ruta.unlockAll=true;
    var i=RUTA.missions.findIndex(function(m){return m.id==="hid-repaso"}),st=RUTA.stations["hid-repaso"];
    RUTA.startMission(i);var S=RUTA.state();S.view="question";
    var dg=st.test.findIndex(function(t){return t.type==="mcq"&&t.source.system===DGAC_KEY});ok(dg>=0,"el repaso trae una DGAC");
    S.q=dg;RUTA.answer(st.test[dg].correct);ok(!appState.stats[st.test[dg].source.appId],"la DGAC no cuenta");
    var or=st.test.findIndex(function(t){return t.type==="oral"});ok(or>=0,"el repaso trae una oral");
    S.q=or;RUTA.answerOral(st.test[or].reference,false);
    var a=S.answers[or];ok(a&&a.result&&a.result.score>=6&&a.ok,"la respuesta de referencia aprueba con el motor ("+(a&&a.result&&a.result.score)+")");
    ok(/\/10/.test(byId("rtPlayer").textContent)&&/coverage/.test(byId("rtPlayer").textContent),"se muestra el puntaje y la cobertura");
    ok(appState.oralVoice[st.test[or].source.id],"queda registrada en Entrevista oral");
    var j=st.test.findIndex(function(t,k){return t.type==="mcq"&&k!==dg});S.q=j;RUTA.answer(st.test[j].correct);
    S.q=or;S.answers[or]=null;RUTA.answerOral("",false);ok(S.answers[or]&&!S.answers[or].ok,"una oral vacia no aprueba");
    RUTA.showCover();
  });
  T("14 RUTA-06 el segundo intento no cuenta doble y las alternativas DGAC salen en su orden original",function(){
    reset();
    var st=RUTA.stations[RUTA.missions[0].id];RUTA.startMission(0);var S=RUTA.state();S.view="question";
    var t0=st.test[0];S.q=0;RUTA.answer((t0.correct+1)%t0.options.length);
    for(var i=1;i<st.test.length;i++){S.q=i;RUTA.answer(st.test[i].correct)}
    S.q=st.test.length-1;RUTA.nextQuestion();
    eq(appState.ruta.stars[st.id],2,"4 de 5 dan 2 estrellas");
    byId("rtPlayer").querySelector('[data-act="retry"]').click();
    eq(RUTA.state().retry.join(),"0","el segundo intento repite solo la fallada");
    RUTA.answer(t0.correct);
    var s=appState.stats[t0.source.appId];eq(s.a,1,"el segundo intento no suma un intento");eq(s.w,1,"queda el error del primer intento");
    appState.ruta.unlockAll=true;
    var i2=RUTA.missions.findIndex(function(m){return m.id==="hid-repaso"}),st2=RUTA.stations["hid-repaso"];
    RUTA.startMission(i2);var S2=RUTA.state();S2.view="question";S2.q=0;RUTA.answer(st2.test[0].correct);
    var shown=[].map.call(byId("rtPlayer").querySelectorAll(".rt-opt span:last-child"),function(e){return e.textContent});
    eq(shown.join("|"),st2.test[0].options.join("|"),"alternativas en su orden");
    RUTA.showCover();
  });
  T("14 RUTA-07 la portada muestra avance, racha y estrellas; el mapa dibuja 18 misiones con candados, la actual y el avion",function(){
    reset();appState.ruta=sanitizeRuta({stars:{"hid-1":3},streak:{last:today(),days:2}});
    RUTA.showCover();
    ok(/Continue · Station 2/.test(byId("rtRouteTitle").textContent),"Continuar en la estacion 2");
    eq(byId("rtStarTotal").textContent,"3","estrellas");eq(byId("rtStreak").textContent,"2","racha");
    ok(new RegExp("1 of "+RUTA.missions.length+" stations").test(byId("rtRouteCount").textContent),"estaciones hechas");
    RUTA.showMap();
    eq(byId("rtCanvas").querySelectorAll(".rt-node").length,RUTA.missions.length,"estaciones en el mapa");
    eq(byId("rtCanvas").querySelectorAll(".rt-node.rt-locked").length,RUTA.missions.length-2,"con candado (abiertas: la hecha y la siguiente)");
    ok(byId("rtCanvas").querySelector('.rt-node.rt-current[data-m="1"]'),"la actual es la 2");
    ok(byId("rtPlane")&&byId("rtPlane").style.left,"el avion esta sobre la ruta");
    var zonesWithBg=window.ESTACIONES_DATA.route.zones.filter(function(z){return z.bg});
    eq(new Set([].map.call(byId("rtCanvas").querySelectorAll(".rt-panel"),function(p){return p.dataset.zone})).size,zonesWithBg.length,"cada zona con imagen tiene su fondo");
    eq(zonesWithBg.length,7,"los 7 fondos, con la pista de llegada");
    RUTA.showCover();
  });
  T("14 RUTA-08 las nubes de la portada pasan en bucle sin salto, bajo el titulo y los botones, y se detienen con Reducir movimiento",function(){
    reset();RUTA.showCover();
    var c=byId("rtCover"),box=c.querySelector(".rt-clouds");
    ok(box&&box.getAttribute("aria-hidden")==="true","capa de nubes oculta para lectores de pantalla");
    var layers=box?[].slice.call(box.querySelectorAll(".rt-cloud")):[];eq(layers.length,2,"dos capas de nubes");
    eq(getComputedStyle(box).pointerEvents,"none","las nubes no bloquean los toques");
    var zc=+getComputedStyle(box).zIndex,zg=+getComputedStyle(c,"::before").zIndex,zi=+getComputedStyle(c.querySelector(".rt-cover-in")).zIndex;
    ok(zc<zg&&zg<zi,"nubes bajo el degradado y bajo el contenido ("+zc+" < "+zg+" < "+zi+")");
    var frames={},still=false;
    [].forEach.call(document.styleSheets,function(sh){var rules;try{rules=sh.cssRules}catch(e){return}
      [].forEach.call(rules,function(r){
        if(r.type===7)frames[r.name]=r;
        if(r.type===4&&/^\(prefers-reduced-motion:\s*reduce\)$/.test(r.conditionText||"")&&layers.length)[].forEach.call(r.cssRules,function(s){
          if(s.selectorText&&layers.every(function(el){return el.matches(s.selectorText)})&&s.style.getPropertyValue("animation-name")==="none"&&s.style.getPropertyPriority("animation-name")==="important")still=true;
        });
      });
    });
    layers.forEach(function(el){
      var cs=getComputedStyle(el),name=cs.animationName,f=frames[name];
      ok(f,"animacion "+name);if(!f)return;
      eq(cs.animationIterationCount,"infinite","en bucle: "+name);eq(cs.animationTimingFunction,"linear","velocidad pareja: "+name);
      var tile=parseFloat(cs.backgroundSize),last=f.cssRules[f.cssRules.length-1].style,m=/translateX\((-?[\d.]+)px\)/.exec(last.transform);
      eq(last.length,1,"solo se anima el transform (no repinta): "+name);
      ok(m&&Math.abs(+m[1])===tile,"avanza justo una textura ("+(m&&m[1])+" de "+tile+" px), asi no salta al repetirse: "+name);
      ok(Math.abs(parseFloat(cs.left))>=tile,"la capa cubre la pantalla durante todo el recorrido: "+name);
      ok(/assets\/portada\/nubes\.webp/.test(cs.backgroundImage),"usa la textura de nubes: "+name);
    });
    ok(still,"con Reducir movimiento las nubes quedan quietas");
    RUTA.showCover();
  });
  T("14 RUTA-09 al terminar una estacion se vuelve si o si al mapa (sin atajo a la siguiente) y ninguna pantalla de la ruta dice mision",function(){
    reset();
    var MIS=/misi[oó]n/i,seen=[];
    function look(where,el){var t=el.textContent+" "+[].map.call(el.querySelectorAll("[aria-label]"),function(e){return e.getAttribute("aria-label")}).join(" ")+" "+(el.getAttribute("aria-label")||"");if(MIS.test(t))seen.push(where)}
    RUTA.showCover();look("portada",byId("rtCover"));
    RUTA.showMap();look("mapa",byId("rtMap"));
    byId("rtCanvas").querySelector('.rt-node[data-m="0"]').click();look("hoja de la estacion",byId("rtSheet"));
    byId("rtCanvas").querySelector('.rt-node[data-m="1"]').click();look("hoja de una estacion cerrada",byId("rtSheet"));
    RUTA.showCover();byId("rtOpenSettings").click();look("ajustes",byId("rtSheet"));
    var m=RUTA.missions[0],st=RUTA.stations[m.id];RUTA.startMission(0);look("presentacion",byId("rtPlayer"));
    var S=RUTA.state();S.view="question";
    st.test.forEach(function(t,i){S.q=i;if(t.type==="mcq")RUTA.answer(t.correct);else RUTA.answerOral(t.reference,false)});
    S.q=st.test.length-1;RUTA.nextQuestion();look("resultado",byId("rtPlayer"));
    eq(seen.join(", "),"","ninguna pantalla dice mision");
    ok(RUTA.isUnlocked(1),"la siguiente queda abierta");
    var acts=[].map.call(byId("rtPlayer").querySelectorAll("[data-act]"),function(b){return b.dataset.act}).sort().join();
    eq(acts,"exit,tomap","en el resultado solo se puede volver al mapa (o salir): sin boton a la siguiente estacion");
    byId("rtPlayer").querySelector('[data-act="tomap"]').click();
    ok(byId("rtPlayer").hidden&&!byId("rtMap").hidden,"Volver al mapa lleva al mapa");
    RUTA.showCover();
  });
  T("14 RUTA-10 el mapa es una carta: despega por el eje de pista, cada estacion es un VOR/DME con su caja, los tramos traen rumbo y distancia, y termina en la aproximacion a la pista de llegada",function(){
    reset();appState.ruta.unlockAll=true;RUTA.showMap();
    var g=RUTA.geo(),cv=byId("rtCanvas"),W=g.W;
    ok(Math.abs(g.cx-Math.round(W*0.499))<=1,"eje de pista del primer fondo");
    eq(g.route.pts[0].x,g.cx,"la ruta parte en el umbral, sobre el eje");
    var onRwy=RUTA.missions.map(function(m,i){return m.zone==="pista"?i:-1}).filter(function(i){return i>=0});
    eq(onRwy.length,3,"tres estaciones en la pista de salida");
    onRwy.forEach(function(i){eq(g.pts[i].x,g.cx,"estacion "+(i+1)+" sobre el eje de pista")});
    var after=g.sIdx[onRwy[onRwy.length-1]];
    ok(g.route.pts[after+1].x===g.cx&&g.route.pts[after+2].x===g.cx&&g.route.pts[after+2].y<g.route.pts[after+1].y&&g.route.pts[after+1].y<g.pts[onRwy[onRwy.length-1]].y,"pasada la ultima estacion de pista sigue derecho por el eje antes de virar");
    ok(Math.abs(parseFloat(byId("rtPlane").style.left)-g.cx)<1,"el avion espera alineado en la pista");
    var img=byId("rtPlane").querySelector("img");ok(img&&/mapa-avion\.webp/.test(img.getAttribute("src")),"el avion es la imagen nueva");
    var nodes=cv.querySelectorAll(".rt-node");eq(nodes.length,RUTA.missions.length,"una radioayuda por estacion");
    [].forEach.call(nodes,function(n){
      var st=RUTA.stations[RUTA.missions[+n.dataset.m].id],vor=n.querySelector(".rt-vor");
      ok(vor&&n.querySelector(".rt-dme"),"VOR/DME en la estacion "+(+n.dataset.m+1));
      if(vor&&!n.classList.contains("rt-locked"))eq(vor.getAttribute("fill")!=="none",st.kind==="review","relleno solo en los repasos (notificacion obligatoria): estacion "+(+n.dataset.m+1));
    });
    var idents=[].map.call(cv.querySelectorAll(".rt-ident"),function(e){return e.textContent.trim()});
    eq(idents.length,RUTA.missions.length,"una caja por radioayuda");
    idents.forEach(function(t){ok(/^11[2-7]\.\d [A-Z]{3}$/.test(t),"caja con frecuencia de VOR e identificador: "+t)});
    eq(new Set(idents.map(function(t){return t.slice(-3)})).size,idents.length,"identificadores distintos");
    var legs=cv.querySelectorAll(".rt-leg");ok(legs.length>=10,"tramos con datos");
    [].forEach.call(legs,function(l){var c=l.querySelector("b").textContent,v=+c.slice(0,3);ok(/^\d{3}°$/.test(c)&&v>=1&&v<=360,"rumbo de carta: "+c);ok(+l.querySelector("i").textContent>0,"distancia")});
    var leg=cv.querySelector('.rt-leg[data-leg="3"]'),b=g.sIdx[3],p1=g.route.pts[b-1],p2=g.route.pts[b];
    var want=Math.round((Math.atan2(p2.x-p1.x,-(p2.y-p1.y))*180/Math.PI+360)%360)||360;
    ok(leg&&+leg.querySelector("b").textContent.slice(0,3)===want,"el rumbo del primer tramo de aerovia sale de su direccion en el mapa ("+want+")");
    ok(/UA320/.test(cv.textContent),"la aerovia tiene nombre");
    for(var i=onRwy.length;i<g.sIdx.length;i++){var L=g.route.cum[g.sIdx[i]]-g.route.cum[g.sIdx[i-1]];ok(L>=135.5,"tramo "+i+" con espacio para el avion ("+Math.round(L)+" px)")}
    ok(cv.querySelector(".rt-appr")&&cv.querySelectorAll(".rt-rwy").length===2,"aproximacion punteada a la pista de llegada y RWY 36 en las dos pistas");
    RUTA.showCover();
  });
  T("14 RUTA-11 una materia nueva no cierra lo ya ganado, y una zona con muchas estaciones se alarga en vez de amontonarlas",function(){
    reset();var M=RUTA.missions;appState.ruta=sanitizeRuta({stars:{}});appState.ruta.stars[M[1].id]=3;
    eq(RUTA.currentIndex(),0,"toca la primera, que quedo sin hacer (como una estacion nueva intercalada)");
    ok(RUTA.isUnlocked(1),"la estacion ya ganada sigue abierta aunque la anterior no tenga estrellas");
    ok(RUTA.isUnlocked(2),"y la que sigue a una ganada tambien");ok(!RUTA.isUnlocked(3),"las demas siguen cerradas");
    RUTA.showMap();var cv=byId("rtCanvas");
    ok(!cv.querySelector('.rt-node[data-m="1"]').classList.contains("rt-locked"),"en el mapa la ganada no tiene candado");
    var count={};M.forEach(function(m){count[m.zone]=(count[m.zone]||0)+1});
    Object.keys(count).forEach(function(z){
      var panels=[].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone===z});
      ok(count[z]<=5*panels.length,"zona "+z+": "+count[z]+" estaciones en "+panels.length+" fondo(s)");
      ok(panels.length%2===1,"zona "+z+": numero impar de fondos, para que la union con la siguiente calce");
      panels.forEach(function(p,i){eq(!!p.querySelector(".rt-flip"),i%2===1,"zona "+z+": copia "+(i+1)+(i%2?" al reves":" derecha"))});
    });
    ok([].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone==="tormenta"}).length>1,"la tormenta, con mas de 5 estaciones, se alarga");
    eq([].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone==="pista"||p.dataset.zone==="llegada"}).length,2,"las pistas no se repiten");
    RUTA.showCover();
  });

  T("14 RUTA-12 materias, estaciones y fichas con titulo en ingles; el texto de las clases en espanol neutro, sin modismos",function(){
    var subj={};RUTA.missions.forEach(function(m){subj[m.subject]=1});
    var ES=/^(La|El|Los|Las|Un|Una|Cada|Qué|Cómo|Cuándo|Dónde|Quién|Para|Si|Con|Sin|En|Del|Tres|Dos|Cinco|Toda|Todo)\b|^[¿¡]|[áéíóúñ]/;
    var titles=[];Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];titles.push([k,st.title]);st.cards.forEach(function(c){titles.push([c.id,c.title])})});
    (window.ESTACIONES_DATA.subjects||[]).forEach(function(s){titles.push([s.id,s.title])});
    var bad=titles.filter(function(p){return ES.test(p[1])});
    eq(bad.length,0,"titulos en espanol: "+JSON.stringify(bad.slice(0,5)));
    var REG=/\bal tiro\b|\bo sea\b|\brecién\b|\bapret[a-z]*|\bcañer[ií]a|\bestanque\b|\bbota[nr]?\b|\bOjo:|\bharto\b|\bnomás\b|\bpartimos por\b|\bletra chica\b/i;
    var hits=[];Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];
      [st.goal,st.intro].concat(st.cards.map(function(c){return [c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" ")})).forEach(function(s){var m=String(s).match(REG);if(m)hits.push(k+": "+m[0])});
    });
    eq(hits.length,0,"modismos en las clases: "+hits.slice(0,5).join(" | "));
  });

  T("14 UI-01 la interfaz esta en ingles: la pagina, la portada, el inicio del banco y la ficha de estacion sin textos en espanol (el contenido de las clases y preguntas sigue en espanol)",function(){
    var ES=/[áéíóúñ¿¡]|\b(Banco|Portada|Inicio|Estación|Estaciones|Empezar|Continuar|Siguiente|Anterior|Salir|Guardar|Repaso|Preguntas|preguntas|precisión|Ruta|Todas|secciones|días|seguidos|Entrevista|Inglés|Sistemas|errores|copia|Restaurar|Crear|fichas|estrellas)\b/;
    function check(root,where){var bad=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
      while((n=w.nextNode())){var p=n.parentNode;if(!p||/^(SCRIPT|STYLE)$/.test(p.nodeName))continue;var s=n.nodeValue.trim();if(s&&ES.test(s))bad.push(s)}
      [].forEach.call(root.querySelectorAll("[aria-label],[placeholder],[title]"),function(el){["aria-label","placeholder","title"].forEach(function(k){var v=el.getAttribute(k);if(v&&ES.test(v))bad.push(k+": "+v)})});
      eq(bad.length,0,where+" en espanol: "+JSON.stringify(bad.slice(0,6)));}
    // 1. la pagina tal como se publica (sin contenido cargado)
    var x=new XMLHttpRequest();x.open("GET",location.href.split("#")[0],false);x.send();
    var page=new DOMParser().parseFromString(x.responseText,"text/html");check(page.body,"index.html");
    // 2. lo que la app dibuja al abrir
    reset();renderHome();RUTA.showCover();check(byId("rtCover"),"portada");check(byId("home"),"inicio del banco");
    // 3. la ficha de una estacion en el mapa
    var M=RUTA.missions,ix=M.findIndex(function(m){return m.id==="ele-1"});
    RUTA.showMap();byId("rtCanvas").querySelector('.rt-node[data-m="'+ix+'"]').click();
    var sheet=byId("rtSheet").textContent;
    ok(/Station /.test(sheet)&&/ cards/.test(sheet)&&/ questions/.test(sheet),"la ficha de la estacion habla en ingles: "+sheet.slice(0,160));
    ok(!/Estación|fichas|preguntas|Empezar|Cerrar/.test(sheet),"sin restos en espanol en la ficha: "+sheet.slice(0,160));
    RUTA.showCover();
  });
  T("14 REG-07 el segundo segmento empieza con el tren arriba, no a 35 ft (pregunta de entrevista corregida)",function(){
    var q=SYSTEMS.interview_technical.questions.find(function(x){return x.q.indexOf("Dentro de los segmentos de despegue")===0});
    ok(q,"existe la pregunta del segundo segmento");
    var a=q.options[q.correct];
    ok(!/desde 35 ft/.test(a)&&/tren queda arriba/.test(a)&&/400 ft/.test(a)&&/V2/.test(a),"alternativa correcta: "+a);
    ok(!/desde los 35 ft/.test(q.expl)&&/2,4/.test(q.expl),"explicacion: "+q.expl.slice(0,80));
  });
  T("14 RUTA-13 Performance: 13 estaciones con el repaso al final, y cada pregunta muestra su origen (entrevista o examen DGAC) sin nombrar documentos",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="performance"});
    eq(P.length,13,"estaciones de Performance");eq(P[P.length-1].id,"perf-repaso","el repaso de Performance va al final");
    reset();appState.ruta.unlockAll=true;
    function badgeFor(stId,pick){
      var i=RUTA.missions.findIndex(function(m){return m.id===stId}),st=RUTA.stations[stId];
      var ti=st.test.findIndex(pick);ok(ti>=0,"hay una pregunta asi en "+stId);
      RUTA.startMission(i);var S=RUTA.state();S.view="question";S.q=ti;RUTA.render();
      var b=byId("rtPlayer").querySelector(".rt-origin");return b?b.textContent:"";
    }
    eq(badgeFor("perf-2",function(t){return t.type==="mcq"&&t.source.system==="interview_technical"}),"Interview question","alternativa de entrevista");
    eq(badgeFor("perf-7",function(t){return t.type==="mcq"&&t.source.system===DGAC_KEY}),"DGAC exam","pregunta del examen DGAC");
    eq(badgeFor("perf-4",function(t){return t.type==="oral"}),"Interview question","pregunta oral");
    eq(badgeFor("hid-1",function(t){return t.type==="mcq"&&t.source.system==="hydraulic"}),"","una pregunta del banco de sistemas no lleva etiqueta");
    var txt=byId("rtPlayer").textContent;ok(!/FCOM|FCTM|Tutorial|Getting to Grips|PDF/.test(txt),"la pantalla no nombra documentos");
    RUTA.showCover();
  });

  T("14 RUTA-14 Tren de aterrizaje: 12 estaciones con el repaso al final; el steering se enseña por MSN (Green en los mas antiguos, Yellow en los mas nuevos) y ninguna estacion usa las 3 preguntas DGAC que responden segun los aviones antiguos",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="tren"});
    eq(P.length,12,"estaciones de Tren de aterrizaje");eq(P[P.length-1].id,"tren-repaso","el repaso va al final");
    var nws=RUTA.stations["tren-4"];ok(nws,"existe la estacion del steering");
    var body=nws.cards.map(function(c){return c.body}).join(" ");
    ok(/\*\*Green\*\* en los MSN más antiguos/.test(body)&&/\*\*Yellow\*\* en los más nuevos/.test(body),"el steering por MSN: Green en los mas antiguos y Yellow en los mas nuevos");
    var viejas=SYSTEMS[DGAC_KEY].questions.filter(function(q){return /WHAT OTHER SYSTEMS WILL BE INOPERATIVE|WILL NOSE WHEEL STEERING BE AVAILABLE|SUPPLIES PRESSURE TO THE NOSE WHEEL STEERING/.test(q.q)});
    eq(viejas.length,3,"las 3 preguntas DGAC del steering");
    var ids=viejas.map(function(q){return qid(DGAC_KEY,q)});
    var usadas=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta DGAC del steering antiguo: "+usadas.join(", "));
  });
  T("14 REG-08 las 3 preguntas DGAC del steering conservan la respuesta del examen y su explicacion aclara que es Green en los MSN mas antiguos y Yellow en los mas nuevos",function(){
    var Q=SYSTEMS[DGAC_KEY].questions;
    function one(re){var h=Q.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]}
    var a=one(/WHAT OTHER SYSTEMS WILL BE INOPERATIVE/),b=one(/WILL NOSE WHEEL STEERING BE AVAILABLE/),c=one(/SUPPLIES PRESSURE TO THE NOSE WHEEL STEERING/);
    eq(a.options[a.correct],"NOSE WHEEL STEERING ONLY.","clave de la 1");eq(b.options[b.correct],"NO.","clave de la 2");eq(c.options[c.correct],"GREEN.","clave de la 3");
    [a,b,c].forEach(function(q){ok(/MSN más antiguos/.test(q.expl)&&/MSN más nuevos/.test(q.expl)&&/Yellow/.test(q.expl)&&!/flota/.test(q.expl),"explicacion: "+q.expl.slice(0,70))});
  });

  T("14 REG-09 ninguna pregunta del banco menciona los Tutorials (enunciado, alternativas ni explicacion) y las estaciones muestran el enunciado del banco tal cual",function(){
    var bad=[];
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){
      [q.q,q.expl||"",q.scenario_q||""].concat(q.options).forEach(function(s){if(/tutorial/i.test(s))bad.push(k+"#"+i+": "+String(s).slice(0,60))});
    })});
    eq(bad.length,0,"menciones a los Tutorials: "+bad.slice(0,4).join(" | "));
    var ops=SYSTEMS.operations_airbus.questions;
    ok(!ops.some(function(q){return /(mostrad[ao]|descrit[ao]|declarado) por Airbus/.test(q.q)}),"ningun enunciado atribuye la tecnica a Airbus como fuente");
    var rto=ops.find(function(q){return q.q.indexOf("Una vez detenido el avión tras un RTO")===0});
    ok(rto&&/ATC/.test(rto.expl)&&!/no incluye notificar/.test(rto.expl),"el flow despues del RTO incluye avisar al ATC");
    var mal=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){
      if(x.source&&x.source.system==="operations_airbus"){var q=findById(x.source.appId);if(!q||q.q!==x.question)mal.push(k+"/"+x.id)}
    })});
    eq(mal.length,0,"estaciones con un enunciado de operaciones distinto del banco: "+mal.join(", "));
  });

  function rtCard(st,title){var s=RUTA.stations[st];ok(s,"existe la estacion "+st);var c=s.cards.find(function(x){return x.title===title});ok(c,"ficha "+st+" · "+title);return c}
  T("15 REG-10 frenos: el triple indicator separa la aguja del accumulator de las de los frenos, el parking brake no es una reserva aparte y todo lo que dice que el autobrake no aplica una presion fija aclara que MAX frena a fondo",function(){
    var S=RUTA.stations;
    var tri=rtCard("tren-5","The triple indicator").body;
    ok(/ACCU/.test(tri)&&/accumulator/.test(tri)&&/BRAKES L y R/.test(tri)&&/solo marcan presión cuando \*\*Yellow\*\*/.test(tri),"el triple indicator: la aguja ACCU por un lado y los frenos, que solo marcan presion con Yellow");
    var txt=[];Object.keys(S).forEach(function(k){S[k].cards.forEach(function(c){txt.push(k+": "+[c.body,c.keyIdea,c.more||""].join(" "))})});
    var esc=txt.filter(function(s){return /→\s*parking brake/i.test(s)});
    eq(esc.length,0,"el parking brake como un escalon mas despues del accumulator: "+esc.join(" | ").slice(0,160));
    ok(/misma reserva/.test(rtCard("tren-5","Accumulator and parking brake").body),"el parking brake usa la misma reserva que el alternate");
    var corpus=txt.slice();
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){corpus.push(k+"#"+i+": "+(q.expl||""))})});
    ORAL_VOICE_BANK.forEach(function(q){corpus.push(q.id+": "+q.reference)});
    var sin=corpus.filter(function(s){return /presi[oó]n fija/i.test(s)&&!/MAX/.test(s)});
    eq(sin.length,0,"autobrake sin la salvedad de MAX: "+sin.join(" | ").slice(0,200));
    ok(!/más antiguos/.test(rtCard("tren-7","The three modes").more||""),"el LO de 1,7 m/s² no es solo de los aviones mas antiguos");
  });
  T("15 REG-11 tren: el giro de 180° da los 24 m del A320 junto a la pista de 30 m, y el tren que no se traba separa el recycle del ECAM de la L/G GRAVITY EXTENSION (los 4 recycles y la manivela hasta el tope)",function(){
    var g=rtCard("tren-8","The 180° turn on a runway").body;
    ok(/\*\*30 m\*\*/.test(g)&&/24 m/.test(g),"la clase: pista de 30 m y unos 24 m de giro");
    var q=SYSTEMS.operations_airbus.questions.find(function(x){return x.q.indexOf("Para un giro de 180° en pista")===0});
    ok(q&&q.options[q.correct]==="30 m"&&/24 m/.test(q.expl),"la pregunta del giro: clave 30 m y explicacion con los 24 m");
    var r=rtCard("tren-9","Recycle").body;
    ok(/procedimiento del ECAM pide primero un \*\*recycle\*\*/.test(r),"primero, el recycle del procedimiento del ECAM");
    ok(/GRAVITY EXTENSION\*\*\.\s+Ese procedimiento, si hay tiempo, permite hasta \*\*4 recycles\*\*/.test(r),"los 4 recycles son de la L/G GRAVITY EXTENSION, no del recycle del ECAM");
    ok(/tope mecánico/.test(rtCard("tren-9","Gravity extension").body),"la manivela: hasta el tope mecanico");
  });
  T("15 RUTA-15 dibujos: los que mezclaban ideas se separaron (Tren, Performance y el pitch y el yaw de Controles; cada ficha tiene el suyo) y todos tienen descripcion",function(){
    var S=RUTA.stations;
    var want={"tren-1":["tren-mando.svg","tren-quien-frena.svg"],"tren-2":["tren-secuencia.svg","tren-velocidades.svg"],"tren-5":["tren-frenado.svg","tren-triple.svg"],"perf-11":["perf-drift-down.svg","perf-ruta-net.svg"],"perf-12":["perf-aterrizaje.svg","perf-aterrizaje-vuelo.svg"],"ctl-2":["ctl-cabeceo.svg","ctl-alabeo.svg"],"ctl-7":["ctl-guinada.svg"]};
    Object.keys(want).forEach(function(k){
      var files=S[k].cards.filter(function(c){return c.diagram}).map(function(c){return c.diagram.src.split("/").pop()});
      want[k].forEach(function(f){ok(files.indexOf(f)>=0,k+" usa "+f)});
    });
    var sinAlt=[],viejo=[];
    Object.keys(S).forEach(function(k){S[k].cards.forEach(function(c){
      if(!c.diagram)return;
      if(!(c.diagram.alt&&c.diagram.alt.length>40))sinAlt.push(k);
      if(/tren-arquitectura/.test(c.diagram.src))viejo.push(k);
    })});
    eq(sinAlt.length,0,"dibujos sin descripcion: "+sinAlt.join(", "));
    eq(viejo.length,0,"todavia se usa el dibujo que mezclaba tren y frenos: "+viejo.join(", "));
  });
  T("15 REG-12 auditoria de las clases contra el FCOM (1.21.0): flare, reset del trim, media velocidad de flaps y slats, wing tip brakes, tren anormal, RTO con ATC, viento de cola al 150% y explicaciones del banco",function(){
    var fm=rtCard("ctl-4","Ground and flare modes").body;
    ok(/tirar suavemente del sidestick/.test(fm)&&!/hacer un flare suave/.test(fm),"flare: hay que tirar suavemente del sidestick");
    ok(/2,5° por más de 5 segundos/.test(fm),"reset del trim: con el pitch bajo 2,5° por mas de 5 s");
    var rl=rtCard("ctl-repaso","On landing").body;
    ok(/tirando suavemente/.test(rl)&&/2,5°/.test(rl),"repaso: el flare y el reset del trim");
    ok(/solo van a media velocidad las superficies que usan ese sistema/.test(rtCard("ctl-9","Two SFCCs working together").body),"sin un hidraulico, solo va a media velocidad lo que usa ese sistema");
    var wtb=rtCard("ctl-9","High-lift protections").body;
    ok(/solo el sistema afectado\*\*, en las dos alas/.test(wtb)&&/El otro sigue funcionando/.test(wtb),"wing tip brakes: el sistema afectado, en las dos alas, y el otro sigue");
    var ab=rtCard("tren-9","Landing with abnormal gear").body;
    ok(/\*\*Sin autobrake\*\*/.test(ab)&&/nose gear anormal: sin reversa/.test(ab),"tren anormal: nunca autobrake; con el nose gear, sin reversa");
    ok(/avisa a ATC/.test(rtCard("perf-5","Flying the RTO").body),"RTO: el F/O avisa a ATC");
    ok(!/no depende de un motor/.test(rtCard("hid-1","What pressurizes each system").body),"la bomba del Blue usa la energia AC del avion");
    var tw=ORAL_VOICE_BANK.find(function(q){return q.id==="ov_tailwind_takeoff"});
    ok(tw&&/150%/.test(tw.reference)&&!/se calcula con el viento real\./.test(tw.reference),"oral de viento de cola: el calculo cuenta el 150%");
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    ok(!/bomba hidráulica movida por otra bomba/.test(bq("hydraulic","¿Qué es correcto sobre la Power Transfer Unit").expl),"PTU: un motor y una bomba, no dos bombas");
    ok(/100 kt/.test(bq("hydraulic","¿Qué condición provoca el despliegue automático del RAT").expl),"RAT automatico: sobre 100 kt");
    ok(/en las dos alas/.test(bq(DGAC_KEY,"THE WING TIP BRAKES, ONCE ACTIVATED").expl),"wing tip brakes en el banco");
    ok(/2,5°/.test(bq(DGAC_KEY,"HORIZONTAL STABILIZER TRIM AUTOMATICALLY RESETS").expl),"reset del THS en el banco");
  });
  T("15 REG-13 el steering se enseña por MSN (Green en los mas antiguos, Yellow en los mas nuevos) y ningun texto afirma lo que tiene 'la mayor parte de la flota': el manual solo da MSN",function(){
    var corpus=[];
    Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];
      corpus.push(k+": "+st.goal+" "+st.intro);
      st.cards.forEach(function(c){corpus.push(c.id+": "+[c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" "))});
      st.test.forEach(function(t){corpus.push(t.id+": "+[t.explanation||"",t.reference||""].join(" "))});
    });
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){corpus.push(k+"#"+i+": "+(q.expl||""))})});
    ORAL_VOICE_BANK.forEach(function(q){corpus.push(q.id+": "+q.reference+" "+(q.short||""))});
    var flota=corpus.filter(function(s){return /(mayor parte|mayoría|buena parte|parte) de la flota|flota actual|aviones de la flota|antiguos de la flota/i.test(s)});
    eq(flota.length,0,"afirmaciones sobre la flota: "+flota.join(" | ").slice(0,220));
    var nws=corpus.filter(function(s){return /steering/i.test(s)&&/(usa|da|alimenta)\W+(\w+\W+){0,3}\**Yellow/i.test(s)&&!/más nuevos/.test(s)});
    eq(nws.length,0,"el steering con Yellow sin decir que es en los MSN mas nuevos: "+nws.join(" | ").slice(0,220));
    var c=rtCard("tren-9","After a gravity extension");
    ok(/MSN más antiguos/.test(c.body)&&/se pierde/.test(c.body)&&/más nuevos/.test(c.body)&&/sigue disponible/.test(c.body),"despues de la gravedad: el steering se pierde en los MSN antiguos y sigue en los nuevos");
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
