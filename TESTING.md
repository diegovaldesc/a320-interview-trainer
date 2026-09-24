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

`tests/run.ps1` arma una copia temporal de `index.html` con `tests/suite.js`
al final y la abre en Chrome o Edge sin ventana (no necesita Node ni instalar
nada). Los casos corren dentro de la propia app, con acceso a sus funciones y
a su estado real. Termina en ~2 s con `OK 66/66 casos...` (código 0) o con la
lista de casos que fallan y su mensaje (código 1). La app publicada no se
modifica.

Está comprobado que detecta regresiones: rompiendo a propósito siete de los
arreglos de abajo, falló en los casos correspondientes. Ejecútala **antes de
cada commit** que toque `index.html`, y agrega un caso a `tests/suite.js`
por cada bug nuevo (con el ID del hallazgo en el nombre).

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

- Las 23 preguntas de `ORAL_VOICE_BANK` deben puntuar ≥9.5/10 contra su propio
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

## 10. Inglés OACI: 4 pruebas al azar (sección nueva)

La sección es una sola **prueba** que reúne los cuatro tipos de ejercicio, y al
entrar te toca una al azar (1 de 4, luego 1 de las 3 que faltan, etc.). Cada
prueba trae **12 alternativas, 4 audios (2 ATIS y 2 autorizaciones de ATC),
2 imágenes para describir y 1 role-play de 3 turnos con ATC**, en ese orden.

- **Banco y reparto** — 74 alternativas (48 repartidas en las pruebas, por
  tema, y 26 de reserva para pruebas nuevas), 8 imágenes, 16 audios (5 + 3
  ATIS nuevos = 8 ATIS y 8 autorizaciones), 4 role-plays y 17 respuestas
  orales de reserva. `bankIntegrity()` no reporta incidencias
  (`englishIssues`); solo las 48 alternativas asignadas entran al banco
  (búsqueda y guardadas), cada una con fuente (`ICAO Doc 9432 · …`), cita y
  explicación; ningún ejercicio está en dos pruebas. Las alternativas no
  cuentan como preguntas FCOM (`totalQuestions()` sigue en 415) ni entran en la
  precisión ni en «Mis errores» del inicio.
- **`englishIntegrity()`** detecta un dato clave mal formado, un tipo de audio
  inválido, un id repetido, un modelo vacío, una alternativa o un role-play
  que no existe, la misma alternativa en dos pruebas, un turno de role-play que
  responde a ATC sin audio, un turno sin cita y un banco sin pruebas.
- **El sorteo** — al entrar (`openEnglish` → `enAssign`) se asigna una prueba
  pendiente al azar y se guarda: al volver a entrar no se sortea de nuevo; al
  terminarla te toca una de las que faltan; al terminar las 4 aparece
  «Completaste las 4 pruebas» con «Empezar otra vuelta» (`enStartNewRound`), cuyo
  primer sorteo no repite la última que hiciste. Con `Math.random` real, 300
  sorteos sacan las 4 pruebas.
- **Flujo de una prueba** — alternativas (motor de preguntas de siempre, con
  explicación y cita, encabezado `PRUEBA n · PARTE 1 DE 4`) → menú → audios →
  menú → imágenes → menú → role-play → prueba completada. Cada parte que se
  termina se guarda (`current.part`); las alternativas dejan un dato objetivo
  (`c` de `t` correctas), nunca una nota. Salir a mitad de una parte la
  reinicia pero conserva las partes terminadas y la prueba asignada; las
  alternativas de una prueba no se guardan como sesión suelta
  (`appState.resume` sigue en `null`).
- **Estado guardado** — `sanitizeState` limpia el mapa `english` (valoración
  0/1/2, intentos, fecha) y `englishTests` (pruebas hechas: enteros 1–99 sin
  repetir; prueba en curso que no esté ya hecha; parte 0–3; aciertos ≤ total;
  vuelta y última); un respaldo antiguo sin esos campos sigue siendo válido y con
  el tipo equivocado se rechaza; ida y vuelta por `JSON`.
- **Inicio** — la tarjeta dice «4 pruebas al azar…» y, cuando hay, «N de 4
  hechas».
- **Sin nota, nunca** — en ninguna parte existe `.oral-score`, `.oral-grade` ni
  `.score-circle`. El autoexamen (Repetir / Casi / Bien) solo se guarda como
  avance.
- **Imágenes** — las 2 fotos de la prueba; el título y el tema de la foto no se
  ven antes de describirla (darían vocabulario hecho) y aparecen al revelar el
  modelo.
- **Role-play** — 3 turnos por escenario (falla de motor después de V1, antes de
  V1, pasajero con un problema de salud y pérdida de presión). La situación
  siempre está a la vista; el primer turno no tiene audio; los siguientes traen
  audio de ATC (con el texto oculto hasta pedirlo) y «Hasta ahora» con lo que ya
  pasó. Cada modelo lleva el indicativo, y cada turno trae 1–2 citas
  (`ICAO Doc 9432`, `FCTM` o `FCOM`) con página PDF.
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
- **Accesibilidad** — el botón de comenzar, «Salir», el botón de escuchar, el de
  grabar, el cuadro de apuntes, las alternativas de la prueba, los botones ▶ del
  modelo, las casillas de autoevaluación y los botones Repetir/Casi/Bien miden
  ≥44 px.

**Comprobación de las citas (fuera de esta batería).** Cada `cite` de las
alternativas, de los audios y de los turnos de role-play se comprobó
textualmente contra la página PDF indicada de su fuente (*ICAO Doc 9432*,
*FCTM* 25 NOV 24 o *FCOM* 15 SEP 25, versiones .md de la carpeta APP), con la
misma normalización que `buscar.ps1 -Frase`; los diálogos de dos columnas
(piloto/controlador) y las tablas del Doc 9432 se leyeron además en la imagen
de la página. Esa comprobación necesita esos manuales en `Desktop\APP` y por
eso no forma parte de `run.ps1`; si se edita el texto de una cita, hay que
repetirla con
`node C:\Users\yodie\Desktop\APP\MD\_herramientas\verificar_citas_ingles.js`
(lee el bloque `english-data` de `index.html`; en la última corrida: 134 tramos
de cita comprobados, 0 problemas). Lo que **no** viene de un manual (los turnos
de ATC de los role-plays y el formato de los ATIS) es composición de práctica y
así se indica en cada ejercicio.

**Prueba de mutación (una vez, al armar las 4 pruebas).** Se rompieron a
propósito ocho piezas (el sorteo que se repite al volver a entrar, las
alternativas de la prueba guardadas como sesión suelta, las voces de novedad, la
velocidad, el avance de una parte a la siguiente, el título de la foto visible,
la voz que se vuelve a sortear al repetir y la vuelta nueva que repite la
última prueba) y la batería falló en cada caso.

## Límite explícito de esta batería

Todo lo anterior prueba que el *motor de coincidencia de palabras/frases* se
comporta como se espera para casos conocidos. Ninguno de estos casos certifica
que el motor entendió el significado de una respuesta libre no anticipada —
esa es una limitación de diseño (detector de palabras/sinónimos, no
comprensión semántica), no un bug que esta batería pueda cubrir. Ver
propuesta pendiente sobre cómo presentar el puntaje oral al usuario a la luz
de este límite.
