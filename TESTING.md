# Batería de regresión — A320 Interview Trainer

Batería única acordada entre Claude y Codex tras la ronda 2 de auditoría, para
dejar de descubrir regresiones después de publicar. Cada caso nació de un bug
real encontrado durante el desarrollo o la auditoría (se referencia el ID
original). Cualquier bug nuevo que se encuentre se agrega aquí de forma
permanente antes de darlo por cerrado, y esta batería completa se corre
después de cualquier cambio al motor de evaluación, al saneamiento de estado
o a la integridad del banco.

## Cómo correrla (un solo comando)

```powershell
powershell -ExecutionPolicy Bypass -File tests\run.ps1
```

`tests/run.ps1` primero revisa la integridad de los datos con
`node tests/data-integrity.js` (si el equipo no tiene Node, avisa y sigue; ver
sección 17). Después arma una copia temporal de `index.html` con la batería al
final (las secciones de `tests/suite/`, unidas en orden de nombre), le copia
al lado los archivos que carga (`css/`, `data/`, `js/`, íconos; ver sección 13)
y la abre en Chrome o Edge sin ventana. Los casos corren dentro de la propia
app, con acceso a sus funciones y a su estado real. Termina en ~10 s con
`OK 114/114 casos...` (código 0) o con la lista de casos que fallan y su
mensaje (código 1). La app publicada no se modifica.

Está comprobado que detecta regresiones: rompiendo a propósito siete de los
arreglos de abajo, falló en los casos correspondientes. Ejecútala **antes de
cada commit** que toque la app (`index.html`, `css/`, `data/` o `js/`), y
agrega un caso por cada bug nuevo en la sección que corresponda de
`tests/suite/` (con el ID del hallazgo en el nombre). `00-arnes.js` abre la
batería con los ayudantes (`T`, `ok`, `eq`, `reset`…) y `99-ejecucion.js` la
cierra: los demás archivos son fragmentos de esa misma función.

Lo que esta batería **no** cubre: aspecto visual, tamaños en pantalla y
comportamiento real del micrófono/voz en un teléfono; eso se verifica a ojo
en el navegador o el dispositivo. Si dos verificaciones distintas (por ejemplo
el harness de Codex y esta) divergen en un caso de aquí, ese es el bug a
resolver primero, antes de seguir auditando.

## 1. Guardar, cerrar y recuperar el progreso

- **A07** — si `localStorage.setItem` falla (cuota llena / modo privado),
  `saveState()` devuelve `false` y se muestra un toast de error una sola vez
  por sesión; nunca se anuncia éxito si la escritura no ocurrió.
- **REG-01** — registrar 10 respuestas correctas y 1 incorrecta con
  `recordTechnical()`, guardar, recargar (o pasar por
  `sanitizeStatEntry` directamente). Esperado: `lastResult` sigue siendo `0`/`1`
  (nunca `null` por ser numérico en vez de booleano), el streak se preserva, y
  una respuesta correcta adicional después de recargar sigue incrementando el
  streak en vez de reiniciarlo en 1. "Mis errores"/débiles no deben perder
  entradas por esto.
- **A01/A06** — `localStorage` con `{"stats":null}` o `{"best":null}` no debe
  impedir que `renderHome()` cargue (antes tiraba `TypeError`).

## 2. Recuperar sesiones antiguas (resume)

- **A03** — `appState.resume.bankFingerprint` distinto de `BANK_FINGERPRINT`
  (incluyendo `null`/ausente, no solo un valor incorrecto) invalida el resume
  y muestra el toast de banco actualizado, sin dejar continuar con contenido
  desactualizado. Un fingerprint que sí coincide debe resumir con normalidad.
- **A06** — un resume con una pregunta `options:null` o con `correct` fuera de
  rango debe ser rechazado por completo por `sanitizeResume` (no debe llegar a
  `renderQuestion()` y crashear en `.map()`). Un resume válido cuyo
  `answers`/`counted`/`ratings`/`revealed` tiene una longitud distinta a
  `questions.length` debe conservar las preguntas pero descartar ese campo
  puntual (el fallback existente genera un arreglo nuevo del tamaño correcto).
  Una pregunta de modo `interview`/`oral` solo necesita algún campo de texto
  (`q`/`oral_q`/`scenario_q`), no `options`.

## 3. Importar datos dañados sin perder datos válidos

- **A01/A06** — `looksLikeValidBackup` debe rechazar `{"stats":null}` (o
  cualquier campo presente con el tipo equivocado) **antes** de tocar
  `appState`; el progreso previamente guardado debe seguir intacto después de
  un intento de importación inválido, sin importar lo que diga el toast.
- **A01** — un payload de import con HTML/`<script>` inyectado en un campo de
  texto (nombre, label, etc.) no debe insertarse sin escapar en ningún
  `innerHTML` (resume total/índice, mejor puntaje, contador de débiles).

## 4. Responder preguntas y conservar las claves correctas

- **A02** — las preguntas DGAC nunca deben mezclar el orden de sus
  alternativas (algunas referencian "A y B" literalmente); el resto del banco
  sí debe variar el orden entre sesiones. El índice de la respuesta correcta
  debe seguir apuntando al texto correcto en ambos casos.
- **MCQ-01** — `qid(sistema, pregunta)` no debe repetirse dentro de las
  ~1123 preguntas del banco principal; `bankIntegrity()` debe marcar un
  duplicado inyectado como incidencia y volver a reportar cero incidencias
  una vez removido.
- **A14** — un `RAW_SYSTEMS` con un sistema `null`, o con `questions` no-array
  (ej. `{}`), no debe crashear `enrich()`: el sistema `null` se omite, y
  `questions` no-array se trata como lista vacía en vez de tirar `TypeError`.

## 5. Iniciar y detener el micrófono

- Fix original de la sesión — el permiso de micrófono se pide una sola vez
  por sesión de práctica oral, no en cada pregunta.
- **A05** — salir con el botón de marca del encabezado (`goHome()`, alcanzable
  desde cualquier pantalla) debe detener cualquier grabación/reconocimiento
  activo, igual que `exitOralVoice()`/`exitSession()`.
- **A05** — si el usuario navega fuera de la pantalla de práctica oral
  mientras el permiso de micrófono todavía está pendiente, y el permiso se
  resuelve después, no debe arrancar un reconocimiento de voz "vivo" sobre una
  pantalla ya abandonada (`oralGeneration` debe haber cambiado y bloquear el
  arranque tardío).

## 6. Evaluar respuestas orales: correctas, incorrectas, negadas, contradictorias

- Las 32 preguntas de `ORAL_VOICE_BANK` deben puntuar ≥9.5/10 contra su propio
  texto de referencia (regresión base, correr después de cualquier cambio al
  motor).
