/* Lógica de la app. index.html carga antes los bancos: data/banco.js, data/ingles.js y data/oral.js. */
const SYSTEM_ORDER=["procedures","hydraulic","air_cond","electrical","flight_control","landing_gear","autoflight","apu_powerplant","fuel","fire","ice_rain","comms_oxygen","indicating"];
const OPERATIONS_ORDER=["operations_airbus"];
const INTERVIEW_TECH_KEY="interview_technical";
const DGAC_KEY="dgac_bank";
const TEST_SIZE=20, INTERVIEW_SIZE=10;
const APP_VERSION="1.15.0";
const BANK_VERSION="2026.10.05 · DGAC 573";
const STATE_SCHEMA=1;
const LETTERS="ABCDEFGH".split("");
let RAW_SYSTEMS;
try{
  const parsedBank=JSON.parse(window.SYSTEMS_DATA_JSON);
  if(!parsedBank||typeof parsedBank!=="object"||Array.isArray(parsedBank))throw new Error("Estructura raíz del banco inválida");
  RAW_SYSTEMS=parsedBank;
}catch(bankLoadError){
  document.body.innerHTML='<div style="padding:28px 20px;font-family:-apple-system,system-ui,sans-serif;max-width:420px;margin:15vh auto 0;text-align:center;color:#1B2329"><h1 style="font-size:17px;margin:0 0 8px">No se pudo cargar el banco de preguntas</h1><p style="color:#666;font-size:14px;line-height:1.5;margin:0 0 16px">Los datos de la aplicación no se leyeron correctamente. Recarga la página; si el problema sigue, es probable que la última actualización publicada tenga un error.</p><button onclick="location.reload()" style="padding:10px 22px;border-radius:10px;border:1px solid #ccc;background:#fff;font-size:14px;cursor:pointer">Recargar</button></div>';
  console.error("Fallo al cargar data/banco.js:",bankLoadError);
  throw bankLoadError;
}
const $=id=>document.getElementById(id);

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function plural(n,one,many){return n===1?one:many}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim()}
function stemKey(s){return norm(String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi," "))}
const CONFLICT_STEMS=new Set(["if the spd mach knob on the fcu is not pulled within a predetermined time to engage selected speed"]);
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)^s.charCodeAt(i);return (h>>>0).toString(36)}
function qid(sys,q){return sys+":"+hash(norm(q.q))}
function totalQuestions(){return SYSTEM_ORDER.reduce((n,k)=>n+(SYSTEMS[k]?.questions||[]).length,0)}
function operationsQuestions(){return OPERATIONS_ORDER.reduce((n,k)=>n+(SYSTEMS[k]?.questions||[]).length,0)}
function dgacTotal(){return (SYSTEMS[DGAC_KEY]?.questions||[]).length}
function interviewTechnicalTotal(){return (SYSTEMS[INTERVIEW_TECH_KEY]?.questions||[]).length}
function isDgacKey(k){return k===DGAC_KEY}
function isInterviewTechKey(k){return k===INTERVIEW_TECH_KEY}
function systemName(k){return k===null?"Todos los sistemas":(SYSTEMS[k]?.name||k)}
function systemAta(k){return k===null?"ALL":(SYSTEMS[k]?.ata||"—")}
function correctText(q){return q.options?.[q.correct] ?? ""}
function isStructurallyValid(q){
  return !!q&&!!q.q&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length;
}
function safePool(pool){return (pool||[]).filter(isStructurallyValid)}

function enrich(){
  const out={};
  Object.entries(RAW_SYSTEMS).forEach(([k,s])=>{
    if(!isPlainObject(s))return;
    const qs=Array.isArray(s.questions)?s.questions:[];
    out[k]={...s,questions:qs.map(q=>({...(isPlainObject(q)?q:{}),expl:String((isPlainObject(q)&&q.expl)||"").trim(),_generated:false}))};
  });
  return out;
}
/* Inglés OACI: el banco vive en su propio archivo JSON (data/ingles.js) y se maneja aparte del
   banco técnico: alternativas, audios, imágenes y role-plays se mezclan en cada prueba
   (ver la sección INGLÉS OACI más abajo). */
let ENGLISH={mcq:[],images:[],listening:[],roleplays:[],pruebas:[]};
try{
  const parsedEnglish=JSON.parse(window.ENGLISH_DATA_JSON);
  if(isPlainObject(parsedEnglish)){
    const list=v=>Array.isArray(v)?v.filter(isPlainObject):[];
    ENGLISH={mcq:list(parsedEnglish.mcq),images:list(parsedEnglish.images),listening:list(parsedEnglish.listening),roleplays:list(parsedEnglish.roleplays),pruebas:list(parsedEnglish.pruebas)};
  }
}catch(englishLoadError){console.error("Fallo al cargar data/ingles.js:",englishLoadError)}
const SYSTEMS=enrich();

const KEY="a320-interview-prep:v8", LEGACY_KEY="a320-interview-prep:v7";
let appState;

/* Huella barata (no criptografica) del contenido del banco (el texto exacto de data/banco.js), para
   detectar si una sesion "continuar" quedo desactualizada tras editar
   una pregunta/explicacion. No es un hash de seguridad, solo deteccion
   de cambio de contenido. */
function cheapHash(str){
  let h=0;
  for(let i=0;i<str.length;i++){h=(Math.imul(31,h)+str.charCodeAt(i))|0}
  return h.toString(36);
}
const BANK_FINGERPRINT=cheapHash(window.SYSTEMS_DATA_JSON);

function isPlainObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v)}
function finiteNum(v,fallback=0){return Number.isFinite(v)?v:fallback}
function sanitizeMapEntries(obj,fn){
  const out={};
  if(isPlainObject(obj)){
    Object.keys(obj).forEach(k=>{
      if(typeof k!=="string"||k.length>200)return;
      const cleaned=fn(obj[k]);
      if(cleaned!==null)out[k]=cleaned;
    });
  }
  return out;
}
function sanitizeStatEntry(v){
  if(!isPlainObject(v))return null;
  return{a:finiteNum(v.a),c:finiteNum(v.c),w:finiteNum(v.w),last:finiteNum(v.last),streak:finiteNum(v.streak),lastResult:v.lastResult===0||v.lastResult===1?v.lastResult:null};
}
function sanitizeBestEntry(v){
  if(!isPlainObject(v))return null;
  return{score:finiteNum(v.score),total:finiteNum(v.total),date:finiteNum(v.date)};
}
function sanitizeOralEntry(v){
  if(!isPlainObject(v))return null;
  return{a:finiteNum(v.a),total:finiteNum(v.total),low:finiteNum(v.low),last:finiteNum(v.last)};
}
function sanitizeOralVoiceEntry(v){
  if(!isPlainObject(v))return null;
  return{score:Math.max(0,Math.min(10,finiteNum(v.score))),attempts:finiteNum(v.attempts,1),last:finiteNum(v.last)};
}
function sanitizeEnglishEntry(v){
  if(!isPlainObject(v))return null;
  return{r:v.r===0||v.r===1||v.r===2?v.r:null,a:finiteNum(v.a),last:finiteNum(v.last)};
}
/* Pruebas de inglés: cuáles completaste en esta vuelta y cuál te tocó, con el orden en que se mezclaron sus ejercicios
   («q:id» alternativa, «l:id» audio, «i:id» imagen, «r:id» role-play), por cuál vas y el resultado objetivo de sus alternativas. */
function sanitizeEnglishTests(v){
  const out={done:[],current:null,cycle:0,last:null};
  if(!isPlainObject(v))return out;
  const small=x=>Number.isInteger(x)&&x>=1&&x<=99;
  if(Array.isArray(v.done))out.done=[...new Set(v.done.filter(small))];
  if(small(v.last))out.last=v.last;
  out.cycle=Math.max(0,Math.min(999,Math.floor(finiteNum(v.cycle))));
  const c=v.current;
  if(isPlainObject(c)&&small(c.n)&&!out.done.includes(c.n)){
    const order=Array.isArray(c.order)?c.order.filter(x=>typeof x==="string"&&/^[qlir]:[A-Za-z0-9_]{1,40}$/.test(x)).slice(0,60):[];
    out.current={n:c.n,order,i:Number.isInteger(c.i)&&c.i>=0&&c.i<=order.length?c.i:0};
    const m=c.mcq;
    if(isPlainObject(m)&&Number.isInteger(m.c)&&Number.isInteger(m.t)&&m.t>=1&&m.t<=99&&m.c>=0&&m.c<=m.t)out.current.mcq={c:m.c,t:m.t};
  }
  return out;
}
function sanitizeBookmarks(obj){
  const out={};
  if(isPlainObject(obj))Object.keys(obj).forEach(k=>{if(typeof k==="string"&&k.length<=200&&obj[k])out[k]=true});
  return out;
}
/* Una pregunta de resume corrupta (options:null, etc.) pasa el chequeo
   de "es un objeto" pero revienta renderQuestion()/renderInterview()
   mas adelante con un .map()/indice invalido. Se valida la forma
   minima que cada pantalla realmente necesita antes de confiar en el
   arreglo completo. */
function validResumeQuestion(q,isInterview){
  if(!isPlainObject(q))return false;
  if(typeof q.q!=="string"&&typeof q.oral_q!=="string"&&typeof q.scenario_q!=="string")return false;
  if(isInterview)return true;
  return Array.isArray(q.options)&&q.options.length>0&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length;
}
function sanitizeResume(r){
  if(!isPlainObject(r))return null;
  const questions=Array.isArray(r.questions)?r.questions:null;
  if(!questions||!questions.length)return null;
  const isInterview=r.mode==="oral"||r.type==="interview";
  if(!questions.every(q=>validResumeQuestion(q,isInterview)))return null;
  const total=questions.length;
  const index=Number.isInteger(r.index)&&r.index>=0&&r.index<total?r.index:0;
  const out={
    mode:r.mode==="oral"?"oral":"technical",
    type:typeof r.type==="string"?r.type.slice(0,40):"study",
    systemKey:typeof r.systemKey==="string"||r.systemKey===null?r.systemKey:null,
    questions,index,total,
    label:typeof r.label==="string"?r.label.slice(0,200):"Sesión anterior",
    bankFingerprint:typeof r.bankFingerprint==="string"?r.bankFingerprint:null
  };
  if(typeof r.kind==="string")out.kind=r.kind.slice(0,40);
  if(Array.isArray(r.answers)&&r.answers.length===total)out.answers=r.answers;
  if(Array.isArray(r.counted)&&r.counted.length===total)out.counted=r.counted;
  if(Array.isArray(r.ratings)&&r.ratings.length===total)out.ratings=r.ratings;
  if(Array.isArray(r.revealed)&&r.revealed.length===total)out.revealed=r.revealed;
  return out;
}
/* El id de una pregunta sale de su enunciado: al corregir un enunciado, su progreso pasa al id
   nuevo (estadísticas, guardadas, autoevaluación y Need to know).
   2026-10-01: «el PTU» → «la PTU» en 6 preguntas de Hidráulico.
   2026-10-05: «la PTU» → «PTU», sin artículo, en 5 de ellas; los ids de ambas versiones anteriores apuntan directo al nuevo. */
const QID_RENAMES={"hydraulic:1os0brc":"hydraulic:1tbt8ld","hydraulic:1eznmr1":"hydraulic:wxjsp5","hydraulic:98eoy5":"hydraulic:14jvqlm","hydraulic:uvvyh":"hydraulic:odnbls","hydraulic:1qfuvr9":"hydraulic:tnkbsc","hydraulic:19f34k":"hydraulic:1yk534j","hydraulic:106iugc":"hydraulic:1tbt8ld","hydraulic:1rx3pif":"hydraulic:14jvqlm","hydraulic:yu9ict":"hydraulic:odnbls","hydraulic:dhos2p":"hydraulic:tnkbsc","hydraulic:152269q":"hydraulic:1yk534j"};
function renameQidKeys(map){
  Object.keys(QID_RENAMES).forEach(old=>{
    if(!(old in map))return;
    if(!(QID_RENAMES[old] in map))map[QID_RENAMES[old]]=map[old];
    delete map[old];
  });
  return map;
}
function renameNtkRefs(ntk){
  const fix=list=>[...new Set(list.map(r=>r.slice(0,2)==="q:"&&QID_RENAMES[r.slice(2)]?"q:"+QID_RENAMES[r.slice(2)]:r))];
  return{added:fix(ntk.added),removed:fix(ntk.removed)};
}
function sanitizeState(raw){
  const base=defaultState();
  if(!isPlainObject(raw))return base;
  return{
    schema:STATE_SCHEMA,
    stats:renameQidKeys(sanitizeMapEntries(raw.stats,sanitizeStatEntry)),
    best:sanitizeMapEntries(raw.best,sanitizeBestEntry),
    bookmarks:renameQidKeys(sanitizeBookmarks(raw.bookmarks)),
    oral:renameQidKeys(sanitizeMapEntries(raw.oral,sanitizeOralEntry)),
    oralVoice:sanitizeMapEntries(raw.oralVoice,sanitizeOralVoiceEntry),
    english:sanitizeMapEntries(raw.english,sanitizeEnglishEntry),
    englishTests:sanitizeEnglishTests(raw.englishTests),
    resume:sanitizeResume(raw.resume),
    lastSystem:typeof raw.lastSystem==="string"?raw.lastSystem.slice(0,200):null,
    needToKnow:renameNtkRefs(sanitizeNeedToKnow(raw.needToKnow)),
    ruta:sanitizeRuta(raw.ruta)
  };
}
/* Ruta de entrenamiento (js/ruta.js): estrellas por estación (1 a 3), racha de días y la opción de abrir
   todas las misiones. Una estación que ya no existe se descarta. */
function sanitizeRuta(v){
  const out={stars:{},streak:{last:"",days:0},unlockAll:false};
  if(!isPlainObject(v))return out;
  const ids=new Set(((window.ESTACIONES_DATA&&window.ESTACIONES_DATA.subjects)||[]).flatMap(s=>(s.stations||[]).map(st=>st.id)));
  if(isPlainObject(v.stars))Object.keys(v.stars).forEach(k=>{const n=v.stars[k];if(k.length<=60&&(!ids.size||ids.has(k))&&(n===1||n===2||n===3))out.stars[k]=n});
  if(isPlainObject(v.streak)&&typeof v.streak.last==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v.streak.last))out.streak={last:v.streak.last,days:Math.max(0,Math.min(9999,Math.floor(finiteNum(v.streak.days))))};
  out.unlockAll=v.unlockAll===true;
  return out;
}
/* Distingue "el campo no viene" (aceptable, backups antiguos) de "el
   campo viene con el tipo equivocado" (senal de archivo corrupto o
   manipulado: se rechaza el import completo en vez de sanear en
   silencio). */
function looksLikeValidBackup(raw){
  if(!isPlainObject(raw))return false;
  for(const f of["stats","best","bookmarks","oral","oralVoice","english","englishTests","needToKnow","ruta"]){
    if(f in raw&&!isPlainObject(raw[f]))return false;
  }
  if("resume" in raw&&raw.resume!==null&&!isPlainObject(raw.resume))return false;
  if("lastSystem" in raw&&raw.lastSystem!==null&&typeof raw.lastSystem!=="string")return false;
  return true;
}
function defaultState(){return{schema:STATE_SCHEMA,stats:{},best:{},bookmarks:{},oral:{},oralVoice:{},english:{},englishTests:{done:[],current:null,cycle:0,last:null},resume:null,lastSystem:null,needToKnow:{added:[],removed:[]},ruta:{stars:{},streak:{last:"",days:0},unlockAll:false}}}
function loadState(){
  try{
    const current=localStorage.getItem(KEY),legacy=localStorage.getItem(LEGACY_KEY);
    const raw=current||legacy||"{}";
    const loaded=sanitizeState(JSON.parse(raw));
    if(!current&&legacy){
      loaded.resume=null;
      loaded.lastSystem=null;
      localStorage.setItem(KEY,JSON.stringify(loaded));
    }
    return loaded;
  }catch(e){return defaultState()}
}
let stateSaveWarned=false;
function saveState(){
  try{localStorage.setItem(KEY,JSON.stringify(appState));return true}
  catch(e){
    if(!stateSaveWarned){stateSaveWarned=true;toast("No se pudo guardar el progreso en este dispositivo")}
    return false;
  }
}
appState=loadState();

function orderedKeys(){return SYSTEM_ORDER.filter(k=>SYSTEMS[k])}
function operationsKeys(){return OPERATIONS_ORDER.filter(k=>SYSTEMS[k])}
function allVerifiedPool(){return safePool([...rawPool(null),...operationsKeys().flatMap(k=>rawPool(k)),...rawPool(INTERVIEW_TECH_KEY)])}
function rawPool(key){
  if(key===null)return orderedKeys().flatMap(k=>(SYSTEMS[k].questions||[]).map(q=>({...q,_sys:k,_id:qid(k,q)})));
  return (SYSTEMS[key]?.questions||[]).map(q=>({...q,_sys:key,_id:qid(key,q)}));
}
function allLookupPool(){return [...allVerifiedPool(),...rawPool(DGAC_KEY)]}
function trainingPool(key){
  if(key===DGAC_KEY)return safePool(rawPool(DGAC_KEY));
  const base=safePool(key===null?rawPool(null):rawPool(key));
  const seen=new Set();
  return base.filter(q=>{
    const stem=stemKey(q.q);
    if(CONFLICT_STEMS.has(stem))return false;
    const n=(key===null?"ALL":"SYS")+"|"+stem;
    if(seen.has(n))return false;
    seen.add(n);return true;
  });
}
function savedQuestions(key=null){const p=key===null?allLookupPool():rawPool(key);return p.filter(q=>!!appState.bookmarks[q._id])}
function isWeakStat(s){
  if(!s||!(s.a>0)||!(s.w>0))return false;
  const err=(s.w||0)/(s.a||1);
  if(s.lastResult==null)return (s.c||0)===0 || err>=0.35;
  return s.lastResult===0 || ((s.a||0)>=2 && err>=0.35 && (s.streak||0)<2);
}
function attemptsFor(q){return appState.stats[q._id]||{a:0,c:0,w:0,last:0}}
function overall(){
  let a=0,c=0;
  allVerifiedPool().forEach(q=>{const s=attemptsFor(q);a+=s.a||0;c+=s.c||0});
  return{a,c,p:a?Math.round(c/a*100):0,wq:weakQuestions(null).length};
}
function systemStats(k){
  const pool=rawPool(k);let a=0,c=0,w=0;
  pool.forEach(q=>{const s=attemptsFor(q);a+=s.a||0;c+=s.c||0;if((s.w||0)>0)w++});
  return{a,c,p:a?Math.round(c/a*100):0,w,best:appState.best[k===null?"all":k]||null}
}
function weakQuestions(key=null){
  const source=key===null?allVerifiedPool():trainingPool(key);
  return source.filter(q=>isWeakStat(attemptsFor(q))).sort((x,y)=>{
    const a=attemptsFor(x),b=attemptsFor(y);
    const rateA=(a.w||0)/(a.a||1),rateB=(b.w||0)/(b.a||1);
    const scoreA=rateA*5+(a.lastResult===0?3:0)-Math.min(a.streak||0,2);
    const scoreB=rateB*5+(b.lastResult===0?3:0)-Math.min(b.streak||0,2);
    return scoreB-scoreA;
  });
}
function toast(t){const e=$("toast");e.textContent=t;e.classList.remove("hidden");clearTimeout(window.__tt);window.__tt=setTimeout(()=>e.classList.add("hidden"),2200)}
function screens(){return["home","systemsFolder","detail","quiz","interview","oralVoice","results","weak","englishHub","englishPractice","ntk","ntkCard"]}
function show(id){
  if(id!=="englishPractice")stopEnglishMedia();
  screens().forEach(s=>$(s).classList.toggle("hidden",s!==id));
  window.scrollTo(0,0);
  /* Mover el foco al encabezado de la pantalla nueva: sin esto, un
     usuario de lector de pantalla o teclado se queda con el foco en
     el boton que disparo la navegacion, sin ninguna señal de que
     cambio de pantalla. */
  const container=$(id);
  const heading=container.querySelector("h1")||container;
  heading.setAttribute("tabindex","-1");
  heading.focus({preventScroll:true});
}
function goHome(){stopEverythingOral();ntkRestoreOralBox();ntkSession=null;session=null;show("home");renderHome()}
function openSystemsFolder(){session=null;renderHome();show("systemsFolder")}
function exitSession(){stopEverythingOral();if(session)persistResume();goHome()}

