/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

