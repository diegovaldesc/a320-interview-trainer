/* Inglés OACI · Alternativas (fraseología, números, lectura) · 32 elementos. data/english/index.js los reúne.
   Las fuentes (cite, src, refs) son internas: nunca se muestran. */
window.ENGLISH_PARTS=window.ENGLISH_PARTS||{};
window.ENGLISH_PARTS["mcq"]=[
 {
  "id": "en_q_01",
  "topic": "Palabras y frases estándar",
  "q": "What does the standard word ROGER mean?",
  "options": [
   "I have received all of your last transmission.",
   "I understand your message and will comply with it.",
   "Yes.",
   "Repeat all, or the following part, of your last transmission."
  ],
  "correct": 0,
  "expl": "ROGER solo confirma que recibiste toda la última transmisión. No significa «sí» (eso es AFFIRM), ni que cumplirás la instrucción (eso es WILCO), ni pide repetición (eso es SAY AGAIN).",
  "cite": "I have received all of your last transmission.",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_08",
  "topic": "Palabras y frases estándar",
  "q": "You did not hear the controller's last transmission and want it repeated. Which standard word do you use?",
  "options": [
   "SAY AGAIN",
   "READ BACK",
   "CONFIRM",
   "WORDS TWICE"
  ],
  "correct": 0,
  "expl": "SAY AGAIN = «repite todo, o la parte indicada, de tu última transmisión». READ BACK pide que te repitan exactamente lo recibido; CONFIRM pide verificar algo; WORDS TWICE se usa cuando la comunicación es difícil y se pide enviar cada palabra dos veces.",
  "cite": "Repeat all, or the following part, of your last transmission.",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_18",
  "topic": "Números y hora",
  "q": "In ICAO radiotelephony, how are the digits 3, 4, 5 and 9 pronounced?",
  "options": [
   "TREE, FOW-er, FIFE, NIN-er",
   "TREE, FOR, FIVE, NINE",
   "THREE, FOW-er, FIVE, NIN-er",
   "TREE, FOW-er, FIVE, NINE"
  ],
  "correct": 0,
  "expl": "Los dígitos 3, 4, 5 y 9 se dicen TREE, FOW-er, FIFE y NIN-er. Las sílabas en mayúscula son las que se acentúan; en FOW-er el acento principal va en la primera.",
  "cite": "3 TREE 4 FOW-er 5 FIFE 6 SIX 7 SEV-en 8 AIT 9 NIN-er",
  "src": "ICAO Doc 9432 · §2.4.1 · p. 2-3 (PDF 20)"
 },
 {
  "id": "en_q_25",
  "topic": "Técnica de transmisión",
  "q": "What is the maximum rate of speech recommended for radiotelephony transmissions?",
  "options": [
   "100 words per minute",
   "60 words per minute",
   "150 words per minute",
   "200 words per minute"
  ],
  "correct": 0,
  "expl": "Se recomienda un ritmo uniforme que no supere 100 palabras por minuto; si el receptor va a anotar el mensaje, conviene hablar un poco más despacio.",
  "cite": "maintain an even rate of speech not exceeding 100 words per minute.",
  "src": "ICAO Doc 9432 · §2.2.1 · p. 2-1 (PDF 18)"
 },
 {
  "id": "en_q_39",
  "topic": "Colación (read-back)",
  "q": "The controller says: “G-CD, hold short runway 24.” Which reply meets the read-back requirement?",
  "options": [
   "“Holding short runway 24, G-CD.”",
   "“Roger, G-CD.”",
   "“Affirm, G-CD.”",
   "“Standby, G-CD.”"
  ],
  "correct": 0,
  "expl": "Las instrucciones de mantener antes de una pista siempre se colacionan: repites la instrucción y terminas con tu indicativo («Holding short runway 24, G-CD»). ROGER, AFFIRM o STANDBY no sirven como colación.",
  "cite": "clearances and instructions to enter, land on, take off from, hold short of, cross and backtrack on any runway",
  "src": "ICAO Doc 9432 · §2.8.3.5 · p. 2-13 (PDF 30)"
 },
 {
  "id": "en_q_51",
  "topic": "Emergencias y falla de comunicaciones",
  "q": "What is the difference between distress and urgency?",
  "options": [
   "Distress: serious and/or imminent danger requiring immediate assistance. Urgency: a safety concern that does not require immediate assistance.",
   "Distress and urgency are the same; only the word changes.",
   "Urgency requires immediate assistance; distress does not.",
   "Distress applies only to aircraft; urgency only to vehicles."
  ],
  "correct": 0,
  "expl": "Distress (MAYDAY): amenaza de peligro grave o inminente que exige ayuda inmediata. Urgency (PAN PAN): condición de seguridad de una aeronave, vehículo o persona a bordo o a la vista, que no exige ayuda inmediata.",
  "cite": "Distress: a condition of being threatened by serious and/or imminent danger and of requiring immediate assistance. … Urgency: a condition concerning the safety of an aircraft or other vehicle, or of some person on board or within sight, but which does not require immediate assistance.",
  "src": "ICAO Doc 9432 · §9.1.2 · p. 9-1 (PDF 88)"
 },
 {
  "id": "en_q_62",
  "topic": "Aeródromo y despegue",
  "q": "What does a taxi instruction issued by a controller always contain?",
  "options": [
   "A clearance limit: the point at which the aircraft must stop until further permission is given.",
   "The QNH and the wind.",
   "A take-off clearance.",
   "The frequency of the next controller."
  ],
  "correct": 0,
  "expl": "Una instrucción de rodaje siempre incluye un límite de la autorización: el punto donde debes detenerte hasta recibir un nuevo permiso. En una salida suele ser el punto de espera de la pista en uso.",
  "cite": "Taxi instructions issued by a controller will always contain a clearance limit, which is the point at which the aircraft must stop until further permission to proceed is given.",
  "src": "ICAO Doc 9432 · §4.4.1 · p. 4-3 (PDF 41)"
 },
 {
  "id": "en_q_45",
  "topic": "Lenguaje claro",
  "q": "Plain language used in radiotelephony should be:",
  "options": [
   "Clear, concise and unambiguous.",
   "Formal and polite.",
   "Long and detailed.",
   "Informal and colloquial."
  ],
  "correct": 0,
  "expl": "Cuando no existe una frase estándar para la situación se usa lenguaje claro, con los mismos principios de la fraseología: claro, conciso e inequívoco. Además exige un buen dominio del idioma.",
  "cite": "communications should be clear, concise, and unambiguous.",
  "src": "ICAO Doc 9432 · Prólogo · p. iii (PDF 5)"
 },
 {
  "id": "en_q_06",
  "topic": "Palabras y frases estándar",
  "q": "What does WILCO stand for, and what does it mean?",
  "options": [
   "“Will comply”: I understand your message and will comply with it.",
   "“Will confirm”: I will verify the information and call you back.",
   "“Will call”: wait and I will call you.",
   "“Will correct”: an error has been made in this transmission."
  ],
  "correct": 0,
  "expl": "WILCO es la abreviatura de «will comply»: entendí tu mensaje y lo cumpliré. No reemplaza la colación cuando esta es obligatoria.",
  "cite": "I understand your message and will comply with it.",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-8 (PDF 25)"
 },
 {
  "id": "en_q_11",
  "topic": "Palabras y frases estándar",
  "q": "Which standard word asks the other station to reduce its rate of speech?",
  "options": [
   "SPEAK SLOWER",
   "SAY AGAIN",
   "WORDS TWICE",
   "DISREGARD"
  ],
  "correct": 0,
  "expl": "SPEAK SLOWER = «reduce tu velocidad al hablar». Se usa cuando oyes bien pero no alcanzas a seguir el ritmo (por ejemplo, para anotar).",
  "cite": "Reduce your rate of speech.",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_20",
  "topic": "Números y hora",
  "q": "How is an altitude of 3 400 feet transmitted?",
  "options": [
   "Three thousand four hundred",
   "Three four zero zero",
   "Thirty-four hundred",
   "Three point four thousand"
  ],
  "correct": 0,
  "expl": "En altitudes, alturas de nubes, visibilidad y RVR, los millares y centenas exactos se dicen dígito + THOUSAND / HUNDRED: 3 400 → «three thousand four hundred».",
  "cite": "shall be transmitted by pronouncing each digit in the number of hundreds or thousands followed by the word HUNDRED or THOUSAND as appropriate.",
  "src": "ICAO Doc 9432 · §2.4.3 · p. 2-4 (PDF 21)"
 },
 {
  "id": "en_q_29",
  "topic": "Indicativos y comunicaciones",
  "q": "When may an aircraft use its abbreviated call sign?",
  "options": [
   "Only after it has been addressed in that abbreviated form by the aeronautical station.",
   "As soon as the first contact is established.",
   "Whenever the pilot considers there is no risk of confusion.",
   "Only when flying VFR."
  ],
  "correct": 0,
  "expl": "La aeronave usa su indicativo abreviado solo después de que la estación aeronáutica se lo haya dirigido de esa manera.",
  "cite": "An aircraft shall use its abbreviated call sign only after it has been addressed in this manner by the aeronautical station.",
  "src": "ICAO Doc 9432 · §2.7.2.2.1 · p. 2-9 (PDF 26)"
 },
 {
  "id": "en_q_38",
  "topic": "Colación (read-back)",
  "q": "Which of the following shall ALWAYS be read back?",
  "options": [
   "Altimeter settings",
   "Wind direction and speed",
   "Time checks",
   "Traffic information"
  ],
  "correct": 0,
  "expl": "Siempre se colacionan: las rutas de ATC; las autorizaciones e instrucciones de entrar, aterrizar, despegar, mantener antes de, cruzar y retroceder (backtrack) en cualquier pista; y la pista en uso, los ajustes altimétricos, los códigos SSR, las instrucciones de nivel, rumbo y velocidad y los niveles de transición. El viento, la hora y la información de tránsito no están en esa lista.",
  "cite": "runway-in-use, altimeter settings, SSR codes, level instructions, heading and speed instructions",
  "src": "ICAO Doc 9432 · §2.8.3.5 · p. 2-13 (PDF 30)"
 },
 {
  "id": "en_q_55",
  "topic": "Emergencias y falla de comunicaciones",
  "q": "In a distress message, after the word MAYDAY (spoken three times), which element should come first?",
  "options": [
   "Name of the station addressed",
   "Nature of the distress condition",
   "Position, level and heading",
   "Intention of the person in command"
  ],
  "correct": 0,
  "expl": "El orden recomendado tras MAYDAY es: a) estación a la que se llama; b) identificación de la aeronave; c) naturaleza de la emergencia; d) intención del piloto al mando; e) posición, nivel y rumbo; f) cualquier otra información útil. Ejemplo: «MAYDAY MAYDAY MAYDAY WALDEN TOWER G-ABCD ENGINE ON FIRE…».",
  "cite": "if possible, in the order shown: … name of the station addressed",
  "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)"
 },
 {
  "id": "en_q_66",
  "topic": "Aeródromo y despegue",
  "q": "A pilot abandons the take-off. What should the pilot do?",
  "options": [
   "Inform the control tower as soon as practicable and request assistance or taxi instructions as required.",
   "Wait silently until the tower calls.",
   "Change to 121.5 MHz.",
   "Complete the after-take-off checklist before calling."
  ],
  "correct": 0,
  "expl": "Al abortar el despegue se informa a la torre lo antes posible y se pide ayuda o instrucciones de rodaje si hacen falta. Ejemplo: «FASTAIR 345 STOPPING» y luego «FASTAIR 345 REQUEST RETURN TO RAMP».",
  "cite": "When a pilot abandons the take-off manoeuvre, the control tower should be so informed as soon as practicable, and assistance or taxi instructions should be requested as required.",
  "src": "ICAO Doc 9432 · §4.5.12 · p. 4-9 (PDF 47)"
 },
 {
  "id": "en_q_72",
  "topic": "Meteorología y estado de pista",
  "q": "In what order are multiple RVR readings transmitted?",
  "options": [
   "Touchdown zone, mid-point zone, then roll-out/stop end zone.",
   "Stop end, mid-point, then touchdown zone.",
   "Mid-point, touchdown zone, then stop end.",
   "The lowest reading first."
  ],
  "correct": 0,
  "expl": "Cuando hay varias lecturas de RVR se transmiten siempre en este orden: zona de toma de contacto, punto medio y final de pista. Ejemplo: «RVR RUNWAY 27 TOUCHDOWN 650 METRES MIDPOINT 700 METRES STOP END 600 METRES».",
  "cite": "they are always transmitted commencing with the reading for the touchdown zone followed by the mid-point zone and ending with the roll-out/stop end zone report.",
  "src": "ICAO Doc 9432 · §10.2.2 · p. 10-2 (PDF 95)"
 },
 {
  "id": "en_q_05",
  "topic": "Palabras y frases estándar",
  "q": "The controller says “STANDBY”. What should you understand?",
  "options": [
   "Wait; the controller will call you. It is neither an approval nor a denial.",
   "Your request is approved.",
   "Your request is denied.",
   "Repeat your last transmission."
  ],
  "correct": 0,
  "expl": "STANDBY = «espera, yo te llamo». No es una aprobación ni una denegación; si la demora es larga, quien llamó normalmente restablece el contacto.",
  "cite": "STANDBY is not an approval or denial.",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_12",
  "topic": "Palabras y frases estándar",
  "q": "You made an error in your own transmission. Which word must you speak?",
  "options": [
   "CORRECTION",
   "DISREGARD",
   "CANCEL",
   "NEGATIVE"
  ],
  "correct": 0,
  "expl": "CORRECTION = «se cometió un error en esta transmisión; la versión correcta es…». El procedimiento es decir CORRECTION, repetir el último grupo o frase correcta y transmitir la versión correcta.",
  "cite": "An error has been made in this transmission (or message indicated).",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_22",
  "topic": "Números y hora",
  "q": "How is the VHF frequency 118.100 transmitted?",
  "options": [
   "One one eight decimal one",
   "One one eight decimal one zero zero",
   "One eighteen decimal one",
   "One one eight point zero zero one"
  ],
  "correct": 0,
  "expl": "118.100 → «ONE ONE EIGHT DECIMAL ONE». Si el quinto y el sexto dígito son ceros, solo se usan los cuatro primeros. Se dice DECIMAL, no «point».",
  "cite": "118.100 ONE ONE EIGHT DECIMAL ONE",
  "src": "ICAO Doc 9432 · §2.4.4 · p. 2-5 (PDF 22)"
 },
 {
  "id": "en_q_30",
  "topic": "Indicativos y comunicaciones",
  "q": "Where does an aircraft in the heavy wake turbulence category say the word HEAVY?",
  "options": [
   "Immediately after the call sign, in the initial contact with ATS units.",
   "Before the call sign, in every transmission.",
   "At the end of every transmission.",
   "Only when the controller asks for it."
  ],
  "correct": 0,
  "expl": "Las aeronaves de categoría de estela turbulenta pesada dicen HEAVY inmediatamente después del indicativo, en el contacto inicial con cada dependencia de tránsito aéreo (por ejemplo: «FASTAIR 345 HEAVY»).",
  "cite": "Aircraft in the heavy wake turbulence category shall include the word “HEAVY” immediately after the aircraft call sign in the initial contact between such aircraft and ATS units.",
  "src": "ICAO Doc 9432 · §2.7.2.4 · p. 2-9 (PDF 26)"
 },
 {
  "id": "en_q_44",
  "topic": "Colación (read-back)",
  "q": "You receive an instruction that you cannot comply with. What should you do?",
  "options": [
   "Say UNABLE and give the reasons.",
   "Say NEGATIVE and wait for a new instruction.",
   "Say STANDBY until you can comply.",
   "Say ROGER and comply as far as possible."
  ],
  "correct": 0,
  "expl": "Si recibes una instrucción que no puedes cumplir, dices UNABLE y das las razones. Ejemplo: «GEORGETOWN DEPARTURE UNABLE TO CROSS WICKEN FL 150 DUE WEIGHT, MAINTAINING FL 130 FASTAIR 345».",
  "cite": "that pilot should advise the controller using the phrase “UNABLE” and give the reasons.",
  "src": "ICAO Doc 9432 · §2.8.3.10 · p. 2-15 (PDF 32)"
 },
 {
  "id": "en_q_56",
  "topic": "Emergencias y falla de comunicaciones",
  "q": "Which SSR (transponder) code may an aircraft in distress activate?",
  "options": [
   "7700",
   "7600",
   "7500",
   "2000"
  ],
  "correct": 0,
  "expl": "La aeronave en emergencia puede activar el código SSR 7700 para hacer conocer su condición. El 7600 es el código de falla de radio.",
  "cite": "including the activation of the appropriate SSR code, 7700",
  "src": "ICAO Doc 9432 · §9.2.1.2 · p. 9-3 (PDF 90)"
 },
 {
  "id": "en_q_67",
  "topic": "Aeródromo y despegue",
  "q": "Which phrase must the pilot use when the pilot initiates a missed approach?",
  "options": [
   "GOING AROUND",
   "MISSED APPROACH REQUEST",
   "ABORTING LANDING",
   "GO AROUND CLEARED"
  ],
  "correct": 0,
  "expl": "Si el piloto inicia la aproximación frustrada usa la frase «GOING AROUND». Ejemplo: «GOING AROUND G-CD» → «G-CD ROGER REPORT DOWNWIND».",
  "cite": "In the event that the missed approach is initiated by the pilot, the phrase “GOING AROUND” shall be used.",
  "src": "ICAO Doc 9432 · §4.8.3 · p. 4-15 (PDF 53)"
 },
 {
  "id": "en_q_48",
  "topic": "Lenguaje claro",
  "q": "When should the word IMMEDIATELY be used?",
  "options": [
   "Only when immediate action is required for safety reasons.",
   "Whenever the controller is in a hurry.",
   "In every clearance to cross a runway.",
   "With every request for a frequency change."
  ],
  "correct": 0,
  "expl": "IMMEDIATELY se reserva para cuando se requiere acción inmediata por razones de seguridad. Ejemplo: «TAKE OFF IMMEDIATELY OR HOLD SHORT OF RUNWAY».",
  "cite": "The word “IMMEDIATELY” should only be used when immediate action is required for safety reasons.",
  "src": "ICAO Doc 9432 · §3.1.5 · p. 3-1 (PDF 34)"
 },
 {
  "id": "en_q_02",
  "topic": "Palabras y frases estándar",
  "q": "When must the word ROGER NOT be used?",
  "options": [
   "In reply to a question requiring READ BACK or a direct answer (AFFIRM or NEGATIVE).",
   "When the message contains numbers.",
   "When the controller uses your abbreviated call sign.",
   "When the transmission is a general broadcast to ALL STATIONS."
  ],
  "correct": 0,
  "expl": "ROGER no debe usarse bajo ninguna circunstancia para responder algo que exige colación (READ BACK) o una respuesta directa afirmativa (AFFIRM) o negativa (NEGATIVE). En esos casos hay que colacionar o decir AFFIRM / NEGATIVE.",
  "cite": "Under no circumstances to be used in reply to a question requiring “READ BACK” or a direct answer in the affirmative (AFFIRM) or negative (NEGATIVE).",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_10",
  "topic": "Palabras y frases estándar",
  "q": "What is the purpose of the word CONFIRM?",
  "options": [
   "To request verification of a clearance, instruction, action or information.",
   "To grant permission for a proposed action.",
   "To indicate the separation between portions of a message.",
   "To cancel a previously transmitted clearance."
  ],
  "correct": 0,
  "expl": "CONFIRM = «solicito verificación de: (autorización, instrucción, acción, información)». Pedir verificación no es lo mismo que pedir repetición (SAY AGAIN).",
  "cite": "I request verification of: (clearance, instruction, action, information).",
  "src": "ICAO Doc 9432 · §2.6 · p. 2-7 (PDF 24)"
 },
 {
  "id": "en_q_21",
  "topic": "Números y hora",
  "q": "How is an altitude of 12 000 feet transmitted?",
  "options": [
   "One two thousand",
   "Twelve thousand",
   "One two zero zero zero",
   "One thousand two hundred"
  ],
  "correct": 0,
  "expl": "12 000 se transmite «one two thousand»: cada dígito de los millares por separado, seguido de THOUSAND.",
  "cite": "12 000 one two thousand",
  "src": "ICAO Doc 9432 · §2.4.3 · p. 2-4 (PDF 21)"
 },
 {
  "id": "en_q_33",
  "topic": "Indicativos y comunicaciones",
  "q": "What is the correct procedure when you make an error in a transmission?",
  "options": [
   "Say CORRECTION, repeat the last correct group or phrase, then transmit the correct version.",
   "Say DISREGARD and start the whole message again.",
   "Say SAY AGAIN and wait for the controller.",
   "Say NEGATIVE and repeat only the wrong item."
  ],
  "correct": 0,
  "expl": "El procedimiento es decir CORRECTION, repetir el último grupo o frase correcta y transmitir la versión correcta. Ejemplo: «FASTAIR 345 WICKEN 47 FL 330 MARLO 07 CORRECTION MARLO 57».",
  "cite": "the word “CORRECTION” shall be spoken, the last correct group or phrase repeated and then the correct version transmitted.",
  "src": "ICAO Doc 9432 · §2.8.1.6 · p. 2-11 (PDF 28)"
 },
 {
  "id": "en_q_41",
  "topic": "Colación (read-back)",
  "q": "A pilot reads back “QNH 1013” but the controller had said “QNH 1003”. What does the controller transmit?",
  "options": [
   "“NEGATIVE I SAY AGAIN” followed by the correct version.",
   "“ROGER”, and the pilot corrects it later.",
   "“CANCEL” followed by the correct version.",
   "“DISREGARD” and a new clearance."
  ],
  "correct": 0,
  "expl": "Si la colación es incorrecta, el controlador dice «NEGATIVE I SAY AGAIN» seguido de la versión correcta, y tú colacionas de nuevo. Ejemplo: «G-CD NEGATIVE I SAY AGAIN, QNH 1003» → «QNH 1003 G-CD».",
  "cite": "the controller shall transmit the word “NEGATIVE I SAY AGAIN” followed by the correct version.",
  "src": "ICAO Doc 9432 · §2.8.3.9 · p. 2-14 (PDF 31)"
 },
 {
  "id": "en_q_53",
  "topic": "Emergencias y falla de comunicaciones",
  "q": "How many times should MAYDAY or PAN PAN preferably be spoken at the start of the initial call?",
  "options": [
   "Three times",
   "Once",
   "Twice",
   "Four times"
  ],
  "correct": 0,
  "expl": "MAYDAY o PAN PAN se dice preferentemente tres veces al inicio de la llamada inicial. Ejemplo: «MAYDAY MAYDAY MAYDAY WALDEN TOWER G-ABCD…».",
  "cite": "should preferably be spoken three times at the start of the initial distress or urgency call.",
  "src": "ICAO Doc 9432 · §9.1.3 · p. 9-1 (PDF 88)"
 },
 {
  "id": "en_q_65",
  "topic": "Aeródromo y despegue",
  "q": "During the take-off roll a controller needs the aircraft to stop. What should the instruction be?",
  "options": [
   "To stop immediately, with the instruction and the call sign repeated.",
   "To hold position, said once.",
   "To go around.",
   "To vacate the runway to the left."
  ],
  "correct": 0,
  "expl": "Si durante la carrera de despegue hay que detener la aeronave, se le ordena parar de inmediato y se repiten la instrucción y el indicativo. Ejemplo: «FASTAIR 345 STOP IMMEDIATELY FASTAIR 345 STOP IMMEDIATELY» → «STOPPING FASTAIR 345».",
  "cite": "the aircraft should be instructed to stop immediately and the instruction and call sign repeated.",
  "src": "ICAO Doc 9432 · §4.5.11 · p. 4-9 (PDF 47)"
 },
 {
  "id": "en_q_73",
  "topic": "Meteorología y estado de pista",
  "q": "Which terms are used to inform aircraft about the amount of water on a runway?",
  "options": [
   "DAMP, WET, WATER PATCHES or FLOODED",
   "DAMP, SLIPPERY, ICY or FLOODED",
   "WET, SOFT, HARD or FLOODED",
   "MOIST, WET, PUDDLED or DEEP"
  ],
  "correct": 0,
  "expl": "Según la cantidad de agua que haya en la pista se usan los términos DAMP, WET, WATER PATCHES o FLOODED.",
  "cite": "the terms “DAMP”, “WET”, “WATER PATCHES” or “FLOODED” according to the amount of water present.",
  "src": "ICAO Doc 9432 · §10.3.3 · p. 10-2 (PDF 95)"
 }
];