let currentSystemKey=null;
function renderHome(){
  const ov=overall();
  $("mQuestions").textContent=totalQuestions();
  $("mAccuracy").textContent=ov.a?ov.p+"%":"—";
  $("mWeak").textContent=ov.wq;
  $("bankChip").textContent=(totalQuestions()+operationsQuestions()+interviewTechnicalTotal()+dgacTotal()+ORAL_VOICE_BANK.length)+" PREGUNTAS";

  $("homeSystemsCount").textContent=totalQuestions()+" preguntas · FCOM 2025 ✓";
  $("homeOpsCount").textContent=operationsQuestions()+" preguntas · Airbus Tutorials Rev 15 ✓";
  $("homeInterviewCount").textContent=interviewTechnicalTotal()+" preguntas · banco de entrevista depurado";
  const dgacExplained=(SYSTEMS[DGAC_KEY]?.questions||[]).filter(q=>q.expl).length;
  $("homeDgacCount").textContent=dgacTotal()+(dgacExplained>=dgacTotal()?" preguntas históricas · explicadas":` preguntas históricas · ${dgacExplained} explicadas`);
  $("homeWeakCount").textContent=ov.wq?`${ov.wq} ${plural(ov.wq,"pregunta","preguntas")} por repasar`:"Sin preguntas pendientes";
  {const nk=ntkRefs(),nd=nk.filter(r=>ntkPracticed(r)).length;$("homeNtkCount").textContent=nk.length?`${nk.length} ${plural(nk.length,"pregunta clave","preguntas clave")}${nd?` · ${nd} ${plural(nd,"practicada","practicadas")}`:" · responde con tu voz o lee la respuesta"}`:"Agrega las preguntas que no puedes olvidar"}
  {
    const tt=enTests(),dn=enTestState().done.filter(n=>tt.some(t=>t.n===n)).length;
    $("homeEnglishCount").textContent=tt.length?`${tt.length} ${plural(tt.length,"prueba","pruebas")} al azar · alternativas, audios, imágenes y role-play${dn?` · ${dn} de ${tt.length} hechas`:""}`:"Pruebas de inglés";
  }
  $("folderSystemsCount").textContent=totalQuestions()+" preguntas";

  const health=BANK_HEALTH;
  $("bankStatus").textContent=health.ok?"Integridad estructural OK":`${health.issues} ${plural(health.issues,"incidencia","incidencias")}`;
  $("bankStatus").classList.toggle("warn",!health.ok);
  $("appMeta").innerHTML=`App <b>v${APP_VERSION}</b> · Banco <b>v${BANK_VERSION}</b><br>${totalQuestions()+operationsQuestions()} FCOM/Airbus · ${interviewTechnicalTotal()} entrevista técnica · ${dgacTotal()} DGAC históricas · ${ORAL_VOICE_BANK.length} entrevista oral · ${ENGLISH.mcq.length} inglés OACI (alternativas en ${enTests().length} pruebas)`;
  $("integrityNote").classList.toggle("warn",!health.ok);
  $("integrityNote").textContent=health.ok
    ?"Comprobación estructural al iniciar: forma de preguntas y rúbricas orales válida, y explicación/referencia presente. La exactitud del contenido aeronáutico se audita aparte, contra el FCOM/FCTM."
    :`Se detectaron ${health.issues} incidencias de estructura${health.oralIssues?` (incluye ${health.oralIssues} en el banco oral)`:""}${health.englishIssues?` (incluye ${health.englishIssues} en Inglés OACI)`:""}. Las preguntas con estructura inválida quedan fuera de las sesiones hasta corregirlas.`;

  const r=appState.resume;
  $("resumeWrap").innerHTML=r?`<button type="button" class="resume-card" onclick="resumeSession()"><div class="resume-main"><div class="resume-label">Continuar</div><strong>${esc(r.label||"Sesión anterior")}</strong><span>Pregunta ${Math.min(finiteNum(r.index)+1,finiteNum(r.total,1))} de ${finiteNum(r.total,1)}</span></div><div class="chev">›</div></button>`:"";

  const all=systemStats(null);
  let html=`<button type="button" class="system-card all" onclick="openSystem(null)"><div class="ata">ALL</div><div class="sys-info"><h3>Todos los sistemas</h3><p>${totalQuestions()} preguntas · explicación y respaldo FCOM</p>${all.best?`<div class="sys-score">Mejor test: ${finiteNum(all.best.score)}/${finiteNum(all.best.total)}</div>`:""}</div><div class="chev">›</div></button>`;
  html+=orderedKeys().map(k=>{
    const s=SYSTEMS[k],st=systemStats(k),count=(s.questions||[]).length;
    return `<button type="button" class="system-card" data-search="${esc(norm((s.name||"")+" "+(s.ata||"")))}" onclick="openSystem('${esc(k)}')"><div class="ata">ATA<br>${esc(s.ata||"—")}</div><div class="sys-info"><h3>${esc(s.name||k)}</h3><p>${count} preguntas · FCOM 2025 ✓${st.a?` · ${st.p}% precisión`:""}</p>${st.best?`<div class="sys-score">Mejor test: ${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</div>`:""}</div><div class="chev">›</div></button>`
  }).join("");
  $("systemsList").innerHTML=html;
}
function openSystem(k){
  currentSystemKey=k;appState.lastSystem=k;saveState();
  const st=systemStats(k),pool=rawPool(k);
  const dgac=isDgacKey(k),ops=operationsKeys().includes(k),interviewTech=isInterviewTechKey(k);
  $("detailAta").textContent=dgac?"BANCO HISTÓRICO · DGAC 2018":interviewTech?"ENTREVISTA · BANCO TÉCNICO GENERAL":ops?"OPERACIÓN · AIRBUS TUTORIALS REV 15":(k===null?"BANCO TÉCNICO · FCOM":`ATA ${systemAta(k)} · FCOM`);
  $("detailTitle").textContent=systemName(k);
  if(dgac){
    const explained=pool.filter(q=>q.expl).length;
    $("detailDesc").textContent=explained>=pool.length?`${pool.length} preguntas reales del examen DGAC A320 2018, con sus alternativas originales sin modificar. Las ${pool.length} tienen explicación técnica y referencia verificadas.`:explained?`${pool.length} preguntas reales del examen DGAC A320 2018, con sus alternativas originales sin modificar. ${explained} de ${pool.length} ya tienen explicación técnica verificada; seguimos completando el resto.`:`${pool.length} preguntas del examen DGAC A320 2018. Este banco se conserva para practicar el formato y las preguntas históricas. No forma parte del banco técnico validado y deliberadamente no muestra explicaciones.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> preguntas DGAC</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> precisión</span><span class="pill"><b>${explained}</b> explicadas</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> mejor test</span>`:""}`;
    $("studyModeDesc").textContent=explained?"Muestra la respuesta marcada en el examen; si ya fue auditada, incluye explicación técnica y cita FCOM.":"Muestra la respuesta marcada en el examen después de contestar. Sin explicación.";
    $("interviewModeCard").classList.add("hidden");
    $("systemWeakBtn").classList.add("hidden");
  }else if(interviewTech){
    const curated=pool.filter(q=>q.audit==="interview_curated"&&q.expl).length;
    $("detailDesc").textContent=`${pool.length} preguntas derivadas de material de entrevistas LATAM, depuradas para estudiar meteorología, performance, IFR, aerodinámica, operación, CRM y conceptos A320.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> preguntas</span><span class="pill"><b>${curated}</b> depuradas</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> precisión</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> mejor test</span>`:""}`;
    $("studyModeDesc").textContent="Respuesta y explicación después de contestar, con referencia al material de entrevista y a la revisión aplicada.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} para repasar</b> · practicar solo preguntas falladas`;
  }else if(ops){
    const verified=pool.filter(q=>q.audit==="airbus_tutorials_verified"&&q.expl&&q.cite).length;
    $("detailDesc").textContent=`${pool.length} preguntas de operación Airbus construidas desde Airbus Tutorials Revision 15. Aquí se evalúan filosofía Airbus, flows, técnicas operacionales y manejo de fases de vuelo.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> preguntas</span><span class="pill"><b>${verified}</b> AIRBUS ✓</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> precisión</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> mejor test</span>`:""}`;
    $("studyModeDesc").textContent="Respuesta, explicación y referencia Airbus Tutorials justo después de contestar.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} para repasar</b> · practicar solo preguntas falladas`;
  }else{
    const verified=pool.filter(q=>q.audit==="fcom_verified"&&q.expl&&q.cite).length;
    $("detailDesc").textContent=`${pool.length} preguntas de nuestro banco principal. Todas las preguntas visibles aquí tienen una respuesta concreta, explicación útil y respaldo en FCOM 15 SEP 25.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> preguntas</span><span class="pill"><b>${verified}</b> FCOM ✓</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> precisión</span>`;
    $("studyModeDesc").textContent="Respuesta, explicación y referencia FCOM justo después de contestar.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} para repasar</b> · practicar solo preguntas falladas`;
  }
  show("detail");
}
let searchDebounceTimer=null;
function debouncedSearch(v){
  $("searchClear").classList.toggle("hidden",!v);
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer=setTimeout(()=>runSearch(v),150);
}
function runSearch(v){
  const q=norm(v),wrap=$("searchResults");
  $("searchClear").classList.toggle("hidden",!v);
  if(q.length<2){wrap.innerHTML="";return}
  const tokens=q.split(" ").filter(Boolean);
  const hits=allLookupPool().filter(x=>{
    const hay=norm(x.q+" "+x.options.join(" ")+" "+systemName(x._sys)+" "+(x.src||""));
    return tokens.every(t=>hay.includes(t));
  }).slice(0,40);
  wrap.innerHTML=hits.length?hits.map(x=>`<button type="button" class="search-item" onclick="startSingle('${x._id}')"><div class="smeta">${esc(systemName(x._sys))}${appState.bookmarks[x._id]?" · ★":""}</div><div class="sq">${esc(x.q)}</div></button>`).join(""):`<div class="empty">No encontré preguntas con “${esc(v)}”.</div>`;
}
function clearSearch(){clearTimeout(searchDebounceTimer);const i=$("searchInput");i.value="";runSearch("");i.focus()}
function findById(id){return allLookupPool().find(q=>q._id===id)}
function startSingle(id){const q=findById(id);if(!q)return;currentSystemKey=q._sys;startTechnical("study",[q])}
function startQuickTest(){currentSystemKey=null;startTechnical("test")}
function startWeakSession(k=null){
  const p=weakQuestions(k);if(!p.length){toast("Todavía no hay errores guardados");return}
  currentSystemKey=k;startTechnical("weak",p.slice(0,Math.min(30,p.length)))
}
function showWeak(){
  const p=weakQuestions(null),saved=savedQuestions(null);show("weak");
  $("weakActions").innerHTML=p.length?`<button type="button" class="btn primary" style="width:100%" onclick="startWeakSession(null)">Practicar ${Math.min(30,p.length)} prioritarias</button>`:"";
  $("weakList").innerHTML=p.length?p.slice(0,80).map(q=>{const s=attemptsFor(q);return `<button type="button" class="weak-item" onclick="startSingle('${q._id}')"><div class="wmeta">${esc(systemName(q._sys))}</div><div class="wq">${esc(q.q)}</div><div class="wstats">${finiteNum(s.w)} ${plural(finiteNum(s.w),"error","errores")} · ${finiteNum(s.c)} ${plural(finiteNum(s.c),"correcta","correctas")}${finiteNum(s.streak)>=2?" · recuperada":""}</div></button>`}).join(""):`<div class="empty">No tienes preguntas pendientes de refuerzo. Las preguntas salen de esta lista cuando demuestras recuperación con respuestas correctas consecutivas.</div>`;
  $("savedWrap").classList.toggle("hidden",saved.length===0);
  if(saved.length){
    $("savedActions").innerHTML=`<button type="button" class="btn" style="width:100%;margin-bottom:9px" onclick="startSavedSession()">Practicar ${Math.min(30,saved.length)} guardadas</button>`;
    $("savedList").innerHTML=saved.slice(0,80).map(q=>`<button type="button" class="weak-item" onclick="startSingle('${q._id}')"><div class="wmeta saved-badge">★ ${esc(systemName(q._sys))}</div><div class="wq">${esc(q.q)}</div></button>`).join("");
  }
}
function startSavedSession(){const p=savedQuestions(null);if(!p.length){toast("No tienes preguntas guardadas");return}currentSystemKey=null;startTechnical("saved",p.slice(0,Math.min(30,p.length)))}

let session=null;
function buildSessionQ(q){
  /* El banco DGAC conserva alternativas originales del examen 2018;
     varias usan referencias posicionales como "BOTH A AND B", que
     cambiarian de significado si se reordenan. Se mantiene su orden
     original; el resto del banco si se mezcla. */
  if(isDgacKey(q._sys))return{...q,_correctText:correctText(q)};
  const shuffled=shuffle(q.options.map((t,i)=>({t,orig:i})));
  return{...q,options:shuffled.map(o=>o.t),correct:shuffled.findIndex(o=>o.orig===q.correct),_correctText:correctText(q)};
}
function startTechnical(type,provided=null){
  let pool=provided?provided:trainingPool(currentSystemKey);
  if(type==="test")pool=shuffle(pool).slice(0,Math.min(TEST_SIZE,pool.length));
  else if(type==="study"&&!provided)pool=shuffle(pool);
  else if(type==="weak"||type==="saved")pool=shuffle(pool);
  if(!pool.length){toast("No hay preguntas disponibles");return}
  session={type,systemKey:currentSystemKey,questions:pool.map(buildSessionQ),answers:new Array(pool.length).fill(null),index:0,counted:new Array(pool.length).fill(false),completed:false};
  show("quiz");renderQuestion();persistResume();
}
function persistResume(){
  if(!session||session.completed)return;
  if(session.type==="interview"){
    appState.resume={
      mode:"oral",type:"interview",kind:session.kind,systemKey:session.systemKey,
      questions:session.questions,ratings:session.ratings,revealed:session.revealed,
      index:session.index,total:session.questions.length,
      label:`${session.kind==="scenario"?"Escenarios":"Autoevaluación"} · ${systemName(session.systemKey)}`,
      bankFingerprint:BANK_FINGERPRINT
    };
  }else{
    appState.resume={
      mode:"technical",type:session.type,systemKey:session.systemKey,
      questions:session.questions,answers:session.answers,index:session.index,counted:session.counted,
      total:session.questions.length,
      label:`${session.type==="test"?"Test":session.type==="weak"?"Repaso de errores":session.type==="saved"?"Guardadas":"Estudio"} · ${systemName(session.systemKey)}`,
      bankFingerprint:BANK_FINGERPRINT
    };
  }
  saveState();
}
function resumeSession(){
  const r=appState.resume;if(!r)return;
  const qs=Array.isArray(r.questions)?r.questions:[];
  if(!qs.length){appState.resume=null;saveState();renderHome();toast("La sesión anterior ya no es válida");return}
  if(r.bankFingerprint!==BANK_FINGERPRINT){
    appState.resume=null;saveState();renderHome();
    toast("El banco se actualizó desde tu última sesión; empieza una nueva para ver el contenido vigente");
    return;
  }
  currentSystemKey=r.systemKey;
  if(r.mode==="oral"||r.type==="interview"){
    session={
      type:"interview",kind:r.kind||"interview",systemKey:r.systemKey,questions:qs,
      ratings:Array.isArray(r.ratings)?r.ratings:new Array(qs.length).fill(null),
      revealed:Array.isArray(r.revealed)?r.revealed:new Array(qs.length).fill(false),
      index:Math.min(r.index||0,qs.length-1),completed:false
    };
    show("interview");renderInterview();return;
  }
  session={
    type:r.type,systemKey:r.systemKey,questions:qs,
    answers:Array.isArray(r.answers)?r.answers:new Array(qs.length).fill(null),
    index:Math.min(r.index||0,qs.length-1),
    counted:Array.isArray(r.counted)?r.counted:new Array(qs.length).fill(false),
    completed:false
  };
  show("quiz");renderQuestion();
}
function sessionQuestion(){return session.questions[session.index]}
function recordTechnical(q,correct){
  const s=appState.stats[q._id]||{a:0,c:0,w:0,last:0,streak:0,lastResult:null};
  s.a++;
  if(correct){s.c++;s.streak=(s.lastResult===1?(s.streak||0)+1:1);s.lastResult=1}
  else{s.w++;s.streak=0;s.lastResult=0}
  s.last=Date.now();appState.stats[q._id]=s;saveState();
}
function selectOption(i){
  const q=sessionQuestion();
  if(session.type!=="test"&&session.answers[session.index]!==null)return;
  session.answers[session.index]=i;
  if(session.type!=="test"&&!session.counted[session.index]){
    if(q.bank!=="dgac")recordTechnical(q,i===q.correct);session.counted[session.index]=true;
  }
  renderQuestion();persistResume();
}
function answerDontKnow(){
  const q=sessionQuestion();if(session.answers[session.index]!==null)return;
  session.answers[session.index]=-1;
  if(session.type!=="test"&&!session.counted[session.index]){if(q.bank!=="dgac")recordTechnical(q,false);session.counted[session.index]=true}
  renderQuestion();persistResume();
}
function renderQuestion(){
  const q=sessionQuestion(),n=session.questions.length,ans=session.answers[session.index];
  $("qMeta").textContent=`${session.type==="test"?"TEST":session.type==="weak"?"REPASO":session.type==="saved"?"GUARDADAS":"ESTUDIO"} · ${session.index+1} / ${n}`;
  $("qProgress").style.width=`${((session.index+1)/n)*100}%`;
  $("qSource").innerHTML=q.bank==="dgac"?`DGAC 2018 · ${esc(q.bank_section||"Sistemas A320")}<span class="${q.expl?"verify-badge":"dgac-badge"}">${q.expl?"✓ EXPLICADA":"BANCO ORIGINAL · SIN EXPLICACIÓN"}</span>`:q.bank==="interview_technical"?`${esc(systemName(q._sys))} · ${esc(q.topic||"Entrevista")}<span class="verify-badge">BANCO DEPURADO</span>`:q.bank==="airbus_tutorials"?`${esc(systemName(q._sys))} · ${esc(q.src||"Airbus Tutorials Rev 15")}<span class="verify-badge">✓ AIRBUS REV 15</span>`:`${esc(systemName(q._sys))} · ${esc(q.src||"FCOM")}<span class="verify-badge">✓ FCOM 2025</span>`;
  $("qText").textContent=q.q;
  $("options").innerHTML=q.options.map((o,i)=>{
    let cls="option";
    const locked=ans!==null&&session.type!=="test";
    if(ans!==null){
      if(session.type==="test"){if(i===ans)cls+=" selected"}
      else{cls+=" locked";if(i===q.correct)cls+=" correct";else if(i===ans)cls+=" wrong"}
    }
    return `<button type="button" class="${cls}" onclick="selectOption(${i})" aria-pressed="${i===ans?"true":"false"}"${locked?" disabled":""}><div class="letter">${LETTERS[i]||i+1}</div><div class="otxt">${esc(o)}</div></button>`
  }).join("");
  $("dontKnowBtn").classList.toggle("hidden",ans!==null);$("dontKnowBtn").textContent=session.type==="test"?"No la sé · continuar":"No la sé · mostrar respuesta";renderBookmark(q);renderNtkToggle("ntkQuizBtn",q._id?"q:"+q._id:null);
  $("answerWrap").innerHTML="";
  if(session.type!=="test"&&ans!==null)$("answerWrap").innerHTML=answerHtml(q,ans===q.correct);

  const isTest=session.type==="test";
  $("prevBtn").classList.toggle("hidden",isTest);
  $("prevBtn").disabled=session.index===0;
  const quizNav=document.querySelector("#quiz .bottom-nav");
  if(quizNav)quizNav.classList.toggle("single",isTest);

  const last=session.index===n-1;
  $("nextBtn").textContent=last?(isTest?"Ver resultados":"Finalizar"):"Siguiente";
  $("nextBtn").disabled=ans===null;
}
function renderBookmark(q){const b=$("bookmarkBtn");const on=!!appState.bookmarks[q._id];b.classList.toggle("active",on);b.textContent=on?"★":"☆";b.setAttribute("aria-pressed",on?"true":"false");b.setAttribute("aria-label",on?"Quitar de guardadas":"Guardar pregunta")}
function toggleBookmark(){const q=sessionQuestion();if(!q)return;if(appState.bookmarks[q._id]){delete appState.bookmarks[q._id];toast("Quitada de guardadas")}else{appState.bookmarks[q._id]=true;toast("Pregunta guardada")}saveState();renderBookmark(q)}

