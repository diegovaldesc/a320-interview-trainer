/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

