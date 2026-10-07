/* Inglés OACI (parte de la lógica de la app; ver la cabecera de js/app.js). Los datos están en data/english/. */
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
  enHubNote=`✓ Test ${cur.n} complete${m?` · multiple choice: ${m.c} of ${m.t} correct`:""}.`;
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
  if(b)b.textContent=enMedia.speaking?"■ Stop":"▶ Listen";
  document.querySelectorAll(".en-say").forEach(x=>x.classList.toggle("playing",enMedia.speaking&&x===enMedia.sayBtn));
}
function enUpdateVoiceStatus(){
  const st=$("enAudioStatus");if(!st)return;
  st.textContent=!enSpeechOk()?"This browser has no speech synthesis: use the transcript.":(enVoices().length?"":(enMedia.voicesLoaded?"No English voice was found on this device. Install one in the system settings or use the transcript.":"Looking for English voices on the device…"));
}
function enStopAudio(){
  enMedia.audioGen++;enMedia.speaking=false;enMedia.sayBtn=null;
  if(enSpeechOk()){try{speechSynthesis.cancel()}catch(e){}}
  enUpdateAudioUi();
}
function enPlay(lines,btn){
  enStopAudio();
  if(!enSpeechOk()){toast("This browser can't read the audio aloud. Use the transcript.");return false}
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
  b.innerHTML=recording?'<span aria-hidden="true">●</span><span>Stop</span>':'<span aria-hidden="true">🎙️</span><span>Record my answer</span>';
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
  if(!window.isSecureContext&&location.hostname!=="localhost"){alert("The microphone requires the app to be opened over HTTPS.");return}
  if(!enMicSupported()){alert("Speech recognition isn't available in this browser. Type your answer in the box.");return}
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
      console.warn("Microphone permission:",error);
      if(gen===enMedia.micGen)enSetMicStatus(isStandaloneMode()?"Couldn't access the microphone. If you're in the installed app, open the site in Safari.":"Couldn't access the microphone.");
      return;
    }
    /* Si mientras se pedía el permiso el usuario cambió de pantalla o de ejercicio,
       no se inicia un reconocimiento sobre algo que ya no está a la vista. */
    if(gen!==enMedia.micGen)return;
  }
  const box=$("enTranscript");
  enMedia.base=box?box.value.trim():"";enMedia.final="";enMedia.interim="";
  enMedia.stopping=false;enMedia.listening=true;enMedia.restarts=0;enMedia.startTime=Date.now();
  enMicButton(true);enSetMicStatus("Listening… speak in English.",true);
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
    console.warn("SpeechRecognition (English) error:",err);
    if(err==="not-allowed"||err==="audio-capture"||err==="network"||err==="service-not-allowed"){
      enMedia.listening=false;enStopTimer();enMicButton(false);
      enSetMicStatus(err==="not-allowed"?"You need to allow microphone access.":err==="audio-capture"?"Couldn't access the microphone.":(isStandaloneMode()?"Speech recognition isn't available in the installed app. Open the site in Safari.":"Connection problem with speech recognition."));
    }
  };
  r.onend=()=>{
    if(gen!==enMedia.micGen)return;
    if(enMedia.listening&&!enMedia.stopping){
      enMedia.restarts++;
      if(enMedia.restarts>EN_MAX_RESTARTS){enMedia.listening=false;enStopTimer();enMicButton(false);enSetMicStatus("The microphone disconnected several times. Try again.");return}
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
    if(enMedia.restarts>EN_MAX_RESTARTS){enMedia.listening=false;enStopTimer();enMicButton(false);enSetMicStatus("The microphone disconnected several times. Try again.");return}
    const gen=enMedia.micGen;
    enMedia.restartTimer=setTimeout(()=>{if(gen===enMedia.micGen&&enMedia.listening){enCreateRec();try{enMedia.rec.start()}catch(e){console.warn("SpeechRecognition (English) restart:",e)}}},500);
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
    catch(e){console.warn("Stop recognition (English):",e)}
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
  enSetMicStatus(box&&box.value.trim()?"Done. This text is what speech recognition understood; you can correct it. There's no grade: compare it with the model.":"I couldn't recognize anything. Try again or type your answer.");
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
  if(!total){body.innerHTML=`<div class="empty">No tests loaded yet.</div>`;return}
  let h=`<div class="folder-summary"><span>Tests completed</span><b>${done} of ${total}${st.cycle?` · round ${st.cycle+1}`:""}</b></div>`;
  h+=`<div class="en-dots" role="list" aria-label="Pruebas">${tests.map(t=>{
    const d=st.done.includes(t.n),now=!!cur&&cur.n===t.n;
    return `<span class="en-dot${d?" done":now?" now":""}" role="listitem" aria-label="Test ${t.n}: ${d?"completed":now?"your current test":"pending"}">${d?"✓":t.n}</span>`;
  }).join("")}</div>`;
  if(enHubNote)h+=`<div class="en-banner" role="status">${esc(enHubNote)}</div>`;
  if(cur){
    const t=enTestByN(cur.n),n=cur.order.length,started=cur.i>0;
    const c=(t.mcq||[]).length,a=(t.listening||[]).length,f=(t.images||[]).length;
    h+=`<div class="en-test-card"><div class="en-test-kicker">${started?"IN PROGRESS":"PICKED AT RANDOM"}</div><h2 class="en-test-title">Test ${cur.n}</h2><p class="en-test-sub">${c} multiple choice, ${a} ${plural(a,"audio clip","audio clips")}, ${f} ${plural(f,"picture","pictures")} and 1 role-play, randomly mixed in a single round.</p>${started?`<div class="progress en-test-progress"><div style="width:${Math.round(cur.i/n*100)}%"></div></div><p class="en-test-sub">You're on exercise ${cur.i+1} of ${n}.</p>`:""}<button class="btn primary en-test-go" onclick="enStartOrContinue()" type="button">${started?"Continue test":"Start test"}</button></div>`;
  }else{
    h+=`<div class="en-test-card"><div class="en-test-kicker">DONE!</div><h2 class="en-test-title">You completed all ${total} tests</h2><p class="en-test-sub">You can start another round: the order is shuffled again.</p><button class="btn primary en-test-go" onclick="enStartNewRound()" type="button">Start another round</button></div>`;
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
  }).join("")}</div>${locked?"":`<button class="dontknow" onclick="enDontKnow()" type="button">I don't know · show answer</button>`}`;
}
function enMcqFeedback(q,st){
  const ok=st.chosen===q.correct;
  return `<div class="feedback-head ${ok?"ok":"bad"}"><div class="status">${ok?"Correct":"Correct answer"}</div><strong>${esc(q.options[q.correct])}</strong></div><div class="explain"><div class="label">Why</div><p>${esc(q.expl)}</p></div>`;
}

/* ---------- piezas de HTML ---------- */
function enUl(items){return `<ul class="en-list">${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`}
function enOl(items){return `<ol class="en-list">${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`}
function enChips(vocab){return `<div class="en-chips">${vocab.map(v=>`<span class="en-chip"><b>${esc(v.en)}</b> · ${esc(v.es)}</span>`).join("")}</div>`}
function enSayBtn(text,who){return `<button class="en-say" data-say="${esc(text)}" data-who="${esc(who)}" onclick="enPlayFromBtn(this)" type="button" aria-label="Listen to this text in English">▶</button>`}
function enChecklist(points){
  return `<div class="section-label">Compare yourself (check what you did)</div><div class="en-check">${points.map(p=>`<label><input type="checkbox"><span>${esc(p)}</span></label>`).join("")}</div><div class="oral-score-note">It's just for you: it isn't saved or turned into a grade.</div>`;
}
function enNotesBox(){
  return `<div class="section-label">Your notes</div>
<textarea class="oral-transcript en-notes" id="enNotes" rows="9" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="Write down what you hear, as if taking notes in the cockpit…" aria-label="Your notes on what you hear" oninput="enTextChanged(this.value)"></textarea>`;
}
/* Un solo botón: la velocidad es siempre la normal y la voz cambia sola de un audio a otro. */
function enAudioBox(){
  return `<div class="en-audio">
<div class="en-audio-row"><button class="btn primary" id="enPlayBtn" onclick="enPlayCurrent()" type="button">▶ Listen</button></div>
<div class="oral-status" id="enAudioStatus" role="status" aria-live="polite"></div>
</div>`;
}
function enMicBox(){
  const supported=enMicSupported(),standalone=isStandaloneMode();
  const warn=!supported?"Your browser doesn't support speech recognition. Type your answer in the box.":standalone?"Safari speech recognition doesn't work inside apps installed on the home screen. Open this site in Safari to use the microphone, or type your answer.":"";
  return `<div class="oral-mic-box">
<div class="section-label">Your answer</div>
${supported?`<button class="oral-mic-btn" id="enMicBtn" onclick="enToggleMic()" type="button"><span aria-hidden="true">🎙️</span><span>Record my answer</span></button>`:""}
${warn?`<div class="oral-mic-fallback show">${esc(warn)}</div>`:""}
<div class="oral-status" id="enMicStatus" role="status" aria-live="polite">${supported?"Tap the microphone when you're ready. What the device understands is written here; no grade is calculated.":"You can say it out loud and then compare it with the model."}</div>
<div class="oral-time" id="enMicTime" style="display:none">00:00</div>
<textarea class="oral-transcript" id="enTranscript" rows="4" placeholder="What you say appears here, or type it yourself…" aria-label="Your answer in English" oninput="enTextChanged(this.value)"></textarea>
</div>`;
}
const EN_HELP=`<details class="en-help"><summary>Useful phrases for describing</summary><div>
<p><b>Where something is:</b> in the foreground / in the background / in the middle · on the left / on the right · next to · behind · in front of · above · below · near</p>
<p><b>What is happening now:</b> There is… / There are… · The firefighters are spraying… (present continuous)</p>
<p><b>Guesses:</b> It looks like… · It seems that… · It may / might / could have… · It must have… · Perhaps… · I think…</p>
<p><b>What to do next:</b> The crew should… · The next step would be… · Emergency services need to…</p>
</div></details>`;
/* Lo que ya pasó en el role-play: lo que ATC dijo y lo que tú (según el modelo) respondiste. */
function enHistory(hist){
  if(!hist||!hist.length)return "";
  const rows=hist.map(h=>(h.heard||[]).map(l=>`<div class="en-tr"><b>ATC:</b> ${esc(l.text)}</div>`).join("")+(h.said?`<div class="en-tr"><b>You:</b> ${esc(h.said)}</div>`:"")).join("");
  return `<div class="en-scenario"><b>So far:</b>${rows}</div>`;
}

/* ---------- pantalla de práctica (sirve para los cuatro tipos de ejercicio) ---------- */
function renderEnglishPractice(){
  const s=enSession,it=enItem(),n=s.items.length,i=s.index,st=s.state[i];
  stopEnglishMedia();
  $("epMeta").textContent=`TEST ${s.n} · ${s.pos+1} / ${s.total}`;
  $("epProgress").style.width=`${((s.pos+(i+1)/n)/s.total)*100}%`;
  let work="",tip="";
  if(s.kind==="mcq"){
    $("epTag").innerHTML="ICAO ENGLISH · MULTIPLE CHOICE";
    $("epEyebrow").textContent="CHOOSE THE CORRECT ANSWER";
    $("epTitle").textContent=it.q;
    $("epStimulus").innerHTML="";
    work=enMcqWork(it,st);
  }else if(s.kind==="image"){
    /* Ni el título ni el tema de la foto se muestran antes de describirla: darían vocabulario hecho. Aparecen al revelar el modelo. */
    $("epTag").innerHTML="ICAO ENGLISH · PICTURE DESCRIPTION";
    $("epEyebrow").textContent="DESCRIBE THE PICTURE";
    $("epTitle").textContent="Describe the picture.";
    $("epStimulus").innerHTML=`<figure class="en-figure"><img src="${esc(it.file)}" alt="${esc(it.alt)}"></figure><div class="en-credit">Photo: ${esc(it.credit.text)} · <a href="${esc(it.credit.url)}" target="_blank" rel="noopener">Wikimedia Commons</a></div>`;
    tip="Take a minute: say what you see (where, what, who) and then what might have happened. You can record yourself or type. Then reveal the model and compare.";
    work=`<div class="section-label">Guiding questions</div>${enOl(it.prompts)}${EN_HELP}${enMicBox()}`;
    $("epRevealBtn").textContent="Show model";
  }else if(s.kind==="roleplay"){
    $("epTag").innerHTML=`ROLE-PLAY · TURN ${it.rp.turn} OF ${it.rp.turns}`;
    $("epEyebrow").textContent="ANSWER ON THE RADIO";
    $("epTitle").textContent=it.prompt;
    $("epStimulus").innerHTML=`<div class="en-scenario"><b>Situation:</b> ${esc(it.scenario)}</div>${enHistory(it.rp.history)}`;
    tip="Speak as on the radio: digits one by one and your call sign at the end. Then reveal the model and compare.";
    if(it.heard&&it.heard.length){
      work+=`${enAudioBox()}<button class="oral-text-fallback-btn en-heard-btn" onclick="enToggleHeard()" type="button">Show the text of what you hear</button><div class="en-scenario hidden" id="enHeardText">${it.heard.map(l=>`<div class="en-tr"><b>${l.who==="pilot"?"Pilot":"ATC"}:</b> ${esc(l.text)}</div>`).join("")}</div>`;
    }
    work+=enMicBox();
    $("epRevealBtn").textContent="Show model";
  }else{
    $("epTag").innerHTML=`AUDIO · ${it.type==="atis"?"ATIS":"ATC CLEARANCE"}`;
    $("epEyebrow").textContent="LISTEN AND WRITE";
    $("epTitle").textContent=it.title;
    $("epStimulus").innerHTML=`<div class="en-scenario">${esc(it.scenario)}</div>`;
    tip="Write down what you hear as you would in the cockpit, in your own format. When you check, you'll see the transcript and which data I found in your notes; no grade is calculated.";
    work=`${enAudioBox()}${enNotesBox()}`;
    $("epRevealBtn").textContent="Check and show transcript";
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
  let h=`<div class="explain"><div class="label">What you can see</div><p><b>${esc(it.title)}</b>${it.topic?` · ${esc(it.topic)}`:""}</p>${enUl(it.seen)}</div>`;
  h+=`<div class="memory"><div class="label">What might have happened (hypotheses)</div>${enUl(it.might)}</div>`;
  h+=`<div class="citation"><div class="label">Context of the event</div><div style="font-size:12.5px;line-height:1.5;color:#596A75">${esc(it.context)}</div></div>`;
  h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Model description</div><div class="en-line"><span class="en-model">${esc(it.model)}</span>${enSayBtn(it.model,"pilot")}</div></div>`;
  h+=`<div class="section-label">Vocabulario clave</div>${enChips(it.vocab)}`;
  if(it.radio)h+=`<div class="explain" style="margin-top:10px"><div class="label">On the radio</div><p>${esc(it.radio.intro)}</p>${it.radio.lines.map(l=>`<div class="en-line"><span class="en-model">${esc(l)}</span>${enSayBtn(l,"pilot")}</div>`).join("")}</div>`;
  h+=enChecklist(it.points);
  return h;
}
function enSpeakingReveal(it){
  let h=`<div class="feedback-head ok"><div class="status">${it.model.length>1?"Model answers":"Model answer"}</div>${it.model.map(m=>`<div class="en-line"><span class="en-model">${esc(m)}</span>${enSayBtn(m,"pilot")}</div>`).join("")}</div>`;
  if(it.note)h+=`<div class="memory"><div class="label">Nota</div><p>${esc(it.note)}</p></div>`;
  h+=enChecklist(it.points);
  if(it.vocab&&it.vocab.length)h+=`<div class="section-label">Vocabulario</div>${enChips(it.vocab)}`;
  if(it.rp)h+=`<div class="oral-score-note">The ATC turns are for practice: they were written for this exercise.</div>`;
  return h;
}
function enListeningReveal(it,st){
  const who=w=>w==="pilot"?"Pilot":"ATC";
  const tok=enNoteTokens(st.text),wrote=String(st.text||"").trim().length>0;
  const rows=it.keys.map(k=>{
    const ok=wrote&&enKeyFound(k,tok);
    return `<div class="en-key ${ok?"ok":"miss"}"><span class="en-key-mark" aria-hidden="true">${ok?"✓":"•"}</span><span><b>${esc(k.label)}</b> · ${esc(k.value)}${ok?"":`<em> — not found in your notes</em>`}</span></div>`;
  }).join("");
  let h=`<div class="explain"><div class="label">Transcript</div>${it.lines.map(l=>`<div class="en-tr"><b>${who(l.who)}:</b> ${esc(l.text)}</div>`).join("")}</div>`;
  h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Key data, in the order heard</div>${wrote?"":`<div class="en-tr">You didn't write anything: listen again, note what you hear and check again.</div>`}${rows}<div class="oral-score-note">The comparison is automatic and flexible: it understands “200/12”, “two zero zero” or “RWY27”. If you wrote it another way and it's right, count it as right. It's only an aid, not a grade.</div></div>`;
  if(it.after&&it.after.length)h+=`<div class="feedback-head ok" style="margin-top:8px"><div class="status">Model readback / call</div>${it.after.map(l=>`<div class="en-line"><span class="en-model"><b>${who(l.who)}:</b> ${esc(l.text)}</span>${enSayBtn(l.text,l.who)}</div>`).join("")}</div>`;
  h+=`<div class="memory" style="margin-top:8px"><div class="label">Key takeaways</div>${enUl(it.notes||[])}</div>`;
  h+=`<button class="btn ghost" onclick="retryEnglish()" style="width:100%;margin-top:10px" type="button">Try again (clears your notes)</button>`;
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
  $("epNextBtn").textContent=lastItem&&lastUnit?"Finish test":"Next";
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
  toast(v===2?"Good":v===1?"Almost · try again":"Marked to repeat");
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