function answerHtml(q,isOk){
  let h=`<div class="feedback-head ${isOk?"ok":"bad"}"><div class="status">${isOk?"Correcta":"Respuesta correcta"}</div><strong>${esc(q._correctText||q.options[q.correct])}</strong></div>`;
  if(q.bank==="dgac"){
    if(q.expl){
      h=`<div class="verified-line">EXPLICACIÓN AGREGADA · EXAMEN DGAC 2018</div>`+h;
      h+=`<div class="explain"><div class="label">Por qué</div><p>${esc(q.expl)}</p></div>`;
      h+=`<div class="citation"><div class="label">REFERENCIA TÉCNICA</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"Examen DGAC A320 2018")}</div></div>`;
      return h;
    }
    h+=`<div class="dgac-warning"><b>Banco DGAC A320 2018.</b> Aquí se muestra únicamente la respuesta marcada en el examen original. No añadimos una explicación porque esta pregunta todavía no ha sido auditada contra el FCOM actual.</div>`;
    return h;
  }
  const isAirbus=q.bank==="airbus_tutorials",isInterview=q.bank==="interview_technical";
  h=`<div class="verified-line">${isInterview?"BANCO DE ENTREVISTA · RESPUESTA DEPURADA":"✓ CONTENIDO VERIFICADO CONTRA "+(isAirbus?"AIRBUS TUTORIALS REV 15":"FCOM 15 SEP 25")}</div>`+h;
  h+=`<div class="explain"><div class="label">Por qué</div><p>${esc(q.expl)}</p></div>`;
  h+=isInterview?`<div class="citation"><div class="label">REFERENCIA DE ESTUDIO</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"Material de entrevista")}</div></div>`:`<div class="citation"><div class="label">${isAirbus?"AIRBUS TUTORIALS · VERIFICADO":"FCOM · VERIFICADO"}</div><blockquote>“${esc(q.cite)}”</blockquote><div class="src">${esc(q.src||(isAirbus?"Airbus Tutorials Rev 15":"FCOM 15 SEP 25"))}</div>${q.audit_note?`<div class="audit-note">${esc(q.audit_note)}</div>`:""}</div>`;
  return h;
}
function prevQuestion(){if(session.index>0){session.index--;renderQuestion();persistResume()}}
function nextQuestion(){
  if(session.answers[session.index]===null)return;
  if(session.index<session.questions.length-1){session.index++;renderQuestion();persistResume();return}
  if(session.type==="test")finishTest();else{session.completed=true;appState.resume=null;saveState();currentSystemKey=session.systemKey;openSystem(currentSystemKey);toast("Sesión completada")}
}
function finishTest(){
  if(session.completed)return;
  session.completed=true;appState.resume=null;
  let correct=0;
  session.questions.forEach((q,i)=>{const ok=session.answers[i]===q.correct;if(ok)correct++;if(q.bank!=="dgac")recordTechnical(q,ok)});
  const key=session.systemKey===null?"all":session.systemKey,prev=appState.best[key];
  if(!prev||correct>prev.score||session.questions.length!==prev.total)appState.best[key]={score:correct,total:session.questions.length,date:Date.now()};
  saveState();
  const total=session.questions.length,pct=Math.round(correct/total*100),wrong=total-correct;
  $("resultPct").textContent=pct+"%";$("resultPct").style.color=pct>=90?"var(--green)":pct>=75?"var(--amber)":"var(--red)";$("resultRaw").textContent=`${correct} / ${total}`;
  $("resultSummary").textContent=wrong===0?"Puntaje perfecto. Repite el test en unos días para confirmar que se mantiene.":pct>=90?"Nivel sólido. Revisa los pocos errores antes de cerrar el tema.":pct>=75?"Buen nivel, pero todavía hay asociaciones que conviene fijar.":"Hay brechas claras. Te conviene repetir solo los errores antes de hacer otro test.";
  if(session.systemKey===DGAC_KEY)$("resultSummary").textContent="Resultado del banco DGAC 2018. Sirve como práctica histórica y no modifica tu precisión ni tus áreas débiles del banco FCOM.";
  const bySys={};session.questions.forEach((q,i)=>{const k=q._sys||"general";bySys[k]??={c:0,t:0};bySys[k].t++;if(session.answers[i]===q.correct)bySys[k].c++});
  $("resultBreakdown").innerHTML=Object.entries(bySys).sort((a,b)=>b[1].t-a[1].t).map(([k,v])=>`<span class="breakdown-pill">${esc(systemName(k))} · <b>${v.c}/${v.t}</b></span>`).join("");
  $("retryWrongBtn").disabled=wrong===0;
  $("review").innerHTML=session.questions.map((q,i)=>{
    const ans=session.answers[i],ok=ans===q.correct;
    return `<details ${ok?"":"open"}><summary><span class="rbadge ${ok?"ok":"bad"}">${ok?"OK":"ERROR"}</span><span class="rq">${esc(q.q)}</span></summary><div class="rbody">${ok?`<div class="right">Tu respuesta: ${esc(q.options[ans])}</div>`:`<div class="your">Tu respuesta: ${ans===-1?"No la sé":esc(q.options[ans]||"Sin responder")}</div><div class="right">Correcta: ${esc(q.options[q.correct])}</div>`}${q.bank==="dgac"?(q.expl?`<div>${esc(q.expl)}</div><div style="margin-top:8px;color:var(--muted);font-size:11px">DGAC · ${esc(q.src||"")}</div>`:`<div class="dgac-warning">Sin explicación: pregunta perteneciente al banco DGAC original, todavía no auditada contra FCOM.</div>`):`<div>${esc(q.expl)}</div><div style="margin-top:8px;color:var(--muted);font-size:11px">${q.bank==="interview_technical"?"Entrevista · ":q.bank==="airbus_tutorials"?"Airbus · ":"FCOM · "}${esc(q.src||"")}</div>`}</div></details>`
  }).join("");
  show("results");
}
function retrySession(){currentSystemKey=session?.systemKey??currentSystemKey;startTechnical("test")}
function retryWrong(){
  if(!session)return;const wrong=session.questions.filter((q,i)=>session.answers[i]!==q.correct).map(q=>{
    const orig=findById(q._id);return orig||q
  });
  if(!wrong.length)return;currentSystemKey=session.systemKey;startTechnical("weak",wrong);
}

function startInterview(k=null){
  startOralSession(k,"interview");
}
function startScenario(){
  const hasProcedures=!!SYSTEMS.procedures;
  startOralSession(hasProcedures?"procedures":null,"scenario");
}
function startOralSession(k=null,kind="interview"){
  currentSystemKey=k;
  const base=trainingPool(k);
  const isBool=q=>q.options?.length===2&&/TRUE|FALSE|VERDADER|FALS/.test(q.options.join(" ").toUpperCase());
  let pool;
  const limit=kind==="scenario"?8:INTERVIEW_SIZE;
  if(kind==="scenario"){
    pool=base.filter(q=>q.scenario_q&&q.options&&q.options.length>=2&&!isBool(q));
  }else{
    const optionDependent=q=>/(¿?cuál de (las|los|estas|estos|siguientes)|¿?qué opción|¿?qué conjunto de|¿?cuál de estos grupos)/i.test(q.q||"");
    const strong=base.filter(q=>!q._generated&&q.options&&q.options.length>=2&&!isBool(q)&&!optionDependent(q)&&q.q.length<320);
    const rest=base.filter(q=>q.options&&q.options.length>=3&&!isBool(q)&&!optionDependent(q)&&q.q.length<320);
    pool=strong.length>=limit?strong:rest;
  }
  if(pool.length<limit)pool=base.filter(q=>q.options&&q.options.length>=2&&!isBool(q));
  pool=shuffle(pool).slice(0,Math.min(limit,pool.length));
  if(!pool.length){toast("No hay preguntas disponibles");return}
  session={type:"interview",kind,systemKey:k,questions:pool,index:0,ratings:new Array(pool.length).fill(null),revealed:new Array(pool.length).fill(false),completed:false};
  show("interview");renderInterview();persistResume();
}
function iQuestion(){return session.questions[session.index]}
function syncRateButtons(r){
  document.querySelectorAll("#rateWrap .rate").forEach((b,i)=>b.classList.toggle("active",r===i));
}
function renderInterview(){
  const q=iQuestion(),n=session.questions.length,r=session.ratings[session.index],isScenario=session.kind==="scenario";
  syncRateButtons(r);renderNtkToggle("ntkInterviewBtn",q._id?"q:"+q._id:null);
  $("iMeta").textContent=`${isScenario?"ESCENARIO":"AUTOEVALUACIÓN"} · ${session.index+1} / ${n}`;$("iProgress").style.width=`${((session.index+1)/n)*100}%`;
  $("iSource").innerHTML=`${esc(systemName(q._sys))} · ${esc(q.bank==="interview_technical"?(q.topic||"Entrevista"):(q.src||"Banco técnico"))}${q.audit==="fcom_verified"?`<span class="verify-badge">✓ FCOM 2025</span>`:q.audit==="airbus_tutorials_verified"?`<span class="verify-badge">✓ AIRBUS REV 15</span>`:q.bank==="interview_technical"?`<span class="verify-badge">BANCO DEPURADO</span>`:""}`;
  $("iQuestion").textContent=isScenario?(q.scenario_q||q.oral_q||q.q):(q.oral_q||q.q);
  $("iEyebrow").textContent=isScenario?"ANALIZA EL CASO":"RESPONDE EN VOZ ALTA";
  $("iTip").textContent=isScenario?"Explica qué está ocurriendo y cuál es la acción o criterio operacional que corresponde. Después compara tu razonamiento con la guía.":"Responde primero con una idea central y después justifícala. Evita recitar alternativas: habla como frente a un instructor.";
  $("iAnswer").classList.add("hidden");$("iAnswer").innerHTML="";$("revealBtn").classList.remove("hidden");$("rateWrap").classList.add("hidden");
  $("iPrevBtn").disabled=session.index===0;$("iNextBtn").disabled=r===null;$("iNextBtn").textContent=session.index===n-1?"Finalizar":"Siguiente";
  const wasRevealed=Array.isArray(session.revealed)&&!!session.revealed[session.index];
  if(r!==null||wasRevealed){revealInterview(true)}
}
function revealInterview(already=false){
  const q=iQuestion();
  if(!Array.isArray(session.revealed))session.revealed=new Array(session.questions.length).fill(false);
  session.revealed[session.index]=true;
  $("iAnswer").innerHTML=`<div class="feedback-head ok"><div class="status">Respuesta esperada</div><strong>${esc(correctText(q))}</strong></div><div class="explain"><div class="label">${q._generated?"Guía de estudio":"Cómo explicarlo"}</div><p>${esc(q.expl||"")}</p>${q._generated?`<div class="src" style="margin-top:7px;color:var(--muted);font-size:10.5px">Basada en la respuesta verificada del banco.</div>`:""}</div>${q.cite?(q.bank==="interview_technical"?`<div class="citation"><div class="label">REFERENCIA DE ESTUDIO</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"Material de entrevista")}</div></div>`:`<div class="citation"><div class="label">${q.audit==="fcom_verified"?"FCOM · VERIFICADO":q.audit==="airbus_tutorials_verified"?"AIRBUS TUTORIALS · VERIFICADO":"Fuente"}</div><blockquote>“${esc(q.cite)}”</blockquote><div class="src">${esc(q.src||"")}</div>${q.audit_note?`<div class="audit-note">${esc(q.audit_note)}</div>`:""}</div>`):`<div class="citation"><div class="label">Fuente</div><div class="src">${esc(q.src||"Banco técnico")}</div></div>`}`;
  $("iAnswer").classList.remove("hidden");$("revealBtn").classList.add("hidden");$("rateWrap").classList.remove("hidden");
  if(already)$("iNextBtn").disabled=false;
  persistResume();
}
function rateInterview(v){
  const q=iQuestion();session.ratings[session.index]=v;
  const s=appState.oral[q._id]||{a:0,total:0,low:0,last:0};s.a++;s.total+=v;if(v===0)s.low++;s.last=Date.now();appState.oral[q._id]=s;saveState();
  $("iNextBtn").disabled=false;syncRateButtons(v);persistResume();toast(v===2?"Sólida":v===1?"Parcial · conviene repetir":"Marcada para repaso");
}
function prevInterview(){if(session.index>0){session.index--;renderInterview();persistResume()}}
function nextInterview(){
  if(session.ratings[session.index]===null)return;
  if(session.index<session.questions.length-1){session.index++;renderInterview();persistResume();return}
  session.completed=true;appState.resume=null;saveState();
  const done=session.kind==="scenario"?"Escenarios completados":"Entrevista completada";goHome();toast(done)
}

function isStandaloneMode(){
  return window.navigator.standalone===true||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches);
}

/* ==========================================================
   ENTREVISTA ORAL - banco curado con rubricas semanticas locales
   (normalizacion + fuzzy matching + conceptos ponderados, sin IA en vivo)
   ========================================================== */
const ORAL_MAX_SECONDS=90;
const ORAL_MAX_RESTARTS=25;

/* ORAL_VOICE_BANK (las preguntas orales y sus rúbricas) está en data/oral.js. */

const oralState={question:null,recognition:null,listening:false,stopping:false,transcript:"",startTime:null,timer:null,restartTimer:null,maxTimer:null,index:0,scores:{},pool:[]};
let oralMicPermissionGranted=false;

function startOralVoice(){
  stopEverythingOral();
  ntkRestoreOralBox();
  oralState.index=0;oralState.scores={};
  oralState.pool=shuffle(ORAL_VOICE_BANK);
  show("oralVoice");
  loadOralVoiceQuestion();
}
function exitOralVoice(){stopEverythingOral();goHome()}
function oralVoiceQuestion(){return oralState.pool[oralState.index]}
function loadOralVoiceQuestion(){
  const q=oralVoiceQuestion();
  $("ovMeta").textContent=`ENTREVISTA ORAL · ${oralState.index+1} / ${oralState.pool.length}`;
  $("ovProgress").style.width=`${((oralState.index+1)/oralState.pool.length)*100}%`;
  $("ovPrevBtn").disabled=oralState.index===0;
  $("ovNextBtn").textContent=oralState.index===oralState.pool.length-1?"Finalizar":"Siguiente";
  $("ovNextBtn").disabled=oralState.scores[q.id]===undefined;
  loadQuestionFromA320Bank(q);
  renderNtkToggle("ntkOralBtn","o:"+q.id);
}
function prevOralVoice(){if(oralState.index>0){stopEverythingOral();oralState.index--;loadOralVoiceQuestion()}}
function nextOralVoice(){
  const q=oralVoiceQuestion();
  if(oralState.scores[q.id]===undefined)return;
  stopEverythingOral();
  if(oralState.index<oralState.pool.length-1){oralState.index++;loadOralVoiceQuestion();return}
  const scores=Object.values(oralState.scores);
  const avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  toast(`Entrevista completada · promedio ${avg.toFixed(1)}/10 en ${scores.length} preguntas`);
  goHome();
}

