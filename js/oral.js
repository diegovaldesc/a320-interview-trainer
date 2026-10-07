/* Entrevista oral (parte de la lógica de la app; ver la cabecera de js/app.js): práctica con micrófono,
   evaluación local con rúbricas (normalización, coincidencia flexible y conceptos ponderados, sin IA en vivo).
   Las preguntas están en data/oral/ (ORAL_VOICE_BANK). */
/* ==========================================================
   ENTREVISTA ORAL - banco curado con rubricas semanticas locales
   (normalizacion + fuzzy matching + conceptos ponderados, sin IA en vivo)
   ========================================================== */
const ORAL_MAX_SECONDS=90;
const ORAL_MAX_RESTARTS=25;

/* ORAL_VOICE_BANK (las preguntas orales y sus rúbricas) está en data/oral/. */

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
  $("ovMeta").textContent=`ORAL INTERVIEW · ${oralState.index+1} / ${oralState.pool.length}`;
  $("ovProgress").style.width=`${((oralState.index+1)/oralState.pool.length)*100}%`;
  $("ovPrevBtn").disabled=oralState.index===0;
  $("ovNextBtn").textContent=oralState.index===oralState.pool.length-1?"Finish":"Next";
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
  toast(`Interview complete · average ${avg.toFixed(1)}/10 over ${scores.length} questions`);
  goHome();
}

function setOralQuestion(question){
  stopEverythingOral();
  oralState.question=question;
  oralState.transcript="";
  $("oralQuestion").textContent=question.question||"Oral question";
  const qImg=$("oralQuestionImage");
  if(question.image){qImg.src=question.image;qImg.alt=question.imageAlt||"Reference diagram for this question";qImg.classList.remove("hidden")}
  else{qImg.classList.add("hidden");qImg.removeAttribute("src");qImg.alt=""}
  $("oralResult").classList.add("hidden");
  $("oralTextFallbackBox").classList.add("hidden");
  $("oralTextFallbackInput").value="";
  setOralStatus("Tap the microphone when you're ready.");
  resetMicButton();
  const fallback=$("oralMicFallback"),micBtn=$("oralMicBtn");
  if(!speechRecognitionSupported()){
    fallback.textContent="Your browser doesn't support speech recognition. Use the option to type your answer.";
    fallback.classList.add("show");micBtn.classList.add("hidden");
  }else if(isStandaloneMode()){
    fallback.textContent="Safari speech recognition doesn't work inside apps installed on the home screen. Open this site in Safari to use the microphone, or type your answer below.";
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
  if(!text){toast("Type something before evaluating");return}
  oralState.transcript=text;
  evaluateCollectedOralAnswer();
}

async function toggleOralAnswer(){
  if(oralState.listening){finishOralAnswer();return}
  await startOralAnswer();
}
async function startOralAnswer(){
  if(!oralState.question){alert("No oral question is loaded.");return}
  if(!window.isSecureContext&&location.hostname!=="localhost"){alert("The microphone requires the app to be opened over HTTPS.");return}
  if(!speechRecognitionSupported()){alert("Speech recognition isn't available in this browser. On iPhone, open the app in Safari.");return}
  const startGeneration=oralGeneration;
  if(!oralMicPermissionGranted){
    try{
      if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        stream.getTracks().forEach(track=>track.stop());
      }
      oralMicPermissionGranted=true;
    }catch(error){
      console.warn("Microphone permission:",error);
      if(startGeneration===oralGeneration)setOralStatus(isStandaloneMode()?"Couldn't access the microphone. If you're in the installed app, open the site in Safari.":"Couldn't access the microphone.");
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
  setOralStatus("Listening… answer as if you were in an interview.",true);
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
      if(error==="not-allowed")setOralStatus("You need to allow microphone access.");
      else if(error==="audio-capture")setOralStatus("Couldn't access the microphone.");
      else{
        setOralStatus(isStandaloneMode()?"Speech recognition isn't available in the installed app. Open the site in Safari.":"Connection problem with speech recognition.");
        if(isStandaloneMode())$("oralMicFallback").classList.add("show");
      }
    }
  };
  recognition.onend=function(){
    if(oralState.listening&&!oralState.stopping){
      oralState.restartCount=(oralState.restartCount||0)+1;
      if(oralState.restartCount>ORAL_MAX_RESTARTS){
        oralState.listening=false;stopOralTimer();resetMicButton();
        setOralStatus("The microphone disconnected several times. Try again.");
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
      setOralStatus("The microphone disconnected several times. Try again.");
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
  setOralStatus("Analyzing answer…");
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
    setOralStatus("I couldn't recognize an answer. Try again or type your answer.");
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
        errors.push(item.feedback||"A conceptual error was detected.");
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
  if(orderPenalty>0)errors.push("The order of some steps doesn't match the expected sequence.");
  return {score:Math.round(rawScore*10)/10,detected,missing,errors,similarity:Math.round(similarity*100),source:"local"};
}
function showOralEvaluation(result,transcript){
  resetMicButton();
  $("oralResult").classList.remove("hidden");
  const score=Number(result.score)||0;
  $("oralScore").textContent=score.toFixed(score%1?1:0)+"/10";
  let grade,gradeClass;
  if(score>=9){grade="Very high coverage";gradeClass="good"}
  else if(score>=7.5){grade="High coverage";gradeClass="good"}
  else if(score>=6){grade="Medium coverage";gradeClass="mid"}
  else if(score>=4){grade="Partial coverage";gradeClass="mid"}
  else{grade="Low coverage";gradeClass="low"}
  $("oralGrade").textContent=grade;
  $("oralGrade").className="oral-grade "+gradeClass;
  let html="";
  if(result.detected&&result.detected.length){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title ok">✓ GOOD</div>';
    result.detected.forEach(item=>{html+='<div class="oral-feedback-item">✓ '+esc(item)+'</div>'});
    html+="</div>";
  }
  if(result.missing&&result.missing.length){
    html+='<div class="oral-feedback-block"><div class="oral-feedback-title warn">YOU COULD ADD</div>';
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
  html+='<div class="oral-feedback-block"><div class="oral-feedback-title">REFERENCE ANSWER</div><div class="oral-feedback-item">'+(oralState.question.short?'<p class="ref-short">'+esc(oralState.question.short)+'</p>':'')+formatRefHtml(oralState.question.reference||"")+'</div></div>';
  $("oralFeedback").innerHTML=html;
  const revealBox=$("oralTranscriptReveal");
  revealBox.classList.add("hidden");
  revealBox.dataset.transcript=transcript||"";
  setOralStatus("Answer evaluated.");
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
    box.textContent=box.dataset.transcript?("Transcribed: “"+box.dataset.transcript+"”"):"No transcript was saved for this answer.";
    box.classList.remove("hidden");
  }else{box.classList.add("hidden")}
}
function restartOralAnswer(){
  oralState.transcript="";
  $("oralResult").classList.add("hidden");
  setOralStatus("Tap the microphone when you're ready.");
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
  $("oralMicText").textContent="Finish answer";
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
