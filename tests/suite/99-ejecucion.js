/* Fragmento de la batería de regresión: tests/run.ps1 une tests/suite/*.js en orden de nombre dentro de una sola función (la abre 00-arnes.js, con los ayudantes T, ok, eq, reset…, y la cierra 99-ejecucion.js). */
  /* ---------- Ejecucion ---------- */
  async function run(){
    var res={total:tests.length,passed:0,failed:0,failures:[],errs:(window.__errs||[]).slice()};
    for(var i=0;i<tests.length;i++){
      try{await tests[i].fn();res.passed++}
      catch(e){res.failed++;res.failures.push({name:tests[i].name,message:String(e&&e.message||e)})}
    }
    try{reset()}catch(e){}
    res.errs=(window.__errs||[]).slice();
    return res;
  }
  run().then(function(res){
    byId("__test_results").textContent=JSON.stringify(res);
  },function(e){
    byId("__test_results").textContent=JSON.stringify({total:tests.length,passed:0,failed:tests.length,failures:[{name:"suite",message:String(e&&e.message||e)}],errs:[]});
  });
})();