function setOralQuestion(question){
  stopEverythingOral();
  oralState.question=question;
  oralState.transcript="";
  $("oralQuestion").textContent=question.question||"Pregunta oral";
  const qImg=$("oralQuestionImage");
  if(question.image){qImg.src=question.image;qImg.alt=question.imageAlt||"Diagrama de referencia para esta pregunta";qImg.classList.remove("hidden")}
  else{qImg.classList.add("hidden");qImg.removeAttribute("src");qImg.alt=""}
  $("oralResult").classList.add("hidden");
  $("oralTextFallbackBox").classList.add("hidden");
  $("oralTextFallbackInput").value="";
  setOralStatus("Toca el micrófono cuando estés listo.");
  resetMicButton();
  const fallback=$("oralMicFallback"),micBtn=$("oralMicBtn");
  if(!speechRecognitionSupported()){
    fallback.textContent="Tu navegador no soporta reconocimiento de voz. Usa la opción de escribir tu respuesta.";
    fallback.classList.add("show");micBtn.classList.add("hidden");
  }else if(isStandaloneMode()){
    fallback.textContent="El reconocimiento de voz de Safari no funciona dentro de apps instaladas en la pantalla de inicio. Abre este sitio en Safari para usar el micrófono, o escribe tu respuesta abajo.";
    fallback.classList.add("show");micBtn.classList.remove("hidden");
  }else{
    fallback.classList.remove("show");micBtn.classList.remove("hidden");
  }
}
function getSpeechRecognitionClass(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
function speechRecognitionSupported(){return !!getSpeechRecognitionClass()}

function showOralTextFallback(){
  $("oralTextFallbackBox").classList.remove("hidden");
  $("oralTextFallbackInput").focus();
}
function submitOralTextFallback(){
  const text=$("oralTextFallbackInput").value.trim();
  if(!text){toast("Escribe algo antes de evaluar");return}
  oralState.transcript=text;
  evaluateCollectedOralAnswer();
}

async function toggleOralAnswer(){
  if(oralState.listening){finishOralAnswer();return}
  await startOralAnswer();
}
async function startOralAnswer(){
  if(!oralState.question){alert("No hay una pregunta oral cargada.");return}
  if(!window.isSecureContext&&location.hostname!=="localhost"){alert("El micrófono requiere que la aplicación se abra mediante HTTPS.");return}
  if(!speechRecognitionSupported()){alert("El reconocimiento de voz no está disponible en este navegador. En iPhone abre la aplicación con Safari.");return}
  const startGeneration=oralGeneration;
  if(!oralMicPermissionGranted){
    try{
      if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        stream.getTracks().forEach(track=>track.stop());
      }
      oralMicPermissionGranted=true;
    }catch(error){
      console.warn("Permiso de micrófono:",error);
      if(startGeneration===oralGeneration)setOralStatus(isStandaloneMode()?"No se pudo acceder al micrófono. Si estás en la app instalada, abre el sitio en Safari.":"No se pudo acceder al micrófono.");
      return;
    }
    /* Se salio de la entrevista, cambio de pregunta, o cualquier otra
       ruta de navegacion invalido esta espera mientras se pedia
       permiso del microfono: no iniciar reconocimiento en una
       pantalla/pregunta que ya no esta activa. */
    if(startGeneration!==oralGeneration)return;
  }
  oralState.transcript="";
  oralState.stopping=false;
  oralState.listening=true;
  oralState.startTime=Date.now();
  oralState.restartCount=0;
  $("oralResult").classList.add("hidden");
  startOralTimer();
  setRecordingButton();
  setOralStatus("Escuchando… responde como si estuvieras en una entrevista.",true);
  createRecognition();
  startRecognitionInstance();
  clearTimeout(oralState.maxTimer);
  oralState.maxTimer=setTimeout(function(){if(oralState.listening){finishOralAnswer()}},ORAL_MAX_SECONDS*1000);
}
function createRecognition(){
  const SpeechRecognition=getSpeechRecognitionClass();
  if(!SpeechRecognition)return;
  const recognition=new SpeechRecognition();
  recognition.lang="es-CL";
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.maxAlternatives=1;
  recognition.onresult=function(event){
    for(let i=event.resultIndex;i<event.results.length;i++){
      if(event.results[i]&&event.results[i][0]){
        const text=event.results[i][0].transcript;
        if(text&&text.trim())oralState.transcript+=" "+text.trim();
      }
    }
  };
  recognition.onerror=function(event){
    const error=event.error||"unknown";
    if(error==="no-speech"||error==="aborted")return;
    console.warn("SpeechRecognition error:",error);
    if(error==="not-allowed"||error==="audio-capture"||error==="network"||error==="service-not-allowed"){
      oralState.listening=false;
      stopOralTimer();
      resetMicButton();
      if(error==="not-allowed")setOralStatus("Debes autorizar el uso del micrófono.");
      else if(error==="audio-capture")setOralStatus("No se pudo acceder al micrófono.");
      else{
        setOralStatus(isStandaloneMode()?"El reconocimiento de voz no está disponible en la app instalada. Abre el sitio en Safari.":"Problema de conexión con el reconocimiento de voz.");
        if(isStandaloneMode())$("oralMicFallback").classList.add("show");
      }
    }
  };
  recognition.onend=function(){
    if(oralState.listening&&!oralState.stopping){
      oralState.restartCount=(oralState.restartCount||0)+1;
      if(oralState.restartCount>ORAL_MAX_RESTARTS){
        oralState.listening=false;stopOralTimer();resetMicButton();
        setOralStatus("El micrófono se desconectó varias veces. Intenta de nuevo.");
        return;
      }
      clearTimeout(oralState.restartTimer);
      oralState.restartTimer=setTimeout(function(){
        if(oralState.listening&&!oralState.stopping){createRecognition();startRecognitionInstance()}
      },350);
      return;
    }
    if(oralState.stopping)evaluateCollectedOralAnswer();
  };
  oralState.recognition=recognition;
}
function startRecognitionInstance(){
  if(!oralState.recognition||!oralState.listening)return;
  try{oralState.recognition.start()}
  catch(error){
    clearTimeout(oralState.restartTimer);
    oralState.restartCount=(oralState.restartCount||0)+1;
    if(oralState.restartCount>ORAL_MAX_RESTARTS){
      oralState.listening=false;stopOralTimer();resetMicButton();
      setOralStatus("El micrófono se desconectó varias veces. Intenta de nuevo.");
      return;
    }
    oralState.restartTimer=setTimeout(function(){
      if(oralState.listening){createRecognition();try{oralState.recognition.start()}catch(e){console.warn("SpeechRecognition restart:",e)}}
    },500);
  }
}
function finishOralAnswer(){
  if(!oralState.listening)return;
  oralState.stopping=true;
  oralState.listening=false;
  clearTimeout(oralState.restartTimer);
  clearTimeout(oralState.maxTimer);
  stopOralTimer();
  setOralStatus("Analizando respuesta…");
  const btn=$("oralMicBtn");
  btn.classList.remove("recording");
  $("oralMicIcon").textContent="⏳";
  $("oralMicText").textContent="Analizando…";
  if(oralState.recognition){
    try{oralState.recognition.stop();return}
    catch(error){console.warn("Stop recognition:",error)}
  }
  setTimeout(evaluateCollectedOralAnswer,300);
}
async function evaluateCollectedOralAnswer(){
  oralState.stopping=false;
  const transcript=oralState.transcript.trim();
  if(!transcript){
    resetMicButton();
    setOralStatus("No pude reconocer una respuesta. Inténtalo nuevamente o escribe tu respuesta.");
    return;
  }
  const result=evaluateLocally(oralState.question,transcript);
  showOralEvaluation(result,transcript);
}
function normalizeOralText(text){
  return String(text||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9ñ\s]/gi," ").replace(/\s+/g," ").trim();
}
const ORAL_STOP_WORDS=new Set(["el","la","los","las","un","una","unos","unas","de","del","a","al","en","con","por","para","que","se","es","son","y","o","como","cuando","donde","lo","le","su","sus","este","esta","esto","esa","ese","muy","mas","tambien","puede","pueden","ser"]);
function usefulTokens(text){return normalizeOralText(text).split(" ").filter(w=>w.length>2&&!ORAL_STOP_WORDS.has(w))}
function textSimilarity(a,b){
  const A=new Set(usefulTokens(a)),B=new Set(usefulTokens(b));
  if(!A.size||!B.size)return 0;
  let intersection=0;A.forEach(w=>{if(B.has(w))intersection++});
  return (2*intersection)/(A.size+B.size);
}

/* Normalizacion de jerga aeronautica: corrige variantes comunes de
   reconocimiento de voz para acronimos ingleses dichos con acento
   hispano (ej. "efcom"/"f com" -> "fcom"). Se aplica solo a la
   transcripcion del usuario; las rubricas ya estan en forma canonica. */
