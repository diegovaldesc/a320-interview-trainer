/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

