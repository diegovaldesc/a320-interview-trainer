/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- 7. Integridad del banco oral ---------- */
  T("7 REG-35 ninguna oral muestra el nombre de un manual (ov_ecam_after y ov_ecam_priorities decian «revisa el FCOM»)",function(){
    var REF=/(FCOM|FCTM|AFM|PDF)|DSC-d|PRO-[A-Z]{3}|§/,mal=[];
    ORAL_VOICE_BANK.forEach(function(o){
      var vis=[o.question,o.short||"",o.reference||""].concat((o.concepts||o.steps||[]).map(function(c){return (c&&(c.label||c.concept))||""}));
      vis.forEach(function(s){if(REF.test(s))mal.push(o.id+": "+String(s).match(REF)[0])});
    });
    eq(mal.length,0,"orales que nombran un manual: "+mal.join(" | "));
    var a=ORAL_VOICE_BANK.find(function(o){return o.id==="ov_ecam_after"});ok(a&&a.reference.indexOf("documentación del procedimiento")>=0,"ov_ecam_after: revisar la documentación del procedimiento");
  });
  T("7 REG-36 ENG FIRE no es un memory item: ninguna pregunta ni oral llama memory items a sus pasos (P9, P12 y ov_engfire lo decian)",function(){
    var mal=[],MI=/memory item|memoriz|memorístic/i,FIRE=/ENG(INE)? ?(1(2) )?FIRE/i;
    allLookupPool().forEach(function(q){var s=[q.q].concat(q.options||[],[q.expl||""]).join(" ");if(FIRE.test(s)&&MI.test(s)&&!/no es un memory item/i.test(s))mal.push(q._id)});
    ORAL_VOICE_BANK.forEach(function(o){var s=[o.question,o.short||"",o.reference||""].join(" ");if(FIRE.test(s)&&MI.test(s))mal.push(o.id)});
    eq(mal.length,0,"llaman memory items a ENG FIRE: "+mal.join(" | "));
    ok(QID_RENAMES["procedures:1bu4ldt"]==="procedures:14935q1","el progreso de P9 pasa a su nuevo id");
  });
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

