/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