const AERO_TERM_MAP={
  "efcom":"fcom","f com":"fcom","fcon":"fcom","el fcom":"fcom","facom":"fcom","efe com":"fcom","efecom":"fcom",
  "el cam":"ecam","icam":"ecam","e cam":"ecam","ical":"ecam",
  "cu ere hache":"qrh","cure":"qrh","q r h":"qrh","curu":"qrh",
  "efe eme ge ce":"fmgc","el fmgc":"fmgc",
  "fa dec":"fadec","fadex":"fadec",
  "to ga":"toga",
  "es erre es":"srs","ese ere ese":"srs",
  "flecs":"flex","fles":"flex",
  "tikas":"tcas","ticas":"tcas","te cas":"tcas","tecas":"tcas",
  "tos":"taws","taus":"taws","taos":"taws",
  "a p u":"apu","apiu":"apu",
  "itops":"etops","etopes":"etops",
  "a te ce":"atc","ate ce":"atc",
  "e ge te":"egt",
  "ene uno":"n1","n uno":"n1",
  "ce erre eme":"crm",
  "el rat":"rat","erat":"rat",
  "adirus":"adirs","a dirs":"adirs"
};
function escapeRegExp(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
/* Reemplazo con limite de palabra: sin esto, "tos"->"taws" convertia
   "vientos" en "vientaws", y "erat"->"rat" convertia "operativa" en
   "oprativa". Se exige que la variante este rodeada por inicio/fin de
   cadena o espacio en ambos lados (una variante de varias palabras,
   como "to ga", se compara como esa secuencia exacta). Precompilado
   una vez porque AERO_TERM_MAP es estatico. */
const AERO_TERM_PATTERNS=Object.keys(AERO_TERM_MAP).map(variant=>({
  re:new RegExp("(^|\\s)"+escapeRegExp(variant)+"(?=\\s|$)","g"),
  replacement:AERO_TERM_MAP[variant]
}));
function normalizeAeroText(text){
  let t=normalizeOralText(text);
  for(const{re,replacement}of AERO_TERM_PATTERNS){
    re.lastIndex=0;
    t=t.replace(re,(m,pre)=>pre+replacement);
  }
  return t;
}
function containsWholeWordPhrase(transcriptStr,termNorm){
  if(!termNorm)return false;
  return new RegExp("(^|\\s)"+escapeRegExp(termNorm)+"($|\\s)").test(transcriptStr);
}
function wholeWordIndexOf(transcriptStr,termNorm){
  if(!termNorm)return -1;
  const m=new RegExp("(^|\\s)"+escapeRegExp(termNorm)+"($|\\s)").exec(transcriptStr);
  if(!m)return -1;
  return m.index+(m[1]?m[1].length:0);
}

/* Distancia de edicion (Levenshtein) para tolerar errores de
   transcripcion/tipeo, y coincidencia difusa por frase para que
   sinonimos y variantes razonables no se marquen como ausentes. */
function levenshtein(a,b){
  if(a===b)return 0;
  const al=a.length,bl=b.length;
  if(!al)return bl;if(!bl)return al;
  let prev=new Array(bl+1);
  for(let j=0;j<=bl;j++)prev[j]=j;
  for(let i=1;i<=al;i++){
    const curr=[i];
    for(let j=1;j<=bl;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      curr[j]=Math.min(prev[j]+1,curr[j-1]+1,prev[j-1]+cost);
    }
    prev=curr;
  }
  return prev[bl];
}
function fuzzyWordMatch(w1,w2){
  if(w1===w2)return true;
  if(w1.length<5||w2.length<5)return false;
  if(Math.abs(w1.length-w2.length)>2)return false;
  /* Resguardo de prefijo: en espanol muchos opuestos semanticos se
     forman con un prefijo corto (a-/des-/in-/no-), ej. ascendente vs
     descendente. Exigir que el inicio de la palabra coincida evita que
     el fuzzy matching confunda un concepto con su opuesto. */
  const prefixLen=Math.min(3,w1.length,w2.length);
  if(levenshtein(w1.slice(0,prefixLen),w2.slice(0,prefixLen))>1)return false;
  const maxLen=Math.max(w1.length,w2.length);
  const tolerance=maxLen<=7?1:2;
  return levenshtein(w1,w2)<=tolerance;
}
/* "no"/"ni" tienen menos de 3 letras y normalmente no cargan
   significado propio (se descartan como stopwords cortas), pero
   cuando SI son parte literal de un termino aceptado ("no presion
   fija", "no toca la pista") sacarlas de significantWords hacia el
   matcher difuso hace que el termino quede satisfecho con solo
   "presion fija" -- sin la negacion -- porque esas palabras nunca
   se exigen. Se preservan aqui para que el termino realmente
   requiera que la negacion este presente. */
const ORAL_NEGATION_MARKERS=new Set(["no","nunca","jamas","tampoco","ni"]);
function significantWords(termNormalized){return termNormalized.split(" ").filter(w=>w.length>=3||ORAL_NEGATION_MARKERS.has(w))}
function phraseFuzzyMatch(transcriptTokens,transcriptStr,term){
  const termNorm=normalizeAeroText(term);
  if(!termNorm)return false;
  if(containsWholeWordPhrase(transcriptStr,termNorm))return true;
  const words=significantWords(termNorm);
  if(!words.length)return false;
  if(words.length===1)return transcriptTokens.some(tok=>fuzzyWordMatch(tok,words[0]));
  /* Cada palabra del termino debe calzar con un token distinto: sin
     esto, un termino como "mayday mayday mayday" (3 repeticiones)
     quedaba satisfecho con un solo "mayday" en la respuesta, porque
     cada palabra buscaba desde el inicio sin recordar que un token ya
     habia sido usado por otra palabra del mismo termino. */
  const usedPositions=new Set();
  const positions=[];
  for(const w of words){
    let foundAt=-1;
    for(let i=0;i<transcriptTokens.length;i++){
      if(usedPositions.has(i))continue;
      if(fuzzyWordMatch(transcriptTokens[i],w)){foundAt=i;break}
    }
    if(foundAt===-1)return false;
    usedPositions.add(foundAt);
    positions.push(foundAt);
  }
  return (Math.max(...positions)-Math.min(...positions))<=(words.length+5);
}
/* Guardia de negacion: "no es una corriente descendente" contiene
   literalmente "corriente descendente" y sin esto se marcaria como
   detectado. Si el termino aceptado ya es en si una negacion (su
   primera palabra normalizada es un marcador de negacion, ej. "no
   presion fija", "no toca la pista"), no se aplica la guardia, para
   no autoanular esas rubricas. Solo mira unos pocos tokens antes de
   la primera palabra significativa del termino: no es un parser de
   alcance de negacion completo, cubre el patron real "no/nunca/jamas/
   tampoco + concepto" que aparece en respuestas orales cortas. */
function negatedBeforeMatch(transcriptTokens,transcriptStr,term){
  const termNorm=normalizeAeroText(term);
  if(!termNorm)return false;
  const termWords=termNorm.split(" ").filter(Boolean);
  if(termWords.length&&ORAL_NEGATION_MARKERS.has(termWords[0]))return false;
  let matchTokenPos=-1;
  const idx=wholeWordIndexOf(transcriptStr,termNorm);
  if(idx!==-1){
    matchTokenPos=transcriptStr.slice(0,idx).split(" ").length-1;
  }else{
    const words=significantWords(termNorm);
    if(!words.length)return false;
    for(let i=0;i<transcriptTokens.length;i++){if(fuzzyWordMatch(transcriptTokens[i],words[0])){matchTokenPos=i;break}}
  }
  if(matchTokenPos===-1)return false;
  for(let j=Math.max(0,matchTokenPos-5);j<matchTokenPos;j++){
    if(ORAL_NEGATION_MARKERS.has(transcriptTokens[j]))return true;
  }
  return false;
}
/* Busqueda complementaria de un concepto: ancla el termino en cada
   aparicion de su primera palabra y toma las demas palabras lo mas cerca
   posible de ese ancla. La busqueda original usa la primera aparicion de
   cada palabra, y en respuestas largas eso dejaba fuera menciones reales:
   "el flex no esta permitido ... el derated si esta permitido" no cumplia
   "derated esta permitido" (la primera aparicion de "esta permitido" queda
   lejos de "derated"), y una negacion en la primera mencion ("nunca bajar
   de green dot ... volar a green dot") anulaba tambien la mencion
   afirmativa posterior. La ventana es mas estrecha que la original (las
   palabras del termino deben quedar a lo sumo 2 posiciones mas separadas
   que en el termino), para no premiar palabras sueltas en respuestas
   largas. La negacion se revisa en las 5 palabras previas a cada ancla,
   igual que negatedBeforeMatch. itemDetected solo suma esta busqueda: si
   la original detecta, el resultado no cambia. */
function anchoredConceptMatch(transcriptTokens,term){
  const termNorm=normalizeAeroText(term);
  if(!termNorm)return false;
  const all=termNorm.split(" ").filter(Boolean);
  const termIsNegation=ORAL_NEGATION_MARKERS.has(all[0]);
  const negatedAt=a=>{
    if(termIsNegation)return false;
    for(let j=Math.max(0,a-5);j<a;j++){if(ORAL_NEGATION_MARKERS.has(transcriptTokens[j]))return true}
    return false;
  };
  for(let s=0;s+all.length<=transcriptTokens.length;s++){
    let same=true;
    for(let k=0;k<all.length;k++){if(transcriptTokens[s+k]!==all[k]){same=false;break}}
    if(same&&!negatedAt(s))return true;
  }
  const words=significantWords(termNorm);
  if(!words.length)return false;
  for(let a=0;a<transcriptTokens.length;a++){
    if(!fuzzyWordMatch(transcriptTokens[a],words[0]))continue;
    const used=new Set([a]);
    let lo=a,hi=a,complete=true;
    for(let k=1;k<words.length;k++){
      let best=-1;
      for(let i=0;i<transcriptTokens.length;i++){
        if(used.has(i)||!fuzzyWordMatch(transcriptTokens[i],words[k]))continue;
        if(best===-1||Math.abs(i-a)<Math.abs(best-a))best=i;
      }
      if(best===-1){complete=false;break}
      used.add(best);lo=Math.min(lo,best);hi=Math.max(hi,best);
    }
    if(complete&&hi-lo<=words.length+2&&!negatedAt(a))return true;
  }
  return false;
}
function itemDetected(transcriptTokens,transcriptStr,item){
  const accepted=item&&(item.accepted||item.terms);
  if(!Array.isArray(accepted))return false;
  return accepted.some(term=>(phraseFuzzyMatch(transcriptTokens,transcriptStr,term)&&!negatedBeforeMatch(transcriptTokens,transcriptStr,term))||anchoredConceptMatch(transcriptTokens,term));
}
/* Errores criticos. Un error critico es una afirmacion equivocada con un
   orden propio ("pan pan es mas grave que mayday"). El detector de
   conceptos ignora el orden de las palabras, y por eso la respuesta
   correcta "el MAYDAY es mas grave que el PAN PAN" (mismas palabras, orden
   inverso) se penalizaba con el error de la afirmacion invertida. Para los
   errores criticos se exige el mismo orden del termino, dentro de la misma
   ventana que usa phraseFuzzyMatch, y la coincidencia no cuenta si hay una
   negacion justo antes o dentro de ella ("el flex no esta permitido en
   pista contaminada" no afirma "flex esta permitido en pista contaminada"),
   salvo que el termino mismo incluya la negacion ("no digo nada"). Se
   revisan todas las apariciones, no solo la primera. */
function orderedMatchSpans(transcriptTokens,term){
  const termNorm=normalizeAeroText(term);
  if(!termNorm)return [];
  const spans=[];
  const all=termNorm.split(" ").filter(Boolean);
  for(let s=0;s+all.length<=transcriptTokens.length;s++){
    let same=true;
    for(let k=0;k<all.length;k++){if(transcriptTokens[s+k]!==all[k]){same=false;break}}
    if(same)spans.push([s,s+all.length-1]);
  }
  const words=significantWords(termNorm);
  if(!words.length)return spans;
  for(let s=0;s<transcriptTokens.length;s++){
    if(!fuzzyWordMatch(transcriptTokens[s],words[0]))continue;
    let pos=s,complete=true;
    for(let k=1;k<words.length;k++){
      let found=-1;
      for(let i=pos+1;i<transcriptTokens.length&&i<=s+words.length+5;i++){
        if(fuzzyWordMatch(transcriptTokens[i],words[k])){found=i;break}
      }
      if(found===-1){complete=false;break}
      pos=found;
    }
    if(complete)spans.push([s,pos]);
  }
  return spans;
}
function criticalItemDetected(transcriptTokens,item){
  const accepted=item&&(item.accepted||item.terms);
  if(!Array.isArray(accepted))return false;
  return accepted.some(term=>{
    const termHasNegation=normalizeAeroText(term).split(" ").some(w=>ORAL_NEGATION_MARKERS.has(w));
    return orderedMatchSpans(transcriptTokens,term).some(([a,b])=>{
      if(termHasNegation)return true;
      for(let j=Math.max(0,a-5);j<=b;j++){if(ORAL_NEGATION_MARKERS.has(transcriptTokens[j]))return false}
      return true;
    });
  });
}
function detectCriticalErrors(transcriptTokens,transcriptStr,question){
  const errors=[];let penaltyTotal=0;
  if(Array.isArray(question.criticalErrors)){
    question.criticalErrors.forEach(item=>{
      if(criticalItemDetected(transcriptTokens,item)){
        errors.push(item.feedback||"Se detectó un error conceptual.");
        penaltyTotal+=Number(item.penalty)||1.5;
      }
    });
  }
  return {errors,penaltyTotal};
}
function evaluateLocally(question,transcript){
  if(Array.isArray(question.steps)&&question.steps.length)return evaluateSteps(question,transcript);
  const transcriptStr=normalizeAeroText(transcript);
  const transcriptTokens=transcriptStr.split(" ").filter(Boolean);
  const concepts=Array.isArray(question.concepts)?question.concepts:[];
  let totalWeight=0,achievedWeight=0,missingRequired=false;
  const detected=[],missing=[];
  concepts.forEach(concept=>{
    const weight=Number(concept.weight)||1;totalWeight+=weight;
    if(itemDetected(transcriptTokens,transcriptStr,concept)){achievedWeight+=weight;detected.push(concept.label)}
    else{missing.push(concept.label);if(concept.required)missingRequired=true}
  });
  const conceptScore=totalWeight>0?achievedWeight/totalWeight:0;
  const similarity=question.reference?textSimilarity(transcript,question.reference):0;
  const {errors,penaltyTotal}=detectCriticalErrors(transcriptTokens,transcriptStr,question);
  let rawScore=totalWeight>0?(conceptScore*0.85+similarity*0.15)*10:similarity*10;
  rawScore-=Math.min(penaltyTotal,6);
  if(missingRequired)rawScore=Math.min(rawScore,4);
  rawScore=Math.max(0,Math.min(10,rawScore));
  return {score:Math.round(rawScore*10)/10,detected,missing,errors,similarity:Math.round(similarity*100),source:"local"};
}
function evaluateSteps(question,transcript){
  const transcriptStr=normalizeAeroText(transcript);
  const transcriptTokens=transcriptStr.split(" ").filter(Boolean);
  const steps=question.steps||[];
  let totalWeight=0,achievedWeight=0,missingRequired=false;
  const detected=[],missing=[],foundPositions=[];
  steps.forEach(step=>{
    const weight=Number(step.weight)||1;totalWeight+=weight;
    const accepted=step.accepted||[];
    let hit=false,hitPos=-1;
    for(const term of accepted){
      const n=normalizeAeroText(term);
      const idx=n?wholeWordIndexOf(transcriptStr,n):-1;
      if(idx!==-1&&!negatedBeforeMatch(transcriptTokens,transcriptStr,term)){hit=true;hitPos=transcriptStr.slice(0,idx).split(" ").length-1;break}
    }
    if(!hit){
      for(const term of accepted){
        if(phraseFuzzyMatch(transcriptTokens,transcriptStr,term)&&!negatedBeforeMatch(transcriptTokens,transcriptStr,term)){
          hit=true;
          const words=significantWords(normalizeAeroText(term));
          if(words.length){for(let i=0;i<transcriptTokens.length;i++){if(fuzzyWordMatch(transcriptTokens[i],words[0])){hitPos=i;break}}}
          break;
        }
      }
    }
    if(hit){achievedWeight+=weight;detected.push(step.concept||step.label);foundPositions.push({order:step.order||0,pos:hitPos})}
    else{missing.push(step.concept||step.label);if(step.required)missingRequired=true}
  });
  const conceptScore=totalWeight>0?achievedWeight/totalWeight:0;
  const similarity=question.reference?textSimilarity(transcript,question.reference):0;
  const {errors,penaltyTotal}=detectCriticalErrors(transcriptTokens,transcriptStr,question);
  const sortedByPos=[...foundPositions].sort((a,b)=>a.pos-b.pos);
  let orderPenalty=0;
  for(let i=1;i<sortedByPos.length;i++){if(sortedByPos[i].order<sortedByPos[i-1].order)orderPenalty++}
  let rawScore=(conceptScore*0.85+similarity*0.15)*10;
  rawScore-=Math.min(orderPenalty,2);
  rawScore-=Math.min(penaltyTotal,6);
  if(missingRequired)rawScore=Math.min(rawScore,4);
  rawScore=Math.max(0,Math.min(10,rawScore));
  if(orderPenalty>0)errors.push("El orden de algunos pasos no coincide con la secuencia esperada.");
  return {score:Math.round(rawScore*10)/10,detected,missing,errors,similarity:Math.round(similarity*100),source:"local"};
}
function showOralEvaluation(result,transcript){
  resetMicButton();
  $("oralResult").classList.remove("hidden");
  const score=Number(result.score)||0;
  $("oralScore").textContent=score.toFixed(score%1?1:0)+"/10";
  let grade,gradeClass;
  if(score>=9){grade="Cobertura muy alta";gradeClass="good"}
  else if(score>=7.5){grade="Cobertura alta";gradeClass="good"}
  else if(score>=6){grade="Cobertura media";gradeClass="mid"}
  else if(score>=4){grade="Cobertura parcial";gradeClass="mid"}
  else{grade="Cobertura baja";gradeClass="low"}
  $("oralGrade").textContent=grade;
  $("oralGrade").className="oral-grade "+gradeClass;
  let html="";
  if(result.detected&&result.detected.length){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title ok">✓ BIEN</div>';
    result.detected.forEach(item=>{html+='<div class="oral-feedback-item">✓ '+esc(item)+'</div>'});
    html+="</div>";
  }
  if(result.missing&&result.missing.length){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title warn">PODRÍAS AGREGAR</div>';
    result.missing.forEach(item=>{html+='<div class="oral-feedback-item">• '+esc(item)+'</div>'});
    html+="</div>";
  }
  if(result.errors&&result.errors.length){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title bad">⚠ REVISAR</div>';
    result.errors.forEach(item=>{html+='<div class="oral-feedback-item">⚠ '+esc(item)+'</div>'});
    html+="</div>";
  }
  if(result.feedback){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title">COMENTARIO</div><div class="oral-feedback-item">'+esc(result.feedback)+'</div></div>';
  }
  html+='<div class="oral-feedback-block"><div class="oral-feedback-title">RESPUESTA DE REFERENCIA</div><div class="oral-feedback-item">'+(oralState.question.short?'<p class="ref-short">'+esc(oralState.question.short)+'</p>':'')+formatRefHtml(oralState.question.reference||"")+'</div></div>';
  $("oralFeedback").innerHTML=html;
  const revealBox=$("oralTranscriptReveal");
  revealBox.classList.add("hidden");
  revealBox.dataset.transcript=transcript||"";
  setOralStatus("Respuesta evaluada.");
  const q=oralVoiceQuestion();
  if(q&&oralState.question&&q.id===oralState.question.id){
    oralState.scores[q.id]=score;
    $("ovNextBtn").disabled=false;
    const prevEntry=appState.oralVoice[q.id];
    appState.oralVoice[q.id]={score,attempts:(prevEntry?.attempts||0)+1,last:Date.now()};
    saveState();
  }
}
function toggleOralTranscriptReveal(){
  const box=$("oralTranscriptReveal");
  if(box.classList.contains("hidden")){
    box.textContent=box.dataset.transcript?("Se transcribió: “"+box.dataset.transcript+"”"):"No se guardó transcripción para esta respuesta.";
    box.classList.remove("hidden");
  }else{box.classList.add("hidden")}
}
function restartOralAnswer(){
  oralState.transcript="";
  $("oralResult").classList.add("hidden");
  setOralStatus("Toca el micrófono cuando estés listo.");
}
function startOralTimer(){
  stopOralTimer();
  $("oralTime").style.display="block";
  updateOralTimer();
  oralState.timer=setInterval(updateOralTimer,1000);
}
function updateOralTimer(){
  if(!oralState.startTime)return;
  const seconds=Math.floor((Date.now()-oralState.startTime)/1000);
  const mins=Math.floor(seconds/60),secs=seconds%60;
  $("oralTime").textContent=String(mins).padStart(2,"0")+":"+String(secs).padStart(2,"0");
}
function stopOralTimer(){clearInterval(oralState.timer);oralState.timer=null}
function setRecordingButton(){
  $("oralMicBtn").classList.add("recording");
  $("oralMicIcon").textContent="●";
  $("oralMicText").textContent="Terminar respuesta";
}
function resetMicButton(){
  const btn=$("oralMicBtn");if(!btn)return;
  btn.classList.remove("recording");
  $("oralMicIcon").textContent="🎙️";
  $("oralMicText").textContent="Responder";
}
function setOralStatus(text,listening){
  const status=$("oralStatus");if(!status)return;
  status.textContent=text;
  status.classList.toggle("listening",!!listening);
}
let oralGeneration=0;
function stopEverythingOral(){
  oralGeneration++;
  oralState.listening=false;oralState.stopping=false;
  clearTimeout(oralState.restartTimer);clearTimeout(oralState.maxTimer);
  stopOralTimer();
  if(oralState.recognition){try{oralState.recognition.abort()}catch(e){}}
  oralState.recognition=null;
}
function loadQuestionFromA320Bank(q){
  if(!q)return;
  const oralQuestion={id:q.id||q._id||"",question:q.oralQuestion||q.question||q.q||"",reference:q.oralReference||q.reference||q.expl||"",short:q.short||"",concepts:q.oralConcepts||q.concepts||[],criticalErrors:q.oralCriticalErrors||q.criticalErrors||[],steps:q.oralSteps||q.steps||[],image:q.image||"",imageAlt:q.imageAlt||""};
  setOralQuestion(oralQuestion);
}
document.addEventListener("keydown",e=>{
  if($("quiz").classList.contains("hidden"))return;
  if(["1","2","3","4","5","6"].includes(e.key)){const i=Number(e.key)-1;if(i<sessionQuestion().options.length)selectOption(i)}
  if(e.key==="ArrowRight"&&!$("nextBtn").disabled)nextQuestion();
  if(e.key==="ArrowLeft"&&!$("prevBtn").disabled)prevQuestion();
});
/* ---------- NEED TO KNOW ----------
   Seccion destacada con las preguntas clave de la entrevista. La lista base (NTK_GROUPS) se combina
   con lo que cada usuario agrega o quita (appState.needToKnow = {added:[], removed:[]}): asi una
   pregunta base nueva le llega a todos sin perder sus cambios. Referencias: "o:<id oral>" para las
   preguntas de Entrevista oral y "q:<_id>" para las de alternativas. Las orales se practican con el
   mismo microfono y la misma evaluacion de Entrevista oral (se mueve .oral-mic-box a la tarjeta);
   las de alternativas, con sus alternativas y una explicacion sin citas. */
const NTK_GROUPS=[
  {title:"Performance y pesos",items:["o:ov_mac_envelope","o:ov_weights","o:ov_cost_index","o:ov_fuel_dan121","o:ov_cg_effects"]},
  {title:"Despegue",items:["o:ov_contaminated_rwy","o:ov_flex_derate_def","o:ov_flex_derate_contam","o:ov_balanced_unbalanced","o:ov_improve_takeoff","o:ov_improved_climb","o:ov_takeoff_segments","o:ov_tailwind_takeoff","o:ov_vmc_cg_weight"]},
  {title:"Velocidades",items:["o:ov_limit_speeds","o:ov_green_dot","o:ov_srs","o:ov_gs_mini","o:ov_coffin_corner"]},
  {title:"Sistemas y leyes",items:["o:ov_fmgs_functions","o:ov_fc_laws","o:ov_dual_ra_direct"]},
  {title:"Aproximación y crucero",items:["o:ov_appr_ldg_climb","o:ov_stab_appr","o:ov_eng_fail_cruise","o:ov_rvsm_equipment"]},
  {title:"Procedimientos",items:["o:ov_ecam_priorities","o:ov_ecam_handling","o:ov_ecam_after","o:ov_emergency_atc","o:ov_golden_rules"]}
];
/* Como funcion (no const): sanitizeState la usa al cargar el estado, antes de que el script llegue hasta aqui. */
function ntkRefOk(x){return typeof x==="string"&&/^[oq]:[A-Za-z0-9_:.\-]{1,200}$/.test(x)}
function sanitizeNeedToKnow(v){
  const out={added:[],removed:[]};
  if(!isPlainObject(v))return out;
  const list=a=>Array.isArray(a)?[...new Set(a.filter(ntkRefOk))].slice(0,500):[];
  out.added=list(v.added);out.removed=list(v.removed);
  return out;
}
function ntkDefaults(){return NTK_GROUPS.flatMap(g=>g.items)}
function ntkResolve(ref){
  if(!ntkRefOk(ref))return null;
  if(ref.charAt(0)==="o"){const q=ORAL_VOICE_BANK.find(x=>x.id===ref.slice(2));return q?{ref,kind:"oral",q}:null}
  const q=findById(ref.slice(2));
  return q&&isStructurallyValid(q)?{ref,kind:"mcq",q}:null;
}
function ntkState(){
  if(!isPlainObject(appState.needToKnow)||!Array.isArray(appState.needToKnow.added)||!Array.isArray(appState.needToKnow.removed))appState.needToKnow=sanitizeNeedToKnow(appState.needToKnow);
  return appState.needToKnow;
}
function ntkRefs(){
  const st=ntkState(),removed=new Set(st.removed),seen=new Set(),out=[];
  [...ntkDefaults(),...st.added].forEach(r=>{if(!removed.has(r)&&!seen.has(r)&&ntkResolve(r)){seen.add(r);out.push(r)}});
  return out;
}
function ntkHas(ref){return ntkRefs().includes(ref)}
function ntkAdd(ref){
  if(!ntkResolve(ref))return false;
  const st=ntkState();
  st.removed=st.removed.filter(r=>r!==ref);
  if(!ntkDefaults().includes(ref)&&!st.added.includes(ref))st.added.push(ref);
  saveState();return true;
}
function ntkRemove(ref){
  const st=ntkState();
  st.added=st.added.filter(r=>r!==ref);
  if(ntkDefaults().includes(ref)&&!st.removed.includes(ref))st.removed.push(ref);
  saveState();
}
function ntkToggle(ref){
  if(ntkHas(ref)){ntkRemove(ref);toast("Quitada de Need to know")}
  else if(ntkAdd(ref))toast("Agregada a Need to know");
}
function ntkThemeOf(ref){const g=NTK_GROUPS.find(x=>x.items.includes(ref));return g?g.title:"Agregada por ti"}
function ntkPracticed(ref){
  const it=ntkResolve(ref);if(!it)return null;
  if(it.kind==="oral"){const e=appState.oralVoice[it.q.id];return e?{score:finiteNum(e.score)}:null}
  const s=appState.stats[it.q._id];return s&&s.a?{ok:s.lastResult===1}:null;
}
function ntkScoreText(n){return n.toFixed(n%1?1:0)}
/* Boton "+ Need to know" de las otras pantallas (alternativas, autoevaluacion, entrevista oral). */
function renderNtkToggle(btnId,ref){
  const b=$(btnId);if(!b)return;
  if(!ref||!ntkResolve(ref)){b.classList.add("hidden");delete b.dataset.ref;return}
  const on=ntkHas(ref);
  b.classList.remove("hidden");b.dataset.ref=ref;
  b.classList.toggle("active",on);
  b.textContent=on?"★ Need to know":"+ Need to know";
  b.setAttribute("aria-pressed",on?"true":"false");
  b.setAttribute("aria-label",on?"Quitar de Need to know":"Agregar a Need to know");
}
function ntkToggleFromBtn(btn){const ref=btn&&btn.dataset.ref;if(!ref)return;ntkToggle(ref);renderNtkToggle(btn.id,ref)}
/* El microfono de Entrevista oral se presta a la tarjeta y vuelve a su lugar al salir. */
function ntkPlaceOralBox(){const box=document.querySelector(".oral-mic-box"),slot=$("ntkOralSlot");if(box&&slot&&box.parentNode!==slot)slot.appendChild(box)}
function ntkRestoreOralBox(){
  const box=document.querySelector(".oral-mic-box"),home=$("oralVoice");
  if(!box||!home||box.parentNode===home)return;
  home.insertBefore(box,home.querySelector(".bottom-nav"));
}
/* Respuestas en parrafos y listas: "- " o "1. " al inicio de linea arman listas; "Etiqueta: texto" resalta la etiqueta. */
function formatRefHtml(text){
  const lead=s=>{const m=/^([^:.]{2,60}):\s+(\S.*)$/.exec(s);return m?`<b>${esc(m[1])}:</b> ${esc(m[2])}`:esc(s)};
  return String(text||"").split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean).map(block=>{
    const out=[];let list=null;
    block.split("\n").map(l=>l.trim()).filter(Boolean).forEach(line=>{
      const ul=/^-\s+(.*)$/.exec(line),ol=/^\d+\.\s+(.*)$/.exec(line),type=ul?"ul":ol?"ol":null;
      if(!type){list=null;out.push(`<p>${lead(line)}</p>`);return}
      if(!list||list.type!==type){list={type,items:[]};out.push(list)}
      list.items.push(lead((ul||ol)[1]));
    });
    return out.map(x=>typeof x==="string"?x:`<${x.type} class="ref-list">${x.items.map(i=>`<li>${i}</li>`).join("")}</${x.type}>`).join("");
  }).join("");
}
let ntkSession=null;
function openNeedToKnow(){stopEverythingOral();ntkRestoreOralBox();ntkSession=null;session=null;show("ntk");renderNtkList()}
function renderNtkList(){
  const refs=ntkRefs(),set=new Set(refs),defaults=ntkDefaults(),st=ntkState();
  const groups=NTK_GROUPS.map(g=>({title:g.title,items:g.items.filter(r=>set.has(r))}));
  const extra=refs.filter(r=>!defaults.includes(r));
  if(extra.length)groups.push({title:"Agregadas por ti",items:extra});
  let h="";
  groups.forEach(g=>{
    if(!g.items.length)return;
    h+=`<div class="section-label">${esc(g.title)}</div>`;
    g.items.forEach(r=>{
      const it=ntkResolve(r),p=ntkPracticed(r);
      const text=it.kind==="oral"?it.q.question:it.q.q;
      const meta=(it.kind==="oral"?"Respuesta oral":"Alternativas · "+systemName(it.q._sys))+(p?(p.score!==undefined?` · última vez ${ntkScoreText(p.score)}/10`:(p.ok?" · última vez correcta":" · última vez incorrecta")):"");
      h+=`<div class="ntk-item"><button type="button" class="ntk-open" data-ref="${esc(r)}" onclick="ntkStart(this.dataset.ref)"><span class="ntk-meta">${esc(meta)}</span><span class="ntk-q">${esc(text)}</span></button><button type="button" class="ntk-remove" data-ref="${esc(r)}" onclick="ntkRemoveFromList(this.dataset.ref)" aria-label="Quitar de Need to know">Quitar</button></div>`;
    });
  });
  $("ntkBody").innerHTML=h||`<div class="empty">No tienes preguntas en Need to know. Agrégalas con el botón “+ Need to know” en cualquier pregunta de la app, o restaura las preguntas iniciales.</div>`;
  const done=refs.filter(r=>ntkPracticed(r)).length;
  $("ntkSummary").textContent=refs.length?`${refs.length} ${plural(refs.length,"pregunta","preguntas")}${done?` · ${done} ${plural(done,"practicada","practicadas")}`:""}`:"";
  $("ntkStartBtn").classList.toggle("hidden",!refs.length);
  $("ntkRestoreBtn").classList.toggle("hidden",!st.removed.some(r=>defaults.includes(r)));
}
function ntkRemoveFromList(ref){ntkRemove(ref);renderNtkList();toast("Quitada de Need to know")}
function ntkRestoreDefaults(){ntkState().removed=[];saveState();renderNtkList();toast("Se restauraron las preguntas iniciales")}
function ntkStart(ref){
  const refs=ntkRefs();if(!refs.length)return;
  const i=typeof ref==="string"?Math.max(0,refs.indexOf(ref)):0;
  ntkSession={refs,index:i,mcq:null};
  show("ntkCard");renderNtkCard();
}
function ntkCurrent(){return ntkSession?ntkResolve(ntkSession.refs[ntkSession.index]):null}
function renderNtkCard(){
  stopEverythingOral();
  const it=ntkCurrent();
  if(!it){ntkExitCard();return}
  const n=ntkSession.refs.length,i=ntkSession.index;
  $("ntkMeta").textContent=`NEED TO KNOW · ${i+1} / ${n}`;
  $("ntkProgress").style.width=`${((i+1)/n)*100}%`;
  $("ntkTheme").textContent=ntkThemeOf(it.ref);
  $("ntkReveal").classList.add("hidden");$("ntkReveal").innerHTML="";
  $("ntkPrevBtn").disabled=i===0;
  $("ntkNextBtn").textContent=i===n-1?"Terminar":"Siguiente";
  const mcq=$("ntkMcq");
  if(it.kind==="oral"){
    ntkSession.mcq=null;
    $("ntkEyebrow").textContent="RESPONDE CON TU VOZ O ESCRIBIENDO";
    $("ntkQuestion").textContent=it.q.question;
    mcq.innerHTML="";mcq.classList.add("hidden");
    ntkPlaceOralBox();
    oralState.pool=[it.q];oralState.index=0;
    loadQuestionFromA320Bank(it.q);
    $("ntkRevealBtn").classList.remove("hidden");
  }else{
    ntkRestoreOralBox();
    if(!ntkSession.mcq||ntkSession.mcq.ref!==it.ref)ntkSession.mcq={ref:it.ref,q:buildSessionQ(it.q),ans:null};
    $("ntkEyebrow").textContent="ELIGE LA ALTERNATIVA CORRECTA";
    $("ntkQuestion").textContent=it.q.q;
    mcq.classList.remove("hidden");
    $("ntkRevealBtn").classList.add("hidden");
    renderNtkMcq();
  }
}
function renderNtkMcq(){
  const m=ntkSession&&ntkSession.mcq;if(!m)return;
  const q=m.q,ans=m.ans;
  let h=q.options.map((o,i)=>{
    let cls="option";
    if(ans!==null){cls+=" locked";if(i===q.correct)cls+=" correct";else if(i===ans)cls+=" wrong"}
    return `<button type="button" class="${cls}" onclick="ntkSelect(${i})" aria-pressed="${i===ans?"true":"false"}"${ans!==null?" disabled":""}><div class="letter">${LETTERS[i]||i+1}</div><div class="otxt">${esc(o)}</div></button>`;
  }).join("");
  if(ans===null)h+=`<button type="button" class="dontknow" onclick="ntkSelect(-1)">No la sé · mostrar respuesta</button>`;
  else h+=`<div class="answer-wrap">${ntkMcqFeedback(q,ans===q.correct)}</div>`;
  $("ntkMcq").innerHTML=h;
}
function ntkSelect(i){
  const m=ntkSession&&ntkSession.mcq;if(!m||m.ans!==null)return;
  m.ans=i;
  if(m.q.bank!=="dgac")recordTechnical(m.q,i===m.q.correct);
  renderNtkMcq();
}
function ntkMcqFeedback(q,isOk){
  return `<div class="feedback-head ${isOk?"ok":"bad"}"><div class="status">${isOk?"Correcta":"Respuesta correcta"}</div><strong>${esc(q._correctText||q.options[q.correct])}</strong></div>${q.expl?`<div class="explain"><div class="label">Por qué</div><p>${esc(q.expl)}</p></div>`:""}`;
}
function ntkAnswerHtml(q){
  return `${q.short?`<div class="ntk-short"><div class="label">La idea</div><p>${esc(q.short)}</p></div>`:""}<div class="explain ntk-explain"><div class="label">Explicación</div>${formatRefHtml(q.reference)}</div>`;
}
function ntkReveal(){
  const it=ntkCurrent();if(!it||it.kind!=="oral")return;
  const box=$("ntkReveal");
  box.innerHTML=ntkAnswerHtml(it.q);box.classList.remove("hidden");
  $("ntkRevealBtn").classList.add("hidden");
  if(box.scrollIntoView)box.scrollIntoView({block:"start",behavior:"smooth"});
}
function ntkPrev(){if(ntkSession&&ntkSession.index>0){ntkSession.index--;renderNtkCard();window.scrollTo(0,0)}}
function ntkNext(){
  if(!ntkSession)return;
  if(ntkSession.index<ntkSession.refs.length-1){ntkSession.index++;renderNtkCard();window.scrollTo(0,0);return}
  const n=ntkSession.refs.length;
  ntkExitCard();toast(`Repasaste ${n} ${plural(n,"pregunta","preguntas")} de Need to know`);
}
function ntkExitCard(){stopEverythingOral();ntkRestoreOralBox();ntkSession=null;show("ntk");renderNtkList()}