- Una respuesta deliberadamente incorrecta/vacía debe puntuar bajo.
- **A04 — ENG FIRE, negación total de los 5 memory items**
  ("No pondria thrust lever a idle. No pondria eng master a off. No
  presionaria fire pushbutton. No esperaria 10 segundos. No creo que n1
  disminuye.") en `ov_engfire`: los 5 pasos deben quedar en `missing`, score
  bajo (no ~9/10 como en el bug original).
- **A04 — autobrake, afirmación de un término requerido negado**
  ("Aplica presion fija automaticamente segun el modo seleccionado y
  condiciones de pista.") en `ov_autobrake`: el concepto "Objetivo de
  desaceleración, no presión fija" debe quedar en `missing` (no detectado
  solo por coincidir "presión"+"fija" sin la negación).
- **A04 — microburst, negación a distancia** ("No es un fenomeno
  localizado...") en `ov_microburst`: el concepto "Fenómeno localizado" debe
  quedar en `missing` aun cuando el marcador de negación está a 4 tokens de
  la palabra clave (no solo a 1-3).
- **Caso de no-regresión — corrección legítima "no es X, es Y"**
  ("No es una corriente ascendente, es una corriente descendente...") en
  `ov_microburst`: el concepto correcto ("corriente descendente") debe seguir
  detectado con normalidad (score alto, sin falso negativo por la ventana de
  negación ampliada).
- **A09 — repetición de término** (`ov_pan_mayday`, término aceptado "mayday
  mayday mayday"): una sola mención de "mayday" en la respuesta no debe
  satisfacer un término que exige tres repeticiones distintas.
- **A09 — límite de palabra**: "desconectar" en la respuesta no debe
  satisfacer un término aceptado "conectar" (coincidencia de substring, no de
  palabra completa).
- **A10 — normalización de jerga aeronáutica**: palabras españolas comunes
  como "vientos" u "operativa" no deben corromperse al pasar por
  `normalizeAeroText` (ej. "vientos" → "vientaws" era el bug original).
- **REG-03 — el error crítico respeta el orden** (2026-09-30): en
  `ov_pan_mayday`, la respuesta correcta "El MAYDAY es más grave que el PAN
  PAN…" se penalizaba con −3 ("Es al revés") porque el error "pan pan es mas
  grave que mayday" tiene las mismas palabras en otro orden (antes 6.2/10).
  Ahora `criticalItemDetected` exige el orden del término: la respuesta
  correcta y "PAN PAN es menos grave que MAYDAY" no se penalizan; "PAN PAN es
  más grave que MAYDAY" y "MAYDAY es menos grave que PAN PAN" sí.
- **REG-03 — negación dentro del error crítico**: "el flex no está permitido
  en pista contaminada" no activa el error "flex esta permitido en pista
  contaminada" (la negación cae entre las palabras del término, no antes);
  la afirmación equivocada sí lo activa. Un término que ya es una negación
  ("no digo nada") sigue funcionando.
- **REG-04 — conceptos con palabras repetidas**: "el flex no está permitido …
  el derated sí está permitido" cumple "derated esta permitido", y "nunca hay
  que bajar de green dot … drift down a green dot" cumple "green dot" (antes
  la primera aparición de cada palabra, o una negación en la primera mención,
  lo impedían). Si la única mención está negada, no cuenta. La búsqueda
  complementaria (`anchoredConceptMatch`) solo suma: sobre todas las
  referencias (53) no quita ninguna detección de la búsqueda original.
- **REG-05 — `ov_elec_arch` no castiga una frase correcta** (2026-10-02): su
  error crítico incluía "las baterías están desconectadas en operación
  normal" (−3), pero el manual dice justamente eso (el BCL las desconecta del
  DC BAT BUS cuando están cargadas; siguen unidas a sus HOT BUS), y la clase
  de Eléctrico lo enseña así. Se quitó ese término; "las baterías solo se
  conectan si fallan los generadores" sigue penalizado. La referencia ya no
  dice que el BUS TIE "comparte" la alimentación (sugería generadores en
  paralelo). Prueba de mutación: con el término devuelto, REG-05 falla.
- **REG-06 — ninguna oral cita un manual en lo que se ve** (2026-10-05,
  1.17.0): al armar Performance aparecieron dos referencias antiguas que lo
  hacían («fuera del FCOM…» en ETOPS, «la razón que da el FCTM» en sterile
  cockpit). Se reescribieron, y la prueba revisa pregunta, referencia,
  resumen, conceptos, pasos y avisos de las 53 orales. El FCOM puede
  aparecer solo como documento que la tripulación consulta («revisa el FCOM
  si hay tiempo»). También fija la corrección de `ov_v1_continue`: con FLEX,
  poner TOGA después de una falla da margen pero no es obligatorio; con
  derated, nunca bajo la velocidad F.
- **Entrevista oral, performance y operación (9 preguntas nuevas,
  2026-09-30)**: MAC% y envolvente, pesos operativos, cost index, combustible
  DAN 121, pista contaminada, FLEX vs derated, approach vs landing climb,
  mejorar el despegue y falla de motor en crucero. Una respuesta correcta
  dicha con otras palabras supera un mínimo (6.5–8.5) sin avisos falsos; el
  cost index confundido con fuel flow se penaliza. Cada una trae fuentes
  internas (`refs` con `src` y `cite`) que nunca se muestran: ni la pregunta,
  ni los conceptos, ni los avisos, ni la respuesta de referencia citan un
  manual. Las citas se comprueban contra los PDF con
  `C:\Users\yodie\Desktop\APP\MD\_herramientas\verificar_citas_orales.js`
  (al 2026-10-01: 252 citas en 31 preguntas, 0 problemas).

## Integridad estructural (no certifica precisión aeronáutica — ver más abajo)

- `bankIntegrity()` sobre el banco real y sin modificar: `{ok:true,
  issues:0}`.
- **A15** — un item de rúbrica `null` dentro de `concepts`/`steps` no debe
  crashear `oralBankIntegrity()`; un `accepted` que solo contiene strings
  vacíos no debe pasar como válido.
- **A15** — un ID duplicado en `ORAL_VOICE_BANK` debe incrementar el conteo de
  incidencias.

## 8. Pulido de la interfaz (revisión general, commits 3aa2fae–a60dd34)

- **Guardadas con DGAC (7764f5c)** — una pregunta DGAC marcada con ⭐ debe
  aparecer en `savedQuestions(null)` y `startSavedSession()` debe arrancar
  con ella (antes quedaba guardada pero invisible).
- **`.verify-badge` (7764f5c)** — la clase de las insignias "✓ FCOM 2025",
  "✓ AIRBUS REV 15", "BANCO DEPURADO" y "✓ EXPLICADA" debe tener estilo
  (borde y margen); antes no existía en el CSS y el texto se veía pegado.
- **Resumen del test (7764f5c)** — 20/20 dice "Puntaje perfecto"; 18/20 sigue
  diciendo "Revisa los pocos errores".
- **Recálculo de integridad (82ba29c)** — `renderHome()` reutiliza
  `BANK_HEALTH`; no debe volver a llamar `bankIntegrity()`.
- **Compartir progreso (fafa386)** — cancelar el panel de compartir
  (`AbortError`) no dispara una descarga; un fallo real sí cae a la descarga.
- **Etiqueta de la Autoevaluación (fafa386)** — el contador de la sesión dice
  `AUTOEVALUACIÓN`, nunca `ORAL`.
- **Plurales (fafa386)** — "1 pregunta por repasar", "1 error · 1 correcta".
- **Mejor test de DGAC/Entrevista técnica/Operación Airbus (fafa386)** — se
  guarda y aparece como pill "mejor test" en la pantalla del banco; un test
  DGAC no modifica las estadísticas de precisión.
- **Precisión del inicio (fafa386)** — cuenta FCOM + Operación Airbus +
  Entrevista técnica, el mismo alcance que "por repasar".
- **Autocalificación visible (a60dd34)** — la nota elegida ("No la sabía" /
  "Parcial" / "La sabía") queda marcada y se ve al volver a la pregunta.
- **Resultado oral (3aa2fae)** — etiqueta `ESTIMACIÓN`, nota aclaratoria y
  grados de cobertura (muy alta / alta / media / parcial / baja) con color
  verde/ámbar/rojo.

## 9. Accesibilidad (revisión de contraste y áreas táctiles)

- **Contraste** — `--muted` (gris de texto secundario) y `--amber` deben
  alcanzar ≥4.5:1 sobre `--bg`, `--panel`, `--panel2` y `--panel3`. Antes
  daban 4.0–4.2:1 y el texto pequeño (10–12 px) se leía mal a la luz.
- **Áreas táctiles** — el botón de marca, "Volver/Salir", los botones de
  autocalificación y "Crear/Restaurar copia" miden ≥44 px de alto (antes
  26–34 px); "Prefiero escribir mi respuesta" y "Ver qué se transcribió"
  pasaron de 14 px a 40 px. Diagnóstico completo por pantalla:
  `tests\run.ps1 -Script <archivo.js> -Width 375 -Height 812`.

## 10. Inglés OACI: 4 pruebas de una sola parte (sección nueva)

La sección es una sola **prueba** de una sola tanda: al entrar te toca una al
azar (1 de 4, luego 1 de las 3 que faltan, etc.) y esa prueba mezcla al azar
**8 alternativas, 4 audios (2 ATIS y 2 autorizaciones de ATC), 2 imágenes para
describir y 1 role-play de 3 turnos con ATC**. No hay partes, secciones ni menú
entre un ejercicio y el siguiente: se avanza siempre hacia adelante.

- **Banco y reparto** — 32 alternativas (8 por prueba, por tema), 8 imágenes,
  16 audios (8 ATIS y 8 autorizaciones) y 4 role-plays; todo está asignado a una
  prueba y nada está en dos (lo que sobró de versiones anteriores —42
  alternativas y 17 frases para hablar— queda en el historial de git, commit
  `f75627e`). `bankIntegrity()` no reporta incidencias (`englishIssues`). Las
  alternativas ya no viven en el banco técnico: `SYSTEMS` no tiene `english_icao`,
  no salen en la búsqueda, no cuentan como preguntas FCOM (`totalQuestions()`
  sigue en 415) ni entran en la precisión ni en «Mis errores», y el motor de
  preguntas es el de antes de esta sección.
- **Ningún texto cita un manual, una sección o una carpeta** — la app se va a
  distribuir a gente que no tiene esos documentos. `enVisibleTexts()` reúne lo que
  el usuario ve de cada ejercicio y `enSourceRef()` detecta «manual», «§», «9432»,
  «FCTM», «FCOM», «PDF», «carpeta», «Anexo», «AIP», «p. N», «foreword», «prólogo»,
  «table in» y «note in the»; `englishIntegrity()` cuenta como incidencia cualquier
  texto visible que las use (así aparece en el inicio, y falla la batería). El
  caso recorre las 4 pruebas completas y revisa también lo que se dibuja (menú,
  alternativas contestadas, modelos revelados, audios y role-plays): sin bloques
  «Referencia» ni «VERIFICADO». Las fuentes (`cite`, `src`, `refs`) siguen en los
  datos como dato interno para verificar y no se muestran.
- **`englishIntegrity()`** detecta un dato clave mal formado, un tipo de audio
  inválido, un id repetido, una alternativa con la respuesta fuera de rango, un
  enunciado, una opción, una explicación, una nota de audio o una nota de
  role-play que cite una fuente, una alternativa o un role-play que no existe, la
  misma alternativa en dos pruebas, un turno que responde a ATC sin audio, un
  turno sin fuente interna y un banco sin pruebas.
- **La mezcla** (`enOrderFor`) — los 15 ejercicios salen en orden aleatorio y
  repartidos: nunca dos ejercicios que no sean alternativas seguidos, ninguna
  racha de más de 3 alternativas, el primer ejercicio y el lugar del role-play
  cambian de una vez a otra. Un orden incompleto o de otra prueba no vale
  (`enValidOrder`).
- **El sorteo** — al entrar (`openEnglish` → `enAssign`) se asigna una prueba
  pendiente al azar, con su orden, y se guarda: al volver a entrar no se sortea
  ni se mezcla de nuevo; al terminarla te toca una de las que faltan; al terminar
  las 4 aparece «Completaste las 4 pruebas» con «Empezar otra vuelta»
  (`enStartNewRound`), cuyo primer sorteo no repite la última que hiciste. Con
  `Math.random` real, 300 sorteos sacan las 4 pruebas.
- **Una sola tanda** — el caso recorre una prueba completa: encabezado
  `PRUEBA n · k / 15` en cada ejercicio, sin pasar por el menú, sin botón
  «Anterior», «Siguiente» bloqueado hasta contestar o revelar (también por
  código), «Terminar prueba» solo en la última pantalla, el avance guardado en el
  dispositivo al terminar cada ejercicio y el resultado objetivo de las
  alternativas (`5 de 8 correctas`), nunca una nota.
- **Salir a mitad** — la prueba queda «EN CURSO»: al volver (incluso tras
  recargar) sigues en el mismo ejercicio, con el mismo orden y tus aciertos; una
  alternativa que no se terminó no cuenta y un role-play a medias vuelve al
  primer turno. Nada se guarda como sesión suelta (`appState.resume` sigue en
  `null`).
- **Estado guardado** — `sanitizeState` limpia el mapa `english` (valoración
  0/1/2, intentos, fecha) y `englishTests` (pruebas hechas: enteros 1–99 sin
  repetir; prueba en curso que no esté ya hecha, con su orden —solo referencias
  `q:`/`l:`/`i:`/`r:` más id—, el ejercicio por el que vas y los aciertos ≤
  total; vuelta y última). El formato de la versión anterior (por partes) se
  acepta y la prueba se vuelve a mezclar al entrar; un respaldo antiguo sin esos
  campos sigue siendo válido y con el tipo equivocado se rechaza.
- **Alternativas** — cuatro opciones mezcladas cada vez (la correcta no cae
  siempre en el mismo lugar), una sola respuesta que no se puede cambiar,
  «No la sé» cuenta como incorrecta, la explicación aparece al contestar y no
  trae citas, y no tocan las estadísticas del banco técnico.
- **Inicio** — la tarjeta dice «4 pruebas al azar…» y, cuando hay, «N de 4
  hechas»; el pie del inicio cuenta las 32 alternativas.
- **Sin nota, nunca** — en ninguna pantalla existe `.oral-score`, `.oral-grade` ni
  `.score-circle`. El autoexamen (Repetir / Casi / Bien) solo se guarda como
  avance y no aparece en las alternativas.
- **Imágenes** — las 2 fotos de la prueba; el título y el tema de la foto no se
  ven antes de describirla (darían vocabulario hecho) y aparecen al revelar el
  modelo.
- **Role-play** — 3 turnos seguidos que cuentan como un solo ejercicio de la
  prueba (falla de motor después de V1, antes de V1, pasajero con un problema de
  salud y pérdida de presión). La situación siempre está a la vista; el primer
  turno no tiene audio; los siguientes traen audio de ATC (con el texto oculto
  hasta pedirlo) y «Hasta ahora» con lo que ya pasó; tras el último turno sigue
  el ejercicio siguiente. Cada modelo lleva el indicativo y no se muestra ninguna
  cita.
- **Audios = copiar un ATIS o una autorización, con apuntes libres** — no hay
  campos ni etiquetas que den el orden: solo un cuadro de texto (el texto de
  ayuda no menciona viento, pista, QNH, etc.) y **un único botón de audio** (no
  hay selector de velocidad ni de voz, ni casilla de dígitos, ni «última
  frase»). Al comprobar se muestra la transcripción y una lista de «datos
  clave» marcados ✓ / • (nunca un total ni una nota). La comparación es
  flexible (`enNoteTokens` / `enKeyFound`): entiende `200/12`, `two zero zero
  one two`, `RWY27`, `QNH1018`, `T16 D10`, `8KM`, `eight thousand`, `two
  thousand five hundred`, `118.7` / `one one eight decimal seven`, sin unir
  cifras ajenas («dew point») ni encontrar `10` dentro de `1018`. Cada dato
  clave de los 16 audios debe reconocerse en su propia transcripción y no en un
  texto ajeno; unos apuntes abreviados «de cabina» (también los del ATIS con
  niebla) los reconocen y unos parciales marcan solo lo anotado. «Volver a
  intentarlo» borra los apuntes, oculta la comparación y sortea otra voz.
- **Voz al azar, una sola velocidad** — se lee con voces en inglés del
  dispositivo (`speechSynthesis`), siempre a velocidad 1. En cada ejercicio se
  sortea una voz (dos distintas para ATC y piloto si hay más de una; con una
  sola voz se distinguen por el tono), se excluyen las voces de novedad de
  macOS/iOS (Zarvox, Bells…) y las que no son inglés, se mantiene al repetir el
  audio, la colación modelo usa la voz del piloto de ese audio y se vuelve a
  sortear al reintentar. Con `Math.random` real salen todas las voces
  disponibles. Cambiar de pantalla cancela la voz. `radioSay` convierte 3/4/5/9
  en tree/fower/fife/niner y deletrea QNH, ILS, RVR y SSR sin tocar palabras
  como «nineteen».
- **Micrófono en inglés** — usa reconocimiento en `en-US`; `goHome()` lo detiene
  y lo aborta; un permiso que llega tarde no inicia el reconocimiento en otra
  pantalla; lo reconocido (provisional y final) llega al cuadro de texto y se
  conserva, pero no se puntúa.
- **Accesibilidad** — el botón de comenzar, «Salir», las alternativas, «No la
  sé», «Siguiente», el botón de escuchar, el de grabar, el de mostrar modelo, el
  cuadro de apuntes, los botones ▶ del modelo, las casillas de autoevaluación y
  los botones Repetir/Casi/Bien miden ≥44 px (`.dontknow`, que comparte el
  botón «No la sé» del banco técnico, pasó de 42 a 44 px).

**Comprobación de las fuentes internas (fuera de esta batería).** El `cite` de
cada alternativa, de cada audio y de cada turno de role-play se comprobó
textualmente contra la página PDF indicada de su fuente (*ICAO Doc 9432*,
*FCTM* 25 NOV 24 o *FCOM* 15 SEP 25, versiones .md de la carpeta APP), con la
misma normalización que `buscar.ps1 -Frase`; los diálogos de dos columnas
(piloto/controlador) y las tablas del Doc 9432 se leyeron además en la imagen
de la página. Esa comprobación necesita esos manuales en `Desktop\APP` y por
eso no forma parte de `run.ps1`; si se edita el texto de una fuente interna,
hay que repetirla con
`node C:\Users\yodie\Desktop\APP\MD\_herramientas\verificar_citas_ingles.js`
(lee `data/english/`; en la última corrida: 77 tramos
de cita comprobados, 0 problemas). Lo que **no** viene de un manual (los turnos
de ATC de los role-plays y el formato de los ATIS) es composición de práctica y
así se indica en pantalla.

**Prueba de mutación (una vez, al armar la versión de una sola parte).** Se
rompieron a propósito doce piezas (el sorteo o la mezcla que se repiten al volver
a entrar, la mezcla que deja de repartir, el avance que no se guarda, las
alternativas acertadas que no se cuentan, la vigilancia de textos que citan un
manual, una explicación que vuelve a mostrar una cita, poder pasar de una
alternativa sin contestarla, las voces de novedad, la voz que se vuelve a sortear
al repetir, una prueba terminada que no se marca como hecha, las opciones que no
se mezclan y el título de la foto visible) y la batería falló en cada caso (dos
de ellas obligaron a reforzar un caso primero).

## 11. Need to know (sección destacada, 2026-10-01)

Sección nueva, la primera del inicio y con color propio, con las preguntas
clave de la entrevista. Cada pregunta se estudia como tarjeta: responder con la
voz o escribiendo (misma evaluación de Entrevista oral) o «Ver respuesta».

- **Lista base y contenido** — 31 preguntas: 10 que ya estaban en Entrevista
  oral y 21 nuevas, que también quedan allí (el banco oral pasa de 32 a 53).
  Cada una trae una idea corta (`short`) y la respuesta en párrafos o listas
  (`formatRefHtml`: «- » y «1. » arman listas, «Etiqueta: texto» resalta la
  etiqueta; no queda ninguna marca suelta). Ningún texto visible cita una
  fuente; «FCOM» solo aparece como paso del procedimiento ECAM («revisar el FCOM
  si hay tiempo»). Las 21 nuevas tienen fuentes internas (`refs`, más
  `extRefs` para el AIP de SCEL) que el verificador comprueba página por página.
- **Estado** — `appState.needToKnow = {added, removed}` se sanea (referencias
  `o:<id>` / `q:<_id>`, sin repetidas ni basura), viaja en el respaldo, un
  respaldo antiguo sin el campo queda vacío y un tipo inválido rechaza el
  respaldo. La lista efectiva es «base − quitadas + agregadas»: una pregunta
  base nueva le llega a todos sin perder sus cambios, y una referencia que ya no
  existe se ignora. La regex de referencias es una función y no una `const`,
  porque `sanitizeState` corre al cargar, antes de esa parte del script.
- **Agregar, quitar y restaurar** — quitar una pregunta base, agregar una de
  alternativas (va al final, en «Agregadas por ti»), restaurar las iniciales
  sin borrar lo agregado, y «Quitar» desde la lista. Los cambios se guardan.
- **Botón + Need to know** — aparece en alternativas, autoevaluación y
  entrevista oral, muestra si la pregunta ya está («★ Need to know») y alterna.
- **Tarjeta oral** — el micrófono de Entrevista oral (`.oral-mic-box`) se
  presta a la tarjeta y vuelve a su lugar al salir o al abrir Entrevista oral;
  la evaluación se guarda y la lista muestra el último puntaje; «Ver respuesta»
  muestra idea corta y explicación con listas; Anterior y Siguiente cambian de
  pregunta y limpian el resultado anterior.
- **Tarjeta de alternativas** — se practica con sus alternativas, registra el
  intento y la explicación no muestra citas ni insignias de fuente.
- **Inicio** — la tarjeta va primero, tiene su propio color y cuenta las
  preguntas y las practicadas.
- **Rúbricas** — 22 respuestas correctas dichas con otras palabras superan su
  mínimo (6.5–8.5) sin avisos falsos. En el orden del ECAM se usan `steps`: el
  orden típico (recall items, OEB, ECAM, QRH, FCOM) aprueba y un orden
  equivocado se avisa. FLEX en pista contaminada se penaliza. «Si no,
  go-around» ya no se lee como una negación del go-around.
- **Término reemplazado** — «altura de pantalla» no aparece en ningún banco ni
  en pantalla (se dice screen height).
- **Áreas táctiles** — la tarjeta del inicio, la lista, «Quitar», la tarjeta y
  el botón + Need to know miden ≥44 px.

Comprobado que detecta regresiones: dejando el micrófono sin volver, aceptando
un `needToKnow` de tipo inválido en el respaldo y quitando el arreglo de «si no,
go-around», la batería falló en el caso correspondiente cada vez.

## 12. Banco DGAC: la pregunta de la PTU con parking brake (2026-10-01)

- **El banco DGAC es el examen oficial.** La sección sirve para preparar ese
  examen: las preguntas y sus alternativas quedan tal como las escribió la DGAC,
  aunque estén mal planteadas. Las respuestas marcadas en el archivo de origen no
  son una clave oficial: las destacó un piloto que compartió el archivo. Por eso
  la app marca la alternativa correcta para el avión real; si ninguna lo es del
  todo, marca la mejor y lo aclara en la explicación.
- **DGAC-01** — «IT IS POSSIBLE TO PRESSURIZE THE GREEN HYDRAULIC SYSTEM ON THE
  GROUND VIA THE PTU WHEN THE PARKING BRAKE IS SET» está en el banco con respuesta
  TRUE. En tierra, la PTU funciona aunque el parking brake esté puesto si los dos
  master levers están en OFF o los dos en ON. Con un master lever en ON y el otro
  en OFF (primer arranque), necesita el parking brake suelto y la NWS fuera de la
  posición de remolque.
  - Historia: en el archivo de origen venía marcada FALSE. Por eso se retiró
    (15e53b0) y después volvió con TRUE (1.11.3). El banco DGAC queda en 573.
  - La batería comprueba que la pregunta esté, con TRUE, con la explicación de
    los master levers y sin citar manuales.

## 13. Archivos de la app (2026-10-01; en módulos desde 2026-10-07)

La app dejó de ser un solo archivo de 1,5 MB, sin ningún cambio visible. Desde
la 1.22.0 los datos y la lógica están además en módulos pequeños (sección 17).
El mapa completo para personas e IA está en `AI_PROJECT_MAP.md`.

| Archivo | Qué tiene |
|---|---|
| `index.html` | La página: encabezado y el HTML de las pantallas. El manifiesto y los íconos están en `manifest.webmanifest` y `assets/icons/`. |
| `css/app.css` | Los estilos. |
| `data/questions/` | Banco de alternativas: un archivo por categoría (`hydraulic.js`, `fuel.js`…), el DGAC en `dgac/` (uno por sección) y `index.js`, que los reúne. |
| `data/english/` | Banco de Inglés OACI: un archivo por tipo de ejercicio e `index.js`. |
| `data/oral/` | Banco de Entrevista oral (`ORAL_VOICE_BANK`, también lo usa Need to know): tres grupos e `index.js`. |
| `data/manifest.json` | Solo metadatos: archivo y cantidad de cada parte (lo escribe `tools/manifest.js`). |
| `js/app.js` | Núcleo: bancos, progreso guardado, pruebas de alternativas, inicio, integridad y respaldo. |
| `js/oral.js`, `js/needtoknow.js`, `js/ingles.js` | Entrevista oral, Need to know e Inglés OACI. |
| `js/inicio.js` | Arranque: recupera el progreso, revisa la integridad y pinta el inicio. |
| `css/ruta.css`, `js/ruta.js` | La Ruta de entrenamiento: portada, mapa y estaciones (sección 14). Todo lleva el prefijo `rt-`. |
| `data/stations/` | Las materias (una por archivo), las estaciones y la ruta del mapa. Lo genera `Escritorio\APP\Estaciones\_herramientas\exportar_app.js`: no se edita a mano. |
| `assets/estaciones/` | Los diagramas, imágenes y fondos del mapa que usan las estaciones (los copia el mismo exportador). |
| `assets/portada/` | La textura de las nubes de la portada (sección 14). El exportador no toca esta carpeta. |

- **Orden de carga** — `index.html` carga los datos antes que `js/app.js`,
  porque la lógica los usa al arrancar. Al cargar el estado se usan funciones
  de Need to know e Inglés: por eso, desde la 1.22.0, esa carga
  (`appState=loadState()`) está en `js/inicio.js`, que corre después de todas
  las partes de la lógica y antes de `js/ruta.js` (sección 17).
- **Texto exacto del banco** — `BANK_FINGERPRINT` se calcula sobre el texto
  JSON del banco. Desde la 1.22.0 ese texto lo arma `data/questions/index.js`
  con `JSON.stringify` y sale idéntico byte a byte al de antes (huella
  `-me5xnl`), así que una sesión «Continuar» guardada sigue valiendo. Las
  herramientas leen los datos con `tools/cargar_datos.js`, que los carga igual
  que el navegador.
- **Versión en las rutas** — cada archivo se pide con `?v=` + `APP_VERSION`
  para que un teléfono no mezcle una parte nueva con otra vieja guardada en su
  memoria. **Cada versión nueva cambia `APP_VERSION` y los `?v=` de
  `index.html`**: desde la 1.22.0 lo hace `node tools/version.js X.Y.Z`.
- **ESTRUCTURA-01** — cada archivo local que carga `index.html` va una sola vez
  y con `?v=APP_VERSION`; las piezas principales van en orden (estilos, los
  `index.js` de `data/questions/`, `data/english/`, `data/oral/` y
  `data/stations/`, y después `js/app.js`, `js/oral.js`, `js/needtoknow.js`,
  `js/ingles.js`, `js/inicio.js` y `js/ruta.js`); cada parte de datos se carga
  antes del `index.js` de su carpeta; los archivos antiguos (`data/banco.js`,
  `data/ingles.js`, `data/oral.js`, `data/estaciones.js`) ya no se cargan; no
  queda `<style>` ni banco dentro de `index.html`; la huella sale del texto
  exacto del banco; ninguna parte queda suelta en `window`; y el banco de
  inglés está cargado.
- **Errores con detalle** — `run.ps1` abre la copia con
  `--allow-file-access-from-files`: sin eso, un error en `js/` o `data/` llega
  solo como «Script error.». Además lee la salida del navegador con
  reintentos, porque a veces el archivo sigue tomado un instante.
- **Comprobación de la división (una vez)** — al rearmar un solo archivo con
  las partes se obtuvo exactamente el `index.html` anterior, salvo las 8 líneas
  previstas: dónde se leen los dos bancos JSON, los mensajes y comentarios que
  los nombran, y `APP_VERSION`. Un recorrido de 14 pantallas con el azar fijo
  dio el mismo HTML, los mismos estilos calculados y la misma distribución en
  las dos versiones. Tampoco cambiaron la huella del banco (`xl140d`), los
  verificadores de citas ni lo que arma `construir.js` de las estaciones.
- **Recorrido de pantallas para cambios internos** — `tests/pantallas.js`
  repite esa comparación: con el azar fijo abre 14 pantallas y guarda el HTML,
  el estilo calculado y la caja de cada elemento. Para comprobar que un cambio
  interno no se ve, se corre antes y después (la versión «antes» puede ser una
  copia de un commit anterior con su propio `tests\run.ps1`) y se comparan las
  dos salidas:

  ```powershell
  powershell -ExecutionPolicy Bypass -File tests\run.ps1 -Script tests\pantallas.js -Width 390 -Height 844 > antes.json
  powershell -ExecutionPolicy Bypass -File tests\run.ps1 -Script tests\pantallas.js -Width 390 -Height 844 > despues.json
  node tests\comparar_pantallas.js antes.json despues.json
  ```

  Comprobado: la versión de un solo archivo contra la dividida sale igual, y
  una regla de CSS agregada a propósito (`body{letter-spacing:0.5px}`) sale
  distinta. Una alteración que no cambia nada (una regla que otra pisa, o una
  clase que no existe) también sale igual: la prueba de mutación tiene que
  cambiar algo de verdad.

Comprobado que detecta regresiones: un `?v=` atrasado en `js/app.js` falla en
ESTRUCTURA-01, y cargar `data/oral.js` (hoy `data/oral/`) después de `js/app.js` falla en 15
casos (`ORAL_VOICE_BANK is not defined`).

## 14. Ruta de entrenamiento: portada, mapa y estaciones (2026-10-01, 1.12.0; carta en ruta 1.13.0)

La app abre en una **portada** con el nombre de la app sobre el aeropuerto del
mapa y dos puertas: **Ruta de entrenamiento** (el mapa de estaciones) y **Banco de
preguntas** (el inicio de siempre, ahora titulado «Banco de preguntas», con un
botón «Portada» para volver). Ningún módulo cambió.

- **Mapa** — los 7 fondos apilados, de la pista de salida a la pista de
  llegada; las estaciones de las materias (desde la 1.14.0, 29: Hidráulico,
  Eléctrico y Controles de vuelo) mezcladas por nivel
  (`data/stations/`); la estación actual destacada, las demás con candado
  hasta ganar una estrella en la anterior, y el avión (la imagen
  `mapa-avion.webp`, fuera de escala) que espera antes de la estación que toca
  y vuela a la siguiente al terminar una, dejando una estela dorada.
- **Carta en ruta (1.13.0)** — el mapa se ve como una carta de navegación:
  - cada estación es un **VOR/DME** (hexágono dentro de un cuadrado) con su
    rosa de los vientos; los repasos van con el hexágono relleno, como los
    puntos de notificación obligatoria;
  - al lado, su caja con frecuencia de VOR (112.0 a 117.9) e identificador de
    3 letras (`ident` de cada estación, como PTU, RAT o IDG; `construir.js`
    exige que exista y no se repita);
  - la ruta es una aerovía (UA320) de tramos rectos, cada uno con su rumbo
    (sale de su dirección en el mapa: el norte de la pantalla es el norte) y
    su distancia en millas;
  - despega del umbral de la RWY 36 por el eje de pista, con las 3 primeras
    estaciones sobre el eje, sigue derecho hasta pasado el fin de pista y
    recién vira;
  - si dos estaciones quedan muy juntas en altura, la ruta se abre en zigzag
    para que cada tramo mida al menos 136 px y el avión quepa sin tapar
    ninguna (en la tormenta queda esquivando las celdas);
  - termina con una aproximación punteada a la RWY 36 del fondo de llegada,
    todavía sin estaciones;
  - una zona con más de 5 estaciones se alarga (1.14.0): su fondo se repite,
    alternando una copia al revés para que las uniones calcen, siempre en número
    impar; las pistas no se repiten nunca.
- **Avance al agregar materias (1.14.0)** — una materia nueva intercala sus
  estaciones de nivel 1 al comienzo de la ruta. Una estación está abierta si
  es la primera, si la anterior tiene estrellas o si ya la ganaste: lo ganado
  no queda con candado, y el avión vuelve a la primera estación sin hacer.
- **Estación** — presentación, fichas con diagramas, prueba y resultado: 3, 2
  y 1 estrellas con 90, 70 y 50 % de respuestas correctas en el primer
  intento, y segundo intento de las falladas. Al terminar se vuelve siempre al
  mapa: no hay botón para pasar directo a la estación siguiente (1.13.0).
- **Nombre** — la app dice «estación», nunca «misión» (decisión de Diego,
  1.13.0). En el código siguen nombres internos en inglés (`missions`).
- **Estadísticas compartidas** — la primera respuesta de cada pregunta de
  alternativas cuenta en las estadísticas de la app con `recordTechnical`
  (las del banco DGAC no, igual que en el resto de la app); el segundo intento
  no cuenta. Las orales se evalúan con el motor de Entrevista oral
  (`evaluateLocally`): aprueba con 6/10 («cobertura media») o más, y el
  puntaje queda en `appState.oralVoice`.
- **Avance** — `appState.ruta = {stars, streak, unlockAll}` se sanea
  (`sanitizeRuta`: solo estaciones que existen, 1 a 3 estrellas, fecha
  AAAA-MM-DD), viaja en la copia de seguridad, un respaldo antiguo sin el
  campo queda vacío y uno con el tipo equivocado se rechaza. Ajustes de la
  ruta: abrir todas las estaciones y borrar solo el avance de la ruta.
- **Contenido** — se exporta desde `Escritorio\APP\Estaciones` (donde
  `construir.js` revisa reglas y citas) con `exportar_app.js`; las fuentes
  internas no se copian a la app.
- **Casos RUTA-01 a RUTA-07** — la app abre en la portada con el nombre de la
  app y sin la frase anterior; Banco de preguntas y Portada llevan y traen;
  las 18 estaciones, cada pregunta enseñada en su estación, igual a la del banco
  (alternativas, orden y respuesta) y sin citar manuales; el saneo y el
  respaldo del avance; una estación completa (estrellas, siguiente abierta,
  racha y estadísticas); la DGAC no cuenta y la oral pasa por el motor; el
  segundo intento no cuenta doble y las alternativas DGAC salen en su orden;
  la portada y el mapa muestran avance, candados, la estación actual, el avión
  y los 7 fondos.
- **Nubes de la portada (1.12.1)** — dos capas de nubes pasan sobre el
  aeropuerto a distinta velocidad. Usan una textura que se repite sin costuras
  (`assets/portada/nubes.webp`, 73 KB; la genera
  `Escritorio\APP\Estaciones\_herramientas\nubes_portada.ps1`). Solo se anima
  el transform, así que la página no se repinta; se desvanecen antes del
  título y quedan quietas con «Reducir movimiento». Con la portada oculta no
  se animan.
- **RUTA-08** — las dos capas están ocultas para lectores de pantalla, no
  bloquean los toques y quedan bajo el degradado y el contenido; cada una
  avanza en bucle, a velocidad pareja, exactamente el ancho de su textura (si
  no, se vería un salto al repetirse), solo con transform y cubriendo la
  pantalla todo el recorrido; y alguna regla `(prefers-reduced-motion:
  reduce)` las detiene.
- **RUTA-09** — al terminar una estación el resultado solo ofrece volver al
  mapa (o salir) y «Volver al mapa» lleva al mapa; ninguna pantalla de la ruta
  (portada, mapa, hojas, ajustes, presentación y resultado, incluidas sus
  etiquetas para lectores de pantalla) dice «misión».
- **RUTA-10** — la carta: el umbral y las 3 estaciones de pista sobre el eje,
  la ruta sigue derecha por el eje pasada la última y el avión espera
  alineado; el avión es la imagen nueva; un VOR/DME por estación, relleno solo
  en los repasos; una caja por radioayuda con frecuencia de VOR e
  identificador distinto; cada tramo con rumbo de carta (001 a 360) y
  distancia, y el del primer tramo de aerovía coincide con su dirección en el
  mapa; la aerovía tiene nombre; cada tramo fuera de la pista mide al menos
  136 px; y la aproximación punteada con la RWY 36 en las dos pistas.
- **RUTA-11** — con estrellas en la segunda estación y no en la primera, la
  ganada y la siguiente quedan abiertas y toca la primera; en el mapa ninguna
  zona pasa de 5 estaciones por fondo, cada zona tiene un número impar de
  fondos con las copias pares al revés, la tormenta se alarga y las pistas no
  se repiten.
- **RUTA-12** (2026-10-05, 1.15.0) — títulos de materias, estaciones y
  fichas en inglés (ninguno empieza con artículo o palabra en español, ni
  lleva tildes), y el texto de las clases en español neutro: sin «al tiro»,
  «o sea», «recién», «apretar», «cañería», «estanque», «botar» (y desde la
  1.21.0 también «bota» y «botan»), «Ojo:»,
  «harto», «nomás», «partimos por» ni «letra chica». Prueba de mutación: con
  un título en español falló; con «al tiro» en una ficha, falló.
- **UI-01** (2026-10-05, 1.16.0) — la interfaz está en inglés (menús, botones,
  avisos, ajustes; pedido de Diego). Revisa la página tal como se publica, la
  portada y el inicio del banco recién dibujados, y la ficha de una estación
  del mapa: ningún texto ni atributo con tildes o palabras de interfaz en
  español. El contenido (clases, preguntas, explicaciones) sigue en español y
  no se revisa aquí. Los nombres de sistemas, secciones DGAC y temas de
  entrevista del banco también pasaron al inglés (son etiquetas de menú).
  Prueba de mutación: con «Todas las secciones» de vuelta en la portada,
  falló. Lección: en cadenas JS con comillas simples, los apóstrofos del
  inglés («don’t», «can’t») van tipográficos, o rompen el script.
- **RUTA-13** (2026-10-05, 1.17.0) — la materia Performance tiene 13
  estaciones, con su repaso al final, y cada pregunta de una estación
  muestra su origen sin nombrar documentos: «Interview question» en las de
  entrevista (alternativas y orales) y «DGAC exam» en las del examen DGAC;
  las del banco de sistemas no llevan etiqueta. Prueba de mutación: sin la
  etiqueta en la pantalla de la pregunta, falló.
- **REG-07** (2026-10-05, 1.17.0) — la pregunta de entrevista del second
  segment decía que empieza a 35 ft; empieza cuando el tren queda arriba
  (el first segment va del liftoff al tren arriba). Se corrigieron la
  alternativa correcta y la explicación; el enunciado no cambió, así que el
  progreso guardado sigue en la misma pregunta.
- **RUTA-14** (2026-10-05, 1.18.0) — la materia Tren de aterrizaje y frenos
  tiene 12 estaciones con su repaso al final. La clase del nosewheel steering
  lo enseña por MSN (desde la 1.21.1, pedido de Diego): Green en los MSN más
  antiguos y Yellow en los más nuevos, sin presentar a ninguno como «el»
  sistema del steering. Ninguna estación usa las tres preguntas DGAC del
  steering que responden según los aviones antiguos. RUTA-02 espera ahora
  cinco materias. Prueba de mutación: con el steering de la clase cambiado a
  Green, falló.
- **REG-08** (2026-10-05, 1.18.0) — esas tres preguntas DGAC conservan la
  respuesta del examen (solo el steering inoperativo después de una extensión
  por gravedad, no hay steering después de la gravedad, el steering usa Green),
  pero su explicación ya no dice que todos los aviones son así: aclara que es
  lo de los MSN más antiguos (Green) y que en los más nuevos la presión la da
  Yellow y el steering sigue disponible (desde la 1.21.1, sin hablar de «la
  mayor parte de la flota»).
- **REG-09** (2026-10-05, 1.18.1) — ninguna pregunta del banco menciona los
  Tutorials en lo que se ve (enunciado, alternativas, explicación): se
  reescribieron 29 enunciados y 29 explicaciones del banco de operaciones, y
  dos enunciados que atribuían la técnica a Airbus. Las alternativas y las
  respuestas no cambiaron. Los 31 enunciados nuevos tienen su id viejo → nuevo
  en `QID_RENAMES` (QID-01 espera ahora 42), así que el progreso se conserva.
  La prueba también exige que las estaciones muestren el enunciado del banco
  tal cual (ya no necesitan reescribirlo) y que el flow después de un RTO
  incluya avisar al ATC (la explicación anterior decía lo contrario). Prueba
  de mutación: con «Según el Tutorial» en una explicación, falló.
- **REG-10** (2026-10-06, 1.19.0) — una revisión externa de los dibujos de
  Tren y Performance encontró simplificaciones que también estaban en el
  texto: el triple indicator «muestra presión solo cuando frena Yellow» (la
  aguja ACCU muestra el accumulator; solo las de los frenos dependen de que
  Yellow controle el frenado), el parking brake como un escalón más después del accumulator
  (usa la misma reserva) y «el autobrake no aplica una presión fija» sin decir
  que MAX frena a fondo. La prueba revisa las fichas, las explicaciones del
  banco y las respuestas orales. Prueba de mutación: sin la frase de MAX en la
  oral del autobrake, falló.
- **REG-11** (2026-10-06, 1.19.0) — el giro de 180° enseñaba solo «30 m»: el
  A320 gira en una pista de 30 m, pero el giro ocupa unos 24 m en pista seca,
  sin margen (30 m es lo que ocupa el A321). La clase y la explicación de la
  pregunta lo dicen ahora; la clave sigue siendo 30 m. El tren que no se
  traba mezclaba dos procedimientos: el recycle del ECAM (y la gravedad si no
  resulta en 120 s) y los hasta 4 recycles, que son de la L/G GRAVITY
  EXTENSION. Pruebas de mutación: con los 4 recycles como parte del recycle
  del ECAM, o sin los 24 m, falló.
- **RUTA-15** (2026-10-06, 1.19.0) — los dibujos que mezclaban varias ideas se
  separaron: el mando del tren y la tabla de frenos (antes un solo dibujo), la
  secuencia y las velocidades del tren, los modos de frenado y el triple
  indicator, la falla en crucero y la planificación de la ruta, y la distancia
  de aterrizaje del despacho y la de vuelo. La prueba exige que cada ficha
  tenga el suyo y que todos tengan descripción. Prueba de mutación: con el
  dibujo antiguo de vuelta, falló. Desde la 1.20.0 (2026-10-06) también exige
  el pitch y el yaw de Controles por separado (`ctl-cabeceo` en la estación 2,
  `ctl-guinada` en la 7) y la descripción de los dibujos de todas las materias.
  Prueba de mutación: con la ficha del rudder apuntando al dibujo del pitch,
  falló. La letra mínima de 10 px de los dibujos no se prueba aquí (la copia de
  prueba no carga imágenes): la revisa `construir.js`, que no escribe nada si
  un dibujo en uso tiene un texto más chico.
- **REG-12** (2026-10-06, 1.21.0) — auditoría de las 54 estaciones contra el
  FCOM, el FCTM y Getting to Grips (pedido de Diego: «he encontrado muchos
  errores»). Lo que estaba mal o impreciso: el flare de normal law («hay que
  hacer un flare suave»; en realidad desde 30 ft el sistema baja la nariz y
  hay que tirar suavemente), el reset del pitch trim (no al tocar la rueda de
  nariz, sino con el pitch bajo 2,5° por más de 5 s), la media velocidad de
  flaps y slats (sin un hidráulico, solo lo que usa ese sistema), los wing
  tip brakes (bloquean los flaps o los slats, en las dos alas, y el otro
  sistema sigue), el aterrizaje con tren anormal (nunca autobrake; con el
  nose gear anormal tampoco reversa), el RTO sin el aviso a ATC, la oral de
  viento de cola («se calcula con el viento real»: el cálculo cuenta el 150%)
  y explicaciones del banco (PTU como «una bomba movida por otra bomba», el
  RAT sin los 100 kt, los wing tip brakes, el reset del THS y otras). La
  prueba revisa las fichas, la oral y el banco. RUTA-12 rechaza además
  «bota», «botan» y «botar». Pruebas de mutación: con «hacer un flare suave»
  de vuelta, con los wing tip brakes en «solo las superficies afectadas» y
  con «botan la sustentación», fallaron.
- **REG-13** (2026-10-06, 1.21.1) — Diego: «No menciones que el sistema
  hidráulico amarillo es el responsable del nose wheel steering; menciona
  que en los MSN antiguos lo hace el verde y en los más nuevos el amarillo»,
  y «usa la carpeta APP como única fuente». El manual solo da rangos de MSN,
  así que ningún texto puede decir lo que tiene «la mayor parte de la
  flota». La prueba revisa clases, dibujos (su descripción), explicaciones
  del banco y orales: ninguna frase sobre la flota, ningún «el steering usa
  Yellow» sin decir que es en los MSN más nuevos, y la ficha de después de la
  gravedad dice que el steering se pierde en los MSN antiguos y sigue en los
  nuevos. Pruebas de mutación: con la frase antigua del steering en la ficha
  de la estación 1, y con «la mayoría de la flota» en la oral de ALL ENGINES
  FAILURE, falló.

Comprobado que detecta regresiones: contando las preguntas DGAC y el segundo
intento en las estadísticas, fallaron RUTA-05 y RUTA-06. Con un avance de
600 px en una textura de 640 px, o sin ninguna regla de «Reducir movimiento»,
falló RUTA-08. Con un botón para pasar a la siguiente estación o con «Misión»
en el globo del mapa, falló RUTA-09; con las estaciones de pista corridas
30 px del eje o sin el tramo recto pasado el fin de pista, falló RUTA-10. Con
la regla de apertura antigua (solo por la anterior) o sin alargar las zonas,
falló RUTA-11.

## 15. PTU: enunciados corregidos sin perder el progreso (QID-01)

En la app se decía «el PTU»; el 2026-10-01 pasó a **la PTU** (la unidad), en
35 textos del banco, en Entrevista oral, en las clases y en sus diagramas. El
2026-10-05 Diego pidió decir **PTU**, sin artículo (sonaba poco neutro): se
corrigió en el banco (enunciados, alternativas, explicaciones y referencias),
en Entrevista oral, en las clases y en los diagramas. «El PTU pb» se mantiene:
es el pushbutton.

- Seis enunciados de Hidráulico cambiaron el 2026-10-01 y cinco de ellos de
  nuevo el 2026-10-05; el id de una pregunta sale de su enunciado. `QID_RENAMES` traslada al id nuevo lo que el usuario tenía en el
  id antiguo: estadísticas, guardadas, autoevaluación y Need to know (si ya
  hay datos en el id nuevo, se conservan). El mapa tiene 11 ids antiguos:
  los de las dos versiones anteriores apuntan directo al id actual.
- **QID-01** comprueba el traslado de los cuatro registros, que los ids
  nuevos existan y los antiguos no, y que ningún texto del banco diga «el
  PTU» ni «la PTU» (desde 1.15.0 también revisa las referencias).

## 16. Banco DGAC: preguntas de controles de vuelo revisadas contra el manual (DGAC-02)

Al armar la materia Controles de vuelo se revisaron las preguntas DGAC del tema.
Tres no calzaban con el manual; enunciados y alternativas siguen como los
escribió la DGAC:

- **«WHICH OF THE FOLLOWING CONTROLS AND MONITORS FLAPS AND SLATS?»**: marcaba
  «ONE SFCC», con una explicación que decía que uno trabaja y el otro queda de
  reserva. Son dos SFCC y trabajan los dos a la vez (cada uno con un canal de
  slats y uno de flaps; si falla uno, todo va a media velocidad). Ahora marca
  «TWO SLAT FLAP CONTROL COMPUTER (SFCC'S)».
- **«WHEN IS ALPHA FLOOR NOT AVAILABLE?»**: la respuesta (fuera de normal law)
  era correcta, pero la explicación decía que las tres condiciones lo inhiben.
- **La de los ELAC**: la explicación decía que no controlan el THS, y sí lo
  hacen.

**DGAC-02** comprueba la respuesta de los SFCC y que las tres explicaciones
calcen con su respuesta.

## 17. Datos y lógica en módulos, para trabajar con menos contexto (2026-10-07, 1.22.0)

Cambio solo de organización: mismo contenido, mismas pantallas. Una persona o
una IA abre solo la parte que necesita (instrucciones para agentes en
`AGENTS.md`, mapa en `AI_PROJECT_MAP.md`).

- **Datos** — los bancos se dividieron por su clasificación real: alternativas
  por categoría (`data/questions/<clave>.js`, la misma clave que usa la app) y
  DGAC por `bank_section` (`data/questions/dgac/`); inglés por tipo de
  ejercicio; orales en tres grupos seguidos, sin cambiar su orden; estaciones
  por materia (lo escribe `exportar_app.js`). Cada archivo trae un elemento
  por línea. El `index.js` de cada carpeta reúne las partes en la misma
  variable de siempre (`SYSTEMS_DATA_JSON`, `ENGLISH_DATA_JSON`,
  `ORAL_VOICE_BANK`, `ESTACIONES_DATA`), así que la lógica no cambió. No hay
  copias: cada pregunta existe en un solo archivo.
- **Lógica** — `js/app.js` se dividió por sus límites ya marcados: Entrevista
  oral, Need to know, Inglés OACI y el arranque (`js/inicio.js`). Cada línea
  original quedó exactamente una vez, en el mismo orden de ejecución. La única
  línea que se movió es `appState=loadState();`, que ahora corre en
  `js/inicio.js` después de todas las partes y antes de `js/ruta.js`.
  Entre su lugar original y ese punto no corre nada que use el estado.
- **index.html** — el manifiesto y los íconos, que iban incrustados en base64
  (123 KB), pasaron a `manifest.webmanifest` y `assets/icons/`, con los
  mismos íconos byte a byte. `index.html` bajó de 145 KB a 28 KB.
- **Batería** — `tests/suite.js` se dividió por sus secciones en
  `tests/suite/`. Unidas en orden, las partes reproducen exactamente el
  archivo anterior (más una línea de comentario en cada una).
- **Integridad de datos** (`tests/data-integrity.js`, Node) — `index.html`
  carga cada archivo de `data/` una vez y antes del `index.js` de su carpeta,
  y no carga ninguno que no exista. Cada archivo registra solo lo que dice su
  nombre (una pregunta DGAC en la sección equivocada falla). Además revisa:
  - la forma de cada pregunta: enunciado, alternativas no repetidas, respuesta
    dentro del rango, y explicación y cita fuera del DGAC;
  - que los ids sean únicos, en las alternativas, las orales, el inglés y las
    estaciones;
  - las rúbricas orales;
  - que las pruebas de inglés y la ruta nombren solo elementos que existen;
  - que `data/manifest.json` esté al día.
- **Comprobación de la migración (una vez)** — contra una copia del commit
  anterior:
  - el texto del banco quedó idéntico byte a byte (1.123 preguntas, mismos ids,
    mismas respuestas correctas, huella `-me5xnl`);
  - las 53 orales, los 60 ejercicios y 4 pruebas de inglés, y las 54
    estaciones quedaron iguales al compararlas en JSON estricto;
  - `construir.js` y los dos verificadores de citas dieron la misma salida;
  - el recorrido de 14 pantallas (`tests/pantallas.js`) dio el mismo HTML,
    estilos y distribución.

  En el recorrido hubo que dejar fuera dos cosas que no dependen del código: la
  fuente web, que en el navegador sin ventana a veces alcanza a cargar y a veces
  no, y la posición de las nubes, que se mueven con el tiempo.
- **Mutaciones comprobadas** — cada una de estas fallas se detecta:
  - una respuesta fuera de rango, una pregunta duplicada, un archivo que
    `index.html` deja de cargar, una pregunta DGAC en otra sección o un
    manifiesto atrasado fallan en la integridad de datos;
  - una parte cargada después de su `index.js` falla en la integridad de datos
    y en el navegador;
  - un `?v=` atrasado, una parte que queda suelta en `window` o
    `js/inicio.js` cargado antes que `js/ingles.js` fallan en ESTRUCTURA-01.
- **Herramientas** — `tools/buscar.js` encuentra por texto o id una pregunta,
  una oral, un ejercicio de inglés o una estación y da `archivo:línea`.
  `tools/manifest.js` reescribe el manifiesto. `tools/version.js` cambia la
  versión en todas partes. `tools/cargar_datos.js` carga los datos en Node
  igual que el navegador; también lo usan `construir.js` y los verificadores
  de citas de `Escritorio\APP`.

## Límite explícito de esta batería

Todo lo anterior prueba que el *motor de coincidencia de palabras/frases* se
comporta como se espera para casos conocidos. Ninguno de estos casos certifica
que el motor entendió el significado de una respuesta libre no anticipada —
esa es una limitación de diseño (detector de palabras/sinónimos, no
comprensión semántica), no un bug que esta batería pueda cubrir. Ver
propuesta pendiente sobre cómo presentar el puntaje oral al usuario a la luz
de este límite.
