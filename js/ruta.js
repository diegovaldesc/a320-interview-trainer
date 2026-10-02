/* Ruta de entrenamiento: portada (inicio de la app), mapa de misiones y misión (clase, prueba y estrellas).
   El contenido viene de data/estaciones.js (lo exporta la carpeta Estaciones). El avance se guarda en
   appState.ruta y viaja en la copia de seguridad. Las preguntas de alternativas cuentan en las
   estadísticas de la app (menos las del banco DGAC, como en el resto de la app) y las orales se
   evalúan con el mismo motor de Entrevista oral. Se carga después de js/app.js. */
(function(){
  var D = window.ESTACIONES_DATA;
  var $ = function(id){ return document.getElementById(id); };
  if (!D || !Array.isArray(D.subjects) || !D.route){ console.error('No se pudo cargar data/estaciones.js'); return; }
  var SUBJ = {}, ST = {}, CARDS = {};
  D.subjects.forEach(function(s){ SUBJ[s.id] = s; s.stations.forEach(function(st){ ST[st.id] = st; st.cards.forEach(function(c){ CARDS[c.id] = c; }); }); });
  var M = D.route.missions.filter(function(m){ return ST[m.id]; });
  var ZONES = D.route.zones;
  var LEVEL = { pista: 'Nivel 1', nubes: 'Nivel 1', crucero: 'Nivel 2', 'mal-tiempo': 'Nivel 2', tormenta: 'Nivel 3', descenso: 'Repasos', llegada: 'Final' };
  var ORAL_PASS = 6;   // «Cobertura media» o más aprueba una respuesta oral

  // ---------- avance (appState.ruta) ----------
  function R(){ if (!appState.ruta) appState.ruta = sanitizeRuta(null); return appState.ruta; }
  function stars(id){ return R().stars[id] || 0; }
  function isUnlocked(i){ return R().unlockAll || i === 0 || stars(M[i - 1].id) > 0; }
  function currentIndex(){ for (var i = 0; i < M.length; i++) if (!stars(M[i].id)) return i; return M.length; }
  function totalStars(){ return M.reduce(function(n, m){ return n + stars(m.id); }, 0); }
  function day(d){ return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function streakNow(){ var t = new Date(), y = new Date(); y.setDate(t.getDate() - 1); var s = R().streak; return (s.last === day(t) || s.last === day(y)) ? s.days : 0; }
  function bumpStreak(){
    var t = new Date(), y = new Date(), s = R().streak;
    y.setDate(t.getDate() - 1);
    if (s.last === day(t)) return;
    R().streak = { last: day(t), days: s.last === day(y) ? s.days + 1 : 1 };
  }

  // ---------- piezas comunes ----------
  function inline(s){ return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function prose(text){
    return String(text || '').split(/\n\s*\n/).map(function(block){
      var head = [], items = [];
      block.split('\n').forEach(function(l){ if (/^- /.test(l)) items.push(l.slice(2)); else head.push(l); });
      return (head.length ? '<p>' + inline(head.join(' ')) + '</p>' : '') + (items.length ? '<ul>' + items.map(function(i){ return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>' : '');
    }).join('');
  }
  var STAR_PATH = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z';
  function starSvg(on){ return '<svg viewBox="0 0 24 24" class="' + (on ? 'rt-on' : '') + '" aria-hidden="true"><path d="' + STAR_PATH + '" fill="' + (on ? '#E9C46A' : 'rgba(255,255,255,.25)') + '" stroke="' + (on ? '#B8902E' : 'rgba(255,255,255,.85)') + '" stroke-width="1.4" stroke-linejoin="round"/></svg>'; }
  function starSvgInk(on){ return '<svg viewBox="0 0 24 24" class="' + (on ? 'rt-on' : '') + '" aria-hidden="true"><path d="' + STAR_PATH + '" fill="' + (on ? 'var(--rt-gold)' : 'none') + '" stroke="' + (on ? '#B8902E' : 'var(--rt-muted)') + '" stroke-width="1.5" stroke-linejoin="round"/></svg>'; }
  function starRow(n, ink){ var h = ''; for (var i = 0; i < 3; i++) h += ink ? starSvgInk(i < n) : starSvg(i < n); return h; }
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  // Avión visto desde arriba, apuntando hacia adelante (arriba).
  function planeSvg(body, line){ return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3c2.3 0 3.7 3.2 3.7 7.2v13.6l21.8 12.6v4.8l-21.8-6.6v12.6l6.2 4.6V56l-9.9-2.7-9.9 2.7v-3.4l6.2-4.6V34.6L6.5 41.2v-4.8l21.8-12.6V10.2C28.3 6.2 29.7 3 32 3z" fill="' + body + '" stroke="' + line + '" stroke-width="2" stroke-linejoin="round"/><rect x="17.5" y="30" width="4" height="7.5" rx="2" fill="#C9D3DB" stroke="' + line + '" stroke-width="1.4"/><rect x="42.5" y="30" width="4" height="7.5" rx="2" fill="#C9D3DB" stroke="' + line + '" stroke-width="1.4"/><path d="M29.4 11.5h5.2" stroke="' + line + '" stroke-width="2" stroke-linecap="round"/></svg>'; }
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function subjChip(s){ return '<span class="rt-subj" style="--c:' + esc(s.color) + '"><i></i>' + esc(s.title) + '</span>'; }
  function zoneTitle(id){ var z = ZONES.filter(function(z){ return z.id === id; })[0]; return z ? z.title : ''; }

  // ---------- portada ----------
  function renderCover(){
    var ci = currentIndex(), done = M.filter(function(m){ return stars(m.id) > 0; }).length;
    if (ci < M.length){
      var m = M[ci];
      $('rtRouteTitle').textContent = (done ? 'Continuar' : 'Empezar') + ' · Misión ' + m.n;
      $('rtRouteSub').textContent = m.title + ' · ' + SUBJ[m.subject].title;
    } else {
      $('rtRouteTitle').textContent = 'Ruta completa';
      $('rtRouteSub').textContent = 'Repite misiones para sumar estrellas. Vienen más materias.';
    }
    $('rtRouteBar').style.width = Math.round(done / M.length * 100) + '%';
    $('rtRouteCount').textContent = done + ' de ' + M.length + ' misiones';
    var s = streakNow();
    $('rtStreak').textContent = s; $('rtStreakLbl').textContent = s === 1 ? 'día seguido' : 'días seguidos';
    $('rtStarTotal').textContent = totalStars(); $('rtStarMax').textContent = M.length * 3;
  }

  // ---------- mapa ----------
  var geo = null, pendingFlight = null;
  function buildMap(){
    var canvas = $('rtCanvas');
    var W = canvas.clientWidth || Math.min(window.innerWidth, 520);
    var PH = W * 1.5, OV = PH * 0.075, STEP = PH - OV;
    var panels = ZONES.filter(function(z){ return z.bg; });
    var H = PH + (panels.length - 1) * STEP;
    var zoneIndex = {}; panels.forEach(function(z, k){ zoneIndex[z.id] = k; });
    var byZone = {};
    M.forEach(function(m){ var k = zoneIndex[m.zone]; if (k == null) k = panels.length - 1; (byZone[k] = byZone[k] || []).push(m); });
    var pts = [];
    M.forEach(function(m, i){
      var k = zoneIndex[m.zone]; if (k == null) k = panels.length - 1;
      var list = byZone[k], j = list.indexOf(m), n = list.length;
      // franja central de cada panel; en el último, la parte baja (arriba va el cartel de "más materias")
      var lo = 0.16, span = k === panels.length - 1 ? 0.46 : 0.68;
      var fromBottom = k * STEP + PH * (lo + span * (j + 0.5) / n);
      pts.push({ x: Math.round(W / 2 + W * 0.24 * Math.sin(i * 1.05 + 0.35)), y: Math.round(H - fromBottom) });
    });
    var start = { x: Math.round(W / 2), y: Math.round(H - PH * 0.035) };
    geo = { W: W, H: H, PH: PH, pts: pts, start: start };
    var html = '';
    panels.forEach(function(z, k){
      html += '<div class="rt-panel' + (k > 0 ? ' rt-fade' : '') + '" style="bottom:' + Math.round(k * STEP) + 'px;background-image:url(&quot;' + esc(z.bg) + '&quot;);z-index:' + (k + 1) + '"></div>';
    });
    var all = [start].concat(pts), ci = currentIndex();
    var flownPts = [start].concat(pts.slice(0, Math.min(ci, pts.length - 1) + 1));
    html += '<svg class="rt-route" style="height:' + H + 'px;z-index:10" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<path d="' + smooth(all) + '" fill="none" stroke="rgba(8,18,26,.45)" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="' + smooth(all) + '" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      (ci > 0 ? '<path d="' + smooth(flownPts) + '" fill="none" stroke="#E9C46A" stroke-width="5" stroke-linecap="round"/>' : '') +
      // rtSeg k: el tramo que llega a la misión k (desde la anterior, o desde la pista)
      all.slice(1).map(function(_, k){ return '<path id="rtSeg' + k + '" d="' + smooth(all, k, k + 1) + '" fill="none" stroke="none"/>'; }).join('') +
      '</svg>';
    panels.forEach(function(z, k){
      if (!byZone[k]) return;
      html += '<span class="rt-zone" style="top:' + Math.round(H - (k * STEP + PH * 0.1)) + 'px;z-index:11">' + esc(z.title) + ' <small>· ' + esc(LEVEL[z.id] || '') + '</small></span>';
    });
    M.forEach(function(m, i){
      var p = pts[i], st = ST[m.id], s = SUBJ[m.subject], open = isUnlocked(i), n = stars(m.id);
      var cls = 'rt-node' + (st.kind === 'review' ? ' rt-review' : '') + (open ? '' : ' rt-locked') + (i === ci ? ' rt-current' : '');
      var label = 'Misión ' + m.n + ': ' + m.title + (open ? (n ? ', ' + n + ' de 3 estrellas' : '') : ', bloqueada');
      html += '<button class="' + cls + '" type="button" data-m="' + i + '" style="left:' + p.x + 'px;top:' + p.y + 'px;--rt-ring:' + esc(s.color) + ';z-index:12" aria-label="' + esc(label) + '"><span>' + (open ? (st.kind === 'review' ? '★' : m.n) : LOCK) + '</span></button>';
      if (n) html += '<span class="rt-node-stars" style="left:' + p.x + 'px;top:' + (p.y + 34) + 'px;z-index:12">' + starRow(n) + '</span>';
    });
    if (ci < M.length){
      var cp = pts[ci], cx = Math.max(122, Math.min(W - 122, cp.x));   // el globo no se sale por los lados
      html += '<div class="rt-callout" style="left:' + cx + 'px;top:' + (cp.y - 46) + 'px;--dx:' + (cp.x - cx) + 'px;z-index:13"><b>Misión ' + M[ci].n + ' · ' + esc(SUBJ[M[ci].subject].title) + '</b><span>' + esc(M[ci].title) + '</span></div>';
    }
    var top = pts.length ? pts[pts.length - 1].y : H / 2;
    html += '<div class="rt-route-end" style="top:' + Math.max(70, Math.round(top - PH * 0.42)) + 'px;z-index:11"><b>Más materias en camino</b><span>La ruta crece con cada materia nueva. Al final viene el aterrizaje.</span></div>';
    html += '<div class="rt-plane" id="rtPlane" style="z-index:14">' + planeSvg('#FFFFFF', '#14212B') + '</div>';
    canvas.style.height = H + 'px';
    canvas.innerHTML = html;
    placePlane();
  }
  // Curva suave (Catmull-Rom) por los puntos; from/to eligen el tramo.
  function smooth(p, from, to){
    if (p.length < 2) return '';
    from = from || 0; to = to == null ? p.length - 1 : to;
    var d = 'M' + p[from].x + ' ' + p[from].y;
    for (var i = from; i < to; i++){
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ' C' + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + ' ' + (p1.y + (p2.y - p0.y) / 6).toFixed(1) + ' ' + (p2.x - (p3.x - p1.x) / 6).toFixed(1) + ' ' + (p2.y - (p3.y - p1.y) / 6).toFixed(1) + ' ' + p2.x + ' ' + p2.y;
    }
    return d;
  }
  // El avión espera sobre la ruta, antes de la misión que toca (a la mitad del tramo que llega a ella).
  var WAIT = 0.5;
  function planeAt(x, y, angle){ var el = $('rtPlane'); if (!el) return; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = 'rotate(' + angle + 'deg)'; }
  function pointOn(seg, d){ var L = seg.getTotalLength(), a = seg.getPointAtLength(Math.max(0, Math.min(L, d))), b = seg.getPointAtLength(Math.max(0, Math.min(L, d + 2))); return { x: a.x, y: a.y, ang: Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI }; }
  function placePlane(index){
    var ci = index == null ? currentIndex() : index;
    if (ci >= M.length){ var last = geo.pts[geo.pts.length - 1]; return planeAt(last.x, last.y - 70, 0); }
    var seg = $('rtSeg' + ci); if (!seg) return;
    var p = pointOn(seg, seg.getTotalLength() * WAIT); planeAt(p.x, p.y, p.ang);
  }
  function flyPlane(fromIdx, toIdx){
    var s1 = $('rtSeg' + fromIdx), s2 = $('rtSeg' + toIdx);
    if (!s1 || !s2 || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return placePlane();
    var L1 = s1.getTotalLength(), L2 = s2.getTotalLength(), d1 = L1 * (1 - WAIT), total = d1 + L2 * WAIT, t0 = null, dur = 1700;
    function frame(ts){
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, d = total * e;
      var p = d < d1 ? pointOn(s1, L1 * WAIT + d) : pointOn(s2, d - d1);
      planeAt(p.x, p.y, p.ang);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function scrollToCurrent(){ var ci = Math.min(currentIndex(), geo.pts.length - 1), map = $('rtMap'); map.scrollTop = Math.max(0, geo.pts[ci].y - map.clientHeight * 0.58); }

  // ---------- pantallas ----------
  function hideAll(){ closeSheet(); ['rtCover', 'rtMap', 'rtPlayer'].forEach(function(id){ $(id).hidden = true; }); }
  function showCover(){
    if (typeof stopEverythingOral === 'function') stopEverythingOral();
    hideAll(); $('rtCover').hidden = false; renderCover(); $('rtCover').scrollTop = 0;
  }
  function showMap(){
    hideAll(); $('rtMap').hidden = false;
    buildMap(); $('rtMapStars').textContent = totalStars() + '/' + (M.length * 3);
    scrollToCurrent();
    if (pendingFlight){ var f = pendingFlight; pendingFlight = null; placePlane(f.from); setTimeout(function(){ flyPlane(f.from, f.to); }, 450); }
  }
  function showBank(){ hideAll(); goHome(); window.scrollTo(0, 0); }
  $('rtGoRoute').addEventListener('click', showMap);
  $('rtGoBank').addEventListener('click', showBank);
  $('rtMapBack').addEventListener('click', showCover);
  $('rtOpenSettings').addEventListener('click', openSettings);
  window.addEventListener('resize', function(){ if (!$('rtMap').hidden) buildMap(); });

  // ---------- hoja de detalle de misión y ajustes ----------
  function openSheet(html){ var sh = $('rtSheet'); sh.innerHTML = '<div class="rt-grip"></div>' + html; sh.hidden = false; $('rtVeil').hidden = false; var b = sh.querySelector('.rt-btn'); if (b) b.focus({ preventScroll: true }); }
  function closeSheet(){ $('rtSheet').hidden = true; $('rtVeil').hidden = true; }
  $('rtVeil').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !$('rtSheet').hidden) closeSheet(); });
  $('rtCanvas').addEventListener('click', function(e){
    var b = e.target.closest('[data-m]'); if (b) openMission(+b.dataset.m);
  });
  function openMission(i){
    var m = M[i], st = ST[m.id], s = SUBJ[m.subject], open = isUnlocked(i), n = stars(m.id);
    var meta = (st.kind === 'review' ? 'Repaso' : 'Nivel ' + st.level) + ' · ' + zoneTitle(m.zone);
    var html = subjChip(s) + '<p class="rt-eyebrow" style="margin-top:10px">Misión ' + m.n + ' · ' + esc(meta) + '</p>' +
      '<h2 id="rtSheetTitle">' + esc(st.title) + '</h2><p>' + esc(st.goal) + '</p>' +
      '<div class="rt-row-meta"><span class="rt-chip">' + st.cards.length + (st.cards.length === 1 ? ' ficha' : ' fichas') + '</span><span class="rt-chip">' + st.test.length + ' preguntas</span><span class="rt-chip">' + st.minutes + ' min</span></div>' +
      '<div class="rt-sheet-stars">' + starRow(n, true) + '<span>' + (n ? 'Tu mejor resultado' : 'Todavía sin estrellas') + '</span></div>';
    if (open) html += '<div class="rt-actions"><button class="rt-btn rt-btn-primary" data-start="' + i + '">' + (n ? 'Repetir la misión' : 'Empezar la misión') + '</button><button class="rt-btn" data-close="1">Cerrar</button></div>';
    else html += '<p class="rt-note" style="margin-top:14px">Se desbloquea al completar la misión ' + M[i - 1].n + ' con al menos una estrella.</p><div class="rt-actions"><button class="rt-btn" data-close="1">Entendido</button></div>';
    openSheet(html);
  }
  $('rtSheet').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.close) return closeSheet();
    if (b.dataset.start != null){ closeSheet(); return startMission(+b.dataset.start); }
    if (b.dataset.toggle === 'unlock'){ R().unlockAll = !R().unlockAll; saveState(); b.setAttribute('aria-checked', String(R().unlockAll)); renderCover(); return; }
    if (b.dataset.reset === 'ask'){ $('rtResetBox').hidden = false; b.hidden = true; return; }
    if (b.dataset.reset === 'no'){ $('rtResetBox').hidden = true; $('rtResetAsk').hidden = false; return; }
    if (b.dataset.reset === 'yes'){ appState.ruta = sanitizeRuta(null); saveState(); closeSheet(); renderCover(); return; }
  });
  function openSettings(){
    openSheet('<h2 id="rtSheetTitle">Ajustes de la ruta</h2>' +
      '<div class="rt-toggle"><span><b>Abrir todas las misiones</b><small>Para repasar sin seguir el orden de la ruta.</small></span>' +
      '<button class="rt-switch" role="switch" aria-checked="' + R().unlockAll + '" aria-label="Abrir todas las misiones" data-toggle="unlock"></button></div>' +
      '<div class="rt-toggle"><span><b>Borrar el avance de la ruta</b><small>Estrellas, racha y misiones hechas. No toca el resto de tu progreso.</small></span><button class="rt-btn" id="rtResetAsk" data-reset="ask" style="width:auto;min-height:42px">Borrar</button></div>' +
      '<div class="rt-confirm" id="rtResetBox" hidden><p style="margin:0">¿Borrar el avance de la ruta? No se puede deshacer.</p><div class="rt-actions"><button class="rt-btn" data-reset="no">Cancelar</button><button class="rt-btn rt-btn-primary" data-reset="yes">Borrar</button></div></div>' +
      '<p class="rt-note" style="margin-top:14px">La copia de seguridad del banco de preguntas también guarda el avance de la ruta.</p>' +
      '<div class="rt-actions"><button class="rt-btn" data-close="1">Listo</button></div>');
  }

  // ---------- misión: clase, prueba y resultado ----------
  var S = null;
  function startMission(i){
    S = { i: i, st: ST[M[i].id], view: 'intro', card: 0, q: 0, answers: [], retry: null, revealed: false, firstScore: null, retryDone: false, confirmExit: false };
    hideAll(); $('rtPlayer').hidden = false; renderPlayer();
  }
  function queue(){ return S.retry || S.st.test.map(function(_, i){ return i; }); }
  function progressHtml(pos){
    var n = S.st.cards.length, h = '';
    for (var i = 0; i < n; i++) h += '<span class="' + (i <= pos ? 'rt-on' : '') + '"></span>';
    return '<div class="rt-progress" aria-hidden="true">' + h + '<span class="rt-test' + (pos >= n ? ' rt-on' : '') + '"></span></div>';
  }
  function cardHtml(c, label){
    return '<article class="rt-card">' + (label ? '<span class="rt-eyebrow">' + label + '</span>' : '') + '<h2>' + esc(c.title) + '</h2>' +
      '<div class="rt-prose">' + prose(c.body) + '</div>' +
      (c.diagram ? '<figure class="rt-figure"><img src="' + esc(c.diagram.src) + '" alt="' + esc(c.diagram.alt) + '" loading="lazy" decoding="async"></figure>' : '') +
      (c.example ? '<div class="rt-example"><b>Ejemplo</b>' + inline(c.example) + '</div>' : '') +
      '<div class="rt-key"><b>La idea</b><p>' + inline(c.keyIdea) + '</p></div>' +
      (c.more ? '<details class="rt-more"><summary>Para saber más</summary><div class="rt-prose">' + prose(c.more) + '</div></details>' : '') + '</article>';
  }
  function seenHtml(t){ return '<p class="rt-seen">Se vio en: ' + t.taughtIn.map(function(id){ return '«' + esc(CARDS[id] ? CARDS[id].title : id) + '»'; }).join(', ') + '</p>'; }
  function head(pos){
    return '<div class="rt-p-head"><button class="rt-x" data-act="exit" aria-label="Salir de la misión">' + CLOSE + '</button>' + progressHtml(pos) + '</div>' +
      (S.confirmExit ? '<div class="rt-p-body" style="padding-bottom:0"><div class="rt-confirm"><p style="margin:0">¿Salir de la misión? Se pierde el avance de esta prueba.</p><div class="rt-actions"><button class="rt-btn" data-act="stay">Seguir</button><button class="rt-btn rt-btn-primary" data-act="leave">Salir</button></div></div></div>' : '');
  }
  function viewIntro(){
    var st = S.st, s = SUBJ[st.subject], m = M[S.i];
    return head(-1) + '<div class="rt-p-body">' + subjChip(s) +
      '<span class="rt-eyebrow">Misión ' + m.n + ' · ' + (st.kind === 'review' ? 'Repaso' : 'Nivel ' + st.level) + '</span>' +
      '<h1>' + esc(st.title) + '</h1>' +
      '<div class="rt-row-meta" style="margin-top:0"><span class="rt-chip">' + st.cards.length + (st.cards.length === 1 ? ' ficha' : ' fichas') + '</span><span class="rt-chip">' + st.test.length + ' preguntas</span><span class="rt-chip">' + st.minutes + ' min</span></div>' +
      '<div class="rt-copilot"><span class="rt-av">' + planeSvg('#E9C46A', '#1E3A4C') + '</span><p>' + esc(st.intro) + '</p></div>' +
      '<p style="margin:0"><strong>Objetivo:</strong> ' + esc(st.goal) + '</p>' +
      '<button class="rt-btn rt-btn-primary" data-act="start">Empezar la clase</button></div>';
  }
  function viewCard(){
    var st = S.st, c = st.cards[S.card], last = S.card === st.cards.length - 1;
    return head(S.card) + '<div class="rt-p-body">' + cardHtml(c, 'Ficha ' + (S.card + 1) + ' de ' + st.cards.length) +
      '<div class="rt-nav"><button class="rt-btn" data-act="prev"' + (S.card === 0 ? ' disabled' : '') + '>‹ Anterior</button><button class="rt-btn rt-btn-primary" data-act="next">' + (last ? 'Ir a la prueba' : 'Siguiente ›') + '</button></div></div>';
  }
  // La pregunta oral del banco de la app (con su rúbrica); si no está, la copia que trae la estación.
  function oralQuestion(t){ var q = t.source && typeof ORAL_VOICE_BANK !== 'undefined' ? ORAL_VOICE_BANK.find(function(x){ return x.id === t.source.id; }) : null; return q || t; }
  function grade(score){ return score >= 9 ? 'Cobertura muy alta' : score >= 7.5 ? 'Cobertura alta' : score >= 6 ? 'Cobertura media' : score >= 4 ? 'Cobertura parcial' : 'Cobertura baja'; }
  function viewQuestion(){
    var st = S.st, order = queue(), ti = order[S.q], t = st.test[ti], ans = S.answers[ti];
    var h = head(st.cards.length) + '<div class="rt-p-body"><span class="rt-eyebrow">' + (S.retry ? 'Segundo intento · ' : '') + 'Pregunta ' + (S.q + 1) + ' de ' + order.length + '</span>';
    if (t.image) h += '<figure class="rt-figure"><img src="' + esc(t.image.src) + '" alt="' + esc(t.image.alt) + '"></figure>';
    h += '<p class="rt-q">' + esc(t.question) + '</p>';
    if (t.type === 'mcq'){
      // Las alternativas van en su orden original (las del banco DGAC pueden decir «A y B»).
      h += '<div class="rt-opts">' + t.options.map(function(o, i){
        var cls = ans ? (i === t.correct ? ' rt-ok' : i === ans.choice ? ' rt-bad' : '') : '';
        return '<button class="rt-opt' + cls + '" data-choice="' + i + '"' + (ans ? ' disabled' : '') + '><span class="rt-l">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>';
      if (ans) h += '<div class="rt-fb ' + (ans.ok ? 'rt-ok' : 'rt-bad') + '"><span class="rt-h">' + (ans.ok ? 'Correcta' : 'Incorrecta') + '</span><p>' + esc(t.explanation) + '</p>' + seenHtml(t) + '</div>';
    } else {
      h += '<label class="rt-note" for="rtOralText">Explícalo con tus palabras, como en la entrevista.</label>' +
        '<textarea id="rtOralText" placeholder="Tu respuesta…"' + (ans ? ' disabled' : '') + '>' + esc(ans ? ans.text : '') + '</textarea>';
      if (!ans) h += '<div class="rt-two"><button class="rt-btn" data-act="oralSkip">No la sé</button><button class="rt-btn rt-btn-primary" data-act="oralEval">Evaluar mi respuesta</button></div>';
      if (ans){
        if (ans.result){
          var r = ans.result, cls = r.score >= 7.5 ? 'rt-ok' : r.score >= ORAL_PASS ? 'rt-mid' : 'rt-bad';
          h += '<div class="rt-fb ' + cls + '"><div class="rt-oral-score"><b>' + r.score.toFixed(r.score % 1 ? 1 : 0) + '/10</b><span class="rt-h" style="margin:0">' + grade(r.score) + '</span></div>' +
            (r.detected && r.detected.length ? '<p><strong>Lo que dijiste bien:</strong></p><ul>' + r.detected.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
            (r.missing && r.missing.length ? '<p style="margin-top:8px"><strong>Te faltó:</strong></p><ul>' + r.missing.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
            (r.errors && r.errors.length ? '<p style="margin-top:8px"><strong>Ojo:</strong></p><ul>' + r.errors.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
            '<p class="rt-seen">Es una estimación por conceptos: compárala con la respuesta de referencia.</p></div>';
        }
        h += '<div class="rt-fb"><span class="rt-h">Respuesta de referencia</span><div class="rt-prose">' + prose(t.reference) + '</div>' + seenHtml(t) + '</div>';
      }
    }
    if (ans) h += '<button class="rt-btn rt-btn-primary" data-act="nextq">' + (S.q === order.length - 1 ? 'Ver resultado' : 'Siguiente ›') + '</button>';
    return h + '</div>';
  }
  function starsFor(r){ return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0; }
  function viewResult(){
    var st = S.st, total = st.test.length, first = S.firstScore, n = starsFor(first / total);
    var wrong = st.test.map(function(t, i){ return { t: t, i: i }; }).filter(function(x){ return !(S.answers[x.i] && S.answers[x.i].ok); });
    var next = S.i + 1 < M.length && isUnlocked(S.i + 1) ? S.i + 1 : null;
    var msg = n === 3 ? 'Impecable. Lo tienes claro.' : n === 2 ? 'Muy bien. Repasa lo que falló y sigue.' : n === 1 ? 'Pasaste. Conviene repasar las fichas.' : 'Todavía no: repasa las fichas y vuelve a intentarlo. Con la mitad correcta se gana la primera estrella.';
    var h = head(st.cards.length) + '<div class="rt-p-body rt-result"><span class="rt-eyebrow">' + esc(st.title) + '</span>' +
      '<div class="rt-bigstars" aria-label="' + n + ' de 3 estrellas">' + starRow(n, true) + '</div>' +
      '<h2>' + first + ' de ' + total + ' correctas</h2><p style="margin:0">' + msg + '</p>';
    if (S.retryDone) h += '<p class="rt-note">Segundo intento: ' + (wrong.length ? 'quedan ' + wrong.length + ' por reforzar.' : 'corregiste todas las que habías fallado.') + '</p>';
    if (next != null) h += '<button class="rt-btn rt-btn-gold" data-act="nextm">Siguiente misión · ' + esc(M[next].title) + '</button>';
    h += '<button class="rt-btn rt-btn-primary" data-act="tomap">Volver al mapa</button>';
    if (wrong.length) h += '<button class="rt-btn" data-act="retry">Reintentar las que fallaste</button>';
    h += '<div class="rt-card rt-recap"><span class="rt-eyebrow">Lo que aprendiste</span><ul>' + st.cards.map(function(c){ return '<li>' + inline(c.keyIdea) + '</li>'; }).join('') + '</ul></div>';
    h += wrong.map(function(x){ return '<div class="rt-miss"><strong>' + esc(x.t.question) + '</strong>' + seenHtml(x.t) + '</div>'; }).join('');
    return h + '</div>';
  }
  // La primera respuesta de cada pregunta cuenta en las estadísticas de la app (menos las del banco DGAC).
  function recordMcq(t, ok){
    if (S.retry || !t.source || t.source.bank === 'dgac' || t.source.system === DGAC_KEY) return;
    var q = findById(t.source.appId); if (q) recordTechnical(q, ok);
  }
  function recordOral(t, score){
    if (S.retry || !t.source || !t.source.id) return;
    var prev = appState.oralVoice[t.source.id];
    appState.oralVoice[t.source.id] = { score: score, attempts: (prev && prev.attempts || 0) + 1, last: Date.now() };
  }
  function finish(){
    var st = S.st, n = starsFor(S.firstScore / st.test.length), before = currentIndex();
    if (n > stars(st.id)) R().stars[st.id] = n;
    bumpStreak(); saveState();
    var after = currentIndex();
    if (after > before && after < M.length) pendingFlight = { from: before, to: after };
  }
  function renderPlayer(){ var v = S.view; $('rtPlayer').innerHTML = v === 'intro' ? viewIntro() : v === 'card' ? viewCard() : v === 'question' ? viewQuestion() : viewResult(); }
  function go(view, extra){ Object.assign(S, extra || {}, { view: view, confirmExit: false }); renderPlayer(); $('rtPlayer').scrollTop = 0; }
  function exitPlayer(){ $('rtPlayer').hidden = true; S = null; showMap(); }
  function answer(choice){
    var ti = queue()[S.q], t = S.st.test[ti]; if (S.answers[ti]) return;
    var ok = choice === t.correct; S.answers[ti] = { choice: choice, ok: ok }; recordMcq(t, ok); renderPlayer();
  }
  function answerOral(text, skip){
    var ti = queue()[S.q], t = S.st.test[ti]; if (S.answers[ti]) return;
    if (skip || !String(text || '').trim()){ S.answers[ti] = { ok: false, text: String(text || ''), result: null }; return renderPlayer(); }
    var r = evaluateLocally(oralQuestion(t), text);
    S.answers[ti] = { ok: r.score >= ORAL_PASS, text: text, result: r }; recordOral(t, r.score); saveState(); renderPlayer();
  }
  function nextQuestion(){
    var st = S.st;
    if (S.q < queue().length - 1) return go('question', { q: S.q + 1, revealed: false });
    if (S.firstScore == null){ S.firstScore = st.test.filter(function(_, i){ return S.answers[i] && S.answers[i].ok; }).length; finish(); }
    if (S.retry) S.retryDone = true;
    go('result', { retry: null });
  }
  $('rtPlayer').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b || !S) return;
    if (b.dataset.choice != null) return answer(+b.dataset.choice);
    switch (b.dataset.act){
      case 'exit': if (S.view === 'question' || S.view === 'card'){ S.confirmExit = true; renderPlayer(); return; } return exitPlayer();
      case 'stay': S.confirmExit = false; return renderPlayer();
      case 'leave': return exitPlayer();
      case 'start': return go('card', { card: 0 });
      case 'prev': return go('card', { card: Math.max(0, S.card - 1) });
      case 'next': return S.card < S.st.cards.length - 1 ? go('card', { card: S.card + 1 }) : go('question', { q: 0 });
      case 'oralEval': var ta = $('rtOralText'); return answerOral(ta ? ta.value : '', false);
      case 'oralSkip': var tb = $('rtOralText'); return answerOral(tb ? tb.value : '', true);
      case 'nextq': return nextQuestion();
      case 'retry':
        var wrong = S.st.test.map(function(_, i){ return i; }).filter(function(i){ return !(S.answers[i] && S.answers[i].ok); });
        wrong.forEach(function(i){ delete S.answers[i]; });
        return go('question', { retry: wrong, q: 0 });
      case 'tomap': return exitPlayer();
      case 'nextm': var nx = S.i + 1; S = null; return startMission(nx);
    }
  });

  // Para la batería de pruebas y para el enlace «Portada» del banco de preguntas.
  window.RUTA = { missions: M, stations: ST, subjects: SUBJ, showCover: showCover, showMap: showMap, showBank: showBank,
    startMission: startMission, answer: answer, answerOral: answerOral, nextQuestion: nextQuestion,
    state: function(){ return S; }, currentIndex: currentIndex, isUnlocked: isUnlocked, totalStars: totalStars, renderCover: renderCover };
  showCover();
})();
