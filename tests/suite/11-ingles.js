/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

