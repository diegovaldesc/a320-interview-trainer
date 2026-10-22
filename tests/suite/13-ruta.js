/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- 14. Ruta de entrenamiento (portada, mapa y misiones) ---------- */
  function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  T("14 RUTA-01 la app abre en la portada con el titulo de la app; Banco de preguntas lleva al inicio de siempre y Portada vuelve",function(){
    reset();RUTA.showCover();
    var c=byId("rtCover");ok(!c.hidden,"la portada se ve");
    ok(/A320/.test(c.querySelector("h1").textContent)&&/Interview Trainer/.test(c.querySelector("h1").textContent),"el titulo es el nombre de la app");
    ok(!/misi[oó]n por misi[oó]n/i.test(c.textContent),"sin la frase anterior");
    byId("rtGoBank").click();
    ok(c.hidden&&!byId("home").classList.contains("hidden"),"Banco de preguntas muestra el inicio de siempre");
    eq(document.querySelector("#home .home-hero h1").textContent,"Question bank","titulo del banco");
    document.querySelector("#home .rt-back-cover").click();
    ok(!c.hidden,"el boton Portada vuelve a la portada");
    RUTA.showBank();
  });
  T("14 RUTA-02 contenido: las estaciones de Hidraulico, Electrico, Controles de vuelo, Performance, Tren de aterrizaje, Combustible, Aire acondicionado, APU, Fuego, Antihielo e Indicacion, cada pregunta se enseña en su estacion, es la del banco y nada visible cita un manual",function(){
    eq(RUTA.missions.length,window.ESTACIONES_DATA.route.missions.length,"estaciones de la ruta");ok(RUTA.missions.length>=115,"al menos las 115 estaciones de Hidraulico, Electrico, Controles de vuelo, Performance, Tren de aterrizaje, Combustible, Aire acondicionado, APU, Fuego, Antihielo e Indicacion");
    var subj={};RUTA.missions.forEach(function(m){subj[m.subject]=1});eq(Object.keys(subj).sort().join(),"aire,antihielo,apu,combustible,controles,electrico,fuego,hidraulico,indicacion,performance,tren","materias");
    var cards={};Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].cards.forEach(function(c){cards[c.id]=k})});
    var REF=/\b(FCOM|FCTM|AFM|PDF)\b|DSC-\d|PRO-[A-Z]{3}|§/;
    Object.keys(RUTA.stations).forEach(function(k){
      var st=RUTA.stations[k];ok(!st.internalRefs,"sin fuentes internas en "+k);
      [st.title,st.goal,st.intro].concat(st.cards.map(function(c){return [c.title,c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" ")})).forEach(function(s){ok(!REF.test(s),"texto con cita en "+k+": "+String(s).slice(0,60))});
      st.test.forEach(function(t){
        t.taughtIn.forEach(function(c){ok(cards[c],"existe la ficha "+c);if(st.kind==="lesson")eq(cards[c],k,"la pregunta "+t.id+" se enseña en su estacion")});
        ok(!REF.test([t.question,t.explanation||"",t.reference||""].concat(t.options||[]).join(" ")),"pregunta con cita: "+t.id);
        if(t.type==="mcq"){var q=findById(t.source.appId);ok(q,"la pregunta "+t.id+" existe en el banco");if(q){eq(t.options.join("|"),q.options.join("|"),"mismas alternativas y orden: "+t.id);eq(t.correct,q.correct,"misma respuesta: "+t.id)}}
        else ok(ORAL_VOICE_BANK.some(function(o){return o.id===t.source.id}),"existe la oral "+t.source.id);
      });
    });
    ok(!JSON.stringify(window.ESTACIONES_DATA).match(/\b(el|del|al) PTU\b(?! pb)|\b[Ll]a PTU\b/),"las clases dicen PTU, sin articulo (el PTU pb es el pushbutton)");
  });
  T("14 RUTA-03 el avance de la ruta se sanea, viaja en el respaldo y un tipo invalido rechaza el respaldo",function(){
    var r=roundTrip({ruta:{stars:{"hid-1":3,"ele-2":2,"no-existe":3,"hid-2":7,"hid-3":"3"},streak:{last:"2026-10-01",days:4},unlockAll:true}});
    eq(JSON.stringify(r.ruta.stars),JSON.stringify({"hid-1":3,"ele-2":2}),"solo estaciones que existen, con 1 a 3 estrellas");
    eq(r.ruta.streak.days,4,"racha");ok(r.ruta.unlockAll===true,"abrir todas");
    eq(JSON.stringify(roundTrip({}).ruta),JSON.stringify(defaultState().ruta),"un respaldo antiguo sin ruta queda vacio");
    eq(roundTrip({ruta:{streak:{last:"ayer",days:2}}}).ruta.streak.days,0,"una fecha invalida se descarta");
    ok(!looksLikeValidBackup({ruta:[1]}),"una ruta con tipo invalido rechaza el respaldo");
    ok(looksLikeValidBackup({ruta:{stars:{}}}),"una ruta valida se acepta");
  });
  T("14 RUTA-04 una mision completa da estrellas, abre la siguiente, suma racha y sus respuestas cuentan en las estadisticas",function(){
    reset();
    eq(RUTA.currentIndex(),0,"empieza en la mision 1");ok(!RUTA.isUnlocked(1),"la 2 parte cerrada");
    var m=RUTA.missions[0],st=RUTA.stations[m.id];
    RUTA.startMission(0);ok(!byId("rtPlayer").hidden,"se abre la mision");
    var S=RUTA.state();S.view="question";
    st.test.forEach(function(t,i){S.q=i;if(t.type==="mcq")RUTA.answer(t.correct);else RUTA.answerOral(t.reference,false)});
    S.q=st.test.length-1;RUTA.nextQuestion();
    eq(RUTA.state().view,"result","pantalla de resultado");
    eq(appState.ruta.stars[m.id],3,"3 estrellas");
    ok(RUTA.isUnlocked(1),"la mision 2 se abre");eq(RUTA.currentIndex(),1,"ahora toca la 2");
    eq(appState.ruta.streak.last,today(),"racha de hoy");ok(appState.ruta.streak.days>=1,"dias de racha");
    var mcq=st.test.filter(function(t){return t.type==="mcq"&&t.source.system!==DGAC_KEY});ok(mcq.length,"hay preguntas de alternativas");
    mcq.forEach(function(t){var s=appState.stats[t.source.appId];ok(s&&s.a===1&&s.c===1,"cuenta en estadisticas: "+t.id)});
    eq(JSON.parse(localStorage.getItem(KEY)).ruta.stars[m.id],3,"guardado en el dispositivo");
    RUTA.showCover();
  });
  T("14 RUTA-05 una DGAC de la ruta no toca las estadisticas y una oral se evalua con el motor de Entrevista oral",function(){
    reset();appState.ruta.unlockAll=true;
    var i=RUTA.missions.findIndex(function(m){return m.id==="hid-repaso"}),st=RUTA.stations["hid-repaso"];
    RUTA.startMission(i);var S=RUTA.state();S.view="question";
    var dg=st.test.findIndex(function(t){return t.type==="mcq"&&t.source.system===DGAC_KEY});ok(dg>=0,"el repaso trae una DGAC");
    S.q=dg;RUTA.answer(st.test[dg].correct);ok(!appState.stats[st.test[dg].source.appId],"la DGAC no cuenta");
    var or=st.test.findIndex(function(t){return t.type==="oral"});ok(or>=0,"el repaso trae una oral");
    S.q=or;RUTA.answerOral(st.test[or].reference,false);
    var a=S.answers[or];ok(a&&a.result&&a.result.score>=6&&a.ok,"la respuesta de referencia aprueba con el motor ("+(a&&a.result&&a.result.score)+")");
    ok(/\/10/.test(byId("rtPlayer").textContent)&&/coverage/.test(byId("rtPlayer").textContent),"se muestra el puntaje y la cobertura");
    ok(appState.oralVoice[st.test[or].source.id],"queda registrada en Entrevista oral");
    var j=st.test.findIndex(function(t,k){return t.type==="mcq"&&k!==dg});S.q=j;RUTA.answer(st.test[j].correct);
    S.q=or;S.answers[or]=null;RUTA.answerOral("",false);ok(S.answers[or]&&!S.answers[or].ok,"una oral vacia no aprueba");
    RUTA.showCover();
  });
  T("14 RUTA-06 el segundo intento no cuenta doble y las alternativas DGAC salen en su orden original",function(){
    reset();
    var st=RUTA.stations[RUTA.missions[0].id];RUTA.startMission(0);var S=RUTA.state();S.view="question";
    var t0=st.test[0];S.q=0;RUTA.answer((t0.correct+1)%t0.options.length);
    for(var i=1;i<st.test.length;i++){S.q=i;RUTA.answer(st.test[i].correct)}
    S.q=st.test.length-1;RUTA.nextQuestion();
    eq(appState.ruta.stars[st.id],2,"4 de 5 dan 2 estrellas");
    byId("rtPlayer").querySelector('[data-act="retry"]').click();
    eq(RUTA.state().retry.join(),"0","el segundo intento repite solo la fallada");
    RUTA.answer(t0.correct);
    var s=appState.stats[t0.source.appId];eq(s.a,1,"el segundo intento no suma un intento");eq(s.w,1,"queda el error del primer intento");
    appState.ruta.unlockAll=true;
    var i2=RUTA.missions.findIndex(function(m){return m.id==="hid-repaso"}),st2=RUTA.stations["hid-repaso"];
    RUTA.startMission(i2);var S2=RUTA.state();S2.view="question";S2.q=0;RUTA.answer(st2.test[0].correct);
    var shown=[].map.call(byId("rtPlayer").querySelectorAll(".rt-opt span:last-child"),function(e){return e.textContent});
    eq(shown.join("|"),st2.test[0].options.join("|"),"alternativas en su orden");
    RUTA.showCover();
  });
  T("14 RUTA-07 la portada muestra avance, racha y estrellas; el mapa dibuja 18 misiones con candados, la actual y el avion",function(){
    reset();appState.ruta=sanitizeRuta({stars:{"hid-1":3},streak:{last:today(),days:2}});
    RUTA.showCover();
    ok(/Continue · Station 2/.test(byId("rtRouteTitle").textContent),"Continuar en la estacion 2");
    eq(byId("rtStarTotal").textContent,"3","estrellas");eq(byId("rtStreak").textContent,"2","racha");
    ok(new RegExp("1 of "+RUTA.missions.length+" stations").test(byId("rtRouteCount").textContent),"estaciones hechas");
    RUTA.showMap();
    eq(byId("rtCanvas").querySelectorAll(".rt-node").length,RUTA.missions.length,"estaciones en el mapa");
    eq(byId("rtCanvas").querySelectorAll(".rt-node.rt-locked").length,RUTA.missions.length-2,"con candado (abiertas: la hecha y la siguiente)");
    ok(byId("rtCanvas").querySelector('.rt-node.rt-current[data-m="1"]'),"la actual es la 2");
    ok(byId("rtPlane")&&byId("rtPlane").style.left,"el avion esta sobre la ruta");
    var zonesWithBg=window.ESTACIONES_DATA.route.zones.filter(function(z){return z.bg});
    eq(new Set([].map.call(byId("rtCanvas").querySelectorAll(".rt-panel"),function(p){return p.dataset.zone})).size,zonesWithBg.length,"cada zona con imagen tiene su fondo");
    eq(zonesWithBg.length,7,"los 7 fondos, con la pista de llegada");
    RUTA.showCover();
  });
  T("14 RUTA-08 las nubes de la portada pasan en bucle sin salto, bajo el titulo y los botones, y se detienen con Reducir movimiento",function(){
    reset();RUTA.showCover();
    var c=byId("rtCover"),box=c.querySelector(".rt-clouds");
    ok(box&&box.getAttribute("aria-hidden")==="true","capa de nubes oculta para lectores de pantalla");
    var layers=box?[].slice.call(box.querySelectorAll(".rt-cloud")):[];eq(layers.length,2,"dos capas de nubes");
    eq(getComputedStyle(box).pointerEvents,"none","las nubes no bloquean los toques");
    var zc=+getComputedStyle(box).zIndex,zg=+getComputedStyle(c,"::before").zIndex,zi=+getComputedStyle(c.querySelector(".rt-cover-in")).zIndex;
    ok(zc<zg&&zg<zi,"nubes bajo el degradado y bajo el contenido ("+zc+" < "+zg+" < "+zi+")");
    var frames={},still=false;
    [].forEach.call(document.styleSheets,function(sh){var rules;try{rules=sh.cssRules}catch(e){return}
      [].forEach.call(rules,function(r){
        if(r.type===7)frames[r.name]=r;
        if(r.type===4&&/^\(prefers-reduced-motion:\s*reduce\)$/.test(r.conditionText||"")&&layers.length)[].forEach.call(r.cssRules,function(s){
          if(s.selectorText&&layers.every(function(el){return el.matches(s.selectorText)})&&s.style.getPropertyValue("animation-name")==="none"&&s.style.getPropertyPriority("animation-name")==="important")still=true;
        });
      });
    });
    layers.forEach(function(el){
      var cs=getComputedStyle(el),name=cs.animationName,f=frames[name];
      ok(f,"animacion "+name);if(!f)return;
      eq(cs.animationIterationCount,"infinite","en bucle: "+name);eq(cs.animationTimingFunction,"linear","velocidad pareja: "+name);
      var tile=parseFloat(cs.backgroundSize),last=f.cssRules[f.cssRules.length-1].style,m=/translateX\((-?[\d.]+)px\)/.exec(last.transform);
      eq(last.length,1,"solo se anima el transform (no repinta): "+name);
      ok(m&&Math.abs(+m[1])===tile,"avanza justo una textura ("+(m&&m[1])+" de "+tile+" px), asi no salta al repetirse: "+name);
      ok(Math.abs(parseFloat(cs.left))>=tile,"la capa cubre la pantalla durante todo el recorrido: "+name);
      ok(/assets\/portada\/nubes\.webp/.test(cs.backgroundImage),"usa la textura de nubes: "+name);
    });
    ok(still,"con Reducir movimiento las nubes quedan quietas");
    RUTA.showCover();
  });
  T("14 RUTA-09 al terminar una estacion se vuelve si o si al mapa (sin atajo a la siguiente) y ninguna pantalla de la ruta dice mision",function(){
    reset();
    var MIS=/misi[oó]n/i,seen=[];
    function look(where,el){var t=el.textContent+" "+[].map.call(el.querySelectorAll("[aria-label]"),function(e){return e.getAttribute("aria-label")}).join(" ")+" "+(el.getAttribute("aria-label")||"");if(MIS.test(t))seen.push(where)}
    RUTA.showCover();look("portada",byId("rtCover"));
    RUTA.showMap();look("mapa",byId("rtMap"));
    byId("rtCanvas").querySelector('.rt-node[data-m="0"]').click();look("hoja de la estacion",byId("rtSheet"));
    byId("rtCanvas").querySelector('.rt-node[data-m="1"]').click();look("hoja de una estacion cerrada",byId("rtSheet"));
    RUTA.showCover();byId("rtOpenSettings").click();look("ajustes",byId("rtSheet"));
    var m=RUTA.missions[0],st=RUTA.stations[m.id];RUTA.startMission(0);look("presentacion",byId("rtPlayer"));
    var S=RUTA.state();S.view="question";
    st.test.forEach(function(t,i){S.q=i;if(t.type==="mcq")RUTA.answer(t.correct);else RUTA.answerOral(t.reference,false)});
    S.q=st.test.length-1;RUTA.nextQuestion();look("resultado",byId("rtPlayer"));
    eq(seen.join(", "),"","ninguna pantalla dice mision");
    ok(RUTA.isUnlocked(1),"la siguiente queda abierta");
    var acts=[].map.call(byId("rtPlayer").querySelectorAll("[data-act]"),function(b){return b.dataset.act}).sort().join();
    eq(acts,"exit,tomap","en el resultado solo se puede volver al mapa (o salir): sin boton a la siguiente estacion");
    byId("rtPlayer").querySelector('[data-act="tomap"]').click();
    ok(byId("rtPlayer").hidden&&!byId("rtMap").hidden,"Volver al mapa lleva al mapa");
    RUTA.showCover();
  });
  T("14 RUTA-10 el mapa es una carta: despega por el eje de pista, cada estacion es un VOR/DME con su caja, los tramos traen rumbo y distancia, y termina en la aproximacion a la pista de llegada",function(){
    reset();appState.ruta.unlockAll=true;RUTA.showMap();
    var g=RUTA.geo(),cv=byId("rtCanvas"),W=g.W;
    ok(Math.abs(g.cx-Math.round(W*0.499))<=1,"eje de pista del primer fondo");
    eq(g.route.pts[0].x,g.cx,"la ruta parte en el umbral, sobre el eje");
    var onRwy=RUTA.missions.map(function(m,i){return m.zone==="pista"?i:-1}).filter(function(i){return i>=0});
    eq(onRwy.length,3,"tres estaciones en la pista de salida");
    onRwy.forEach(function(i){eq(g.pts[i].x,g.cx,"estacion "+(i+1)+" sobre el eje de pista")});
    var after=g.sIdx[onRwy[onRwy.length-1]];
    ok(g.route.pts[after+1].x===g.cx&&g.route.pts[after+2].x===g.cx&&g.route.pts[after+2].y<g.route.pts[after+1].y&&g.route.pts[after+1].y<g.pts[onRwy[onRwy.length-1]].y,"pasada la ultima estacion de pista sigue derecho por el eje antes de virar");
    ok(Math.abs(parseFloat(byId("rtPlane").style.left)-g.cx)<1,"el avion espera alineado en la pista");
    var img=byId("rtPlane").querySelector("img");ok(img&&/mapa-avion\.webp/.test(img.getAttribute("src")),"el avion es la imagen nueva");
    var nodes=cv.querySelectorAll(".rt-node");eq(nodes.length,RUTA.missions.length,"una radioayuda por estacion");
    [].forEach.call(nodes,function(n){
      var st=RUTA.stations[RUTA.missions[+n.dataset.m].id],vor=n.querySelector(".rt-vor");
      ok(vor&&n.querySelector(".rt-dme"),"VOR/DME en la estacion "+(+n.dataset.m+1));
      if(vor&&!n.classList.contains("rt-locked"))eq(vor.getAttribute("fill")!=="none",st.kind==="review","relleno solo en los repasos (notificacion obligatoria): estacion "+(+n.dataset.m+1));
    });
    var idents=[].map.call(cv.querySelectorAll(".rt-ident"),function(e){return e.textContent.trim()});
    eq(idents.length,RUTA.missions.length,"una caja por radioayuda");
    idents.forEach(function(t){ok(/^11[2-7]\.\d [A-Z]{3}$/.test(t),"caja con frecuencia de VOR e identificador: "+t)});
    eq(new Set(idents.map(function(t){return t.slice(-3)})).size,idents.length,"identificadores distintos");
    var legs=cv.querySelectorAll(".rt-leg");ok(legs.length>=10,"tramos con datos");
    [].forEach.call(legs,function(l){var c=l.querySelector("b").textContent,v=+c.slice(0,3);ok(/^\d{3}°$/.test(c)&&v>=1&&v<=360,"rumbo de carta: "+c);ok(+l.querySelector("i").textContent>0,"distancia")});
    var leg=cv.querySelector('.rt-leg[data-leg="3"]'),b=g.sIdx[3],p1=g.route.pts[b-1],p2=g.route.pts[b];
    var want=Math.round((Math.atan2(p2.x-p1.x,-(p2.y-p1.y))*180/Math.PI+360)%360)||360;
    ok(leg&&+leg.querySelector("b").textContent.slice(0,3)===want,"el rumbo del primer tramo de aerovia sale de su direccion en el mapa ("+want+")");
    ok(/UA320/.test(cv.textContent),"la aerovia tiene nombre");
    for(var i=onRwy.length;i<g.sIdx.length;i++){var L=g.route.cum[g.sIdx[i]]-g.route.cum[g.sIdx[i-1]];ok(L>=135.5,"tramo "+i+" con espacio para el avion ("+Math.round(L)+" px)")}
    ok(cv.querySelector(".rt-appr")&&cv.querySelectorAll(".rt-rwy").length===2,"aproximacion punteada a la pista de llegada y RWY 36 en las dos pistas");
    RUTA.showCover();
  });
  T("14 RUTA-11 una materia nueva no cierra lo ya ganado, y una zona con muchas estaciones se alarga en vez de amontonarlas",function(){
    reset();var M=RUTA.missions;appState.ruta=sanitizeRuta({stars:{}});appState.ruta.stars[M[1].id]=3;
    eq(RUTA.currentIndex(),0,"toca la primera, que quedo sin hacer (como una estacion nueva intercalada)");
    ok(RUTA.isUnlocked(1),"la estacion ya ganada sigue abierta aunque la anterior no tenga estrellas");
    ok(RUTA.isUnlocked(2),"y la que sigue a una ganada tambien");ok(!RUTA.isUnlocked(3),"las demas siguen cerradas");
    RUTA.showMap();var cv=byId("rtCanvas");
    ok(!cv.querySelector('.rt-node[data-m="1"]').classList.contains("rt-locked"),"en el mapa la ganada no tiene candado");
    var count={};M.forEach(function(m){count[m.zone]=(count[m.zone]||0)+1});
    Object.keys(count).forEach(function(z){
      var panels=[].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone===z});
      ok(count[z]<=5*panels.length,"zona "+z+": "+count[z]+" estaciones en "+panels.length+" fondo(s)");
      ok(panels.length%2===1,"zona "+z+": numero impar de fondos, para que la union con la siguiente calce");
      panels.forEach(function(p,i){eq(!!p.querySelector(".rt-flip"),i%2===1,"zona "+z+": copia "+(i+1)+(i%2?" al reves":" derecha"))});
    });
    ok([].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone==="tormenta"}).length>1,"la tormenta, con mas de 5 estaciones, se alarga");
    eq([].filter.call(cv.querySelectorAll(".rt-panel"),function(p){return p.dataset.zone==="pista"||p.dataset.zone==="llegada"}).length,2,"las pistas no se repiten");
    RUTA.showCover();
  });

  T("14 RUTA-12 materias, estaciones y fichas con titulo en ingles; el texto de las clases en espanol neutro, sin modismos",function(){
    var subj={};RUTA.missions.forEach(function(m){subj[m.subject]=1});
    var ES=/^(La|El|Los|Las|Un|Una|Cada|Qué|Cómo|Cuándo|Dónde|Quién|Para|Si|Con|Sin|En|Del|Tres|Dos|Cinco|Toda|Todo)\b|^[¿¡]|[áéíóúñ]/;
    var titles=[];Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];titles.push([k,st.title]);st.cards.forEach(function(c){titles.push([c.id,c.title])})});
    (window.ESTACIONES_DATA.subjects||[]).forEach(function(s){titles.push([s.id,s.title])});
    var bad=titles.filter(function(p){return ES.test(p[1])});
    eq(bad.length,0,"titulos en espanol: "+JSON.stringify(bad.slice(0,5)));
    var REG=/\bal tiro\b|\bo sea\b|\brecién\b|\bapret[a-z]*|\bcañer[ií]a|\bestanque\b|\bbota[nr]?\b|\bOjo:|\bharto\b|\bnomás\b|\bpartimos por\b|\bletra chica\b/i;
    var hits=[];Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];
      [st.goal,st.intro].concat(st.cards.map(function(c){return [c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" ")})).forEach(function(s){var m=String(s).match(REG);if(m)hits.push(k+": "+m[0])});
    });
    eq(hits.length,0,"modismos en las clases: "+hits.slice(0,5).join(" | "));
  });

  T("14 UI-01 la interfaz esta en ingles: la pagina, la portada, el inicio del banco y la ficha de estacion sin textos en espanol (el contenido de las clases y preguntas sigue en espanol)",function(){
    var ES=/[áéíóúñ¿¡]|\b(Banco|Portada|Inicio|Estación|Estaciones|Empezar|Continuar|Siguiente|Anterior|Salir|Guardar|Repaso|Preguntas|preguntas|precisión|Ruta|Todas|secciones|días|seguidos|Entrevista|Inglés|Sistemas|errores|copia|Restaurar|Crear|fichas|estrellas)\b/;
    function check(root,where){var bad=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
      while((n=w.nextNode())){var p=n.parentNode;if(!p||/^(SCRIPT|STYLE)$/.test(p.nodeName))continue;var s=n.nodeValue.trim();if(s&&ES.test(s))bad.push(s)}
      [].forEach.call(root.querySelectorAll("[aria-label],[placeholder],[title]"),function(el){["aria-label","placeholder","title"].forEach(function(k){var v=el.getAttribute(k);if(v&&ES.test(v))bad.push(k+": "+v)})});
      eq(bad.length,0,where+" en espanol: "+JSON.stringify(bad.slice(0,6)));}
    // 1. la pagina tal como se publica (sin contenido cargado)
    var x=new XMLHttpRequest();x.open("GET",location.href.split("#")[0],false);x.send();
    var page=new DOMParser().parseFromString(x.responseText,"text/html");check(page.body,"index.html");
    // 2. lo que la app dibuja al abrir
    reset();renderHome();RUTA.showCover();check(byId("rtCover"),"portada");check(byId("home"),"inicio del banco");
    // 3. la ficha de una estacion en el mapa
    var M=RUTA.missions,ix=M.findIndex(function(m){return m.id==="ele-1"});
    RUTA.showMap();byId("rtCanvas").querySelector('.rt-node[data-m="'+ix+'"]').click();
    var sheet=byId("rtSheet").textContent;
    ok(/Station /.test(sheet)&&/ cards/.test(sheet)&&/ questions/.test(sheet),"la ficha de la estacion habla en ingles: "+sheet.slice(0,160));
    ok(!/Estación|fichas|preguntas|Empezar|Cerrar/.test(sheet),"sin restos en espanol en la ficha: "+sheet.slice(0,160));
    RUTA.showCover();
  });
  T("14 REG-07 el segundo segmento empieza con el tren arriba, no a 35 ft (pregunta de entrevista corregida)",function(){
    var q=SYSTEMS.interview_technical.questions.find(function(x){return x.q.indexOf("Dentro de los segmentos de despegue")===0});
    ok(q,"existe la pregunta del segundo segmento");
    var a=q.options[q.correct];
    ok(!/desde 35 ft/.test(a)&&/tren queda arriba/.test(a)&&/400 ft/.test(a)&&/V2/.test(a),"alternativa correcta: "+a);
    ok(!/desde los 35 ft/.test(q.expl)&&/2,4/.test(q.expl),"explicacion: "+q.expl.slice(0,80));
  });
  T("14 RUTA-13 Performance: 13 estaciones con el repaso al final, y cada pregunta muestra su origen (entrevista o examen DGAC) sin nombrar documentos",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="performance"});
    eq(P.length,13,"estaciones de Performance");eq(P[P.length-1].id,"perf-repaso","el repaso de Performance va al final");
    reset();appState.ruta.unlockAll=true;
    function badgeFor(stId,pick){
      var i=RUTA.missions.findIndex(function(m){return m.id===stId}),st=RUTA.stations[stId];
      var ti=st.test.findIndex(pick);ok(ti>=0,"hay una pregunta asi en "+stId);
      RUTA.startMission(i);var S=RUTA.state();S.view="question";S.q=ti;RUTA.render();
      var b=byId("rtPlayer").querySelector(".rt-origin");return b?b.textContent:"";
    }
    eq(badgeFor("perf-2",function(t){return t.type==="mcq"&&t.source.system==="interview_technical"}),"Interview question","alternativa de entrevista");
    eq(badgeFor("perf-7",function(t){return t.type==="mcq"&&t.source.system===DGAC_KEY}),"DGAC exam","pregunta del examen DGAC");
    eq(badgeFor("perf-4",function(t){return t.type==="oral"}),"Interview question","pregunta oral");
    eq(badgeFor("hid-1",function(t){return t.type==="mcq"&&t.source.system==="hydraulic"}),"","una pregunta del banco de sistemas no lleva etiqueta");
    var txt=byId("rtPlayer").textContent;ok(!/FCOM|FCTM|Tutorial|Getting to Grips|PDF/.test(txt),"la pantalla no nombra documentos");
    RUTA.showCover();
  });

  T("14 RUTA-14 Tren de aterrizaje: 12 estaciones con el repaso al final; el steering se enseña por MSN (Green en los mas antiguos, Yellow en los mas nuevos) y ninguna estacion usa las 3 preguntas DGAC que responden segun los aviones antiguos",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="tren"});
    eq(P.length,12,"estaciones de Tren de aterrizaje");eq(P[P.length-1].id,"tren-repaso","el repaso va al final");
    var nws=RUTA.stations["tren-4"];ok(nws,"existe la estacion del steering");
    var body=nws.cards.map(function(c){return c.body}).join(" ");
    ok(/\*\*Green\*\* en los MSN más antiguos/.test(body)&&/\*\*Yellow\*\* en los más nuevos/.test(body),"el steering por MSN: Green en los mas antiguos y Yellow en los mas nuevos");
    var viejas=SYSTEMS[DGAC_KEY].questions.filter(function(q){return /WHAT OTHER SYSTEMS WILL BE INOPERATIVE|WILL NOSE WHEEL STEERING BE AVAILABLE|SUPPLIES PRESSURE TO THE NOSE WHEEL STEERING/.test(q.q)});
    eq(viejas.length,3,"las 3 preguntas DGAC del steering");
    var ids=viejas.map(function(q){return qid(DGAC_KEY,q)});
    var usadas=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta DGAC del steering antiguo: "+usadas.join(", "));
  });
  T("14 REG-08 las 3 preguntas DGAC del steering conservan la respuesta del examen y su explicacion aclara que es Green en los MSN mas antiguos y Yellow en los mas nuevos",function(){
    var Q=SYSTEMS[DGAC_KEY].questions;
    function one(re){var h=Q.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]}
    var a=one(/WHAT OTHER SYSTEMS WILL BE INOPERATIVE/),b=one(/WILL NOSE WHEEL STEERING BE AVAILABLE/),c=one(/SUPPLIES PRESSURE TO THE NOSE WHEEL STEERING/);
    eq(a.options[a.correct],"NOSE WHEEL STEERING ONLY.","clave de la 1");eq(b.options[b.correct],"NO.","clave de la 2");eq(c.options[c.correct],"GREEN.","clave de la 3");
    [a,b,c].forEach(function(q){ok(/MSN más antiguos/.test(q.expl)&&/MSN más nuevos/.test(q.expl)&&/Yellow/.test(q.expl)&&!/flota/.test(q.expl),"explicacion: "+q.expl.slice(0,70))});
  });

  T("14 REG-09 ninguna pregunta del banco menciona los Tutorials (enunciado, alternativas ni explicacion) y las estaciones muestran el enunciado del banco tal cual",function(){
    var bad=[];
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){
      [q.q,q.expl||"",q.scenario_q||""].concat(q.options).forEach(function(s){if(/tutorial/i.test(s))bad.push(k+"#"+i+": "+String(s).slice(0,60))});
    })});
    eq(bad.length,0,"menciones a los Tutorials: "+bad.slice(0,4).join(" | "));
    var ops=SYSTEMS.operations_airbus.questions;
    ok(!ops.some(function(q){return /(mostrad[ao]|descrit[ao]|declarado) por Airbus/.test(q.q)}),"ningun enunciado atribuye la tecnica a Airbus como fuente");
    var rto=ops.find(function(q){return q.q.indexOf("Una vez detenido el avión tras un RTO")===0});
    ok(rto&&/ATC/.test(rto.expl)&&!/no incluye notificar/.test(rto.expl),"el flow despues del RTO incluye avisar al ATC");
    var mal=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){
      if(x.source&&x.source.system==="operations_airbus"){var q=findById(x.source.appId);if(!q||q.q!==x.question)mal.push(k+"/"+x.id)}
    })});
    eq(mal.length,0,"estaciones con un enunciado de operaciones distinto del banco: "+mal.join(", "));
  });

  function rtCard(st,title){var s=RUTA.stations[st];ok(s,"existe la estacion "+st);var c=s.cards.find(function(x){return x.title===title});ok(c,"ficha "+st+" · "+title);return c}
  T("15 REG-10 frenos: el triple indicator separa la aguja del accumulator de las de los frenos, el parking brake no es una reserva aparte y todo lo que dice que el autobrake no aplica una presion fija aclara que MAX frena a fondo",function(){
    var S=RUTA.stations;
    var tri=rtCard("tren-5","The triple indicator").body;
    ok(/ACCU/.test(tri)&&/accumulator/.test(tri)&&/BRAKES L y R/.test(tri)&&/solo marcan presión cuando \*\*Yellow\*\*/.test(tri),"el triple indicator: la aguja ACCU por un lado y los frenos, que solo marcan presion con Yellow");
    var txt=[];Object.keys(S).forEach(function(k){S[k].cards.forEach(function(c){txt.push(k+": "+[c.body,c.keyIdea,c.more||""].join(" "))})});
    var esc=txt.filter(function(s){return /→\s*parking brake/i.test(s)});
    eq(esc.length,0,"el parking brake como un escalon mas despues del accumulator: "+esc.join(" | ").slice(0,160));
    ok(/misma reserva/.test(rtCard("tren-5","Accumulator and parking brake").body),"el parking brake usa la misma reserva que el alternate");
    var corpus=txt.slice();
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){corpus.push(k+"#"+i+": "+(q.expl||""))})});
    ORAL_VOICE_BANK.forEach(function(q){corpus.push(q.id+": "+q.reference)});
    var sin=corpus.filter(function(s){return /presi[oó]n fija/i.test(s)&&!/MAX/.test(s)});
    eq(sin.length,0,"autobrake sin la salvedad de MAX: "+sin.join(" | ").slice(0,200));
    ok(!/más antiguos/.test(rtCard("tren-7","The three modes").more||""),"el LO de 1,7 m/s² no es solo de los aviones mas antiguos");
  });
  T("15 REG-11 tren: el giro de 180° da los 24 m del A320 junto a la pista de 30 m, y el tren que no se traba separa el recycle del ECAM de la L/G GRAVITY EXTENSION (los 4 recycles y la manivela hasta el tope)",function(){
    var g=rtCard("tren-8","The 180° turn on a runway").body;
    ok(/\*\*30 m\*\*/.test(g)&&/24 m/.test(g),"la clase: pista de 30 m y unos 24 m de giro");
    var q=SYSTEMS.operations_airbus.questions.find(function(x){return x.q.indexOf("Para un giro de 180° en pista")===0});
    ok(q&&q.options[q.correct]==="30 m"&&/24 m/.test(q.expl),"la pregunta del giro: clave 30 m y explicacion con los 24 m");
    var r=rtCard("tren-9","Recycle").body;
    ok(/procedimiento del ECAM pide primero un \*\*recycle\*\*/.test(r),"primero, el recycle del procedimiento del ECAM");
    ok(/GRAVITY EXTENSION\*\*\.\s+Ese procedimiento, si hay tiempo, permite hasta \*\*4 recycles\*\*/.test(r),"los 4 recycles son de la L/G GRAVITY EXTENSION, no del recycle del ECAM");
    ok(/tope mecánico/.test(rtCard("tren-9","Gravity extension").body),"la manivela: hasta el tope mecanico");
  });
  T("15 RUTA-15 dibujos: los que mezclaban ideas se separaron (Tren, Performance y el pitch y el yaw de Controles; cada ficha tiene el suyo) y todos tienen descripcion",function(){
    var S=RUTA.stations;
    var want={"tren-1":["tren-mando.svg","tren-quien-frena.svg"],"tren-2":["tren-secuencia.svg","tren-velocidades.svg"],"tren-5":["tren-frenado.svg","tren-triple.svg"],"perf-11":["perf-drift-down.svg","perf-ruta-net.svg"],"perf-12":["perf-aterrizaje.svg","perf-aterrizaje-vuelo.svg"],"ctl-2":["ctl-cabeceo.svg","ctl-alabeo.svg"],"ctl-7":["ctl-guinada.svg"]};
    Object.keys(want).forEach(function(k){
      var files=S[k].cards.filter(function(c){return c.diagram}).map(function(c){return c.diagram.src.split("/").pop()});
      want[k].forEach(function(f){ok(files.indexOf(f)>=0,k+" usa "+f)});
    });
    var sinAlt=[],viejo=[];
    Object.keys(S).forEach(function(k){S[k].cards.forEach(function(c){
      if(!c.diagram)return;
      if(!(c.diagram.alt&&c.diagram.alt.length>40))sinAlt.push(k);
      if(/tren-arquitectura/.test(c.diagram.src))viejo.push(k);
    })});
    eq(sinAlt.length,0,"dibujos sin descripcion: "+sinAlt.join(", "));
    eq(viejo.length,0,"todavia se usa el dibujo que mezclaba tren y frenos: "+viejo.join(", "));
  });
  T("15 REG-12 auditoria de las clases contra el FCOM (1.21.0): flare, reset del trim, media velocidad de flaps y slats, wing tip brakes, tren anormal, RTO con ATC, viento de cola al 150% y explicaciones del banco",function(){
    var fm=rtCard("ctl-4","Ground and flare modes").body;
    ok(/tirar suavemente del sidestick/.test(fm)&&!/hacer un flare suave/.test(fm),"flare: hay que tirar suavemente del sidestick");
    ok(/2,5° por más de 5 segundos/.test(fm),"reset del trim: con el pitch bajo 2,5° por mas de 5 s");
    var rl=rtCard("ctl-repaso","On landing").body;
    ok(/tirando suavemente/.test(rl)&&/2,5°/.test(rl),"repaso: el flare y el reset del trim");
    ok(/solo van a media velocidad las superficies que usan ese sistema/.test(rtCard("ctl-9","Two SFCCs working together").body),"sin un hidraulico, solo va a media velocidad lo que usa ese sistema");
    var wtb=rtCard("ctl-9","High-lift protections").body;
    ok(/solo el sistema afectado\*\*, en las dos alas/.test(wtb)&&/El otro sigue funcionando/.test(wtb),"wing tip brakes: el sistema afectado, en las dos alas, y el otro sigue");
    var ab=rtCard("tren-9","Landing with abnormal gear").body;
    ok(/\*\*Sin autobrake\*\*/.test(ab)&&/nose gear anormal: sin reversa/.test(ab),"tren anormal: nunca autobrake; con el nose gear, sin reversa");
    ok(/avisa a ATC/.test(rtCard("perf-5","Flying the RTO").body),"RTO: el F/O avisa a ATC");
    ok(!/no depende de un motor/.test(rtCard("hid-1","What pressurizes each system").body),"la bomba del Blue usa la energia AC del avion");
    var tw=ORAL_VOICE_BANK.find(function(q){return q.id==="ov_tailwind_takeoff"});
    ok(tw&&/150%/.test(tw.reference)&&!/se calcula con el viento real\./.test(tw.reference),"oral de viento de cola: el calculo cuenta el 150%");
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    ok(!/bomba hidráulica movida por otra bomba/.test(bq("hydraulic","¿Qué es correcto sobre la Power Transfer Unit").expl),"PTU: un motor y una bomba, no dos bombas");
    ok(/100 kt/.test(bq("hydraulic","¿Qué condición provoca el despliegue automático del RAT").expl),"RAT automatico: sobre 100 kt");
    ok(/en las dos alas/.test(bq(DGAC_KEY,"THE WING TIP BRAKES, ONCE ACTIVATED").expl),"wing tip brakes en el banco");
    ok(/2,5°/.test(bq(DGAC_KEY,"HORIZONTAL STABILIZER TRIM AUTOMATICALLY RESETS").expl),"reset del THS en el banco");
  });
  T("15 REG-13 el steering se enseña por MSN (Green en los mas antiguos, Yellow en los mas nuevos) y ningun texto afirma lo que tiene 'la mayor parte de la flota': el manual solo da MSN",function(){
    var corpus=[];
    Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];
      corpus.push(k+": "+st.goal+" "+st.intro);
      st.cards.forEach(function(c){corpus.push(c.id+": "+[c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" "))});
      st.test.forEach(function(t){corpus.push(t.id+": "+[t.explanation||"",t.reference||""].join(" "))});
    });
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q,i){corpus.push(k+"#"+i+": "+(q.expl||""))})});
    ORAL_VOICE_BANK.forEach(function(q){corpus.push(q.id+": "+q.reference+" "+(q.short||""))});
    var flota=corpus.filter(function(s){return /(mayor parte|mayoría|buena parte|parte) de la flota|flota actual|aviones de la flota|antiguos de la flota/i.test(s)});
    eq(flota.length,0,"afirmaciones sobre la flota: "+flota.join(" | ").slice(0,220));
    var nws=corpus.filter(function(s){return /steering/i.test(s)&&/(usa|da|alimenta)\W+(\w+\W+){0,3}\**Yellow/i.test(s)&&!/más nuevos/.test(s)});
    eq(nws.length,0,"el steering con Yellow sin decir que es en los MSN mas nuevos: "+nws.join(" | ").slice(0,220));
    var c=rtCard("tren-9","After a gravity extension");
    ok(/MSN más antiguos/.test(c.body)&&/se pierde/.test(c.body)&&/más nuevos/.test(c.body)&&/sigue disponible/.test(c.body),"despues de la gravedad: el steering se pierde en los MSN antiguos y sigue en los nuevos");
  });
  T("15 REG-21 lote 009 de Codex: en la oral de arquitectura electrica, nombrar las piezas sin relacionarlas no cumple los criterios obligatorios",function(){
    var A=ORAL_VOICE_BANK.filter(function(x){return x.id==="ov_elec_arch"})[0];
    var r=evaluateLocally(A,"gen 1 tr 1 hot bus emer gen");ok(r.detected.length===0&&r.score<2,"solo palabras: "+r.score+", cumple "+JSON.stringify(r.detected));
    var ok1=evaluateLocally(A,"GEN 1 y GEN 2 alimentan el AC BUS 1 y el AC BUS 2; el APU GEN o el external power pueden reemplazarlos y el BUS TIE une las barras. Los TR convierten AC a DC para las barras DC. Las baterías están siempre conectadas a su HOT BUS. Sin generadores principales y sobre 100 kt, el RAT presuriza el azul, que mueve el EMER GEN, y este alimenta el AC ESS BUS; si tampoco hay EMER GEN, el static inverter convierte DC en AC desde la BAT 1.");
    ok(ok1.score>=9&&!ok1.errors.length,"respuesta correcta corta: "+ok1.score+" "+JSON.stringify(ok1.missing));
    var ok2=evaluateLocally(A,"Cada motor tiene su generador: los generadores de los motores alimentan las barras AC. Los transformadores rectificadores pasan la AC a DC. El HOT BUS siempre está unido a las baterías. Si se pierde todo, el RAT mueve el EMER GEN, que alimenta lo esencial, y luego el inversor estático.");
    ok(ok2.score>=6.5&&!ok2.errors.length,"respuesta correcta con otro orden: "+ok2.score+" "+JSON.stringify(ok2.missing));
    var st=RUTA.stations["ele-repaso"].test.filter(function(t){return t.source&&t.source.id==="ov_elec_arch"})[0];ok(JSON.stringify(st.relations)===JSON.stringify(A.relations)&&st.concepts.length===A.concepts.length,"la estacion de repaso trae la rubrica nueva");
  });
  T("15 REG-20 lote 008 de Codex (Electrico): 140 kt es la minima del procedimiento, no el umbral de stall; la luz FAULT no se da por transitoria; HF 1 opcional",function(){
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    var corpus=[];
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q){corpus.push(k+": "+q.options.join(" ")+" "+(q.expl||""))})});
    Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];st.cards.forEach(function(c){corpus.push(c.id+": "+[c.body,c.keyIdea,c.diagram?c.diagram.alt:""].join(" "))});st.test.forEach(function(t){corpus.push(t.id+": "+[t.explanation||"",t.reference||""].join(" "))})});
    ORAL_VOICE_BANK.forEach(function(q){corpus.push(q.id+": "+q.reference)});
    function nada(re,msg){var h=corpus.filter(function(s){return re.test(s)});eq(h.length,0,msg+": "+h.join(" | ").slice(0,220))}
    nada(/por eso[^.]{0,40}140 kt|140 kt[^.]{0,60}para que no se detenga|por debajo de aproximadamente 140 kt/i,"140 kt presentado como umbral de stall");
    nada(/(EMER GEN|emergency generator) (todavía|aún) no (alimenta|está suministrando)|condición transitoria/i,"la luz FAULT dada por transitoria");
    nada(/VHF 1, HF 1 y ATC 1/,"HF 1 sin decir que depende del avion");
    ok(/125 kt/.test(correctText(bq("interview_technical","¿Qué puede provocar que el RAT")))&&/mínima/.test(correctText(bq("interview_technical","¿Qué puede provocar que el RAT"))),"alternativa del RAT: minima de 140 y 125 kt");
    ok(/la luz sola no dice la causa/.test(bq(DGAC_KEY,"IN CRUISE, YOU HAVE SUDDENLY A MASTER WARNING").expl),"H014 en la explicacion DGAC");
    var E=ORAL_VOICE_BANK.filter(function(q){return q.id==="ov_elec_emer"})[0];var v=evaluateLocally(E,E.reference);ok(v.score>=9.5&&!v.errors.length,"oral de ELEC EMER CONFIG: la referencia saca "+v.score);
  });
  T("15 REG-19 lotes 005-007 de Codex (Electrico): static inverter monofasico, contexto de las preguntas DGAC, windmilling, DC BUS Ent, AC ESS FEED en los dos sentidos, 50 kt y chequeo de baterias",function(){
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    var c1=rtCard("ele-1","AC and DC");
    ok(/static inverter entrega una AC distinta: monofásica, de \*\*115 V\*\*/.test(c1.body)&&/generadores y el external power es trifásica/.test(c1.body),"AC: trifasica de los generadores, monofasica del static inverter");
    ok(/monofásica, de 115 V/.test(c1.diagram.alt)&&!/la entregan los generadores, el external power y el static inverter/.test(c1.diagram.alt),"dibujo AC/DC: el inverter no aparece con 115/200 V");
    ok(/supone que el external power está alimentando/.test(bq(DGAC_KEY,"HAVING STARTING THE APU").expl),"H008: la explicacion dice de que situacion parte la pregunta");
    ok(/windmilling/.test(bq(DGAC_KEY,"ARE THERE ANY LIMITATIONS ASSOCIATED WITH DISCONNECTING AN IDG").expl),"H009: windmilling");
    var h10=bq(DGAC_KEY,"IF BOTH ENGINE GENERATORS ARE POWERING THE SYSTEM");ok(/DC BUS Ent/.test(h10.expl),"H010: excepcion del DC BUS Ent en el banco");
    var st=RUTA.stations["ele-5"].test.filter(function(t){return t.question.indexOf("IF BOTH ENGINE GENERATORS")===0})[0];ok(st&&/DC BUS Ent/.test(st.explanation),"H010: y en la estacion");
    var h11=bq(DGAC_KEY,"AN AC ESS FEED SWITCH").expl;ok(!/no al revés/.test(h11)&&/vuelve|de nuevo energía del AC BUS 1/.test(h11),"H011: al volver a normal, de nuevo el AC BUS 1");
    ok(/C\/B TRIPPED/.test(bq(DGAC_KEY,"HOW MANY TIMES CAN YOU RESET A CIRCUIT BREAKER?").expl)&&/En tierra/.test(bq(DGAC_KEY,"HOW MANY TIMES CAN YOU RESET A CIRCUIT BREAKER?").expl),"H012: vuelo y tierra separados");
    ok(/sobre 50 kt/.test(rtCard("ele-1","Loss of all main generators").diagram.alt)&&/sobre 50 kt/.test(rtCard("ele-1","Generate, distribute, convert").diagram.alt),"BAT 1 al AC ESS BUS: sobre 50 kt");
    ok(/BAT pb en OFF, voltaje sobre 25\.5 V, y de nuevo en AUTO/.test(rtCard("ele-6","Low battery charge").body),"el segundo chequeo tambien con BAT en OFF");
    ok(/N2 bajo 14 %/.test(rtCard("ele-5","IDG FAULT light").body),"FAULT del IDG: N2 bajo 14 %");
    ok(/No quiere decir que la batería quede cargada al 100 %/.test(bq(DGAC_KEY,"BOTH BATTERIES ARE CHARGED BY THE EXTERNAL").expl),"20 min: ciclo de carga, no carga completa");
    ok(/El contactor de BAT 1, que maneja su BCL/.test(rtCard("ele-6","Two batteries and their hot buses").diagram.alt),"dibujo de baterias: el contactor lo maneja el BCL");
  });
  T("15 REG-18 auditoria de Electrico: los 30 min del BCL se enseñan sin elegir si son al conectar o al desconectar (REG-19); fuentes sin contradiccion; orales electricas penalizan lo falso; explicaciones sin causas inventadas",function(){
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    var c2=rtCard("ele-7","When charging starts"),c3=rtCard("ele-7","When charging ends");
    ok(/26\.5 V/.test(c2.body)&&!/30 min/.test(c2.body),"la carga empieza bajo 26.5 V");
    ok(/4 A/.test(c3.body)&&/en tierra, el BCL actúa \*\*de inmediato\*\*; en vuelo, con una \*\*demora de 30 min\*\*/.test(c3.body),"tierra inmediato, vuelo con una demora de 30 min, sin decir si es al conectar o al desconectar");
    var p=bq("electrical","En la carga de las baterías por el BCL");eq(correctText(p),"En tierra es inmediato; en vuelo hay una demora de 30 min","pregunta del BCL");
    var corpus=[];
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q){corpus.push(k+": "+q.q+" "+q.options.join(" ")+" "+(q.expl||""))})});
    Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];st.cards.forEach(function(c){corpus.push(c.id+": "+[c.body,c.example||"",c.more||"",c.keyIdea,c.diagram?c.diagram.alt:""].join(" "))});st.test.forEach(function(t){corpus.push(t.id+": "+[t.question||"",t.explanation||"",t.reference||""].join(" "))})});
    function nada(re,msg){var h=corpus.filter(function(s){return re.test(s)});eq(h.length,0,msg+": "+h.join(" | ").slice(0,200))}
    nada(/(desconecta|desconectarla)[^.]{0,40}30 min|30 min (después|antes de desconectar)/i,"30 min aplicados a la desconexion");
    nada(/(conecta|conectarla)[^.]{0,30}(después de|tras) 30 min|espera media hora|en vuelo, después de 30 min/i,"30 min aplicados a la conexion");
    nada(/se shed /,"«se shed» mezcla idiomas");
    nada(/Así se evita mantener|Esto evita usar innecesariamente|energía aerodinámica suficiente|participa en la generación AC/,"causas sin fuente o «generacion» de la BAT 1");
    var c=rtCard("ele-1","The sources and what they can power");
    ok(/La única excepción es el \*\*DC BUS Ent\*\*/.test(c.body)&&!/Si queda un solo engine generator, alimenta todo menos/.test(c.body),"fuentes: una sola regla con su excepcion");
    var r=bq("interview_technical","¿Qué puede provocar que el RAT");ok(/125 kt/.test(correctText(r))&&!/^Volar por debajo de aproximadamente 140 kt/.test(correctText(r)),"RAT: 140 kt es el minimo, alimenta hasta unos 125 kt");
    ok(/C\/B TRIPPED/.test(bq(DGAC_KEY,"HOW MANY TIMES CAN YOU RESET A CIRCUIT BREAKER?").expl),"C/B: la explicacion cita la regla del procedimiento");
    var A=ORAL_VOICE_BANK.filter(function(q){return q.id==="ov_elec_arch"})[0],E=ORAL_VOICE_BANK.filter(function(q){return q.id==="ov_elec_emer"})[0];
    ok(/todos los generadores principales/.test(A.question)&&/100 kt/.test(A.reference)&&/BAT 1 alimenta el AC ESS BUS/.test(A.reference)&&!/\bla (AC ESS|DC BAT|DC ESS) BUS/.test(A.reference),"oral de arquitectura: generadores principales, 100 kt, BAT 1 y «el … BUS»");
    ok(/140 kt/.test(E.reference)&&/VHF 1, HF 1 \(en los aviones que lo tienen\) y ATC 1/.test(E.reference)&&!/dos riesgos distintos/.test(E.reference),"oral de ELEC EMER CONFIG: 140 kt y equipos concretos");
    [[A,A.reference],[E,E.reference]].forEach(function(x){var v=evaluateLocally(x[0],x[1]);ok(v.score>=9.5&&!v.errors.length,x[0].id+": la referencia saca "+v.score)});
    [[A,A.reference.replace("sin conectar nunca dos generadores en paralelo","conectando los dos generadores en paralelo"),"generadores en paralelo"],
     [A,A.reference.replace("el EMER GEN alimenta el AC ESS BUS","el EMER GEN alimenta el AC BUS 1 y el AC BUS 2"),"EMER GEN a las barras principales"],
     [A,A.reference.replace("El APU GEN o el EXT PWR pueden reemplazar a cualquiera de los generadores de motor","El APU GEN no puede reemplazar a los generadores de motor"),"APU GEN no reemplaza"],
     [E,"El RAT alimenta la red esencial por el emergency generator, con radio y navegación limitadas. Hay gravity feed, evitar G negativas, y la velocidad mínima es 100 kt.","minimo 100 kt"],
     [E,"El RAT alimenta la red esencial por el emergency generator, con radio y navegación limitadas. Hay gravity feed, hay que evitar G positivas, y no bajar de 140 kt.","G positivas"],
     [E,"El APU alimenta el emergency generator y la red esencial, con radio y navegación limitadas. Gravity feed, evitar G negativas, mínimo 140 kt.","EMER GEN por el APU"],
     [E,"Tengo el RAT y el emergency generator, todos los equipos de radio y navegación siguen disponibles. Gravity feed, evitar G negativas, mínimo 140 kt.","todos los equipos"]
    ].forEach(function(x){ok(x[1]!==x[0].reference,x[2]+": el reemplazo no aplico");ok(evaluateLocally(x[0],x[1]).errors.length>0,x[2]+": no se penalizo")});
  });
  T("15 REG-17 cierre de la auditoria de Hidraulico: PTU actua cuando la diferencia supera 500 PSI, y ningun texto da una causa sin fuente para los 2500 PSI del RAT",function(){
    function bq(sys,pre){var h=SYSTEMS[sys].questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    var p=bq("hydraulic","¿A partir de qué diferencial de presión");
    ok(/supera 500 PSI/.test(p.expl)&&/(PTU pb en AUTO)/.test(p.expl)&&!/500 PSI menos/.test(p.expl),"PTU: supera 500 PSI, con el pb en AUTO");
    var corpus=[];
    Object.keys(SYSTEMS).forEach(function(k){(SYSTEMS[k].questions||[]).forEach(function(q){corpus.push(k+": "+q.q+" "+(q.expl||""))})});
    Object.keys(RUTA.stations).forEach(function(k){var st=RUTA.stations[k];st.cards.forEach(function(c){corpus.push(c.id+": "+[c.body,c.example||"",c.more||"",c.keyIdea].join(" "))});st.test.forEach(function(t){corpus.push(t.id+": "+[t.explanation||"",t.reference||""].join(" "))})});
    var causa=corpus.filter(function(s){return /2500|2 500/.test(s)&&/menor capacidad|menos potencia|menor potencia|turbina e[oó]lica/i.test(s)});
    eq(causa.length,0,"textos con una causa sin fuente: "+causa.join(" | ").slice(0,240));
  });
  T("15 REG-14 lote 001 de Hidraulico: la pregunta de presion pide las dos condiciones con una sola correcta, el oral no da los 3000 PSI por decir 2500 y los case drain filters si filtran",function(){
    function bq(pre){var h=SYSTEMS.hydraulic.questions.filter(function(q){return q.q.indexOf(pre)===0});eq(h.length,1,"pregunta "+pre);return h[0]}
    var p=bq("¿Qué combinación indica correctamente la presión normal");
    ok(/RAT/.test(p.q),"el enunciado pide la presion con RAT");
    eq(correctText(p),"3000 PSI; Blue con RAT: 2500 PSI","respuesta correcta");
    eq(p.options.filter(function(o){return /^3000 PSI/.test(o)&&/2500 PSI/.test(o)}).length,1,"una sola alternativa da 3000 normal y 2500 con RAT");
    ok(p.options.every(function(o){return /RAT/.test(o)}),"todas las alternativas responden las dos condiciones");
    var rt=RUTA.stations["hid-1"].test.filter(function(t){return t.question===p.q});eq(rt.length,1,"la estacion hid-1 usa la pregunta corregida");
    var o=ORAL_VOICE_BANK.filter(function(q){return q.id==="ov_hyd_arch"})[0];
    var it=o.concepts.filter(function(c){return c.label==="Presión normal 3000 PSI"})[0];
    function det(txt){var n=normalizeAeroText(txt);return itemDetected(n.split(" ").filter(Boolean),n,it)}
    ok(!det("2500 psi")&&!det("La presión normal es 2500 psi"),"2500 PSI no cumple el criterio de presion normal");
    ok(det("3000 psi")&&det("normal 3000 PSI; Blue con RAT 2500 PSI"),"3000 PSI si lo cumple");
    ok(!det("No recuerdo la presión"),"sin presion no hay credito");
    var f=bq("¿Para qué sirven los case drain filters");
    ok(/filtran el fluido/.test(f.expl)&&!/no cumplen una función|sino de diagnóstico/.test(f.expl),"case drain filters: filtran y ademas sirven para el diagnostico");
  });
  T("15 RUTA-16 Combustible: 10 estaciones con el repaso al final; el center tank se enseña por MSN (bombas en los mas antiguos, jet pumps y transfer valves sin bombas en los mas nuevos), el fuel used vuelve a cero al arrancar el motor en tierra y ninguna estacion usa las preguntas DGAC que el FCOM no respalda tal como estan",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="combustible"});
    eq(P.length,10,"estaciones de Combustible");eq(P[P.length-1].id,"ful-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    var uno=body("ful-1");ok(/MSN más antiguos \(hasta el 06183\):\*\* el center tank tiene \*\*dos bombas\*\*/.test(uno)&&/MSN más nuevos \(desde el 06286\):\*\* el center tank \*\*no tiene bombas\*\*/.test(uno),"panorama: el center tank por MSN");
    ok(/hasta el 06183/.test(body("ful-3"))&&/desde el 06286/.test(body("ful-4"))&&/jet pump/.test(body("ful-4")),"una clase para cada version del center tank");
    var fu=RUTA.stations["ful-8"].test.find(function(t){return /FUEL USED INDICATION/.test(t.question)});
    ok(fu&&/al arrancar el motor en tierra/.test(fu.explanation)&&!/al energizar eléctricamente/.test(fu.explanation),"fuel used: vuelve a cero al arrancar el motor en tierra");
    var malas=SYSTEMS[DGAC_KEY].questions.filter(function(q){return /FUEL PUMPS IN EACH A-320 FUEL TANK|WHY DO THE CENTER TANK PUPS STOP|THE WING FUEL TRANSFER VALVES ARE:|FUEL CAN BE TRANSFERRED FROM TANK TO TANK|WITH THE CENTER TANK PUMP MODE SEL SWITCH IN AUTO/.test(q.q)});
    eq(malas.length,5,"las 5 preguntas DGAC de combustible que no se usan");
    var ids=malas.map(function(q){return qid(DGAC_KEY,q)}),usadas=[];
    Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta DGAC de combustible no respaldada: "+usadas.join(", "));
  });
  T("15 REG-22 explicaciones de combustible: el fuel used vuelve a cero al arrancar el motor en tierra, el inner lleno si detiene la bomba del center tank, las bombas por tanque y la logica AUTO se explican por MSN, y el center tank de los A320 antiguos tambien alimenta directo",function(){
    var G=SYSTEMS[DGAC_KEY].questions;
    function one(re){var h=G.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]||{expl:"",options:[]}}
    var fu=one(/THE FUEL USED INDICATION ON ECAM IS RESET/);
    eq(fu.options[fu.correct],"AUTOMATICALLY AT ENGINE START ON THE GROUND.","clave del fuel used");
    ok(/al arrancar el motor en tierra/.test(fu.expl)&&!/al energizar eléctricamente/.test(fu.expl),"fuel used: "+fu.expl.slice(0,70));
    var st=one(/CAUSE THE CENTER TANK FUEL PUMPS TO STOP/);
    ok(/500 kg/.test(st.expl)&&!/ni por una condición de sobrellenado/.test(st.expl),"inner lleno: detiene la bomba hasta gastar unos 500 kg");
    var nb=one(/FUEL PUMPS IN EACH A-320 FUEL TANK/);
    eq(nb.options[nb.correct],"2","clave de las bombas por tanque");
    ok(/06183/.test(nb.expl)&&/06286/.test(nb.expl)&&/outer tanks no tienen bombas/.test(nb.expl),"bombas por tanque explicadas por MSN");
    var au=one(/CENTER TANK PUMP MODE SEL SWITCH IN AUTO/);
    ok(/nivel bajo/.test(au.expl)&&/06183/.test(au.expl),"logica AUTO: 5 minutos despues del nivel bajo");
    var act=SYSTEMS.fuel.questions.find(function(q){return q.q.indexOf("En una configuración de combustible equipada con ACT")===0});
    ok(act&&/06183/.test(act.expl)&&/06286/.test(act.expl),"tanques que alimentan a los motores, por MSN");
  });
  T("15 RUTA-17 Aire acondicionado y neumatico: 14 estaciones con el repaso al final; el control de temperatura se enseña por MSN (zone controller hasta el 02321, ACSC desde el 02572), el bleed separa los A320neo, y ninguna estacion usa las preguntas DGAC de los MSN antiguos o no respaldadas; el banco ya no pregunta por el ECON FLOW (A321)",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="aire"});
    eq(P.length,14,"estaciones de Aire acondicionado");eq(P[P.length-1].id,"air-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    var t=body("air-6");ok(/hasta el 02321\):\*\* un \*\*zone controller\*\*/.test(t)&&/desde el 02572\):\*\* dos \*\*ACSC\*\*/.test(t),"temperatura: zone controller hasta el 02321 y ACSC desde el 02572");
    ok(/\*\*45 PSI\*\*/.test(body("air-2"))&&/A320neo/.test(body("air-2")),"bleed: 45 PSI y el caso de los A320neo");
    var G=SYSTEMS[DGAC_KEY].questions;
    var malas=G.filter(function(q){return /^UNDER WHAT CONDITIONS SHOULD THE PACK FLOW CONTROLLER BE SET TO LOW|^TEMPERATURE REGULATION FOR THE A-320 IS CONTROLLED BY|^PACK CONTROLLER, |^WHAT HAPPENS WHEN A TEMPERATURE SELECTOR ROTARY KNOB/.test(q.q)});
    eq(malas.length,6,"las 6 preguntas DGAC de aire que no se usan");
    var ac=SYSTEMS.air_cond.questions.filter(function(q){return /ECON FLOW/.test(q.q)});
    eq(ac.length,0,"ninguna pregunta del banco de aire habla del ECON FLOW, que es de los A321");
    var ids=malas.map(function(q){return qid(DGAC_KEY,q)}),usadas=[];
    Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta de aire no respaldada o de otro avion: "+usadas.join(", "));
  });
  T("15 REG-23 banco de aire acondicionado: claves DGAC del avion real (minimum idle automatica, despresurizacion al tocar tierra, las dos formas de intervenir), PACK FLOW en vez de ECON FLOW, enunciados sin el FCOM y explicaciones por MSN",function(){
    var G=SYSTEMS[DGAC_KEY].questions,A=SYSTEMS.air_cond.questions;
    function one(L,re){var h=L.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]||{q:"",options:[],expl:""}}
    var e=one(G,/^ENGINE FLOW DEMAND, WHEN THE HEATING/);eq(e.options[e.correct],"THE MINIMUM IDLE IS INCREASED AUTOMATICALLY.","engine flow demand: la minimum idle sube sola");
    var d=one(G,/^WHEN DOES NORMAL DEPRESSURIZATION OCCUR/);eq(d.options[d.correct],"ON LANDING TOUCHDOWN.","despresurizacion: al tocar tierra");ok(/55 segundos/.test(d.expl)&&/500 ft\/min/.test(d.expl),"despresurizacion: 500 ft/min y 55 s");
    var i=one(G,/^PRESSURIZATION IS NORMALLY AUTOMATIC. CAN YOU INTERFERE/);eq(i.options[i.correct],"BOTH ARE CORRECT.","intervenir: las dos formas");
    ok(!/11,300|11 300/.test(one(G,/^AT WHAT CABIN ALTITUDE DO YOU GET AN ECAM WARNING/).expl),"9 550 ft: sin los 11 300 ft sin respaldo");
    ok(!/preservar presión/.test(one(G,/^WHAT HAPPENS TO THE PACK FLOW CONTROL VALVES DURING ENGINE START/).expl),"arranque: sin una razon que el manual no da");
    G.filter(function(q){return /^PACK CONTROLLER, |^TEMPERATURE REGULATION FOR THE A-320|^WHAT HAPPENS WHEN A TEMPERATURE SELECTOR/.test(q.q)}).forEach(function(q){ok(/02321/.test(q.expl)&&/02572/.test(q.expl),"explicacion por MSN: "+q.q.slice(0,40))});
    eq(A.filter(function(q){return /ECON FLOW/.test(q.q+" "+q.options.join(" ")+" "+q.expl)}).length,0,"el banco de aire no habla del ECON FLOW");
    eq(A.filter(function(q){return /PACK FLOW/.test(q.q)}).length,4,"las 4 preguntas del selector PACK FLOW");
    eq(A.filter(function(q){return /FCOM|effectivity auditada/.test(q.q)}).length,0,"ningun enunciado de aire nombra el FCOM ni la effectivity");
  });
  T("15 RUTA-18 APU y powerplant: 10 estaciones con el repaso al final; el EPR se enseña como parametro de los IAE (CFM y PW usan N1), los motores y el APU AVAIL van por version, y ninguna estacion usa las preguntas DGAC que el manual no respalda tal como estan",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="apu"});
    eq(P.length,10,"estaciones de APU y powerplant");eq(P[P.length-1].id,"apu-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    var e=body("apu-3");ok(/\*\*IAE V2500:\*\* el \*\*EPR\*\*/.test(e)&&/\*\*CFM56 y PW1100G:\*\* el \*\*N1\*\*/.test(e),"parametro de empuje: EPR en los IAE, N1 en los CFM y PW");
    ok(/IAE V2500-A5/.test(e)&&/CFM56-5B/.test(e)&&/PW1100G-JM/.test(e),"los tres motores");
    var ep=RUTA.stations["apu-3"].test.find(function(t){return /THE NORMAL MODE TO SET THRUST/.test(t.question)});
    ok(ep&&/IAE/.test(ep.explanation)&&/N1/.test(ep.explanation)&&!/CEO/.test(ep.explanation),"explicacion del EPR por motor");
    ok(/sobre 95 %/.test(body("apu-2"))&&/99,5 %/.test(body("apu-2")),"APU AVAIL segun el avion");
    var G=SYSTEMS[DGAC_KEY].questions;
    var malas=G.filter(function(q){return /^MAXIMUM ALTITUDE FOR APU BLEED OPERATION|^THE APU BLEED VALVE IS AUTOMATICALLY CLOSED ABOVE|^FIRE ON GROUND OR IN FLIGHT WILL CAUSE THE APU MASTER|^DURING AN AUTOMATIC START SEQUENCE, SELECTING THE ENG MASTER/.test(q.q)});
    eq(malas.length,4,"las 4 preguntas DGAC de APU y motores que no se usan");
    var ids=malas.map(function(q){return qid(DGAC_KEY,q)}),usadas=[];
    Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta DGAC no respaldada: "+usadas.join(", "));
  });
  T("15 REG-24 banco de APU y powerplant: el EPR y la ignicion continua se explican por motor, las preguntas DGAC dudosas aclaran lo que dice el manual, y ninguna explicacion nombra el FCOM ni agrega razones sin respaldo",function(){
    var G=SYSTEMS[DGAC_KEY].questions.filter(function(q){return q.bank_section==="APU and powerplant"}),A=SYSTEMS.apu_powerplant.questions;
    function one(L,re){var h=L.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]||{q:"",options:[],expl:""}}
    var e=one(G,/^THE NORMAL MODE TO SET THRUST IS/);eq(e.options[e.correct],"EPR.","clave del EPR sin cambio");ok(/IAE/.test(e.expl)&&/N1/.test(e.expl)&&!/CEO/.test(e.expl),"EPR: solo los IAE");
    ok(/IAE/.test(one(G,/^CONTINUOUS IGNITION IS AUTOMATICALLY PROVIDED/).expl),"ignicion continua: lista de los IAE");
    var b=one(G,/^MAXIMUM ALTITUDE FOR APU BLEED OPERATION/).expl;ok(/22 500/.test(b)&&/15 000/.test(b),"APU bleed: los tres techos");
    ok(/no describe/.test(one(G,/^THE APU BLEED VALVE IS AUTOMATICALLY CLOSED ABOVE/).expl),"23 000 ft: el manual no lo describe");
    ok(/ENG MODE/.test(one(G,/^DURING AN AUTOMATIC START SEQUENCE, SELECTING THE ENG MASTER/).expl),"ENG MASTER: las pack valves las cierra el ENG MODE");
    var mal=G.concat(A).filter(function(q){return /FCOM|choque térmico|tren de nariz|certificado|pérdida eléctrica total|estrés térmico/.test(q.q+" "+q.expl)}).map(function(q){return q.q.slice(0,40)});
    eq(mal.length,0,"textos con el FCOM o razones sin respaldo: "+mal.join(" | "));
  });
  T("15 RUTA-19 Proteccion contra fuego: 10 estaciones con el repaso al final; el test del APU de mas de 3 s puede apagarlo, las botellas de carga van por MSN, y ninguna estacion usa las preguntas DGAC que el manual no respalda tal como estan",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="fuego"});
    eq(P.length,10,"estaciones de Proteccion contra fuego");eq(P[P.length-1].id,"fir-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    ok(/\*\*más de 3 segundos\*\*, el APU \*\*puede apagarse solo\*\*/.test(body("fir-6")),"test del APU: mas de 3 s puede apagarlo");
    var c=body("fir-7");ok(/\*\*hasta el 11597\*\*/.test(c)&&/\*\*desde el 11629\*\*/.test(c),"botellas de carga por MSN");
    ok(/\*\*AGENT 1\*\* después de \*\*10 segundos\*\*/.test(body("fir-8")),"ENG FIRE: AGENT 1 a los 10 s");
    var G=SYSTEMS[DGAC_KEY].questions;
    var malas=G.filter(function(q){return /^WHEN THE AIRCRAFT IS ON THE GROUND AND THE APU IS STARTED ON BETTERY|^IN ADDITION TO THE CRC AND RED MASTER WARN LIGHT, A GOOD ENGINE FIRE TEST|^IN THE EVENT THAT THE AFT CARGO COMPARTMENT SMOKE DETECTOR, DETECTS SMOKE/.test(q.q)});
    eq(malas.length,3,"las 3 preguntas DGAC de fuego que no se usan");
    var ids=malas.map(function(q){return qid(DGAC_KEY,q)}),usadas=[];
    Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&ids.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta DGAC no respaldada: "+usadas.join(", "));
  });
  T("15 REG-25 banco de fuego: el test del APU de mas de 3 s puede apagarlo (clave YES), las preguntas DGAC dudosas aclaran lo que dice el manual, las botellas de carga van por MSN, y ningun texto de fuego nombra el FCOM",function(){
    var G=SYSTEMS[DGAC_KEY].questions,F=SYSTEMS.fire.questions,P=SYSTEMS.procedures.questions;
    function one(L,re){var h=L.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]||{q:"",options:[],expl:""}}
    var t=one(G,/^WILL AN APU FIRE TEST SHUT/);eq(t.options[t.correct],"YES.","test del APU: puede apagarlo");ok(/3 segundos/.test(t.expl),"explicacion con los 3 s");
    ok(/no lo explica/.test(one(G,/^WHEN THE AIRCRAFT IS ON THE GROUND AND THE APU IS STARTED ON BETTERY/).expl),"APU con baterias: lo que dice el manual");
    ok(/No menciona la página ENGINE/.test(one(G,/^IN ADDITION TO THE CRC AND RED MASTER WARN LIGHT/).expl),"test de motor: sin la pagina ENGINE");
    ok(/no detalla el MASTER WARN/.test(one(G,/^IN THE EVENT THAT THE AFT CARGO COMPARTMENT SMOKE DETECTOR, DETECTS/).expl),"humo de bodega: luz SMOKE y ECAM");
    var b=one(G,/^WITH REFERENCE TO CARGO COMPARTMENT FIRE EXTINGUISHING/).expl;ok(/11597/.test(b)&&/11629/.test(b),"botellas de carga por MSN");
    var fuego=F.concat(G.filter(function(q){return q.bank_section==="Fire protection"})).concat([4,5,6,7,8,15,16,17,18].map(function(i){return P[i]}));
    var mal=fuego.filter(function(q){return /FCOM|DSC-\d|circuito esencial|sistemas alimentados por AC/.test(q.q+" "+q.expl)}).map(function(q){return q.q.slice(0,40)});
    eq(mal.length,0,"textos de fuego que nombran el FCOM o dan razones sin respaldo: "+mal.join(" | "));
  });
  T("15 REG-26 lote 011 de Codex (ctl-4): el flare del A320 es a 50 ft (los 100 ft son de otro grupo, A321), en high speed el THS no siempre se congela, y el rotation mode tiene sus condiciones",function(){
    var st=RUTA.stations["ctl-4"];ok(st,"existe ctl-4");if(!st)return;
    var c3=st.cards[2].body,c4=st.cards[3],todo=st.cards.map(function(c){return [c.body,c.more||"",c.example||""].join(" ")}).join(" ");
    ok(!/100 ft/.test(c4.body+" "+(c4.more||"")),"sin el flare a 100 ft en la clase del A320");
    ok(/memoriza la actitud de pitch a 50 ft/.test(c4.more||""),"memorizacion a 50 ft");
    ok(/11° nose up/.test(c3)&&/MSN más antiguos/.test(c3),"high speed: en algunos MSN antiguos el THS queda limitado hasta 11° nose up");
    ok(/10 segundos después del despegue/.test(c4.more||"")&&/8°/.test(c4.more||"")&&/puede superar/.test(c4.more||""),"rotation mode con sus condiciones");
    ok(/Green o Yellow/.test(c4.body),"reset del trim: necesita Green o Yellow");
    ok(/tiende a seguir/.test(todo)&&/flight mode, fuera de las protecciones/.test(todo),"ley de g: flight mode y tendencia");
  });
  T("15 REG-27 lote 012 de Codex (ctl-5): en high speed el bank maximo es 40 o 20 grados segun el avion, el roll rate baja a 7,5 grados/s en los A320neo con proteccion de AOA o pitch, y la pregunta DGAC de roll explica por que la C es la mas precisa",function(){
    function txt(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return [c.body,c.keyIdea||"",c.more||"",c.diagram?c.diagram.alt:""].join(" ")}).join(" "):""}
    var c5=txt("ctl-5"),c6=txt("ctl-6");
    ok(c5.indexOf("a **20°** en los demás A320neo")>=0&&c5.indexOf("MSN 12226")>=0,"ctl-5: high speed 40 o 20 por MSN");
    ok(!/a 40° con la protección de high speed/.test(c5),"ctl-5: sin el 40 general");
    ok(c6.indexOf("en los A320neo, a 20°, salvo el MSN 12226")>=0,"ctl-6: high speed 40 o 20");
    ok(c5.indexOf("**7,5° por segundo**")>=0,"ctl-5: roll rate 7,5 en los A320neo");
    var F=SYSTEMS.flight_control.questions,G=SYSTEMS[DGAC_KEY].questions;
    var r=F.filter(function(q){return /^¿Cuál es el roll rate máximo aproximado/.test(q.q)});eq(r.length,1,"pregunta del roll rate");
    if(r[0]){ok(/en condiciones normales\?$/.test(r[0].q),"roll rate: en condiciones normales");eq(r[0].options[r[0].correct],"15°/s","clave 15");ok(/7,5°\/s/.test(r[0].expl),"explica los 7,5");}
    var d=G.filter(function(q){return /^ROLL CONTROL IN NORMAL LAW IS ACHIEVED WITH/.test(q.q)});eq(d.length,1,"pregunta DGAC de roll");
    if(d[0]){eq(d[0].correct,2,"clave C");ok(/La B no es falsa/.test(d[0].expl),"explica la B");}
    var b=F.filter(function(q){return /^¿Qué bank angle máximo puede comandarse/.test(q.q)})[0];ok(b&&/20°/.test(b.expl)&&/12226/.test(b.expl),"bank maximo: high speed por MSN");
  });
  T("15 RUTA-22 Indicacion: 9 estaciones con el repaso al final; pantallas, DMC y boton ALL por MSN, las fases con sus inhibiciones, el ND por defecto en ROSE NAV 80 NM, y ninguna estacion usa la pregunta del ALL cada un segundo",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="indicacion"});
    eq(P.length,9,"estaciones de Indicacion");eq(P[P.length-1].id,"ind-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    var b1=body("ind-1"),b3=body("ind-3"),b5=body("ind-5"),b8=body("ind-8");
    ok((b1.indexOf("**MSN 01143 a 02321:** de tubo (CRT)")>=0)&&(b1.indexOf("**Desde el MSN 02572:** de cristal líquido (LCD)")>=0),"pantallas CRT o LCD por MSN");
    ok((b1.indexOf("**la pantalla genera la imagen**")>=0),"DMC por MSN");
    ok((b3.indexOf("**T.O INHIBIT:** fases 3, 4 y 5")>=0)&&(b3.indexOf("**LDG INHIBIT:** fases 7 y 8")>=0),"inhibiciones por fase");
    ok((b5.indexOf("cada **3 segundos**")>=0),"ALL cada 3 s desde el 02572");
    ok((b8.indexOf("**ROSE NAV, 80 NM**")>=0),"ND por defecto");
    var I=SYSTEMS.indicating.questions,mala=I.filter(function(q){return /^¿Qué hace mantener presionado ALL/.test(q.q)}).map(function(q){return qid("indicating",q)});
    eq(mala.length,1,"la pregunta del ALL");
    var usadas=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&mala.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa la pregunta del ALL cada un segundo: "+usadas.join(", "));
  });
  T("15 REG-28 banco de Antihielo: las preguntas que valen para un grupo dicen cual, las explicaciones no inventan razones ni nombran el FCOM, la de la lluvia no dice que el bleed calienta las ventanas, y la oral ov_icing distingue engine y wing anti-ice",function(){
    var I=SYSTEMS.ice_rain.questions,G=SYSTEMS[DGAC_KEY].questions.filter(function(q){return q.bank_section==="Ice and rain protection"});
    function one(L,re){var h=L.filter(function(q){return re.test(q.q)});eq(h.length,1,"pregunta "+re);return h[0]||{q:"",options:[],expl:""}}
    var e=one(I,/^En un A320neo, en ELEC EMER CONFIG/);ok(e.expl.indexOf("IAE o CFM")>=0,"ELEC EMER: explica los IAE o CFM");
    var g=one(I,/^En un A320 con motores IAE, ¿qué ocurre con la ignición/);ok(g.expl.indexOf("A320neo")>=0,"ignicion: explica los otros aviones");
    ok(one(G,/^IN THE EVENT OF AN ELECTRICAL POWER LOSS:/).expl.indexOf("A320neo")>=0,"DGAC sin energia: aclara el A320neo");
    ok(one(G,/^WITH THE LOSS OF ELECTRICAL POWER THE ENGINE ANTI-ICE VALVES/).expl.indexOf("A320neo")>=0,"DGAC valvulas sin energia: aclara el A320neo");
    ok(one(G,/^WHAT HAPPENS WHEN EITHER ENGINE ANTI-ICE IS OPEN\?/).expl.indexOf("motores IAE")>=0,"DGAC encendido continuo: IAE");
    ok(one(G,/^WITH REFERENCE TO THE PROBE\/WINDOW HEAT PUSHBUTTON/).expl.indexOf("sí tiene AUTO")>=0,"DGAC: el pushbutton tiene AUTO");
    ok(one(G,/^RAIN PROTECTION IS PROVIDED BY/).expl.indexOf("se calientan con electricidad")>=0,"lluvia: las ventanas son electricas");
    var mal=I.concat(G).filter(function(q){return /FCOM|flujo de aire|enfriamiento|riesgo térmico|priorizando|ingestión de hielo|evitando una descarga|carga aerodinámica/.test(q.expl)}).map(function(q){return q.q.slice(0,40)});
    eq(mal.length,0,"explicaciones con razones sin respaldo o que nombran el FCOM: "+mal.join(" | "));
    var o=ORAL_VOICE_BANK.filter(function(q){return q.id==="ov_icing"})[0];ok(o,"existe ov_icing");if(!o)return;
    var bien=evaluateLocally(o,"Hay condiciones de engelamiento con 10 grados o menos y humedad visible. El engine anti-ice lo enciendo cuando se esperan esas condiciones, sin esperar a ver hielo, salvo en ascenso y crucero con SAT bajo menos 40. El wing anti-ice lo enciendo si hay evidencia de hielo en el indicador visual o en los wipers.");
    ok(bien.score>=8,"respuesta correcta: puntaje "+bien.score);
    var malr=evaluateLocally(o,"Lo enciendo solo cuando veo hielo en el parabrisas.");
    ok(malr.score<=4,"respuesta incorrecta: puntaje "+malr.score);
  });
  T("15 RUTA-21 ctl-8 explica que hace el avion con el bank al soltar el sidestick en cada ley: normal mantiene hasta 33 y vuelve a 33, high speed vuelve a 0, alternate y direct no corrigen el bank, abnormal attitude con roll directo",function(){
    var st=RUTA.stations["ctl-8"];ok(st,"existe ctl-8");if(!st)return;
    var c=st.cards.filter(function(x){return x.title==="Releasing the sidestick, law by law"})[0];ok(c,"ficha de soltar el sidestick");if(!c)return;
    var b=c.body;
    ok((b.indexOf("lo devuelve solo a **33°**")>=0)&&(b.indexOf("lo devuelve a **0°**")>=0),"normal y high speed");
    ok((b.indexOf("**No hay bank angle protection**")>=0)&&(b.indexOf("el sistema no mantiene ni corrige el bank")>=0),"alternate y direct: nadie corrige el bank");
    ok((b.indexOf("**125°**")>=0),"abnormal attitude con 125");
    ok(c.diagram&&/ctl-soltar.svg$/.test(c.diagram.src),"diagrama de soltar el sidestick");
    var ids=st.test.map(function(t){return t.question});ok(ids.some(function(q){return /^WHAT HAPPENS IF YOU RELEASE THE STICK AT 40/.test(q)}),"pregunta DGAC de soltar a 40 grados en la prueba");
  });
  T("15 RUTA-20 Antihielo y lluvia: 8 estaciones con el repaso al final; el engine anti-ice se enseña por motor (IAE o CFM, A320neo), el encendido continuo es de los IAE, y ninguna estacion usa las preguntas que solo valen para un grupo de aviones",function(){
    var P=RUTA.missions.filter(function(m){return m.subject==="antihielo"});
    eq(P.length,8,"estaciones de Antihielo y lluvia");eq(P[P.length-1].id,"ice-repaso","el repaso va al final");
    function body(id){var st=RUTA.stations[id];ok(st,"existe "+id);return st?st.cards.map(function(c){return c.body}).join(" "):""}
    var e=body("ice-3");
    ok((e.indexOf("**A320 con motores IAE o CFM:** las válvulas **abren solas**")>=0)&&(e.indexOf("**A320neo:** las dos PRSOV **siguen funcionando**")>=0),"ELEC EMER CONFIG por motor");
    ok((e.indexOf("motores **IAE**, además")>=0),"encendido continuo: IAE");
    ok((e.indexOf("**SAT bajo -40 °C**")>=0),"ENG ANTI ICE: excepcion con SAT bajo -40");
    ok((body("ice-6").indexOf("**230 kt**")>=0),"wipers hasta 230 kt");
    ok((body("ice-5").indexOf("**TAT no se calientan**")>=0),"TAT sin calefaccion en tierra");
    var I=SYSTEMS.ice_rain.questions,G=SYSTEMS[DGAC_KEY].questions;
    eq(I.filter(function(q){return /^En un A320neo, en ELEC EMER CONFIG|^En un A320 con motores IAE, ¿qué ocurre con la ignición/.test(q.q)}).length,2,"las preguntas de un solo grupo dicen a que aviones aplican");
    var malas=G.filter(function(q){return /^IN THE EVENT OF AN ELECTRICAL POWER LOSS:/.test(q.q)}).map(function(q){return qid(DGAC_KEY,q)});
    eq(malas.length,1,"la pregunta DGAC repetida del engine anti-ice sin energia");
    var usadas=[];Object.keys(RUTA.stations).forEach(function(k){RUTA.stations[k].test.forEach(function(x){if(x.source&&malas.indexOf(x.source.appId)>=0)usadas.push(k+"/"+x.id)})});
    eq(usadas.length,0,"una estacion usa una pregunta que vale solo para un grupo: "+usadas.join(", "));
  });
