/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
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

