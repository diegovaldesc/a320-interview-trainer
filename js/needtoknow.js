/* Need to know (parte de la lógica de la app; ver la cabecera de js/app.js). */
/* ---------- NEED TO KNOW ----------
   Seccion destacada con las preguntas clave de la entrevista. La lista base (NTK_GROUPS) se combina
   con lo que cada usuario agrega o quita (appState.needToKnow = {added:[], removed:[]}): asi una
   pregunta base nueva le llega a todos sin perder sus cambios. Referencias: "o:<id oral>" para las
   preguntas de Entrevista oral y "q:<_id>" para las de alternativas. Las orales se practican con el
   mismo microfono y la misma evaluacion de Entrevista oral (se mueve .oral-mic-box a la tarjeta);
   las de alternativas, con sus alternativas y una explicacion sin citas. */
const NTK_GROUPS=[
  {title:"Performance and weights",items:["o:ov_mac_envelope","o:ov_weights","o:ov_cost_index","o:ov_fuel_dan121","o:ov_cg_effects"]},
  {title:"Takeoff",items:["o:ov_contaminated_rwy","o:ov_flex_derate_def","o:ov_flex_derate_contam","o:ov_balanced_unbalanced","o:ov_improve_takeoff","o:ov_improved_climb","o:ov_takeoff_segments","o:ov_tailwind_takeoff","o:ov_vmc_cg_weight"]},
  {title:"Speeds",items:["o:ov_limit_speeds","o:ov_green_dot","o:ov_srs","o:ov_gs_mini","o:ov_coffin_corner"]},
  {title:"Systems and laws",items:["o:ov_fmgs_functions","o:ov_fc_laws","o:ov_dual_ra_direct"]},
  {title:"Approach and cruise",items:["o:ov_appr_ldg_climb","o:ov_stab_appr","o:ov_eng_fail_cruise","o:ov_rvsm_equipment"]},
  {title:"Procedures",items:["o:ov_ecam_priorities","o:ov_ecam_handling","o:ov_ecam_after","o:ov_emergency_atc","o:ov_golden_rules"]}
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
  if(ntkHas(ref)){ntkRemove(ref);toast("Removed from Need to know")}
  else if(ntkAdd(ref))toast("Agregada a Need to know");
}
function ntkThemeOf(ref){const g=NTK_GROUPS.find(x=>x.items.includes(ref));return g?g.title:"Added by you"}
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
  b.setAttribute("aria-label",on?"Remove from Need to know":"Add to Need to know");
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
  if(extra.length)groups.push({title:"Added by you",items:extra});
  let h="";
  groups.forEach(g=>{
    if(!g.items.length)return;
    h+=`<div class="section-label">${esc(g.title)}</div>`;
    g.items.forEach(r=>{
      const it=ntkResolve(r),p=ntkPracticed(r);
      const text=it.kind==="oral"?it.q.question:it.q.q;
      const meta=(it.kind==="oral"?"Oral answer":"Multiple choice · "+systemName(it.q._sys))+(p?(p.score!==undefined?` · last time ${ntkScoreText(p.score)}/10`:(p.ok?" · last time correct":" · last time incorrect")):"");
      h+=`<div class="ntk-item"><button type="button" class="ntk-open" data-ref="${esc(r)}" onclick="ntkStart(this.dataset.ref)"><span class="ntk-meta">${esc(meta)}</span><span class="ntk-q">${esc(text)}</span></button><button type="button" class="ntk-remove" data-ref="${esc(r)}" onclick="ntkRemoveFromList(this.dataset.ref)" aria-label="Quitar de Need to know">Quitar</button></div>`;
    });
  });
  $("ntkBody").innerHTML=h||`<div class="empty">You have no questions in Need to know. Add them with the “+ Need to know” button on any question in the app, or restore the default questions.</div>`;
  const done=refs.filter(r=>ntkPracticed(r)).length;
  $("ntkSummary").textContent=refs.length?`${refs.length} ${plural(refs.length,"question","questions")}${done?` · ${done} practiced`:""}`:"";
  $("ntkStartBtn").classList.toggle("hidden",!refs.length);
  $("ntkRestoreBtn").classList.toggle("hidden",!st.removed.some(r=>defaults.includes(r)));
}
function ntkRemoveFromList(ref){ntkRemove(ref);renderNtkList();toast("Removed from Need to know")}
function ntkRestoreDefaults(){ntkState().removed=[];saveState();renderNtkList();toast("Default questions restored")}
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
  $("ntkNextBtn").textContent=i===n-1?"Finish":"Next";
  const mcq=$("ntkMcq");
  if(it.kind==="oral"){
    ntkSession.mcq=null;
    $("ntkEyebrow").textContent="ANSWER BY VOICE OR IN WRITING";
    $("ntkQuestion").textContent=it.q.question;
    mcq.innerHTML="";mcq.classList.add("hidden");
    ntkPlaceOralBox();
    oralState.pool=[it.q];oralState.index=0;
    loadQuestionFromA320Bank(it.q);
    $("ntkRevealBtn").classList.remove("hidden");
  }else{
    ntkRestoreOralBox();
    if(!ntkSession.mcq||ntkSession.mcq.ref!==it.ref)ntkSession.mcq={ref:it.ref,q:buildSessionQ(it.q),ans:null};
    $("ntkEyebrow").textContent="CHOOSE THE CORRECT OPTION";
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
  if(ans===null)h+=`<button type="button" class="dontknow" onclick="ntkSelect(-1)">I don't know · show answer</button>`;
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
  return `<div class="feedback-head ${isOk?"ok":"bad"}"><div class="status">${isOk?"Correct":"Correct answer"}</div><strong>${esc(q._correctText||q.options[q.correct])}</strong></div>${q.expl?`<div class="explain"><div class="label">Why</div><p>${esc(q.expl)}</p></div>`:""}`;
}
function ntkAnswerHtml(q){
  return `${q.short?`<div class="ntk-short"><div class="label">Key idea</div><p>${esc(q.short)}</p></div>`:""}<div class="explain ntk-explain"><div class="label">Explanation</div>${formatRefHtml(q.reference)}</div>`;
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
  ntkExitCard();toast(`You reviewed ${n} Need to know ${plural(n,"question","questions")}`);
}
function ntkExitCard(){stopEverythingOral();ntkRestoreOralBox();ntkSession=null;show("ntk");renderNtkList()}

