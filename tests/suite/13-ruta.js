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
  T("14 RUTA-02 contenido: las estaciones de Hidraulico, Electrico, Controles de vuelo, Performance y Tren de aterrizaje, cada pregunta se enseña en su estacion, es la del banco y nada visible cita un manual",function(){
    eq(RUTA.missions.length,window.ESTACIONES_DATA.route.missions.length,"estaciones de la ruta");ok(RUTA.missions.length>=54,"al menos las 54 estaciones de Hidraulico, Electrico, Controles de vuelo, Performance y Tren de aterrizaje");
    var subj={};RUTA.missions.forEach(function(m){subj[m.subject]=1});eq(Object.keys(subj).sort().join(),"controles,electrico,hidraulico,performance,tren","materias");
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