function oralBankIntegrity(){
  let issues=0;
  if(!Array.isArray(ORAL_VOICE_BANK))return 0;
  const seenIds=new Set();
  ORAL_VOICE_BANK.forEach(q=>{
    if(!q||typeof q.id!=="string"||!q.id||seenIds.has(q.id)){issues++;return}
    seenIds.add(q.id);
    if(!String(q.question||"").trim()||!String(q.reference||"").trim()){issues++;return}
    const rubric=Array.isArray(q.steps)&&q.steps.length?q.steps:q.concepts;
    if(!Array.isArray(rubric)||!rubric.length){issues++;return}
    rubric.forEach(item=>{
      if(!item||typeof item!=="object"){issues++;return}
      const accepted=Array.isArray(item.accepted)?item.accepted:null;
      if(!accepted||!accepted.length||!accepted.every(term=>typeof term==="string"&&term.trim()))issues++;
      if(item.weight!==undefined&&(!Number.isFinite(item.weight)||item.weight<=0))issues++;
    });
  });
  return issues;
}
/* "Integridad" es estructural: forma valida de cada pregunta (banco
   tecnico/DGAC) y de cada rubrica (banco oral). No certifica que el
   contenido aeronautico sea correcto - eso se audita por separado
   contra el FCOM/FCTM y no lo puede confirmar esta funcion. */
function bankIntegrity(){
  let structural=0,verifiedMissing=0;
  const seenIds=new Set();
  Object.entries(SYSTEMS).forEach(([k,s])=>(s.questions||[]).forEach(q=>{
    if(!isStructurallyValid(q)){structural++;return}
    if(k!==DGAC_KEY&&(!String(q.expl||"").trim()||!String(q.cite||"").trim()))verifiedMissing++;
    const id=qid(k,q);
    if(seenIds.has(id))structural++;else seenIds.add(id);
  }));
  const oralIssues=oralBankIntegrity();
  const englishIssues=englishIntegrity();
  const issues=structural+verifiedMissing+oralIssues+englishIssues;
  return{ok:issues===0,issues,structural,verifiedMissing,oralIssues,englishIssues};
}
async function exportProgress(){
  const payload={
    meta:{product:"A320 Interview Trainer",appVersion:APP_VERSION,bankVersion:BANK_VERSION,schema:STATE_SCHEMA,exportedAt:new Date().toISOString()},
    state:appState
  };
  const text=JSON.stringify(payload,null,2);
  const fileName=`A320_Trainer_Progreso_${new Date().toISOString().slice(0,10)}.json`;
  try{
    const file=new File([text],fileName,{type:"application/json"});
    if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:"Copia de progreso A320 Trainer"});
      toast("Copia preparada");return;
    }
  }catch(e){if(e&&e.name==="AbortError")return}
  try{
    const blob=new Blob([text],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Copia de progreso creada");
  }catch(e){toast("No fue posible crear la copia")}
}
function importProgress(event){
  const input=event.target,file=input.files&&input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      const incoming=parsed&&parsed.state?parsed.state:parsed;
      if(!looksLikeValidBackup(incoming))throw new Error("Formato inválido");
      if(!confirm("Restaurar esta copia reemplazará el progreso guardado actualmente en este dispositivo. ¿Continuar?")){input.value="";return}
      const candidate=sanitizeState(incoming);
      const ok=(()=>{appState=candidate;return saveState()})();
      session=null;currentSystemKey=null;renderHome();show("home");
      toast(ok?"Progreso restaurado":"Progreso restaurado en esta sesión, pero no se pudo guardar en el dispositivo");
    }catch(e){toast("La copia no es válida")}
    input.value="";
  };
  reader.onerror=()=>{toast("No fue posible leer la copia");input.value=""};
  reader.readAsText(file);
}
/* ==========================================================
   INGLÉS OACI - pruebas sin nota
   Cada prueba es una sola tanda que mezcla al azar alternativas, audios (ATIS y
   autorizaciones), imágenes para describir y un role-play con ATC: las alternativas
   se reparten entre los demás ejercicios, sin secciones. Al entrar te toca una prueba
   al azar y no se repite hasta completar las demás. Nada de esto calcula una nota ni
   un nivel: se revela el modelo, el usuario se compara y sigue. Los audios se leen con
   voces en inglés del propio dispositivo (no se distribuye audio): en cada audio suena
   una voz al azar, siempre a la misma velocidad. Nada de lo que se ve cita manuales,
   secciones ni carpetas (la app se distribuye a gente que no tiene esos documentos):
   las fuentes (cite, src, refs) son un dato interno para verificar y no se muestran.
   ========================================================== */
const EN_PREF_KEY="a320-english-prefs:v1";
const EN_MAX_SECONDS=90,EN_MAX_RESTARTS=25;
const EN_AUDIO_RATE=1;
const EN_RADIO_DIGITS={three:"tree",four:"fower",five:"fife",nine:"niner"};
/* Voces de «novedad» de macOS/iOS (Zarvox, Bells…): son inglés técnicamente, pero no sirven para practicar. */
const EN_NOVELTY_VOICE=/^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox)\b/i;
/* Palabras que delatan una referencia a un manual, una sección o una carpeta: no pueden aparecer en ningún texto visible. */
const EN_SOURCE_REF=/\bmanual\b|§|\b9432\b|\bFCTM\b|\bFCOM\b|\bPDF\b|carpeta|\bAnexo\b|\bAIP\b|\bp\. ?\d|\bforeword\b|\bprólogo\b|\btable in\b|\bnote in the\b/i;
function enSourceRef(s){return EN_SOURCE_REF.test(s)||/\bAPP\b/.test(s)}
let enSession=null,enHubNote="";
const enMedia={audioGen:0,speaking:false,sayBtn:null,utter:null,voicesLoaded:false,micGen:0,listening:false,stopping:false,rec:null,base:"",final:"",interim:"",restarts:0,timer:null,maxTimer:null,restartTimer:null,startTime:null,micOk:false};

/* ---------- preferencias (solo comodidad; si falla el almacenamiento, todo sigue igual) ---------- */
function enPrefs(){try{const p=JSON.parse(localStorage.getItem(EN_PREF_KEY)||"{}");return isPlainObject(p)?p:{}}catch(e){return{}}}
function enPref(k,def){const p=enPrefs();return k in p?p[k]:def}

/* ---------- datos de las pruebas ---------- */
function enById(list,id){return (Array.isArray(list)?list:[]).find(x=>isPlainObject(x)&&x.id===id)||null}
function enTests(){return (Array.isArray(ENGLISH.pruebas)?ENGLISH.pruebas:[]).filter(t=>isPlainObject(t)&&Number.isInteger(t.n)&&t.n>=1)}
function enTestByN(n){return enTests().find(t=>t.n===n)||null}
/* Cada turno del role-play se comporta como un ejercicio de hablar; se le agrega lo que ya pasó para mostrar la conversación. */
function enRoleplayItems(rp){
  const turns=Array.isArray(rp&&rp.turns)?rp.turns:[];
  return turns.map((t,i)=>({
    id:`${rp.id}_t${i+1}`,title:rp.title,scenario:rp.scenario,
    heard:t.heard,prompt:t.prompt,model:t.model,points:t.points,vocab:t.vocab,note:t.note,
    rp:{turn:i+1,turns:turns.length,history:turns.slice(0,i).map(p=>({heard:p.heard||[],said:(p.model||[])[0]||""}))}
  }));
}
/* Los ejercicios de una prueba se identifican con una letra y su id: q (alternativa), l (audio), i (imagen) y r (role-play). */
function enUnitRefs(t){
  return [...(t.mcq||[]).map(id=>"q:"+id),...(t.listening||[]).map(id=>"l:"+id),...(t.images||[]).map(id=>"i:"+id),"r:"+t.roleplay];
}
function enValidOrder(t,order){
  const want=enUnitRefs(t);
  return Array.isArray(order)&&order.length===want.length&&order.slice().sort().join("|")===want.slice().sort().join("|");
}
/* Mezcla al azar los ejercicios de una prueba: las alternativas se reparten entre los demás ejercicios (audios,
   imágenes y role-play), de modo que nunca hay dos de esos seguidos ni bloques por tipo. */
function enOrderFor(t){
  const qs=shuffle((t.mcq||[]).map(id=>"q:"+id));
  const rest=shuffle([...(t.listening||[]).map(id=>"l:"+id),...(t.images||[]).map(id=>"i:"+id),"r:"+t.roleplay]);
  if(rest.length>qs.length+1)return shuffle([...qs,...rest]);
  const at=new Set(shuffle([...Array(qs.length+1).keys()]).slice(0,rest.length));
  const out=[];let r=0;
  for(let g=0;g<=qs.length;g++){
    if(at.has(g))out.push(rest[r++]);
    if(g<qs.length)out.push(qs[g]);
  }
  return out;
}
/* Ejercicio (o ejercicios, si es un role-play de varios turnos) que corresponde a una referencia de la lista. */
function enUnitItems(ref){
  const k=ref[0],id=ref.slice(2);
  if(k==="q"){const q=enById(ENGLISH.mcq,id);return q?{kind:"mcq",items:[q]}:null}
  if(k==="l"){const x=enById(ENGLISH.listening,id);return x?{kind:"listening",items:[x]}:null}
  if(k==="i"){const x=enById(ENGLISH.images,id);return x?{kind:"image",items:[x]}:null}
  if(k==="r"){const items=enRoleplayItems(enById(ENGLISH.roleplays,id));return items.length?{kind:"roleplay",items}:null}
  return null;
}
/* Todo lo que el usuario ve de un ejercicio (las fuentes internas: cite, src, refs, ref y credit, no se muestran). */
function enVisibleTexts(k,x){
  const out=[],add=v=>{if(typeof v==="string")out.push(v)},addAll=a=>{if(Array.isArray(a))a.forEach(add)};
  if(k==="mcq"){add(x.q);addAll(x.options);add(x.expl)}
  else if(k==="listening"){add(x.title);add(x.scenario);(x.lines||[]).forEach(l=>add(l.text));(x.after||[]).forEach(l=>add(l.text));(x.keys||[]).forEach(z=>{add(z.label);add(z.value)});addAll(x.notes)}
  else if(k==="image"){["title","topic","alt","model","context"].forEach(f=>add(x[f]));["prompts","seen","might","points"].forEach(f=>addAll(x[f]));(x.vocab||[]).forEach(v=>{add(v.en);add(v.es)});if(x.radio){add(x.radio.intro);addAll(x.radio.lines)}}
  else if(k==="roleplay"){add(x.title);add(x.scenario);(x.turns||[]).forEach(t=>{add(t.prompt);(t.heard||[]).forEach(l=>add(l.text));addAll(t.model);addAll(t.points);(t.vocab||[]).forEach(v=>{add(v.en);add(v.es)});add(t.note)})}
  return out;
}

/* ---------- integridad estructural del banco de inglés (alternativas, imágenes, audios, role-plays y pruebas) ---------- */
function englishIntegrity(){
  let issues=0;
  const seen=new Set(),str=v=>typeof v==="string"&&v.trim().length>0;
  const strs=(a,min)=>Array.isArray(a)&&a.length>=min&&a.every(str);
  const uid=x=>{if(!isPlainObject(x)||!str(x.id)||seen.has(x.id))return false;seen.add(x.id);return true};
  const vocabOk=a=>Array.isArray(a)&&a.length>=1&&a.every(v=>isPlainObject(v)&&str(v.en)&&str(v.es));
  const refOk=r=>isPlainObject(r)&&str(r.src)&&str(r.cite);
  const linesOk=a=>Array.isArray(a)&&a.length>0&&a.every(l=>isPlainObject(l)&&(l.who==="atc"||l.who==="pilot")&&str(l.text));
  const clean=(k,x)=>{if(enVisibleTexts(k,x).some(enSourceRef))issues++};
  (ENGLISH.mcq||[]).forEach(q=>{
    if(!uid(q)){issues++;return}
    if(!isStructurallyValid(q)||!str(q.topic)||!str(q.expl)||!str(q.cite)||!str(q.src)){issues++;return}
    clean("mcq",q);
  });
  (ENGLISH.images||[]).forEach(x=>{
    if(!uid(x)){issues++;return}
    if(!str(x.file)||!str(x.alt)||!str(x.title)||!str(x.model)||!strs(x.prompts,1)||!strs(x.seen,1)||!strs(x.might,1)||!strs(x.points,1)||!vocabOk(x.vocab)||!isPlainObject(x.credit)||!str(x.credit.text)||!str(x.credit.url)){issues++;return}
    clean("image",x);
  });
  (ENGLISH.listening||[]).forEach(x=>{
    if(!uid(x)){issues++;return}
    if(!["atis","clearance"].includes(x.type)||!str(x.title)||!str(x.scenario)||!linesOk(x.lines)||!Array.isArray(x.keys)||!x.keys.length){issues++;return}
    x.keys.forEach(k=>{
      if(!isPlainObject(k)||!str(k.label)||!str(k.value)||!Array.isArray(k.accept)||!k.accept.length||!k.accept.every(a=>Array.isArray(a)&&a.length&&a.every(t=>typeof t==="string"&&/^[a-z0-9]+$/.test(t))))issues++;
    });
    clean("listening",x);
  });
  (ENGLISH.roleplays||[]).forEach(rp=>{
    if(!uid(rp)){issues++;return}
    if(!str(rp.title)||!str(rp.scenario)||!Array.isArray(rp.turns)||!rp.turns.length){issues++;return}
    rp.turns.forEach((t,i)=>{
      if(!isPlainObject(t)||!str(t.prompt)||!strs(t.model,1)||!strs(t.points,1)||!vocabOk(t.vocab)||!Array.isArray(t.refs)||!t.refs.length||!t.refs.every(refOk))issues++;
      else if(t.heard!==undefined&&!linesOk(t.heard))issues++;
      else if(i>0&&!t.heard)issues++;
    });
    clean("roleplay",rp);
  });
  const tests=Array.isArray(ENGLISH.pruebas)?ENGLISH.pruebas:[];
  if(!tests.length)issues++;
  const nums=new Set(),used=new Set();
  tests.forEach(t=>{
    if(!isPlainObject(t)||!Number.isInteger(t.n)||t.n<1||nums.has(t.n)){issues++;return}
    nums.add(t.n);
    const check=(ids,list)=>{
      if(!Array.isArray(ids)||!ids.length){issues++;return}
      ids.forEach(id=>{if(!enById(list,id)||used.has(id))issues++;used.add(id)});
    };
    check(t.mcq,ENGLISH.mcq);check(t.images,ENGLISH.images);check(t.listening,ENGLISH.listening);check([t.roleplay],ENGLISH.roleplays);
  });
  return issues;
}

