/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

