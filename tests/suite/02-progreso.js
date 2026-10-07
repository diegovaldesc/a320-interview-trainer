/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