/* ---------- qué prueba te toca (al azar entre las que faltan) ---------- */
function enTestState(){
  if(!isPlainObject(appState.englishTests))appState.englishTests=sanitizeEnglishTests(null);
  return appState.englishTests;
}
function enPending(){const st=enTestState();return enTests().filter(t=>!st.done.includes(t.n))}
function enPickRandom(list){return list.length?list[Math.floor(Math.random()*list.length)]:null}
function enNewCurrent(t){return t?{n:t.n,order:enOrderFor(t),i:0}:null}
/* Si ya hay una prueba asignada y en curso se conserva (con su orden y su avance); si no, se sortea una entre las pendientes. */
function enAssign(){
  const st=enTestState(),cur=st.current,t=cur&&!st.done.includes(cur.n)?enTestByN(cur.n):null;
  if(t){
    if(!enValidOrder(t,cur.order)){cur.order=enOrderFor(t);cur.i=0;delete cur.mcq}
    saveState();
    return cur;
  }
  st.current=enNewCurrent(enPickRandom(enPending()));
  saveState();
  return st.current;
}
/* Cuando ya hiciste todas: nueva vuelta, con el orden otra vez al azar (sin repetir de inmediato la última). */
function enStartNewRound(){
  const st=enTestState(),tests=enTests();
  const from=tests.filter(t=>t.n!==st.last);
  st.done=[];st.cycle=finiteNum(st.cycle)+1;
  st.current=enNewCurrent(enPickRandom(from.length?from:tests));
  enHubNote="";
  saveState();
  renderEnglishHub();
}
/* Terminó un ejercicio (o un role-play completo): se cuenta la alternativa (dato objetivo, no una nota) y se pasa al siguiente. */
function enUnitDone(){
  const s=enSession,st=enTestState(),cur=st.current;
  stopEnglishMedia();enSession=null;session=null;
  if(!s||!cur||cur.n!==s.n||cur.i!==s.pos){openEnglish();return}
  if(s.kind==="mcq"){
    const ok=s.state[0].chosen===s.items[0].correct,m=cur.mcq||{c:0,t:0};
    cur.mcq={c:m.c+(ok?1:0),t:m.t+1};
  }
  cur.i=s.pos+1;
  if(cur.i>=cur.order.length){enFinishTest();return}
  saveState();
  enRunUnit();
}
function enFinishTest(){
  const st=enTestState(),cur=st.current;if(!cur)return;
  if(!st.done.includes(cur.n))st.done.push(cur.n);
  st.last=cur.n;st.current=null;
  const m=cur.mcq;
  enHubNote=`✓ Prueba ${cur.n} completada${m?` · alternativas: ${m.c} de ${m.t} correctas`:""}.`;
  saveState();
  openEnglish(true);
}

/* ---------- voz sintética (lee los audios con voces del dispositivo, una al azar por audio) ---------- */
function radioSay(text,radioDigits=true){
  let t=String(text||"");
  t=t.replace(/\bQNH\b/g,"Q N H").replace(/\bILS\b/g,"I L S").replace(/\bRVR\b/g,"R V R").replace(/\bSSR\b/g,"S S R");
  if(radioDigits)t=t.replace(/\b(three|four|five|nine)\b/gi,m=>EN_RADIO_DIGITS[m.toLowerCase()]);
  return t;
}
function enSpeechOk(){return typeof window!=="undefined"&&"speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined"}
function enVoices(){
  if(!enSpeechOk())return[];
  let all=[];try{all=speechSynthesis.getVoices()||[]}catch(e){}
  const seen=new Set();
  return all.filter(v=>/^en([-_]|$)/i.test(v.lang||"")&&!EN_NOVELTY_VOICE.test(v.name||"")).filter(v=>{if(seen.has(v.voiceURI))return false;seen.add(v.voiceURI);return true});
}
/* Voz de ATC y voz del piloto: dos voces distintas si el dispositivo tiene más de una. */
function enPickVoices(){
  const list=enVoices();if(!list.length)return null;
  const a=enPickRandom(list),rest=list.filter(v=>v.voiceURI!==a.voiceURI),b=enPickRandom(rest)||a;
  return{atc:a.voiceURI,pilot:b.voiceURI};
}
/* Se elige una vez por ejercicio y se conserva mientras dure (así, al repetir el audio suena igual); vuelve a sortearse al reintentar. */
function enVoiceFor(who){
  const list=enVoices(),st=enSession?enSession.state[enSession.index]:null;
  if(!list.length)return{voice:null,same:true};
  let v=st?st.voices:null;
  if(!v||!list.some(x=>x.voiceURI===v.atc)||!list.some(x=>x.voiceURI===v.pilot)){v=enPickVoices();if(st)st.voices=v}
  const uri=who==="pilot"?v.pilot:v.atc;
  return{voice:list.find(x=>x.voiceURI===uri)||null,same:v.atc===v.pilot};
}
function enUpdateAudioUi(){
  const b=$("enPlayBtn");
  if(b)b.textContent=enMedia.speaking?"■ Detener":"▶ Escuchar";
  document.querySelectorAll(".en-say").forEach(x=>x.classList.toggle("playing",enMedia.speaking&&x===enMedia.sayBtn));
}
function enUpdateVoiceStatus(){
  const st=$("enAudioStatus");if(!st)return;
  st.textContent=!enSpeechOk()?"Este navegador no tiene voz sintética: usa la transcripción.":(enVoices().length?"":(enMedia.voicesLoaded?"No se encontró ninguna voz en inglés en este dispositivo. Instala una en los ajustes del sistema o usa la transcripción.":"Buscando voces en inglés del dispositivo…"));
}
function enStopAudio(){
  enMedia.audioGen++;enMedia.speaking=false;enMedia.sayBtn=null;
  if(enSpeechOk()){try{speechSynthesis.cancel()}catch(e){}}
  enUpdateAudioUi();
}
function enPlay(lines,btn){
  enStopAudio();
  if(!enSpeechOk()){toast("Este navegador no puede leer el audio en voz alta. Usa la transcripción.");return false}
  enStopMic(true);
  const gen=++enMedia.audioGen;
  let i=0;
  enMedia.speaking=true;enMedia.sayBtn=btn||null;enUpdateAudioUi();
  const finish=()=>{if(gen!==enMedia.audioGen)return;enMedia.speaking=false;enMedia.sayBtn=null;enUpdateAudioUi()};
  const next=()=>{
    if(gen!==enMedia.audioGen)return;
    if(i>=lines.length){finish();return}
    const ln=lines[i++],pick=enVoiceFor(ln.who);
    const u=new SpeechSynthesisUtterance(radioSay(ln.say||ln.text));
    u.lang=pick.voice?pick.voice.lang:"en-GB";if(pick.voice)u.voice=pick.voice;
    u.rate=EN_AUDIO_RATE;u.pitch=pick.same?(ln.who==="pilot"?1.15:0.9):1;
    const pause=Number.isFinite(ln.pause)?ln.pause:650;
    u.onend=()=>{if(gen===enMedia.audioGen)setTimeout(next,pause)};
    u.onerror=finish;
    enMedia.utter=u;
    try{speechSynthesis.speak(u)}catch(e){finish()}
  };
  setTimeout(next,80);
  return true;
}
function enPlayableLines(){
  const it=enItem();if(!it)return[];
  return enSession.kind==="listening"?it.lines:(it.heard||[]);
}
function enPlayCurrent(){
  if(enMedia.speaking){enStopAudio();return}
  const lines=enPlayableLines();
  if(lines.length)enPlay(lines);
}
function enPlayFromBtn(btn){
  if(enMedia.speaking&&enMedia.sayBtn===btn){enStopAudio();return}
  enPlay([{who:btn.dataset.who||"pilot",text:btn.dataset.say||"",pause:0}],btn);
}
if(enSpeechOk()){try{speechSynthesis.onvoiceschanged=()=>{enMedia.voicesLoaded=true;enUpdateVoiceStatus()}}catch(e){}}

/* ---------- micrófono en inglés (solo transcribe: no puntúa) ---------- */
function enMicSupported(){return speechRecognitionSupported()}
function enSetMicStatus(t,live){const s=$("enMicStatus");if(s){s.textContent=t;s.classList.toggle("listening",!!live)}}
function enMicButton(recording){
  const b=$("enMicBtn");if(!b)return;
  b.classList.toggle("recording",!!recording);
  b.innerHTML=recording?'<span aria-hidden="true">●</span><span>Detener</span>':'<span aria-hidden="true">🎙️</span><span>Grabar mi respuesta</span>';
}
function enRenderTranscript(){
  const box=$("enTranscript");if(!box)return;
  box.value=[enMedia.base,enMedia.final,enMedia.interim].filter(x=>x&&x.trim()).join(" ");
}
function enTextChanged(v){if(enSession)enSession.state[enSession.index].text=String(v||"")}
function enStartTimer(){enStopTimer();const t=$("enMicTime");if(t)t.style.display="block";enTick();enMedia.timer=setInterval(enTick,1000)}
function enTick(){
  const t=$("enMicTime");if(!t||!enMedia.startTime)return;
  const s=Math.floor((Date.now()-enMedia.startTime)/1000);
  t.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}
function enStopTimer(){clearInterval(enMedia.timer);enMedia.timer=null}
async function enToggleMic(){
  if(enMedia.listening){enFinishMic();return}
  await enStartMic();
}
async function enStartMic(){
  if(!window.isSecureContext&&location.hostname!=="localhost"){alert("El micrófono requiere que la aplicación se abra mediante HTTPS.");return}
  if(!enMicSupported()){alert("El reconocimiento de voz no está disponible en este navegador. Escribe tu respuesta en el cuadro.");return}
  enStopAudio();
  const gen=++enMedia.micGen;
  if(!enMedia.micOk){
    try{
      if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        stream.getTracks().forEach(t=>t.stop());
      }
      enMedia.micOk=true;
    }catch(error){
      console.warn("Permiso de micrófono:",error);
      if(gen===enMedia.micGen)enSetMicStatus(isStandaloneMode()?"No se pudo acceder al micrófono. Si estás en la app instalada, abre el sitio en Safari.":"No se pudo acceder al micrófono.");
      return;
    }
    /* Si mientras se pedía el permiso el usuario cambió de pantalla o de ejercicio,
       no se inicia un reconocimiento sobre algo que ya no está a la vista. */
    if(gen!==enMedia.micGen)return;
  }
  const box=$("enTranscript");
  enMedia.base=box?box.value.trim():"";enMedia.final="";enMedia.interim="";
  enMedia.stopping=false;enMedia.listening=true;enMedia.restarts=0;enMedia.startTime=Date.now();
  enMicButton(true);enSetMicStatus("Escuchando… habla en inglés.",true);
  enStartTimer();
  enCreateRec();enStartRec();
  clearTimeout(enMedia.maxTimer);
  enMedia.maxTimer=setTimeout(()=>{if(enMedia.listening)enFinishMic()},EN_MAX_SECONDS*1000);
}
function enCreateRec(){
  const SR=getSpeechRecognitionClass();if(!SR)return;
  const gen=enMedia.micGen;
  const r=new SR();
  r.lang=enPref("micLang","en-US");r.continuous=false;r.interimResults=true;r.maxAlternatives=1;
  r.onresult=e=>{
    if(gen!==enMedia.micGen)return;
    let interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const res=e.results[i];if(!res||!res[0])continue;
      const t=String(res[0].transcript||"");
      if(res.isFinal){if(t.trim())enMedia.final+=(enMedia.final?" ":"")+t.trim()}else interim+=t;
    }
    enMedia.interim=interim.trim();
    enRenderTranscript();
  };
  r.onerror=e=>{
    if(gen!==enMedia.micGen)return;
    const err=(e&&e.error)||"unknown";
    if(err==="no-speech"||err==="aborted")return;
    console.warn("SpeechRecognition (inglés) error:",err);
    if(err==="not-allowed"||err==="audio-capture"||err==="network"||err==="service-not-allowed"){
      enMedia.listening=false;enStopTimer();enMicButton(false);
      enSetMicStatus(err==="not-allowed"?"Debes autorizar el uso del micrófono.":err==="audio-capture"?"No se pudo acceder al micrófono.":(isStandaloneMode()?"El reconocimiento de voz no está disponible en la app instalada. Abre el sitio en Safari.":"Problema de conexión con el reconocimiento de voz."));
    }
  };
  r.onend=()=>{
    if(gen!==enMedia.micGen)return;
    if(enMedia.listening&&!enMedia.stopping){
      enMedia.restarts++;
      if(enMedia.restarts>EN_MAX_RESTARTS){enMedia.listening=false;enStopTimer();enMicButton(false);enSetMicStatus("El micrófono se desconectó varias veces. Intenta de nuevo.");return}
      clearTimeout(enMedia.restartTimer);
      enMedia.restartTimer=setTimeout(()=>{if(gen===enMedia.micGen&&enMedia.listening&&!enMedia.stopping){enCreateRec();enStartRec()}},350);
      return;
    }
    if(enMedia.stopping)enFinalizeMic();
  };
  enMedia.rec=r;
}
function enStartRec(){
  if(!enMedia.rec||!enMedia.listening)return;
  try{enMedia.rec.start()}
  catch(err){
    clearTimeout(enMedia.restartTimer);
    enMedia.restarts++;
    if(enMedia.restarts>EN_MAX_RESTARTS){enMedia.listening=false;enStopTimer();enMicButton(false);enSetMicStatus("El micrófono se desconectó varias veces. Intenta de nuevo.");return}
    const gen=enMedia.micGen;
    enMedia.restartTimer=setTimeout(()=>{if(gen===enMedia.micGen&&enMedia.listening){enCreateRec();try{enMedia.rec.start()}catch(e){console.warn("SpeechRecognition (inglés) restart:",e)}}},500);
  }
}
function enFinishMic(){
  if(!enMedia.listening)return;
  enMedia.stopping=true;enMedia.listening=false;
  clearTimeout(enMedia.restartTimer);clearTimeout(enMedia.maxTimer);enStopTimer();
  enSetMicStatus("Procesando…");
  const gen=enMedia.micGen;
  if(enMedia.rec){
    try{enMedia.rec.stop();setTimeout(()=>{if(gen===enMedia.micGen&&enMedia.stopping)enFinalizeMic()},1200);return}
    catch(e){console.warn("Stop recognition (inglés):",e)}
  }
  setTimeout(enFinalizeMic,300);
}
function enFinalizeMic(){
  if(!enMedia.stopping)return;
  enMedia.stopping=false;
  enMedia.interim="";enRenderTranscript();
  const box=$("enTranscript");
  if(box)enTextChanged(box.value);
  enMicButton(false);
  enSetMicStatus(box&&box.value.trim()?"Listo. Este texto es lo que entendió el reconocimiento de voz; puedes corregirlo. No hay nota: compáralo con el modelo.":"No pude reconocer nada. Inténtalo de nuevo o escribe tu respuesta.");
}
function enStopMic(updateUi){
  enMedia.micGen++;
  enMedia.listening=false;enMedia.stopping=false;
  clearTimeout(enMedia.restartTimer);clearTimeout(enMedia.maxTimer);enStopTimer();
  if(enMedia.rec){try{enMedia.rec.abort()}catch(e){}}
  enMedia.rec=null;
  if(updateUi)enMicButton(false);
}
function stopEnglishMedia(){enStopAudio();enStopMic(false)}
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopEnglishMedia()});

/* ---------- comparar tus apuntes con el audio (flexible; solo marca datos, nunca una nota) ----------
   Los apuntes son libres: cada persona escribe a su manera («200/12», «wind two zero zero one two»,
   «RWY27», «118.7»). Se normalizan a grupos de dígitos y palabras y cada dato clave declara con qué
   grupos se da por anotado (ver "keys" de cada audio). */
const EN_NUM_WORDS=Object.assign(Object.create(null),{zero:"0",one:"1",wun:"1",two:"2",too:"2",three:"3",tree:"3",four:"4",fower:"4",five:"5",fife:"5",six:"6",seven:"7",eight:"8",ait:"8",nine:"9",niner:"9"});
function enNoteTokens(text){
  const t=String(text||"").toLowerCase().replace(/(\d)[.,:](?=\d)/g,"$1").replace(/[^a-z0-9]+/g," ").trim();
  const words=[],digits=[],compact=[];
  let run="",acc="",hold=false;
  const push=g=>{if(hold&&digits.length)digits[digits.length-1]+=g;else digits.push(g);hold=false};
  const flush=()=>{const n=acc+run;acc="";run="";if(n)push(n)};
  (t?t.split(" "):[]).forEach(tok=>{
    compact.push(tok);
    (tok.match(/[a-z]+|\d+/g)||[]).forEach(ch=>{
      if(/^\d+$/.test(ch)){flush();push(ch);return}
      if(ch in EN_NUM_WORDS){run+=EN_NUM_WORDS[ch];return}
      if(ch==="thousand"){if(run){acc=run+"000";run=""}return}
      if(ch==="hundred"){if(run){acc=acc?acc.slice(0,-3)+run+"00":run+"00";run=""}return}
      if(ch==="decimal"||ch==="dot"){flush();hold=true;return}
      hold=false;flush();words.push(ch);
    });
  });
  flush();
  return{words,digits,compact};
}
function enNumEq(g,a){return g===a||(g.length<=3&&a.length<=3&&parseInt(g,10)===parseInt(a,10))}
function enAtomFound(atom,tok){
  if(/^\d+$/.test(atom))return tok.digits.some(g=>enNumEq(g,atom));
  return tok.words.includes(atom)||tok.compact.includes(atom);
}
function enKeyFound(key,tok){
  const alts=[];
  ((key&&key.accept)||[]).forEach(a=>{
    alts.push(a);
    if(a.length>1&&a.every(x=>/^\d+$/.test(x)))alts.push([a.join("")]);   // «20012» por 200/12
  });
  return alts.some(a=>a.length>0&&a.every(x=>enAtomFound(x,tok)));
}

