/* Lógica de la app: núcleo (bancos, progreso guardado, pruebas de alternativas, inicio, integridad y
   respaldo). index.html carga antes los datos (data/questions/, data/english/, data/oral/,
   data/stations/) y después, en este orden: js/app.js, js/oral.js (Entrevista oral),
   js/needtoknow.js (Need to know), js/ingles.js (Inglés OACI), js/inicio.js (arranque) y js/ruta.js.
   Todos comparten el ámbito global: lo que se declara aquí lo usan los demás. */
const SYSTEM_ORDER=["procedures","hydraulic","air_cond","electrical","flight_control","landing_gear","autoflight","apu_powerplant","fuel","fire","ice_rain","comms_oxygen","indicating"];
const OPERATIONS_ORDER=["operations_airbus"];
const INTERVIEW_TECH_KEY="interview_technical";
const DGAC_KEY="dgac_bank";
const TEST_SIZE=20, INTERVIEW_SIZE=10;
const APP_VERSION="1.22.0";
const BANK_VERSION="2026.10.05 · DGAC 573";
const STATE_SCHEMA=1;
const LETTERS="ABCDEFGH".split("");
let RAW_SYSTEMS;
try{
  const parsedBank=JSON.parse(window.SYSTEMS_DATA_JSON);
  if(!parsedBank||typeof parsedBank!=="object"||Array.isArray(parsedBank))throw new Error("Invalid bank root structure");
  RAW_SYSTEMS=parsedBank;
}catch(bankLoadError){
  document.body.innerHTML='<div style="padding:28px 20px;font-family:-apple-system,system-ui,sans-serif;max-width:420px;margin:15vh auto 0;text-align:center;color:#1B2329"><h1 style="font-size:17px;margin:0 0 8px">Couldn’t load the question bank</h1><p style="color:#666;font-size:14px;line-height:1.5;margin:0 0 16px">The app data wasn’t read correctly. Reload the page; if the problem persists, the latest published update probably has an error.</p><button onclick="location.reload()" style="padding:10px 22px;border-radius:10px;border:1px solid #ccc;background:#fff;font-size:14px;cursor:pointer">Reload</button></div>';
  console.error("Failed to load data/banco.js:",bankLoadError);
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
function systemName(k){return k===null?"All systems":(SYSTEMS[k]?.name||k)}
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
    label:typeof r.label==="string"?r.label.slice(0,200):"Previous session",
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
const QID_RENAMES={"hydraulic:1os0brc":"hydraulic:1tbt8ld","hydraulic:1eznmr1":"hydraulic:wxjsp5","hydraulic:98eoy5":"hydraulic:14jvqlm","hydraulic:uvvyh":"hydraulic:odnbls","hydraulic:1qfuvr9":"hydraulic:tnkbsc","hydraulic:19f34k":"hydraulic:1yk534j","hydraulic:106iugc":"hydraulic:1tbt8ld","hydraulic:1rx3pif":"hydraulic:14jvqlm","hydraulic:yu9ict":"hydraulic:odnbls","hydraulic:dhos2p":"hydraulic:tnkbsc","hydraulic:152269q":"hydraulic:1yk534j","operations_airbus:1yhv78r":"operations_airbus:5oywvc","operations_airbus:vzmxfv":"operations_airbus:1ijy8qj","operations_airbus:hg8ipi":"operations_airbus:sd4h12","operations_airbus:1w0wha6":"operations_airbus:iv9agd","operations_airbus:1vwlann":"operations_airbus:cd62sc","operations_airbus:1lgscph":"operations_airbus:1qyg8l4","operations_airbus:7qcjcw":"operations_airbus:t6q783","operations_airbus:5o5u81":"operations_airbus:bsylyk","operations_airbus:1facwnf":"operations_airbus:snbemf","operations_airbus:1cjookz":"operations_airbus:1nw9qtb","operations_airbus:1rfrhzt":"operations_airbus:5si7wx","operations_airbus:4g82zf":"operations_airbus:34a5dy","operations_airbus:18b7lhd":"operations_airbus:1n1vzf6","operations_airbus:4lohyb":"operations_airbus:18qlur2","operations_airbus:7ctcli":"operations_airbus:1pp6xm2","operations_airbus:nf77u5":"operations_airbus:6ktm8d","operations_airbus:ftczwt":"operations_airbus:wani40","operations_airbus:1w4lpmy":"operations_airbus:bo9mpd","operations_airbus:v9fa2j":"operations_airbus:1nkissb","operations_airbus:8l2mtg":"operations_airbus:1nkszyc","operations_airbus:gnnf8j":"operations_airbus:1ysn11m","operations_airbus:psxts9":"operations_airbus:1yy58xm","operations_airbus:1kqlsyy":"operations_airbus:xxewiu","operations_airbus:oalhef":"operations_airbus:1ls3gzo","operations_airbus:1744a7b":"operations_airbus:1uhxpuv","operations_airbus:3w0l2l":"operations_airbus:1ht2hkn","operations_airbus:1m17c7z":"operations_airbus:k3br02","operations_airbus:1u9j9j8":"operations_airbus:u4uvpg","operations_airbus:147xh0d":"operations_airbus:twj5lb","operations_airbus:dtahbm":"operations_airbus:cojfs7","operations_airbus:ytathc":"operations_airbus:177rc93"};
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
    if(!stateSaveWarned){stateSaveWarned=true;toast("Couldn't save progress on this device")}
    return false;
  }
}

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

  $("homeSystemsCount").textContent=totalQuestions()+" questions · FCOM 2025 ✓";
  $("homeOpsCount").textContent=operationsQuestions()+" questions · Airbus Tutorials Rev 15 ✓";
  $("homeInterviewCount").textContent=interviewTechnicalTotal()+" questions · curated interview bank";
  const dgacExplained=(SYSTEMS[DGAC_KEY]?.questions||[]).filter(q=>q.expl).length;
  $("homeDgacCount").textContent=dgacTotal()+(dgacExplained>=dgacTotal()?" historical questions · explained":` historical questions · ${dgacExplained} explained`);
  $("homeWeakCount").textContent=ov.wq?`${ov.wq} ${plural(ov.wq,"question","questions")} to review`:"No questions pending";
  {const nk=ntkRefs(),nd=nk.filter(r=>ntkPracticed(r)).length;$("homeNtkCount").textContent=nk.length?`${nk.length} ${plural(nk.length,"key question","key questions")}${nd?` · ${nd} practiced`:" · answer by voice or read the answer"}`:"Add the questions you can't forget"}
  {
    const tt=enTests(),dn=enTestState().done.filter(n=>tt.some(t=>t.n===n)).length;
    $("homeEnglishCount").textContent=tt.length?`${tt.length} ${plural(tt.length,"test","tests")} at random · multiple choice, audio, pictures and role-play${dn?` · ${dn} of ${tt.length} done`:""}`:"English tests";
  }
  $("folderSystemsCount").textContent=totalQuestions()+" questions";

  const health=BANK_HEALTH;
  $("bankStatus").textContent=health.ok?"Integridad estructural OK":`${health.issues} ${plural(health.issues,"incidencia","incidencias")}`;
  $("bankStatus").classList.toggle("warn",!health.ok);
  $("appMeta").innerHTML=`App <b>v${APP_VERSION}</b> · Bank <b>v${BANK_VERSION}</b><br>${totalQuestions()+operationsQuestions()} FCOM/Airbus · ${interviewTechnicalTotal()} technical interview · ${dgacTotal()} historical DGAC · ${ORAL_VOICE_BANK.length} oral interview · ${ENGLISH.mcq.length} ICAO English (multiple choice across ${enTests().length} tests)`;
  $("integrityNote").classList.toggle("warn",!health.ok);
  $("integrityNote").textContent=health.ok
    ?"Structural check at startup: valid question shapes and oral rubrics, with explanation/reference present. Aviation content accuracy is audited separately, against the FCOM/FCTM."
    :`${health.issues} structural issues detected${health.oralIssues?` (including ${health.oralIssues} in the oral bank)`:""}${health.englishIssues?` (including ${health.englishIssues} in ICAO English)`:""}. Questions with an invalid structure are left out of sessions until they are fixed.`;

  const r=appState.resume;
  $("resumeWrap").innerHTML=r?`<button type="button" class="resume-card" onclick="resumeSession()"><div class="resume-main"><div class="resume-label">Continue</div><strong>${esc(r.label||"Previous session")}</strong><span>Question ${Math.min(finiteNum(r.index)+1,finiteNum(r.total,1))} of ${finiteNum(r.total,1)}</span></div><div class="chev">›</div></button>`:"";

  const all=systemStats(null);
  let html=`<button type="button" class="system-card all" onclick="openSystem(null)"><div class="ata">ALL</div><div class="sys-info"><h3>All systems</h3><p>${totalQuestions()} questions · explanation and FCOM backing</p>${all.best?`<div class="sys-score">Best test: ${finiteNum(all.best.score)}/${finiteNum(all.best.total)}</div>`:""}</div><div class="chev">›</div></button>`;
  html+=orderedKeys().map(k=>{
    const s=SYSTEMS[k],st=systemStats(k),count=(s.questions||[]).length;
    return `<button type="button" class="system-card" data-search="${esc(norm((s.name||"")+" "+(s.ata||"")))}" onclick="openSystem('${esc(k)}')"><div class="ata">ATA<br>${esc(s.ata||"—")}</div><div class="sys-info"><h3>${esc(s.name||k)}</h3><p>${count} questions · FCOM 2025 ✓${st.a?` · ${st.p}% accuracy`:""}</p>${st.best?`<div class="sys-score">Best test: ${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</div>`:""}</div><div class="chev">›</div></button>`
  }).join("");
  $("systemsList").innerHTML=html;
}
function openSystem(k){
  currentSystemKey=k;appState.lastSystem=k;saveState();
  const st=systemStats(k),pool=rawPool(k);
  const dgac=isDgacKey(k),ops=operationsKeys().includes(k),interviewTech=isInterviewTechKey(k);
  $("detailAta").textContent=dgac?"HISTORICAL BANK · DGAC 2018":interviewTech?"INTERVIEW · GENERAL TECHNICAL BANK":ops?"OPERATIONS · AIRBUS TUTORIALS REV 15":(k===null?"TECHNICAL BANK · FCOM":`ATA ${systemAta(k)} · FCOM`);
  $("detailTitle").textContent=systemName(k);
  if(dgac){
    const explained=pool.filter(q=>q.expl).length;
    $("detailDesc").textContent=explained>=pool.length?`${pool.length} real questions from the DGAC A320 exam (2018), with their original options unchanged. All ${pool.length} have a verified technical explanation and reference.`:explained?`${pool.length} real questions from the DGAC A320 exam (2018), with their original options unchanged. ${explained} of ${pool.length} already have a verified technical explanation; we keep completing the rest.`:`${pool.length} questions from the DGAC A320 exam (2018). This bank is kept to practice the format and the historical questions. It is not part of the validated technical bank and deliberately shows no explanations.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> DGAC questions</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> accuracy</span><span class="pill"><b>${explained}</b> explained</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> best test</span>`:""}`;
    $("studyModeDesc").textContent=explained?"Shows the answer marked in the exam; if it has been audited, it includes a technical explanation and an FCOM quote.":"Shows the answer marked in the exam after you answer. No explanation.";
    $("interviewModeCard").classList.add("hidden");
    $("systemWeakBtn").classList.add("hidden");
  }else if(interviewTech){
    const curated=pool.filter(q=>q.audit==="interview_curated"&&q.expl).length;
    $("detailDesc").textContent=`${pool.length} questions drawn from LATAM interview material, curated to study meteorology, performance, IFR, aerodynamics, operations, CRM and A320 concepts.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> questions</span><span class="pill"><b>${curated}</b> curated</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> accuracy</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> best test</span>`:""}`;
    $("studyModeDesc").textContent="Answer and explanation after you answer, with a reference to the interview material and the review applied.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} to review</b> · practice only missed questions`;
  }else if(ops){
    const verified=pool.filter(q=>q.audit==="airbus_tutorials_verified"&&q.expl&&q.cite).length;
    $("detailDesc").textContent=`${pool.length} Airbus operations questions built from Airbus Tutorials Revision 15. They cover Airbus philosophy, flows, operating techniques and handling of each flight phase.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> questions</span><span class="pill"><b>${verified}</b> AIRBUS ✓</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> accuracy</span>${st.best?`<span class="pill"><b>${finiteNum(st.best.score)}/${finiteNum(st.best.total)}</b> best test</span>`:""}`;
    $("studyModeDesc").textContent="Answer, explanation and Airbus Tutorials reference right after you answer.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} to review</b> · practice only missed questions`;
  }else{
    const verified=pool.filter(q=>q.audit==="fcom_verified"&&q.expl&&q.cite).length;
    $("detailDesc").textContent=`${pool.length} questions from our main bank. Every question shown here has a specific answer, a useful explanation and backing in the FCOM 15 SEP 25.`;
    $("detailStats").innerHTML=`<span class="pill"><b>${pool.length}</b> questions</span><span class="pill"><b>${verified}</b> FCOM ✓</span><span class="pill"><b>${st.a?st.p+"%":"—"}</b> accuracy</span>`;
    $("studyModeDesc").textContent="Answer, explanation and FCOM reference right after you answer.";
    $("interviewModeCard").classList.remove("hidden");
    const weak=weakQuestions(k).length,b=$("systemWeakBtn");
    b.classList.toggle("hidden",weak===0);if(weak)b.innerHTML=`<b>${weak} to review</b> · practice only missed questions`;
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
  wrap.innerHTML=hits.length?hits.map(x=>`<button type="button" class="search-item" onclick="startSingle('${x._id}')"><div class="smeta">${esc(systemName(x._sys))}${appState.bookmarks[x._id]?" · ★":""}</div><div class="sq">${esc(x.q)}</div></button>`).join(""):`<div class="empty">No questions found for “${esc(v)}”.</div>`;
}
function clearSearch(){clearTimeout(searchDebounceTimer);const i=$("searchInput");i.value="";runSearch("");i.focus()}
function findById(id){return allLookupPool().find(q=>q._id===id)}
function startSingle(id){const q=findById(id);if(!q)return;currentSystemKey=q._sys;startTechnical("study",[q])}
function startQuickTest(){currentSystemKey=null;startTechnical("test")}
function startWeakSession(k=null){
  const p=weakQuestions(k);if(!p.length){toast("No mistakes saved yet");return}
  currentSystemKey=k;startTechnical("weak",p.slice(0,Math.min(30,p.length)))
}
function showWeak(){
  const p=weakQuestions(null),saved=savedQuestions(null);show("weak");
  $("weakActions").innerHTML=p.length?`<button type="button" class="btn primary" style="width:100%" onclick="startWeakSession(null)">Practicar ${Math.min(30,p.length)} prioritarias</button>`:"";
  $("weakList").innerHTML=p.length?p.slice(0,80).map(q=>{const s=attemptsFor(q);return `<button type="button" class="weak-item" onclick="startSingle('${q._id}')"><div class="wmeta">${esc(systemName(q._sys))}</div><div class="wq">${esc(q.q)}</div><div class="wstats">${finiteNum(s.w)} ${plural(finiteNum(s.w),"mistake","mistakes")} · ${finiteNum(s.c)} correct${finiteNum(s.streak)>=2?" · recovered":""}</div></button>`}).join(""):`<div class="empty">You have no questions to reinforce. Questions leave this list once you show recovery with consecutive correct answers.</div>`;
  $("savedWrap").classList.toggle("hidden",saved.length===0);
  if(saved.length){
    $("savedActions").innerHTML=`<button type="button" class="btn" style="width:100%;margin-bottom:9px" onclick="startSavedSession()">Practice ${Math.min(30,saved.length)} saved</button>`;
    $("savedList").innerHTML=saved.slice(0,80).map(q=>`<button type="button" class="weak-item" onclick="startSingle('${q._id}')"><div class="wmeta saved-badge">★ ${esc(systemName(q._sys))}</div><div class="wq">${esc(q.q)}</div></button>`).join("");
  }
}
function startSavedSession(){const p=savedQuestions(null);if(!p.length){toast("You have no saved questions");return}currentSystemKey=null;startTechnical("saved",p.slice(0,Math.min(30,p.length)))}

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
  if(!pool.length){toast("No questions available");return}
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
      label:`${session.kind==="scenario"?"Scenarios":"Self-assessment"} · ${systemName(session.systemKey)}`,
      bankFingerprint:BANK_FINGERPRINT
    };
  }else{
    appState.resume={
      mode:"technical",type:session.type,systemKey:session.systemKey,
      questions:session.questions,answers:session.answers,index:session.index,counted:session.counted,
      total:session.questions.length,
      label:`${session.type==="test"?"Test":session.type==="weak"?"Mistake review":session.type==="saved"?"Saved":"Study"} · ${systemName(session.systemKey)}`,
      bankFingerprint:BANK_FINGERPRINT
    };
  }
  saveState();
}
function resumeSession(){
  const r=appState.resume;if(!r)return;
  const qs=Array.isArray(r.questions)?r.questions:[];
  if(!qs.length){appState.resume=null;saveState();renderHome();toast("The previous session is no longer valid");return}
  if(r.bankFingerprint!==BANK_FINGERPRINT){
    appState.resume=null;saveState();renderHome();
    toast("The bank was updated since your last session; start a new one to see the current content");
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
  $("qMeta").textContent=`${session.type==="test"?"TEST":session.type==="weak"?"REVIEW":session.type==="saved"?"SAVED":"STUDY"} · ${session.index+1} / ${n}`;
  $("qProgress").style.width=`${((session.index+1)/n)*100}%`;
  $("qSource").innerHTML=q.bank==="dgac"?`DGAC 2018 · ${esc(q.bank_section||"A320 systems")}<span class="${q.expl?"verify-badge":"dgac-badge"}">${q.expl?"✓ EXPLAINED":"ORIGINAL BANK · NO EXPLANATION"}</span>`:q.bank==="interview_technical"?`${esc(systemName(q._sys))} · ${esc(q.topic||"Interview")}<span class="verify-badge">CURATED BANK</span>`:q.bank==="airbus_tutorials"?`${esc(systemName(q._sys))} · ${esc(q.src||"Airbus Tutorials Rev 15")}<span class="verify-badge">✓ AIRBUS REV 15</span>`:`${esc(systemName(q._sys))} · ${esc(q.src||"FCOM")}<span class="verify-badge">✓ FCOM 2025</span>`;
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
  $("dontKnowBtn").classList.toggle("hidden",ans!==null);$("dontKnowBtn").textContent=session.type==="test"?"I don't know · continue":"I don't know · show answer";renderBookmark(q);renderNtkToggle("ntkQuizBtn",q._id?"q:"+q._id:null);
  $("answerWrap").innerHTML="";
  if(session.type!=="test"&&ans!==null)$("answerWrap").innerHTML=answerHtml(q,ans===q.correct);

  const isTest=session.type==="test";
  $("prevBtn").classList.toggle("hidden",isTest);
  $("prevBtn").disabled=session.index===0;
  const quizNav=document.querySelector("#quiz .bottom-nav");
  if(quizNav)quizNav.classList.toggle("single",isTest);

  const last=session.index===n-1;
  $("nextBtn").textContent=last?(isTest?"See results":"Finish"):"Next";
  $("nextBtn").disabled=ans===null;
}
function renderBookmark(q){const b=$("bookmarkBtn");const on=!!appState.bookmarks[q._id];b.classList.toggle("active",on);b.textContent=on?"★":"☆";b.setAttribute("aria-pressed",on?"true":"false");b.setAttribute("aria-label",on?"Remove from saved":"Save question")}
function toggleBookmark(){const q=sessionQuestion();if(!q)return;if(appState.bookmarks[q._id]){delete appState.bookmarks[q._id];toast("Removed from saved")}else{appState.bookmarks[q._id]=true;toast("Question saved")}saveState();renderBookmark(q)}

function answerHtml(q,isOk){
  let h=`<div class="feedback-head ${isOk?"ok":"bad"}"><div class="status">${isOk?"Correct":"Correct answer"}</div><strong>${esc(q._correctText||q.options[q.correct])}</strong></div>`;
  if(q.bank==="dgac"){
    if(q.expl){
      h=`<div class="verified-line">ADDED EXPLANATION · DGAC EXAM 2018</div>`+h;
      h+=`<div class="explain"><div class="label">Why</div><p>${esc(q.expl)}</p></div>`;
      h+=`<div class="citation"><div class="label">TECHNICAL REFERENCE</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"DGAC A320 exam 2018")}</div></div>`;
      return h;
    }
    h+=`<div class="dgac-warning"><b>DGAC A320 bank (2018).</b> Only the answer marked in the original exam is shown here. We haven't added an explanation because this question hasn't been audited against the current FCOM yet.</div>`;
    return h;
  }
  const isAirbus=q.bank==="airbus_tutorials",isInterview=q.bank==="interview_technical";
  h=`<div class="verified-line">${isInterview?"INTERVIEW BANK · CURATED ANSWER":"✓ CONTENT VERIFIED AGAINST "+(isAirbus?"AIRBUS TUTORIALS REV 15":"FCOM 15 SEP 25")}</div>`+h;
  h+=`<div class="explain"><div class="label">Why</div><p>${esc(q.expl)}</p></div>`;
  h+=isInterview?`<div class="citation"><div class="label">STUDY REFERENCE</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"Interview material")}</div></div>`:`<div class="citation"><div class="label">${isAirbus?"AIRBUS TUTORIALS · VERIFIED":"FCOM · VERIFIED"}</div><blockquote>“${esc(q.cite)}”</blockquote><div class="src">${esc(q.src||(isAirbus?"Airbus Tutorials Rev 15":"FCOM 15 SEP 25"))}</div>${q.audit_note?`<div class="audit-note">${esc(q.audit_note)}</div>`:""}</div>`;
  return h;
}
function prevQuestion(){if(session.index>0){session.index--;renderQuestion();persistResume()}}
function nextQuestion(){
  if(session.answers[session.index]===null)return;
  if(session.index<session.questions.length-1){session.index++;renderQuestion();persistResume();return}
  if(session.type==="test")finishTest();else{session.completed=true;appState.resume=null;saveState();currentSystemKey=session.systemKey;openSystem(currentSystemKey);toast("Session complete")}
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
  $("resultSummary").textContent=wrong===0?"Perfect score. Repeat the test in a few days to confirm it sticks.":pct>=90?"Solid level. Review the few mistakes before closing the topic.":pct>=75?"Good level, but some associations still need to settle.":"There are clear gaps. Repeat only the mistakes before taking another test.";
  if(session.systemKey===DGAC_KEY)$("resultSummary").textContent="DGAC 2018 bank result. It serves as historical practice and doesn't change your accuracy or your weak areas in the FCOM bank.";
  const bySys={};session.questions.forEach((q,i)=>{const k=q._sys||"general";bySys[k]??={c:0,t:0};bySys[k].t++;if(session.answers[i]===q.correct)bySys[k].c++});
  $("resultBreakdown").innerHTML=Object.entries(bySys).sort((a,b)=>b[1].t-a[1].t).map(([k,v])=>`<span class="breakdown-pill">${esc(systemName(k))} · <b>${v.c}/${v.t}</b></span>`).join("");
  $("retryWrongBtn").disabled=wrong===0;
  $("review").innerHTML=session.questions.map((q,i)=>{
    const ans=session.answers[i],ok=ans===q.correct;
    return `<details ${ok?"":"open"}><summary><span class="rbadge ${ok?"ok":"bad"}">${ok?"OK":"ERROR"}</span><span class="rq">${esc(q.q)}</span></summary><div class="rbody">${ok?`<div class="right">Your answer: ${esc(q.options[ans])}</div>`:`<div class="your">Your answer: ${ans===-1?"I don't know":esc(q.options[ans]||"Not answered")}</div><div class="right">Correct: ${esc(q.options[q.correct])}</div>`}${q.bank==="dgac"?(q.expl?`<div>${esc(q.expl)}</div><div style="margin-top:8px;color:var(--muted);font-size:11px">DGAC · ${esc(q.src||"")}</div>`:`<div class="dgac-warning">No explanation: question from the original DGAC bank, not yet audited against the FCOM.</div>`):`<div>${esc(q.expl)}</div><div style="margin-top:8px;color:var(--muted);font-size:11px">${q.bank==="interview_technical"?"Interview · ":q.bank==="airbus_tutorials"?"Airbus · ":"FCOM · "}${esc(q.src||"")}</div>`}</div></details>`
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
  if(!pool.length){toast("No questions available");return}
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
  $("iMeta").textContent=`${isScenario?"SCENARIO":"SELF-ASSESSMENT"} · ${session.index+1} / ${n}`;$("iProgress").style.width=`${((session.index+1)/n)*100}%`;
  $("iSource").innerHTML=`${esc(systemName(q._sys))} · ${esc(q.bank==="interview_technical"?(q.topic||"Interview"):(q.src||"Technical bank"))}${q.audit==="fcom_verified"?`<span class="verify-badge">✓ FCOM 2025</span>`:q.audit==="airbus_tutorials_verified"?`<span class="verify-badge">✓ AIRBUS REV 15</span>`:q.bank==="interview_technical"?`<span class="verify-badge">BANCO DEPURADO</span>`:""}`;
  $("iQuestion").textContent=isScenario?(q.scenario_q||q.oral_q||q.q):(q.oral_q||q.q);
  $("iEyebrow").textContent=isScenario?"ANALYZE THE CASE":"ANSWER OUT LOUD";
  $("iTip").textContent=isScenario?"Explain what is happening and which action or operational criterion applies. Then compare your reasoning with the guide.":"Start with a central idea and then justify it. Avoid reciting options: speak as if facing an instructor.";
  $("iAnswer").classList.add("hidden");$("iAnswer").innerHTML="";$("revealBtn").classList.remove("hidden");$("rateWrap").classList.add("hidden");
  $("iPrevBtn").disabled=session.index===0;$("iNextBtn").disabled=r===null;$("iNextBtn").textContent=session.index===n-1?"Finish":"Next";
  const wasRevealed=Array.isArray(session.revealed)&&!!session.revealed[session.index];
  if(r!==null||wasRevealed){revealInterview(true)}
}
function revealInterview(already=false){
  const q=iQuestion();
  if(!Array.isArray(session.revealed))session.revealed=new Array(session.questions.length).fill(false);
  session.revealed[session.index]=true;
  $("iAnswer").innerHTML=`<div class="feedback-head ok"><div class="status">Expected answer</div><strong>${esc(correctText(q))}</strong></div><div class="explain"><div class="label">${q._generated?"Study guide":"How to explain it"}</div><p>${esc(q.expl||"")}</p>${q._generated?`<div class="src" style="margin-top:7px;color:var(--muted);font-size:10.5px">Based on the bank's verified answer.</div>`:""}</div>${q.cite?(q.bank==="interview_technical"?`<div class="citation"><div class="label">STUDY REFERENCE</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(q.cite)}</div><div class="src" style="margin-top:7px">${esc(q.src||"Interview material")}</div></div>`:`<div class="citation"><div class="label">${q.audit==="fcom_verified"?"FCOM · VERIFIED":q.audit==="airbus_tutorials_verified"?"AIRBUS TUTORIALS · VERIFIED":"Source"}</div><blockquote>“${esc(q.cite)}”</blockquote><div class="src">${esc(q.src||"")}</div>${q.audit_note?`<div class="audit-note">${esc(q.audit_note)}</div>`:""}</div>`):`<div class="citation"><div class="label">Source</div><div class="src">${esc(q.src||"Technical bank")}</div></div>`}`;
  $("iAnswer").classList.remove("hidden");$("revealBtn").classList.add("hidden");$("rateWrap").classList.remove("hidden");
  if(already)$("iNextBtn").disabled=false;
  persistResume();
}
function rateInterview(v){
  const q=iQuestion();session.ratings[session.index]=v;
  const s=appState.oral[q._id]||{a:0,total:0,low:0,last:0};s.a++;s.total+=v;if(v===0)s.low++;s.last=Date.now();appState.oral[q._id]=s;saveState();
  $("iNextBtn").disabled=false;syncRateButtons(v);persistResume();toast(v===2?"Solid":v===1?"Partial · worth repeating":"Marked for review");
}
function prevInterview(){if(session.index>0){session.index--;renderInterview();persistResume()}}
function nextInterview(){
  if(session.ratings[session.index]===null)return;
  if(session.index<session.questions.length-1){session.index++;renderInterview();persistResume();return}
  session.completed=true;appState.resume=null;saveState();
  const done=session.kind==="scenario"?"Scenarios complete":"Interview complete";goHome();toast(done)
}

function isStandaloneMode(){
  return window.navigator.standalone===true||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches);
}

document.addEventListener("keydown",e=>{
  if($("quiz").classList.contains("hidden"))return;
  if(["1","2","3","4","5","6"].includes(e.key)){const i=Number(e.key)-1;if(i<sessionQuestion().options.length)selectOption(i)}
  if(e.key==="ArrowRight"&&!$("nextBtn").disabled)nextQuestion();
  if(e.key==="ArrowLeft"&&!$("prevBtn").disabled)prevQuestion();
});

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
      await navigator.share({files:[file],title:"A320 Trainer progress backup"});
      toast("Backup ready");return;
    }
  }catch(e){if(e&&e.name==="AbortError")return}
  try{
    const blob=new Blob([text],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Progress backup created");
  }catch(e){toast("Couldn't create the backup")}
}
function importProgress(event){
  const input=event.target,file=input.files&&input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      const incoming=parsed&&parsed.state?parsed.state:parsed;
      if(!looksLikeValidBackup(incoming))throw new Error("Invalid format");
      if(!confirm("Restoring this backup will replace the progress currently saved on this device. Continue?")){input.value="";return}
      const candidate=sanitizeState(incoming);
      const ok=(()=>{appState=candidate;return saveState()})();
      session=null;currentSystemKey=null;renderHome();show("home");
      toast(ok?"Progress restored":"Progress restored for this session, but it couldn't be saved on the device");
    }catch(e){toast("The backup isn't valid")}
    input.value="";
  };
  reader.onerror=()=>{toast("Couldn't read the backup");input.value=""};
  reader.readAsText(file);
}
