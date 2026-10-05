/* Ruta de entrenamiento: portada (inicio de la app), mapa de estaciones y estación (clase, prueba y estrellas).
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
  // Abierta si es la primera, si la anterior tiene estrellas o si ya la ganaste (una materia nueva puede
  // intercalar estaciones antes de las que ya hiciste: esas siguen abiertas).
  function isUnlocked(i){ return R().unlockAll || i === 0 || stars(M[i - 1].id) > 0 || stars(M[i].id) > 0; }
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
      $('rtRouteTitle').textContent = (done ? 'Continuar' : 'Empezar') + ' · Estación ' + m.n;
      $('rtRouteSub').textContent = m.title + ' · ' + SUBJ[m.subject].title;
    } else {
      $('rtRouteTitle').textContent = 'Ruta completa';
      $('rtRouteSub').textContent = 'Repite estaciones para sumar estrellas. Vienen más materias.';
    }
    $('rtRouteBar').style.width = Math.round(done / M.length * 100) + '%';
    $('rtRouteCount').textContent = done + ' de ' + M.length + ' estaciones';
    var s = streakNow();
    $('rtStreak').textContent = s; $('rtStreakLbl').textContent = s === 1 ? 'día seguido' : 'días seguidos';
    $('rtStarTotal').textContent = totalStars(); $('rtStarMax').textContent = M.length * 3;
  }

  // ---------- mapa ----------
  // La ruta se dibuja como una aerovía de carta en ruta: tramos rectos entre radioayudas. Cada estación es un VOR/DME
  // (hexágono dentro de un cuadrado, relleno en los repasos, que son puntos de notificación obligatoria) con su rosa de
  // los vientos, su identificador y su frecuencia; cada tramo trae su rumbo y su distancia. Despega por el eje de la
  // pista del primer fondo, sigue ese eje hasta pasado el fin de pista y recién vira; si existe el fondo de llegada,
  // termina con una aproximación (punteada, todavía no disponible) a su pista.
  var RWY_X = 0.499;               // eje de pista de los fondos 1 y 7 (fracción del ancho)
  var THR1 = 0.16, END1 = 0.915;   // fondo 1: umbral y fin de pista (fracción del alto, desde abajo)
  var THR7 = 0.21;                 // fondo 7: umbral de la pista de llegada
  var NM_PER_W = 40;               // escala de la carta: millas náuticas por ancho de pantalla
  var ZONE_CAP = 5;                // estaciones que caben en un fondo; con más, la zona se alarga
  var AIRWAY = 'UA320';
  var WAIT = 0.5;                  // el avión espera a la mitad del tramo que lleva a la estación que toca
  var geo = null, pendingFlight = null;
  // Una línea quebrada: largo acumulado, punto a cierta distancia, rumbo suavizado en los quiebres y trazo SVG.
  function line(points){
    var cum = [0], i;
    for (i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    var total = cum[cum.length - 1];
    function xy(d){
      d = Math.max(0, Math.min(total, d));
      for (var k = 1; k < points.length; k++) if (d <= cum[k] || k === points.length - 1){
        var t = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1);
        return { x: points[k - 1].x + (points[k].x - points[k - 1].x) * t, y: points[k - 1].y + (points[k].y - points[k - 1].y) * t };
      }
      return { x: points[0].x, y: points[0].y };
    }
    function r1(v){ return Math.round(v * 10) / 10; }
    return { pts: points, cum: cum, total: total, xy: xy,
      at: function(d){ var p = xy(d), a = xy(d - 8), b = xy(d + 8); return { x: p.x, y: p.y, ang: (a.x === b.x && a.y === b.y) ? 0 : Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI }; },
      path: function(from, to){
        from = from || 0; to = to == null ? total : to;
        var out = [xy(from)];
        for (var k = 1; k < points.length - 1; k++) if (cum[k] > from && cum[k] < to) out.push(points[k]);
        out.push(xy(to));
        return out.map(function(p, k){ return (k ? 'L' : 'M') + r1(p.x) + ' ' + r1(p.y); }).join(' ');
      } };
  }
  // Rumbo de a hacia b como en la carta (001 a 360; el norte de la pantalla es el norte de la carta).
  function course(a, b){ var c = Math.round((Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI + 360) % 360); return ('00' + (c || 360)).slice(-3) + '°'; }
  // Frecuencia de VOR (112.0 a 117.9 MHz) de la estación n: fija y distinta para cada una.
  function freq(n){ return (112 + ((n * 37) % 59) / 10).toFixed(1); }
  // Símbolo de VOR/DME con su rosa de los vientos (la flecha marca el norte).
  function navaid(kind, state, color){
    var locked = state === 'locked', ring = locked ? 'rgba(255,255,255,.5)' : state === 'current' ? '#E9C46A' : color;
    var ink = locked ? 'rgba(255,255,255,.72)' : '#14212B', ticks = '', hex = '', a, k;
    for (a = 0; a < 360; a += 10){
      var r0 = a % 30 ? 23.5 : 20.5, t = (a - 90) * Math.PI / 180;
      ticks += 'M' + (r0 * Math.cos(t)).toFixed(1) + ' ' + (r0 * Math.sin(t)).toFixed(1) + 'L' + (27 * Math.cos(t)).toFixed(1) + ' ' + (27 * Math.sin(t)).toFixed(1);
    }
    for (k = 0; k < 6; k++) hex += (k ? 'L' : 'M') + (11.5 * Math.cos(k * Math.PI / 3)).toFixed(2) + ' ' + (11.5 * Math.sin(k * Math.PI / 3)).toFixed(2);
    return '<svg viewBox="-29 -29 58 58" aria-hidden="true"><circle r="28.5" fill="' + (locked ? 'rgba(16,30,42,.8)' : '#FFFFFF') + '"/>' +
      '<path d="' + ticks + '" stroke="' + ring + '" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M0 -28.6L3.4 -21.8H-3.4Z" fill="' + ink + '"/>' +
      '<rect class="rt-dme" x="-13" y="-12" width="26" height="24" fill="none" stroke="' + ink + '" stroke-width="1.6"/>' +
      '<path class="rt-vor" d="' + hex + 'Z" fill="' + (kind !== 'review' ? 'none' : locked ? 'rgba(255,255,255,.28)' : ink) + '" stroke="' + ink + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  // Antes de la primera estación el avión espera alineado cerca del umbral, sin tapar la estación.
  function waitDist(i){ var r = geo.route, a = i ? r.cum[geo.sIdx[i - 1]] : 0, b = r.cum[geo.sIdx[i]]; return a + (i ? (b - a) * WAIT : Math.max(0, Math.min((b - a) * WAIT, b - a - 74))); }
  function buildMap(){
    var canvas = $('rtCanvas');
    var W = canvas.clientWidth || Math.min(window.innerWidth, 520);
    var PH = W * 1.5, OV = PH * 0.075, STEP = PH - OV;
    var panels = ZONES.filter(function(z){ return z.bg; }), last = panels.length - 1;
    var zoneIndex = {}; panels.forEach(function(z, k){ zoneIndex[z.id] = k; });
    var arrival = last > 0 && panels[last].id === 'llegada' ? last : -1;
    function kOf(m){ var k = zoneIndex[m.zone]; return k == null ? last : k; }
    var cx = Math.round(W * RWY_X), byZone = {};
    M.forEach(function(m){ var k = kOf(m); (byZone[k] = byZone[k] || []).push(m); });
    // Una zona con más de ZONE_CAP estaciones se alarga: su fondo se repite, alternando una copia al revés (así las
    // uniones calzan) y siempre en número impar (así termina con el borde que empalma con la zona siguiente).
    // Las pistas (primer y último fondo) no se repiten nunca.
    var slots = [], first = {};
    panels.forEach(function(z, k){
      var n = (byZone[k] || []).length, c = (k === 0 || k === arrival || n <= ZONE_CAP) ? 1 : Math.ceil(n / ZONE_CAP);
      if (c % 2 === 0) c++;
      first[k] = slots.length;
      for (var s = 0; s < c; s++) slots.push({ z: z, k: k, flip: s % 2 === 1 });
    });
    var H = PH + (slots.length - 1) * STEP;
    function yAt(slot, f){ return Math.round(H - (slot * STEP + PH * f)); }
    function zoneSpan(k){ var c = slots.filter(function(s){ return s.k === k; }).length; return { lo: first[k] * STEP + PH * 0.16, hi: (first[k] + c - 1) * STEP + PH * (k === last && arrival < 0 ? 0.62 : 0.84) }; }
    var pts = M.map(function(m, i){
      var k = kOf(m), list = byZone[k], j = list.indexOf(m), n = list.length;
      // En la pista de salida, sobre el eje, entre el umbral y el fin de pista.
      if (k === 0) return { x: cx, y: yAt(0, n > 1 ? 0.36 + 0.48 * j / (n - 1) : 0.5) };
      // En los demás fondos, repartidas en la franja central de la zona (en el último, si no hay pista de llegada, la parte baja).
      var zs = zoneSpan(k);
      return { x: Math.round(W / 2 + W * 0.24 * Math.sin(i * 1.05 + 0.35)), y: Math.round(H - (zs.lo + (zs.hi - zs.lo) * (j + 0.5) / n)) };
    });
    // Tramos de al menos MIN_LEG: si dos estaciones quedan muy juntas en altura, se abren hacia los lados (zigzag),
    // para que el avión quepa entre ellas sin tapar ninguna.
    var MIN_LEG = 136;
    for (var q = 1; q < pts.length; q++){
      if (kOf(M[q]) === 0) continue;
      var dy = pts[q].y - pts[q - 1].y, need = Math.sqrt(Math.max(0, MIN_LEG * MIN_LEG - dy * dy)), dx = pts[q].x - pts[q - 1].x;
      if (Math.abs(dx) >= need) continue;
      var dir = dx >= 0 ? 1 : -1, nx = pts[q - 1].x + dir * need;
      if (nx < W * 0.16 || nx > W * 0.84) nx = pts[q - 1].x - dir * need;
      pts[q].x = Math.round(Math.max(W * 0.16, Math.min(W * 0.84, nx)));
    }
    // Desde el umbral por el eje; al dejar la pista sigue el eje hasta pasado el fin de pista y recién vira.
    var verts = [{ x: cx, y: yAt(0, THR1) }], sIdx = [];
    M.forEach(function(m, i){
      if (i && kOf(M[i - 1]) === 0 && kOf(m) !== 0) verts.push({ x: cx, y: yAt(0, END1) }, { x: cx, y: yAt(1, 0.1) });
      sIdx.push(verts.length); verts.push(pts[i]);
    });
    var route = line(verts);
    function routeX(y){
      for (var v = 1; v < verts.length; v++){ var a = verts[v - 1], b = verts[v]; if ((y - a.y) * (y - b.y) <= 0) return a.x + (b.x - a.x) * ((y - a.y) / ((b.y - a.y) || 1)); }
      return W / 2;
    }
    var arrSlot = arrival >= 0 ? first[arrival] : -1;
    var appr = arrival >= 0 && pts.length ? line([pts[pts.length - 1], { x: cx, y: yAt(arrSlot, -0.05) }, { x: cx, y: yAt(arrSlot, THR7) }]) : null;
    geo = { W: W, H: H, PH: PH, cx: cx, pts: pts, route: route, sIdx: sIdx, appr: appr };
    var ci = currentIndex();
    var flown = !M.length ? 0 : pendingFlight ? waitDist(pendingFlight.from) : ci < M.length ? waitDist(ci) : route.total;
    var html = '';
    slots.forEach(function(s, i){
      var bg = 'background-image:url(&quot;' + esc(s.z.bg) + '&quot;)';
      html += '<div class="rt-panel' + (i > 0 ? ' rt-fade' : '') + '" data-zone="' + esc(s.z.id) + '" style="bottom:' + Math.round(i * STEP) + 'px;' + (s.flip ? '' : bg + ';') + 'z-index:' + (i + 1) + '">' +
        (s.flip ? '<i class="rt-flip" style="' + bg + '"></i>' : '') + '</div>';
    });
    var casing = 'rgba(8,18,26,.5)';
    html += '<svg class="rt-route" style="height:' + H + 'px;z-index:10" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      (appr ? '<path d="' + appr.path() + '" fill="none" stroke="' + casing + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path class="rt-appr" d="' + appr.path() + '" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.2" stroke-dasharray="7 7" stroke-linecap="round"/>' : '') +
      '<path d="' + route.path() + '" fill="none" stroke="' + casing + '" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path class="rt-airway" d="' + route.path() + '" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path id="rtFlown" d="' + route.path(0, flown) + '" fill="none" stroke="#E9C46A" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
    html += '<span class="rt-rwy" style="left:' + (cx + 28) + 'px;top:' + yAt(0, THR1) + 'px;z-index:11">RWY 36</span>';
    if (appr) html += '<span class="rt-rwy" style="left:' + (cx + 28) + 'px;top:' + yAt(arrSlot, THR7) + 'px;z-index:11">RWY 36</span>';
    // Rumbo y distancia de cada tramo de la aerovía (en la pista no hay; el que sale de la estación actual lo tapa su globo).
    var legs = 0;
    for (var i = 1; i < M.length; i++){
      if (kOf(M[i]) === 0 || i === ci + 1) continue;
      var a = sIdx[i - 1], b = sIdx[i], p1 = verts[b - 1], p2 = verts[b];
      var nm = Math.max(1, Math.round((route.cum[b] - route.cum[a]) / W * NM_PER_W));
      html += '<span class="rt-leg" data-leg="' + i + '" style="left:' + Math.round((p1.x + p2.x) / 2) + 'px;top:' + Math.round((p1.y + p2.y) / 2) + 'px;z-index:11">' +
        (legs % 4 === 0 ? '<em>' + AIRWAY + '</em>' : '') + '<b>' + course(p1, p2) + '</b><i>' + nm + '</i></span>';
      legs++;
    }
    panels.forEach(function(z, k){
      if (!byZone[k]) return;
      var zy = yAt(first[k], 0.1);   // al comienzo de la zona, al lado contrario de la ruta, para no taparla
      html += '<span class="rt-zone" style="top:' + zy + 'px;' + (routeX(zy) < W / 2 ? 'left:auto;right:14px;' : '') + 'z-index:11">' + esc(z.title) + ' <small>· ' + esc(LEVEL[z.id] || '') + '</small></span>';
    });
    M.forEach(function(m, i){
      var p = pts[i], st = ST[m.id], s = SUBJ[m.subject], open = isUnlocked(i), n = stars(m.id);
      var state = !open ? 'locked' : i === ci ? 'current' : n ? 'done' : 'open', right = p.x <= W / 2;
      var label = 'Estación ' + m.n + ': ' + m.title + (open ? (n ? ', ' + n + ' de 3 estrellas' : '') : ', bloqueada');
      html += '<button class="rt-node rt-' + state + (st.kind === 'review' ? ' rt-review' : '') + '" type="button" data-m="' + i + '" style="left:' + p.x + 'px;top:' + p.y + 'px;z-index:12" aria-label="' + esc(label) + '">' +
        navaid(st.kind, state, s.color) + (open ? '<span class="rt-nv-n">' + (st.kind === 'review' ? '★' : m.n) + '</span>' : '<span class="rt-nv-lock">' + LOCK + '</span>') + '</button>';
      if (n) html += '<span class="rt-node-stars" style="left:' + p.x + 'px;top:' + (p.y + 34) + 'px;z-index:12">' + starRow(n) + '</span>';
      html += '<span class="rt-ident' + (right ? '' : ' rt-left') + (open ? '' : ' rt-dim') + '" style="left:' + (p.x + (right ? 1 : -1) * (state === 'current' ? 40 : 36)) + 'px;top:' + p.y + 'px;z-index:12">' + freq(m.n) + ' <b>' + esc(st.ident || '') + '</b></span>';
    });
    if (ci < M.length){
      var cp = pts[ci], cxl = Math.max(122, Math.min(W - 122, cp.x));   // el globo no se sale por los lados
      html += '<div class="rt-callout" style="left:' + cxl + 'px;top:' + (cp.y - 46) + 'px;--dx:' + (cp.x - cxl) + 'px;z-index:13"><b>Estación ' + M[ci].n + ' · ' + esc(SUBJ[M[ci].subject].title) + '</b><span>' + esc(M[ci].title) + '</span></div>';
    }
    var endTop = arrival >= 0 ? 70 : Math.max(70, Math.round((pts.length ? pts[pts.length - 1].y : H / 2) - PH * 0.42));
    html += '<div class="rt-route-end" style="top:' + endTop + 'px;z-index:11"><b>Más materias en camino</b><span>La ruta crece con cada materia nueva. Al final viene el aterrizaje.</span></div>';
    html += '<div class="rt-plane" id="rtPlane" style="z-index:14">' + (D.route.plane ? '<img src="' + esc(D.route.plane) + '" alt="" decoding="async">' : planeSvg('#FFFFFF', '#14212B')) + '</div>';
    canvas.style.height = H + 'px';
    canvas.innerHTML = html;
    placePlane(pendingFlight ? pendingFlight.from : null);
  }
  function planeAt(x, y, angle){ var el = $('rtPlane'); if (!el) return; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.transform = 'rotate(' + angle + 'deg)'; }
  function placePlane(index){
    var ci = index == null ? currentIndex() : index;
    if (!M.length) return;
    if (ci >= M.length){
      if (geo.appr){ var q = geo.appr.at(geo.appr.total * 0.35); return planeAt(q.x, q.y, q.ang); }
      var last = geo.pts[geo.pts.length - 1]; return planeAt(last.x, last.y - 70, 0);
    }
    var p = geo.route.at(waitDist(ci)); planeAt(p.x, p.y, p.ang);
  }
  // Vuela de la espera de una estación a la de la siguiente; la estela dorada crece con el avión.
  function flyPlane(fromIdx, toIdx){
    var d1 = waitDist(fromIdx), d2 = waitDist(toIdx), fl = $('rtFlown');
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ if (fl) fl.setAttribute('d', geo.route.path(0, d2)); return placePlane(toIdx); }
    var t0 = null, dur = Math.max(1200, Math.min(2600, (d2 - d1) * 6));
    function frame(ts){
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, d = d1 + (d2 - d1) * e, p = geo.route.at(d);
      planeAt(p.x, p.y, p.ang); if (fl) fl.setAttribute('d', geo.route.path(0, d));
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

  // ---------- hoja de detalle de la estación y ajustes ----------
  function openSheet(html){ var sh = $('rtSheet'); sh.innerHTML = '<div class="rt-grip"></div>' + html; sh.hidden = false; $('rtVeil').hidden = false; var b = sh.querySelector('.rt-btn'); if (b) b.focus({ preventScroll: true }); }
  function closeSheet(){ $('rtSheet').hidden = true; $('rtVeil').hidden = true; }
  $('rtVeil').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !$('rtSheet').hidden) closeSheet(); });
  $('rtCanvas').addEventListener('click', function(e){
    var b = e.target.closest('[data-m]'); if (b) openStation(+b.dataset.m);
  });
  function openStation(i){
    var m = M[i], st = ST[m.id], s = SUBJ[m.subject], open = isUnlocked(i), n = stars(m.id);
    var meta = (st.kind === 'review' ? 'Repaso' : 'Nivel ' + st.level) + ' · ' + zoneTitle(m.zone);
    var html = subjChip(s) + '<p class="rt-eyebrow" style="margin-top:10px">Estación ' + m.n + ' · ' + esc(meta) + '</p>' +
      '<h2 id="rtSheetTitle">' + esc(st.title) + '</h2><p>' + esc(st.goal) + '</p>' +
      '<div class="rt-row-meta"><span class="rt-chip">VOR/DME ' + esc(st.ident || '') + ' ' + freq(m.n) + '</span><span class="rt-chip">' + st.cards.length + (st.cards.length === 1 ? ' ficha' : ' fichas') + '</span><span class="rt-chip">' + st.test.length + ' preguntas</span><span class="rt-chip">' + st.minutes + ' min</span></div>' +
      '<div class="rt-sheet-stars">' + starRow(n, true) + '<span>' + (n ? 'Tu mejor resultado' : 'Todavía sin estrellas') + '</span></div>';
    if (open) html += '<div class="rt-actions"><button class="rt-btn rt-btn-primary" data-start="' + i + '">' + (n ? 'Repetir la estación' : 'Empezar la estación') + '</button><button class="rt-btn" data-close="1">Cerrar</button></div>';
    else html += '<p class="rt-note" style="margin-top:14px">Se desbloquea al completar la estación ' + M[i - 1].n + ' con al menos una estrella.</p><div class="rt-actions"><button class="rt-btn" data-close="1">Entendido</button></div>';
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
      '<div class="rt-toggle"><span><b>Abrir todas las estaciones</b><small>Para repasar sin seguir el orden de la ruta.</small></span>' +
      '<button class="rt-switch" role="switch" aria-checked="' + R().unlockAll + '" aria-label="Abrir todas las estaciones" data-toggle="unlock"></button></div>' +
      '<div class="rt-toggle"><span><b>Borrar el avance de la ruta</b><small>Estrellas, racha y estaciones hechas. No toca el resto de tu progreso.</small></span><button class="rt-btn" id="rtResetAsk" data-reset="ask" style="width:auto;min-height:42px">Borrar</button></div>' +
      '<div class="rt-confirm" id="rtResetBox" hidden><p style="margin:0">¿Borrar el avance de la ruta? No se puede deshacer.</p><div class="rt-actions"><button class="rt-btn" data-reset="no">Cancelar</button><button class="rt-btn rt-btn-primary" data-reset="yes">Borrar</button></div></div>' +
      '<p class="rt-note" style="margin-top:14px">La copia de seguridad del banco de preguntas también guarda el avance de la ruta.</p>' +
      '<div class="rt-actions"><button class="rt-btn" data-close="1">Listo</button></div>');
  }

  // ---------- estación: clase, prueba y resultado ----------
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
    return '<div class="rt-p-head"><button class="rt-x" data-act="exit" aria-label="Salir de la estación">' + CLOSE + '</button>' + progressHtml(pos) + '</div>' +
      (S.confirmExit ? '<div class="rt-p-body" style="padding-bottom:0"><div class="rt-confirm"><p style="margin:0">¿Salir de la estación? Se pierde el avance de esta prueba.</p><div class="rt-actions"><button class="rt-btn" data-act="stay">Seguir</button><button class="rt-btn rt-btn-primary" data-act="leave">Salir</button></div></div></div>' : '');
  }
  function viewIntro(){
    var st = S.st, s = SUBJ[st.subject], m = M[S.i];
    return head(-1) + '<div class="rt-p-body">' + subjChip(s) +
      '<span class="rt-eyebrow">Estación ' + m.n + ' · ' + (st.kind === 'review' ? 'Repaso' : 'Nivel ' + st.level) + '</span>' +
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
            (r.errors && r.errors.length ? '<p style="margin-top:8px"><strong>Atención:</strong></p><ul>' + r.errors.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
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
    var msg = n === 3 ? 'Impecable. Lo tienes claro.' : n === 2 ? 'Muy bien. Repasa lo que falló y sigue.' : n === 1 ? 'Pasaste. Conviene repasar las fichas.' : 'Todavía no: repasa las fichas y vuelve a intentarlo. Con la mitad correcta se gana la primera estrella.';
    var h = head(st.cards.length) + '<div class="rt-p-body rt-result"><span class="rt-eyebrow">' + esc(st.title) + '</span>' +
      '<div class="rt-bigstars" aria-label="' + n + ' de 3 estrellas">' + starRow(n, true) + '</div>' +
      '<h2>' + first + ' de ' + total + ' correctas</h2><p style="margin:0">' + msg + '</p>';
    if (S.retryDone) h += '<p class="rt-note">Segundo intento: ' + (wrong.length ? 'quedan ' + wrong.length + ' por reforzar.' : 'corregiste todas las que habías fallado.') + '</p>';
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
    }
  });

  // Para la batería de pruebas y para el enlace «Portada» del banco de preguntas.
  window.RUTA = { missions: M, stations: ST, subjects: SUBJ, showCover: showCover, showMap: showMap, showBank: showBank,
    startMission: startMission, answer: answer, answerOral: answerOral, nextQuestion: nextQuestion,
    state: function(){ return S; }, geo: function(){ return geo; }, currentIndex: currentIndex, isUnlocked: isUnlocked, totalStars: totalStars, renderCover: renderCover };
  showCover();
})();
