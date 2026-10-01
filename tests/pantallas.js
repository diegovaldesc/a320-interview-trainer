/* Recorrido de pantallas para comprobar que un cambio interno no cambia nada a la vista (ver TESTING.md,
   seccion 13). Con el azar fijo, abre 14 pantallas y guarda de cada una el HTML y, por elemento, el estilo
   calculado y su caja. Se corre en cada version con
     tests\run.ps1 -Script tests\pantallas.js -Width 390 -Height 844
   y las dos salidas se comparan con tests\comparar_pantallas.js. No forma parte de la app publicada. */
(function(){
  var out={errors:(window.__errs||[]).slice(),screens:{},facts:{},steps:[]};
  var seed=20261001;
  Math.random=function(){seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff;return seed/0x80000000};
  var VER=typeof APP_VERSION==="string"?APP_VERSION:"";
  var PROPS=["display","visibility","position","color","backgroundColor","backgroundImage","fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textTransform","padding","margin","border","borderRadius","boxShadow","width","height","opacity","gap","gridTemplateColumns","flexDirection","alignItems","justifyContent","overflow","zIndex","transform"];
  /* La version de la app cambia en cada entrega: se reemplaza para que no cuente como diferencia. */
  function clean(s){return VER?s.split(VER).join("<VER>"):s}
  function snap(name){
    try{
      var clone=document.body.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll("script,#__test_results"),function(n){n.remove()});
      var css=[];
      Array.prototype.forEach.call(document.body.querySelectorAll("*"),function(el){
        if(el.tagName==="SCRIPT"||el.closest("#__test_results"))return;
        var cs=getComputedStyle(el),row=[el.tagName+(el.id?"#"+el.id:"")+(el.className&&typeof el.className==="string"?"."+el.className.trim().replace(/\s+/g,"."):"")];
        PROPS.forEach(function(p){row.push(cs[p])});
        var r=el.getBoundingClientRect();
        row.push(cs.display==="none"?"":[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(","));
        css.push(row.join("|"));
      });
      /* Los espacios al final del body dependen de cuantas etiquetas <script> haya: no se ven. */
      out.screens[name]={html:clean(clone.innerHTML).replace(/\s+$/,""),css:clean(css.join("\n")),scrollH:document.documentElement.scrollHeight};
      out.steps.push(name);
    }catch(e){out.steps.push(name+" ERROR "+e.message)}
  }
  function step(name,fn){try{fn();snap(name)}catch(e){out.steps.push(name+" FAILED "+e.message)}}
  function visible(id){var el=document.getElementById(id);return !!el&&!el.classList.contains("hidden")}
  snap("home");
  step("systemsFolder",function(){openSystemsFolder()});
  step("detail",function(){openSystem("hydraulic")});
  step("quiz",function(){goHome();startQuickTest()});
  step("quiz-answered",function(){selectOption(0)});
  step("results",function(){
    for(var k=0;k<40&&visible("quiz");k++){
      var s=session;if(s&&s.answers&&s.answers[s.index]==null)selectOption(1);
      nextQuestion();
    }
  });
  step("weak",function(){goHome();showWeak()});
  step("interview",function(){goHome();startInterview()});
  step("oralVoice",function(){goHome();startOralVoice()});
  step("ntk",function(){goHome();openNeedToKnow()});
  step("ntkCard",function(){ntkStart()});
  step("englishHub",function(){goHome();openEnglish()});
  step("englishPractice",function(){enRunUnit()});
  step("home-after",function(){goHome()});
  try{
    out.facts={bankVersion:BANK_VERSION,fingerprint:BANK_FINGERPRINT,total:totalQuestions(),dgac:dgacTotal(),tech:interviewTechnicalTotal(),
      oral:ORAL_VOICE_BANK.length,english:[ENGLISH.mcq.length,ENGLISH.images.length,ENGLISH.listening.length,ENGLISH.roleplays.length,ENGLISH.pruebas.length].join("/"),
      health:JSON.stringify(bankIntegrity()),systems:Object.keys(SYSTEMS).join(","),
      title:document.title,bodyBg:getComputedStyle(document.body).backgroundColor};
  }catch(e){out.facts.error=e.message}
  out.errorsAfter=(window.__errs||[]).slice();
  document.getElementById("__test_results").textContent=JSON.stringify(out);
})();
