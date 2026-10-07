/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