/* ---------- pantalla de la sección: la prueba que te tocó ---------- */
/* keepNote: solo al terminar una prueba se conserva el aviso «Prueba n completada»; en cualquier otra entrada al menú se borra. */
function openEnglish(keepNote){
  stopEnglishMedia();stopEverythingOral();enSession=null;session=null;
  if(keepNote!==true)enHubNote="";
  enAssign();
  renderEnglishHub();show("englishHub");
}
function renderEnglishHub(){
  const tests=enTests(),st=enTestState(),body=$("enHubBody");
  const total=tests.length,done=tests.filter(t=>st.done.includes(t.n)).length;
  const cur=st.current&&enTestByN(st.current.n)&&!st.done.includes(st.current.n)?st.current:null;
  if(!total){body.innerHTML=`<div class="empty">Todavía no hay pruebas cargadas.</div>`;return}
  let h=`<div class="folder-summary"><span>Pruebas completadas</span><b>${done} de ${total}${st.cycle?` · vuelta ${st.cycle+1}`:""}</b></div>`;
  h+=`<div class="en-dots" role="list" aria-label="Pruebas">${tests.map(t=>{
    const d=st.done.includes(t.n),now=!!cur&&cur.n===t.n;
    return `<span class="en-dot${d?" done":now?" now":""}" role="listitem" aria-label="Prueba ${t.n}: ${d?"completada":now?"la que te tocó":"pendiente"}">${d?"✓":t.n}</span>`;
  }).join("")}</div>`;
  if(enHubNote)h+=`<div class="en-banner" role="status">${esc(enHubNote)}</div>`;
  if(cur){
    const t=enTestByN(cur.n),n=cur.order.length,started=cur.i>0;
    const c=(t.mcq||[]).length,a=(t.listening||[]).length,f=(t.images||[]).length;
    h+=`<div class="en-test-card"><div class="en-test-kicker">${started?"EN CURSO":"TE TOCÓ AL AZAR"}</div><h2 class="en-test-title">Prueba ${cur.n}</h2><p class="en-test-sub">${c} ${plural(c,"alternativa","alternativas")}, ${a} ${plural(a,"audio","audios")}, ${f} ${plural(f,"foto","fotos")} y 1 role-play, mezclados al azar en una sola tanda.</p>${started?`<div class="progress en-test-progress"><div style="width:${Math.round(cur.i/n*100)}%"></div></div><p class="en-test-sub">Vas en el ejercicio ${cur.i+1} de ${n}.</p>`:""}<button class="btn primary en-test-go" onclick="enStartOrContinue()" type="button">${started?"Continuar prueba":"Comenzar prueba"}</button></div>`;
  }else{
    h+=`<div class="en-test-card"><div class="en-test-kicker">¡LISTO!</div><h2 class="en-test-title">Completaste las ${total} pruebas</h2><p class="en-test-sub">Puedes empezar otra vuelta: el orden vuelve a salir al azar.</p><button class="btn primary en-test-go" onclick="enStartNewRound()" type="button">Empezar otra vuelta</button></div>`;
  }
  body.innerHTML=h;
}
function enStartOrContinue(){
  const cur=enAssign();
  if(!cur){renderEnglishHub();return}
  enRunUnit();
}
/* Muestra el ejercicio que toca en la prueba en curso (una alternativa, un audio, una foto o un role-play de varios turnos). */
function enRunUnit(){
  const st=enTestState(),cur=st.current,t=cur?enTestByN(cur.n):null;
  if(!t||!enValidOrder(t,cur.order)){openEnglish();return}
  let unit=null;
  while(cur.i<cur.order.length&&!(unit=enUnitItems(cur.order[cur.i])))cur.i++;
  if(!unit){enFinishTest();return}
  stopEnglishMedia();stopEverythingOral();enHubNote="";session=null;
  enSession={n:t.n,pos:cur.i,total:cur.order.length,kind:unit.kind,items:unit.items,index:0,
    state:unit.items.map(x=>({revealed:false,rating:null,text:"",voices:null,chosen:null,opts:unit.kind==="mcq"?shuffle(x.options.map((_,k)=>k)):null}))};
  show("englishPractice");renderEnglishPractice();
}
function enItem(){return enSession?enSession.items[enSession.index]:null}
function exitEnglishPractice(){stopEnglishMedia();enSession=null;openEnglish()}
function nextEnglish(){
  if(!enSession)return;
  const s=enSession,st=s.state[s.index];
  if(!(s.kind==="mcq"?st.chosen!==null:st.revealed))return;
  if(s.index<s.items.length-1){s.index++;renderEnglishPractice();return}
  enUnitDone();
}

/* ---------- alternativas ---------- */
/* Se elige por el número de opción original (no por su posición en pantalla, que se mezcla). -1 = «No la sé». */
function enChoose(orig){
  const s=enSession;if(!s||s.kind!=="mcq")return;
  const st=s.state[0];if(st.chosen!==null)return;
  st.chosen=orig;
  renderEnglishPractice();
  const r=$("epReveal");if(r&&r.scrollIntoView)r.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function enDontKnow(){enChoose(-1)}
function enMcqWork(q,st){
  const locked=st.chosen!==null;
  return `<div class="en-options" role="group" aria-label="Alternativas">${st.opts.map((orig,k)=>{
    let cls="option";
    if(locked){cls+=" locked";if(orig===q.correct)cls+=" correct";else if(orig===st.chosen)cls+=" wrong"}
    return `<button type="button" class="${cls}" onclick="enChoose(${orig})" aria-pressed="${orig===st.chosen?"true":"false"}"${locked?" disabled":""}><div class="letter">${LETTERS[k]||k+1}</div><div class="otxt">${esc(q.options[orig])}</div></button>`;
  }).join("")}</div>${locked?"":`<button class="dontknow" onclick="enDontKnow()" type="button">No la sé · mostrar respuesta</button>`}`;
}
function enMcqFeedback(q,st){
  const ok=st.chosen===q.correct;
  return `<div class="feedback-head ${ok?"ok":"bad"}"><div class="status">${ok?"Correcta":"Respuesta correcta"}</div><strong>${esc(q.options[q.correct])}</strong></div><div class="explain"><div class="label">Por qué</div><p>${esc(q.expl)}</p></div>`;
}

/* ---------- piezas de HTML ---------- */
function enUl(items){return `<ul class="en-list">${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}
function enOl(items){return `<ol class="en-list">${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`}
function enChips(vocab){return `<div class="en-chips">${vocab.map(v=>`<span class="en-chip"><b>${esc(v.en)}</b> · ${esc(v.es)}</span>`).join("")}</div>`}
function enSayBtn(text,who){return `<button class="en-say" data-say="${esc(text)}" data-who="${esc(who)}" onclick="enPlayFromBtn(this)" type="button" aria-label="Escuchar este texto en inglés">▶</button>`}
function enChecklist(points){
  return `<div class="section-label">Compárate (marca lo que cumpliste)</div><div class="en-check">${points.map(p=>`<label><input type="checkbox"><span>${esc(p)}</span></label>`).join("")}</div><div class="oral-score-note">Es solo para ti: no se guarda ni se convierte en nota.</div>`;
}
function enNotesBox(){
  return `<div class="section-label">Tus apuntes</div>
<textarea class="oral-transcript en-notes" id="enNotes" rows="9" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="Escribe aquí lo que vas oyendo, como si tomaras nota en cabina…" aria-label="Tus apuntes de lo que escuchas" oninput="enTextChanged(this.value)"></textarea>`;
}
/* Un solo botón: la velocidad es siempre la normal y la voz cambia sola de un audio a otro. */
function enAudioBox(){
  return `<div class="en-audio">
<div class="en-audio-row"><button class="btn primary" id="enPlayBtn" onclick="enPlayCurrent()" type="button">▶ Escuchar</button></div>
<div class="oral-status" id="enAudioStatus" role="status" aria-live="polite"></div>
</div>`;
}
function enMicBox(){
  const supported=enMicSupported(),standalone=isStandaloneMode();
  const warn=!supported?"Tu navegador no soporta reconocimiento de voz. Escribe tu respuesta en el cuadro.":standalone?"El reconocimiento de voz de Safari no funciona dentro de apps instaladas en la pantalla de inicio. Abre este sitio en Safari para usar el micrófono, o escribe tu respuesta.":"";
  return `<div class="oral-mic-box">
<div class="section-label">Tu respuesta</div>
${supported?`<button class="oral-mic-btn" id="enMicBtn" onclick="enToggleMic()" type="button"><span aria-hidden="true">🎙️</span><span>Grabar mi respuesta</span></button>`:""}
${warn?`<div class="oral-mic-fallback show">${esc(warn)}</div>`:""}
<div class="oral-status" id="enMicStatus" role="status" aria-live="polite">${supported?"Toca el micrófono cuando estés listo. Se escribe aquí lo que entiende el dispositivo; no se calcula ninguna nota.":"Puedes decirlo en voz alta y luego compararlo con el modelo."}</div>
<div class="oral-time" id="enMicTime" style="display:none">00:00</div>
<textarea class="oral-transcript" id="enTranscript" rows="4" placeholder="Aquí aparece lo que dices, o escríbelo tú…" aria-label="Tu respuesta en inglés" oninput="enTextChanged(this.value)"></textarea>
</div>`;
}
const EN_HELP=`<details class="en-help"><summary>Frases útiles para describir</summary><div>
<p><b>Dónde está algo:</b> in the foreground / in the background / in the middle · on the left / on the right · next to · behind · in front of · above · below · near</p>
<p><b>Qué pasa ahora:</b> There is… / There are… · The firefighters are spraying… (presente continuo)</p>
<p><b>Suposiciones:</b> It looks like… · It seems that… · It may / might / could have… · It must have… · Perhaps… · I think…</p>
<p><b>Qué hacer después:</b> The crew should… · The next step would be… · Emergency services need to…</p>
</div></details>`;
/* Lo que ya pasó en el role-play: lo que ATC dijo y lo que tú (según el modelo) respondiste. */
function enHistory(hist){
  if(!hist||!hist.length)return "";
  const rows=hist.map(h=>(h.heard||[]).map(l=>`<div class="en-tr"><b>ATC:</b> ${esc(l.text)}</div>`).join("")+(h.said?`<div class="en-tr"><b>Tú:</b> ${esc(h.said)}</div>`:"")).join("");
  return `<div class="en-scenario"><b>Hasta ahora:</b>${rows}</div>`;
}

/* ---------- pantalla de práctica (sirve para los cuatro tipos de ejercicio) ---------- */
function renderEnglishPractice(){
  const s=enSession,it=enItem(),n=s.items.length,i=s.index,st=s.state[i];
  stopEnglishMedia();
  $("epMeta").textContent=`PRUEBA ${s.n} · ${s.pos+1} / ${s.total}`;
  $("epProgress").style.width=`${((s.pos+(i+1)/n)/s.total)*100}%`;
  let work="",tip="";
  if(s.kind==="mcq"){
    $("epTag").innerHTML="INGLÉS OACI · ALTERNATIVA";
    $("epEyebrow").textContent="ELIGE LA RESPUESTA CORRECTA";
    $("epTitle").textContent=it.q;
    $("epStimulus").innerHTML="";
    work=enMcqWork(it,st);
  }else if(s.kind==="image"){
    /* Ni el título ni el tema de la foto se muestran antes de describirla: darían vocabulario hecho. Aparecen al revelar el modelo. */
    $("epTag").innerHTML="INGLÉS OACI · DESCRIBIR IMÁGENES";
    $("epEyebrow").textContent="DESCRIBE LA IMAGEN";
    $("epTitle").textContent="Describe the picture.";
    $("epStimulus").innerHTML=`<figure class="en-figure"><img src="${esc(it.file)}" alt="${esc(it.alt)}"></figure><div class="en-credit">Foto: ${esc(it.credit.text)} · <a href="${esc(it.credit.url)}" target="_blank" rel="noopener">Wikimedia Commons</a></div>`;
    tip="Tómate un minuto: di lo que ves (dónde, qué, quién) y después lo que podría haber pasado. Puedes grabarte o escribir. Luego revela el modelo y compárate.";
    work=`<div class="section-label">Preguntas guía</div>${enOl(it.prompts)}${EN_HELP}${enMicBox()}`;
    $("epRevealBtn").textContent="Mostrar modelo";
  }else if(s.kind==="roleplay"){
    $("epTag").innerHTML=`ROLE-PLAY · TURNO ${it.rp.turn} DE ${it.rp.turns}`;
    $("epEyebrow").textContent="RESPONDE POR RADIO";
    $("epTitle").textContent=it.prompt;
    $("epStimulus").innerHTML=`<div class="en-scenario"><b>Situación:</b> ${esc(it.scenario)}</div>${enHistory(it.rp.history)}`;
    tip="Habla como en la radio: cifras una por una y tu indicativo al final. Después revela el modelo y compárate.";
    if(it.heard&&it.heard.length){
      work+=`${enAudioBox()}<button class="oral-text-fallback-btn en-heard-btn" onclick="enToggleHeard()" type="button">Ver el texto de lo que escuchas</button><div class="en-scenario hidden" id="enHeardText">${it.heard.map(l=>`<div class="en-tr"><b>${l.who==="pilot"?"Piloto":"ATC"}:</b> ${esc(l.text)}</div>`).join("")}</div>`;
    }
    work+=enMicBox();
    $("epRevealBtn").textContent="Mostrar modelo";
  }else{
    $("epTag").innerHTML=`AUDIO · ${it.type==="atis"?"ATIS":"AUTORIZACIÓN DE ATC"}`;
    $("epEyebrow").textContent="ESCUCHA Y ESCRIBE";
    $("epTitle").textContent=it.title;
    $("epStimulus").innerHTML=`<div class="en-scenario">${esc(it.scenario)}</div>`;
    tip="Anota lo que oigas como lo escribirías en cabina, en tu propio formato. Al comprobar verás la transcripción y qué datos encontré en tus apuntes; no se calcula ninguna nota.";
    work=`${enAudioBox()}${enNotesBox()}`;
    $("epRevealBtn").textContent="Comprobar y ver transcripción";
  }
  $("epTip").textContent=tip;$("epTip").classList.toggle("hidden",!tip);
  $("epWork").innerHTML=work;
  const box=$("enTranscript")||$("enNotes");
  if(box){box.value=st.text||"";if(s.kind==="listening"&&st.revealed)box.readOnly=true}
  enUpdateVoiceStatus();
  if(!enMedia.voicesLoaded&&$("enAudioStatus"))setTimeout(()=>{enMedia.voicesLoaded=true;enUpdateVoiceStatus()},2500);
  renderEnglishReveal();
}
function enToggleHeard(){const b=$("enHeardText");if(b)b.classList.toggle("hidden")}
function enImageReveal(it){
  let h=`<div class="explain"><div class="label">Lo que se ve</div><p><b>${esc(it.title)}</b>${it.topic?` · ${esc(it.topic)}`:""}</p>${enUl(it.seen)}</div>`;
  h+=`<div class="memory"><div class="label">Lo que podría haber pasado (hipótesis)</div>${enUl(it.might)}</div>`;
  h+=`<div class="citation"><div class="label">Contexto del suceso</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(it.context)}</div></div>`;
  h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Descripción modelo</div><div class="en-line"><span class="en-model">${esc(it.model)}</span>${enSayBtn(it.model,"pilot")}</div></div>`;
  h+=`<div class="section-label">Vocabulario clave</div>${enChips(it.vocab)}`;
  if(it.radio)h+=`<div class="explain" style="margin-top:10px"><div class="label">Por radio</div><p>${esc(it.radio.intro)}</p>${it.radio.lines.map(l=>`<div class="en-line"><span class="en-model">${esc(l)}</span>${enSayBtn(l,"pilot")}</div>`).join("")}</div>`;
  h+=enChecklist(it.points);
  return h;
}
function enSpeakingReveal(it){
  let h=`<div class="feedback-head ok"><div class="status">${it.model.length>1?"Respuestas modelo":"Respuesta modelo"}</div>${it.model.map(m=>`<div class="en-line"><span class="en-model">${esc(m)}</span>${enSayBtn(m,"pilot")}</div>`).join("")}</div>`;
  if(it.note)h+=`<div class="memory"><div class="label">Nota</div><p>${esc(it.note)}</p></div>`;
  h+=enChecklist(it.points);
  if(it.vocab&&it.vocab.length)h+=`<div class="section-label">Vocabulario</div>${enChips(it.vocab)}`;
  if(it.rp)h+=`<div class="oral-score-note">Los turnos de ATC son de práctica: están redactados para este ejercicio.</div>`;
  return h;
}
function enListeningReveal(it,st){
  const who=w=>w==="pilot"?"Piloto":"ATC";
  const tok=enNoteTokens(st.text),wrote=String(st.text||"").trim().length>0;
  const rows=it.keys.map(k=>{
    const ok=wrote&&enKeyFound(k,tok);
    return `<div class="en-key ${ok?"ok":"miss"}"><span class="en-key-mark" aria-hidden="true">${ok?"✓":"•"}</span><span><b>${esc(k.label)}</b> · ${esc(k.value)}${ok?"":`<em> — no lo encontré en tus apuntes</em>`}</span></div>`;
  }).join("");
  let h=`<div class="explain"><div class="label">Transcripción</div>${it.lines.map(l=>`<div class="en-tr"><b>${who(l.who)}:</b> ${esc(l.text)}</div>`).join("")}</div>`;
  h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Datos clave, en el orden en que sonaron</div>${wrote?"":`<div class="en-tr">No escribiste nada: escucha de nuevo, anota lo que oigas y vuelve a comprobar.</div>`}${rows}<div class="oral-score-note">La comparación es automática y flexible: entiende «200/12», «two zero zero» o «RWY27». Si lo anotaste de otra forma y está bien, cuéntalo como bien. Es solo una ayuda, no una nota.</div></div>`;
  if(it.after&&it.after.length)h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Colación / llamada modelo</div>${it.after.map(l=>`<div class="en-line"><span class="en-model"><b>${who(l.who)}:</b> ${esc(l.text)}</span>${enSayBtn(l.text,l.who)}</div>`).join("")}</div>`;
  h+=`<div class="memory" style="margin-top:8px"><div class="label">Para fijar</div>${enUl(it.notes||[])}</div>`;
  h+=`<button class="btn ghost" onclick="retryEnglish()" style="width:100%;margin-top:10px" type="button">Volver a intentarlo (borra tus apuntes)</button>`;
  return h;
}
function renderEnglishReveal(){
  const s=enSession,it=enItem(),st=s.state[s.index],isMcq=s.kind==="mcq";
  const shown=isMcq?st.chosen!==null:st.revealed;
  const box=$("epReveal");
  if(shown){
    box.innerHTML=isMcq?enMcqFeedback(it,st):s.kind==="image"?enImageReveal(it):s.kind==="roleplay"?enSpeakingReveal(it):enListeningReveal(it,st);
    box.classList.remove("hidden");
    const notes=$("enNotes");if(notes&&s.kind==="listening")notes.readOnly=true;
  }else{box.innerHTML="";box.classList.add("hidden")}
  $("epRevealBtn").classList.toggle("hidden",isMcq||shown);
  $("epRateWrap").classList.toggle("hidden",isMcq||!shown);
  enSyncRate();
  $("epNextBtn").disabled=!shown;
  const lastItem=s.index===s.items.length-1,lastUnit=s.pos===s.total-1;
  $("epNextBtn").textContent=lastItem&&lastUnit?"Terminar prueba":"Siguiente";
}
function revealEnglish(){
  if(!enSession||enSession.kind==="mcq")return;
  enSession.state[enSession.index].revealed=true;
  stopEnglishMedia();
  const box=$("enTranscript")||$("enNotes");if(box)enTextChanged(box.value);
  renderEnglishReveal();
  const r=$("epReveal");if(r&&r.scrollIntoView)r.scrollIntoView({block:"start",behavior:"smooth"});
}
function rateEnglish(v){
  if(!enSession||enSession.kind==="mcq")return;
  const it=enItem(),st=enSession.state[enSession.index];
  st.rating=v;
  const prev=appState.english[it.id]||{};
  appState.english[it.id]={r:v,a:finiteNum(prev.a)+1,last:Date.now()};
  saveState();
  enSyncRate();
  toast(v===2?"Bien":v===1?"Casi · vuelve a intentarlo":"Marcada para repetir");
}
/* Repetir el mismo audio desde cero: borra los apuntes, vuelve a ocultar la comparación y sortea otra voz. */
function retryEnglish(){
  if(!enSession)return;
  const st=enSession.state[enSession.index];
  st.revealed=false;st.rating=null;st.text="";st.voices=null;
  renderEnglishPractice();
  const n=$("enNotes");if(n){n.focus({preventScroll:true});n.scrollIntoView({block:"center"})}
}
function enSyncRate(){
  const st=enSession?enSession.state[enSession.index]:null;
  document.querySelectorAll("#epRateWrap .rate").forEach((b,k)=>b.classList.toggle("active",!!st&&st.rating===k));
}
const BANK_HEALTH=bankIntegrity();
if(!BANK_HEALTH.ok)console.warn("A320 Trainer · integridad del banco",BANK_HEALTH);
renderHome();
