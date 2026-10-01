/* Banco de Inglés OACI (alternativas, audios, imágenes, role-plays y pruebas), en JSON.
   Mismas reglas que data/banco.js: sin comillas invertidas ni un signo $ seguido de una llave. */
window.ENGLISH_DATA_JSON=String.raw`
{
 "version": "2026.09.24-v3",
 "mcq": [
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
 ],
 "images": [
  {
   "id": "en_img_01",
   "file": "assets/ingles/takeoff-excursion-snow.jpg",
   "alt": "Un Boeing 737 tendido sobre un terreno con nieve; un motor está en el suelo junto al ala y la puerta delantera izquierda está abierta con una escalera.",
   "title": "An airliner off the runway in the snow",
   "topic": "Salida de pista · nieve",
   "prompts": [
    "Describe what you can see in the picture.",
    "What do you think happened to this aircraft?",
    "How do you think the people on board left the aircraft?",
    "What should the airport do now?"
   ],
   "seen": [
    "A Boeing 737 airliner is lying on flat, open ground.",
    "The ground is covered with a thin layer of snow and dry grass.",
    "The aircraft is very low to the ground, and its landing gear is not visible.",
    "One engine is on the ground next to the wing, and it seems to be separated from the wing.",
    "The front door on the left side is open, and there is a ladder next to it.",
    "The rear part of the fuselage looks damaged.",
    "The sky is blue with a few thin clouds."
   ],
   "might": [
    "The aircraft may have left the runway during take-off or landing.",
    "The landing gear might have collapsed or broken off.",
    "The people on board could have left through the open door.",
    "Emergency services and investigators must have been called."
   ],
   "context": "Es el vuelo 1404 de Continental Airlines, un Boeing 737-500: el 20-dic-2008 se salió por un costado de la pista 34R durante el despegue en Denver.",
   "model": "In this picture I can see a Boeing 737 lying in an open field covered with a little snow. The aircraft is very low to the ground, so the landing gear has probably collapsed or broken off. One of the engines is on the ground next to the wing, and the rear part of the fuselage looks damaged. The front door on the left side is open, and there is a ladder beside it. The sky is blue and there are no other vehicles in the picture. I think the aircraft left the runway during take-off or landing and stopped in the field. The people on board may have left through the open door. Now emergency services and investigators would need to secure the area.",
   "vocab": [
    {
     "en": "runway excursion",
     "es": "salida de pista"
    },
    {
     "en": "to veer off",
     "es": "salirse (por un costado)"
    },
    {
     "en": "landing gear",
     "es": "tren de aterrizaje"
    },
    {
     "en": "to collapse",
     "es": "colapsar"
    },
    {
     "en": "fuselage",
     "es": "fuselaje"
    },
    {
     "en": "engine",
     "es": "motor"
    },
    {
     "en": "wing",
     "es": "ala"
    },
    {
     "en": "ladder",
     "es": "escalera"
    },
    {
     "en": "thin layer of snow",
     "es": "capa fina de nieve"
    },
    {
     "en": "to be damaged",
     "es": "estar dañado"
    },
    {
     "en": "emergency services",
     "es": "servicios de emergencia"
    }
   ],
   "points": [
    "Dije dónde está el avión y cómo está (cerca del suelo, sobre nieve).",
    "Nombré al menos cinco cosas que se ven (motor, fuselaje, puerta, escalera, nieve…).",
    "Separé lo que se ve de lo que supongo (may / might / could + have + participio).",
    "Usé presente continuo o «there is / there are» para describir.",
    "Terminé con lo que debería pasar ahora (servicios de emergencia, investigación)."
   ],
   "credit": {
    "text": "NTSB · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Continental_Airlines_Flight_1404_wreckage.jpg"
   }
  },
  {
   "id": "en_img_02",
   "file": "assets/ingles/takeoff-excursion-grass.jpg",
   "alt": "Un MD-83 blanco sobre el pasto, con la nariz cerca del suelo, una escalera junto a la puerta delantera y camiones al fondo.",
   "title": "An aircraft on the grass with vehicles around it",
   "topic": "Despegue abortado · pasto",
   "prompts": [
    "Describe the scene.",
    "Which vehicles can you see, and what could they be doing?",
    "What might have happened before this picture was taken?",
    "What information would the tower need from the crew?"
   ],
   "seen": [
    "A white jet with its engines at the rear is standing on dry grass.",
    "The nose is very close to the ground.",
    "There is a stepladder against the fuselage, below the front door.",
    "Behind the wing there are several vehicles: white trucks and what looks like a tanker truck.",
    "There is a truck with a boom near the tail.",
    "A person in a high-visibility vest is standing near the left wing.",
    "A red hose and some equipment are lying on the grass.",
    "It is a sunny day, with blue sky and scattered clouds."
   ],
   "might": [
    "The aircraft may have rejected the take-off and run off the runway.",
    "The trucks could be there to remove the fuel or to move the aircraft.",
    "The crew and the passengers might have left the aircraft through the front door.",
    "The airport probably closed the runway while the aircraft was recovered."
   ],
   "context": "Vuelo 9363 de Ameristar Charters, un MD-83: tuvo una salida de pista tras abortar el despegue en la pista 23L del aeropuerto Detroit-Willow Run (Michigan), el 8-mar-2017.",
   "model": "This picture shows a white jet standing on dry grass. Its nose is very close to the ground, and there is a ladder against the fuselage under the front door. Behind the wing I can see several trucks, including what looks like a tanker, and a truck with a boom near the tail. A worker in a high-visibility vest is standing near the wing. It is a sunny day. I think the aircraft rejected its take-off and ran off the runway. The trucks might be there to remove the fuel and to move the aircraft. Before this, the crew probably stopped the aircraft and evacuated the people on board.",
   "vocab": [
    {
     "en": "rejected (aborted) take-off",
     "es": "despegue rechazado (abortado)"
    },
    {
     "en": "to run off the runway",
     "es": "salirse de la pista"
    },
    {
     "en": "grass",
     "es": "pasto"
    },
    {
     "en": "nose",
     "es": "nariz"
    },
    {
     "en": "stepladder",
     "es": "escalera de mano"
    },
    {
     "en": "tanker truck",
     "es": "camión cisterna"
    },
    {
     "en": "boom",
     "es": "brazo (de una grúa o camión)"
    },
    {
     "en": "high-visibility vest",
     "es": "chaleco reflectante"
    },
    {
     "en": "hose",
     "es": "manguera"
    },
    {
     "en": "to defuel",
     "es": "descargar combustible"
    },
    {
     "en": "to evacuate",
     "es": "evacuar"
    }
   ],
   "radio": {
    "intro": "Cuando el piloto aborta el despegue, este es el modelo de radio:",
    "lines": [
     "Fastair three four five, stopping.",
     "Fastair three four five, request return to ramp."
    ],
    "ref": "ICAO Doc 9432 · §4.5.12 · p. 4-9 (PDF 47)"
   },
   "points": [
    "Describí el entorno (pasto seco, día soleado) y la posición del avión.",
    "Nombré vehículos y personas y lo que podrían estar haciendo.",
    "Usé «could / might / must have» para lo que pudo pasar antes.",
    "Usé preposiciones de lugar (behind the wing, near the tail, below the door).",
    "Sé decir por radio que aborto el despegue y pido volver a la plataforma."
   ],
   "credit": {
    "text": "NTSB · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Ameristar_Jet_Charter_Flight_9363_after_accident6.jpg"
   }
  },
  {
   "id": "en_img_03",
   "file": "assets/ingles/takeoff-overrun-ditch.jpg",
   "alt": "Un Tupolev Tu-154 de Aeroflot al borde de una zanja de tierra removida; a la izquierda un carro bomba rojo y personas con overoles naranjos.",
   "title": "A Tupolev airliner at the edge of a ditch",
   "topic": "Despegue rechazado · zanja",
   "prompts": [
    "Describe the aircraft and the ground around it.",
    "Who is helping, and what are they wearing?",
    "What could have caused this?",
    "Why is a fire truck standing by?"
   ],
   "seen": [
    "A Tupolev airliner with Aeroflot markings is standing at the edge of a deep ditch.",
    "The registration CCCP-85067 is written on the rear fuselage.",
    "The ground in front is dark, dug-up earth, and there are pieces of debris on it.",
    "There are some orange round objects on short posts in the foreground.",
    "The front part of the aircraft looks damaged.",
    "A red fire truck is parked on the left, and several people in orange overalls are standing near it and near the tail.",
    "A yellow utility vehicle is near the front of the aircraft.",
    "The sky is hazy."
   ],
   "might": [
    "The aircraft may have failed to get airborne and run past the end of the runway.",
    "The crew might have rejected the take-off too late.",
    "The fire truck is probably there in case of a fuel leak or a fire.",
    "The people in orange overalls could be rescue workers or ground crew."
   ],
   "context": "Tu-154S CCCP-85067 de Aeroflot, aeropuerto internacional Roberts (Monrovia, Liberia), 13-ene-1989: no logró despegar, se rechazó el despegue, se pasó del final de la pista 04 y quedó en una zanja. Los informes indican que iba sobrecargado y que la carga mal asegurada se movió (centro de gravedad fuera del límite delantero); no hubo fallecidos.",
   "model": "This photo shows a Tupolev airliner with Aeroflot markings, standing at the edge of a deep ditch. The ground in the foreground is dark, dug-up earth with pieces of debris and orange round objects on short posts. The front part of the aircraft looks damaged. On the left there is a red fire truck, and several people in orange overalls are standing near it and near the tail. A yellow vehicle is parked at the front of the aircraft. The sky is hazy. I think the aircraft did not get airborne and ran off the end of the runway into the ditch. The fire truck is probably standing by in case there is a fuel leak or a fire.",
   "vocab": [
    {
     "en": "ditch",
     "es": "zanja"
    },
    {
     "en": "to overrun the runway",
     "es": "salirse por el final de la pista"
    },
    {
     "en": "to fail to get airborne",
     "es": "no lograr despegar"
    },
    {
     "en": "debris",
     "es": "restos, escombros"
    },
    {
     "en": "fire truck",
     "es": "carro bomba"
    },
    {
     "en": "overalls",
     "es": "overol"
    },
    {
     "en": "utility vehicle",
     "es": "vehículo utilitario"
    },
    {
     "en": "to stand by",
     "es": "estar listo / en espera"
    },
    {
     "en": "fuel leak",
     "es": "fuga de combustible"
    },
    {
     "en": "overloaded",
     "es": "sobrecargado"
    },
    {
     "en": "cargo",
     "es": "carga"
    },
    {
     "en": "centre of gravity",
     "es": "centro de gravedad"
    }
   ],
   "points": [
    "Describí la aeronave y el terreno (zanja, tierra removida, restos).",
    "Nombré a las personas y vehículos y su ropa (overoles naranjos, carro bomba).",
    "Expliqué por qué está el carro bomba con un modal de posibilidad (probably, may).",
    "Diferencié lo que veo (registro, marcas, daños) de la causa que supongo.",
    "Usé al menos tres palabras de vocabulario nuevas (ditch, debris, overrun…)."
   ],
   "credit": {
    "text": "Departamento de Defensa de EE. UU. (según Commons) · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Aeroflot_Tupolev_Tu-154_CCCP-85067_after_runway_excursion.jpg"
   }
  },
  {
   "id": "en_img_04",
   "file": "assets/ingles/landing-overrun-snow.jpg",
   "alt": "Un Embraer 170 detenido en la nieve detrás de una cerca perimetral; a la izquierda dos personas con trajes protectores blancos y al fondo carros bomba amarillos.",
   "title": "An aircraft stopped in the snow behind a fence",
   "topic": "Aterrizaje · sobrepaso de pista · nieve",
   "prompts": [
    "Describe the aircraft and its position.",
    "Who are the people and vehicles in the picture?",
    "How could the weather have contributed to this event?",
    "What information about runway conditions should pilots receive?"
   ],
   "seen": [
    "A regional jet with a red and blue tail is standing in deep snow.",
    "There is a green chain-link fence between the camera and the aircraft.",
    "The nose is close to the ground.",
    "On the left, two people in white protective suits are standing next to the aircraft.",
    "On the right, behind the fence, there are yellow airport fire trucks.",
    "There is a dark patch on the snow in the foreground.",
    "The sky is grey and overcast."
   ],
   "might": [
    "The aircraft may have landed on a snowy or icy runway and could not stop before the end.",
    "Braking action might have been poor because of snow or ice.",
    "The fence could show that the aircraft has reached the airport boundary.",
    "The fire trucks are there in case of fire and to help the people on board."
   ],
   "context": "Embraer 170 de Shuttle America (matrícula N862RW) tras sobrepasar el final de la pista, el 18-feb-2007.",
   "model": "In this picture I can see a regional jet stopped in deep snow. It has a red and blue tail. There is a green chain-link fence between the camera and the aircraft, and the nose is close to the ground. On the left, two people in white protective suits are standing next to the aircraft. On the right, behind the fence, I can see yellow airport fire trucks. The sky is grey. I think the aircraft overran the runway while landing, maybe because the runway was covered with snow or ice and the braking action was poor. The fire trucks are there to help the people on board and to prevent a fire.",
   "vocab": [
    {
     "en": "regional jet",
     "es": "jet regional"
    },
    {
     "en": "chain-link fence",
     "es": "cerca de malla metálica"
    },
    {
     "en": "perimeter fence",
     "es": "cerca perimetral"
    },
    {
     "en": "deep snow",
     "es": "nieve profunda"
    },
    {
     "en": "overcast",
     "es": "nublado, cubierto"
    },
    {
     "en": "protective suit",
     "es": "traje protector"
    },
    {
     "en": "fire truck (crash tender)",
     "es": "carro bomba (vehículo de rescate)"
    },
    {
     "en": "braking action",
     "es": "eficacia de frenado"
    },
    {
     "en": "icy",
     "es": "con hielo"
    },
    {
     "en": "slush",
     "es": "nieve derretida"
    },
    {
     "en": "airport boundary",
     "es": "límite del aeropuerto"
    }
   ],
   "radio": {
    "intro": "Así se informa el estado de la pista al tránsito:",
    "lines": [
     "Runway conditions zero nine: available width three two metres, covered with thin patches of ice, braking action poor."
    ],
    "ref": "ICAO Doc 9432 · §4.10 · p. 4-16 (PDF 54)"
   },
   "points": [
    "Describí la posición del avión respecto a la cerca y la nieve.",
    "Nombré a las personas, los vehículos y lo que probablemente hacen.",
    "Relacioné el clima (nieve, hielo) con la eficacia de frenado.",
    "Usé «may / might / probably» para las causas posibles.",
    "Conozco la frase de radio para informar condiciones de pista."
   ],
   "credit": {
    "text": "NTSB · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Shuttle_America_N862RW_after_overrun.jpg"
   }
  },
  {
   "id": "en_img_05",
   "file": "assets/ingles/arff-response.jpg",
   "alt": "Dos bomberos con trajes plateados y equipos de aire dirigen un chorro de agua hacia un avión OV-10 de dos botalones que quedó inclinado sobre el pasto.",
   "title": "Firefighters at work beside a damaged aircraft",
   "topic": "Respuesta de emergencia · rescate y extinción",
   "prompts": [
    "Describe what the firefighters are doing.",
    "What special equipment are they wearing, and why?",
    "What do you think happened to the aircraft?",
    "What are the priorities of the rescue team in the first minutes?"
   ],
   "seen": [
    "Two firefighters wearing silver protective suits and breathing apparatus are spraying water or foam from a hose.",
    "The spray is directed at the fuselage of a small twin-boom propeller aircraft.",
    "The aircraft is leaning to one side on the grass.",
    "There is a lot of white mist around the aircraft.",
    "On the right, several other rescuers wear orange overalls and yellow jackets.",
    "The grass is green and the sky is blue with a few clouds."
   ],
   "might": [
    "The aircraft may have swerved off the runway during the landing.",
    "The firefighters are probably cooling the aircraft to prevent a fire.",
    "The crew might have been rescued already.",
    "The aircraft could be leaking fuel, which is a fire risk."
   ],
   "context": "Un OV-10 Bronco de la Fuerza Aérea de Filipinas se salió de la pista al aterrizar en la base aérea de Clark, el 24-oct-2006. En la foto, un equipo ARFF (Aircraft rescue and firefighting) del Cuerpo de Marines de EE. UU. responde.",
   "model": "In this picture two firefighters are spraying water or foam onto a small twin-boom military aircraft. They are wearing silver protective suits and breathing apparatus, because they may have to work close to fire and heat. The aircraft is leaning to one side on the grass, and there is a lot of white mist around it. On the right, other rescuers in orange overalls and yellow jackets are waiting. The sky is blue. I think the aircraft swerved off the runway when it was landing. The crew is probably cooling the aircraft to prevent a fire. Their priorities are to save lives, to control any fire or fuel leak, and to keep the area safe.",
   "vocab": [
    {
     "en": "firefighter",
     "es": "bombero"
    },
    {
     "en": "protective (proximity) suit",
     "es": "traje de proximidad"
    },
    {
     "en": "breathing apparatus",
     "es": "equipo de respiración autónomo"
    },
    {
     "en": "hose",
     "es": "manguera"
    },
    {
     "en": "foam",
     "es": "espuma"
    },
    {
     "en": "mist",
     "es": "neblina, rocío"
    },
    {
     "en": "to spray",
     "es": "rociar"
    },
    {
     "en": "twin-boom",
     "es": "de doble botalón"
    },
    {
     "en": "propeller",
     "es": "hélice"
    },
    {
     "en": "to swerve off the runway",
     "es": "desviarse bruscamente y salir de la pista"
    },
    {
     "en": "rescue team",
     "es": "equipo de rescate"
    },
    {
     "en": "to cool down",
     "es": "enfriar"
    }
   ],
   "points": [
    "Describí qué hacen los bomberos con verbos en presente continuo (are spraying, are wearing).",
    "Nombré el equipo de protección y expliqué para qué sirve.",
    "Dije qué pudo pasar con el avión usando may / might / probably.",
    "Mencioné prioridades del rescate (salvar vidas, controlar fuego y fugas, asegurar la zona).",
    "Usé vocabulario de rescate (firefighter, hose, foam, rescue team)."
   ],
   "credit": {
    "text": "Cuerpo de Marines de EE. UU. · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:OV-10A_PhilAF_crash_2006.jpeg"
   }
  },
  {
   "id": "en_img_06",
   "file": "assets/ingles/nose-gear-collapse.jpg",
   "alt": "Un Boeing 737 azul apoyado sobre la nariz junto a la pista, con un tobogán de evacuación desplegado y personal con chalecos reflectantes cerca del ala.",
   "title": "An airliner with its nose on the ground",
   "topic": "Tren de nariz colapsado · evacuación",
   "prompts": [
    "Describe the aircraft and what you notice about its nose.",
    "What is on the ground near the doors, and what is it used for?",
    "What do you think the crew did?",
    "What would the tower need to know?"
   ],
   "seen": [
    "A blue Boeing 737 is standing on the grass next to the runway.",
    "The nose is on the ground, so the nose landing gear is not holding the aircraft up.",
    "An evacuation slide is deployed at the front door.",
    "Another slide is visible near the wing.",
    "A few people in high-visibility vests are standing near the wing.",
    "The word “Southwest” is written on the tail.",
    "The sky is grey and cloudy, and there are airport buildings in the background."
   ],
   "might": [
    "The aircraft may have landed hard on its nose gear.",
    "The passengers might have used the slides to evacuate.",
    "The crew could have declared an emergency before landing.",
    "The runway might have been closed for a while."
   ],
   "context": "Vuelo 345 de Southwest, Boeing 737-700, aeropuerto LaGuardia (Nueva York), 22-jul-2013: aterrizó sobre el tren de nariz, que se colapsó; el avión quedó al costado de la pista 4. Hubo 9 heridos a bordo.",
   "model": "This picture shows a blue Boeing 737 standing on the grass beside a runway. The nose of the aircraft is on the ground, which means the nose landing gear has collapsed. An evacuation slide is deployed at the front door, and I can see another slide near the wing. A few people in high-visibility vests are standing near the wing. The sky is grey and cloudy, and there are airport buildings in the background. I think the aircraft landed hard on its nose gear, and the passengers probably left the aircraft using the slides. The airport would have to close the runway and send rescue vehicles.",
   "vocab": [
    {
     "en": "nose gear collapse",
     "es": "colapso del tren de nariz"
    },
    {
     "en": "evacuation slide",
     "es": "tobogán de evacuación"
    },
    {
     "en": "emergency exit",
     "es": "salida de emergencia"
    },
    {
     "en": "to evacuate",
     "es": "evacuar"
    },
    {
     "en": "to land hard",
     "es": "aterrizar con fuerza"
    },
    {
     "en": "to deploy",
     "es": "desplegar"
    },
    {
     "en": "high-visibility vest",
     "es": "chaleco reflectante"
    },
    {
     "en": "rescue vehicles",
     "es": "vehículos de rescate"
    },
    {
     "en": "runway closure",
     "es": "cierre de pista"
    },
    {
     "en": "grass",
     "es": "pasto"
    }
   ],
   "radio": {
    "intro": "Al detenerse fuera de la pista, el piloto podría empezar así una llamada de socorro (orden: estación llamada, indicativo, naturaleza, intención y posición):",
    "lines": [
     "Mayday, mayday, mayday, LaGuardia Tower, Fastair three four five, nose gear collapsed, evacuating on the runway."
    ],
    "ref": "Ejemplo propio con la estructura de ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)"
   },
   "points": [
    "Noté que la nariz está en el suelo y lo relacioné con el tren de nariz.",
    "Nombré los toboganes y expliqué para qué sirven.",
    "Dije qué pudo hacer la tripulación (declarar emergencia, evacuar).",
    "Separé lo que se ve de lo que supongo.",
    "Sé la estructura de una llamada MAYDAY (quién llama, qué pasa, qué pretende)."
   ],
   "credit": {
    "text": "NTSB · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Southwest_Flight_345_after_nose-first_crash_landing_on_RWY_4_at_LaGuardia_22_July_2013.jpg"
   }
  },
  {
   "id": "en_img_07",
   "file": "assets/ingles/deicing.jpg",
   "alt": "Un Boeing 737 rodeado de niebla y vapor mientras un camión de deshielo con brazo y cesta lo rocía; a los lados hay una escalera de embarque, una camioneta y un trabajador con chaleco reflectante.",
   "title": "De-icing an aircraft in foggy weather",
   "topic": "Operación invernal · deshielo",
   "prompts": [
    "Describe the scene and the weather.",
    "What is the vehicle on the right doing?",
    "Why is this procedure necessary?",
    "What could happen if it were not done?"
   ],
   "seen": [
    "A Boeing 737 is parked on the apron in misty or foggy weather.",
    "A large de-icing truck with a boom and a basket is spraying the aircraft, and a person is working in the basket.",
    "White vapour and spray are covering the tail and the rear part of the aircraft.",
    "Boarding stairs are attached to the front left door.",
    "A white van is parked in front of the aircraft, and a truck is on the right.",
    "A ground worker in a yellow high-visibility vest is standing on the left.",
    "The sky is hazy and light."
   ],
   "might": [
    "It is probably cold, and there may be frost, ice or snow on the aircraft.",
    "The crew and the ground staff are preparing the aircraft for departure.",
    "The passengers could be boarding, or the crew may already be on board.",
    "Ice on the wings and the tail could change the airflow and reduce the aircraft's performance."
   ],
   "context": "Boeing 737 de Air Berlin recibiendo deshielo en el aeropuerto de Berlín-Tegel, 29-ene-2011. «Apron» (plataforma): área definida de un aeródromo terrestre destinada a que las aeronaves embarquen o desembarquen pasajeros, correo o carga, carguen combustible, estacionen o reciban mantenimiento.",
   "manual": {
    "cite": "A defined area, on a land aerodrome, intended to accommodate aircraft for purposes of loading or unloading passengers, mail or cargo, fuelling, parking or maintenance."
   },
   "model": "In this picture a Boeing 737 is parked on the apron in cold, misty weather. A large de-icing truck with a boom and a basket is spraying the aircraft, and a person is working in the basket. There is a lot of white vapour around the tail and the rear part of the aircraft. Boarding stairs are attached to the front left door, a white van is parked in front of the aircraft and a truck is standing on the right. A ground worker in a yellow vest is standing on the left. I think the aircraft is being de-iced before departure, because there may be frost, ice or snow on its surfaces. Ice on the wings or the tail could reduce the aircraft's performance, so it must be removed before take-off.",
   "vocab": [
    {
     "en": "de-icing",
     "es": "deshielo"
    },
    {
     "en": "anti-icing",
     "es": "anti-hielo (protección)"
    },
    {
     "en": "de-icing truck",
     "es": "camión de deshielo"
    },
    {
     "en": "boom",
     "es": "brazo"
    },
    {
     "en": "basket",
     "es": "cesta"
    },
    {
     "en": "vapour (steam)",
     "es": "vapor"
    },
    {
     "en": "apron",
     "es": "plataforma"
    },
    {
     "en": "boarding stairs",
     "es": "escalera de embarque"
    },
    {
     "en": "ground crew",
     "es": "personal de tierra"
    },
    {
     "en": "frost",
     "es": "escarcha"
    },
    {
     "en": "fog / mist",
     "es": "niebla / bruma"
    },
    {
     "en": "surfaces",
     "es": "superficies"
    }
   ],
   "points": [
    "Describí el clima (niebla, frío) y el lugar (plataforma).",
    "Expliqué qué hace el camión de deshielo y por qué.",
    "Nombré al menos cinco elementos (camión, cesta, escalera, camioneta, chaleco…).",
    "Dije qué podría pasar sin deshielo (hielo en alas y cola, menor rendimiento).",
    "Usé la voz pasiva correctamente (is being de-iced)."
   ],
   "credit": {
    "text": "Wingtip (foto propia) · CC0",
    "url": "https://commons.wikimedia.org/wiki/File:AirBerlin_Boeing737-86J_D-ABKHdeicingTXL-1.jpg"
   }
  },
  {
   "id": "en_img_08",
   "file": "assets/ingles/engine-damage.jpg",
   "alt": "Una persona con gorro de lana y chaqueta azul revisa con una linterna el ventilador de un motor dañado, con el carenado roto y a la vista el panal interior.",
   "title": "Inspecting a damaged jet engine",
   "topic": "Falla de motor · inspección",
   "prompts": [
    "Describe the damage that you can see.",
    "Who is the person, and what is the person doing?",
    "What could have caused this damage?",
    "What would the crew do after an engine failure?"
   ],
   "seen": [
    "A person in a dark blue jacket and a wool cap is looking at the front of a jet engine with a small flashlight.",
    "The jacket has yellow letters on the back.",
    "The engine cowling at the front is torn open, and the honeycomb structure inside is visible.",
    "The fan blades are visible, and the spinner in the centre has dark marks.",
    "The aircraft is parked on a paved apron, with a yellow line and an orange traffic cone on the ground.",
    "Part of the blue fuselage is visible in the top left corner."
   ],
   "might": [
    "An internal engine failure may have broken the cowling.",
    "A fan blade could have separated from the engine.",
    "Debris from the engine might have hit other parts of the aircraft.",
    "The crew would have shut down the engine and asked for priority to land."
   ],
   "context": "Motor CFM56 del Boeing 737-700 del vuelo 1380 de Southwest (17-abr-2018), revisado por un empleado del NTSB (National Transportation Safety Board). El motor falló en vuelo, se rompió su carenado y el avión desvió a Filadelfia; fue un accidente grave.",
   "model": "In this picture a person in a dark blue jacket and a wool cap is inspecting the front of a jet engine with a small flashlight. The engine cowling is torn open and I can see the honeycomb structure inside. The fan blades are visible, and the spinner in the centre has dark marks. The aircraft is parked on the apron, and there is a yellow line and an orange cone on the ground. I think the engine suffered a serious failure. Perhaps a fan blade broke and damaged the cowling. After a failure like this, the crew would have shut down the engine, asked for priority and landed at the nearest suitable airport. Now investigators are looking for the cause.",
   "vocab": [
    {
     "en": "engine cowling",
     "es": "capó / carenado del motor"
    },
    {
     "en": "fan blades",
     "es": "álabes del ventilador"
    },
    {
     "en": "spinner",
     "es": "cono del ventilador"
    },
    {
     "en": "honeycomb",
     "es": "panal (de abeja)"
    },
    {
     "en": "flashlight (torch)",
     "es": "linterna"
    },
    {
     "en": "investigator",
     "es": "investigador"
    },
    {
     "en": "to inspect",
     "es": "inspeccionar"
    },
    {
     "en": "torn open",
     "es": "desgarrado, abierto"
    },
    {
     "en": "engine failure",
     "es": "falla de motor"
    },
    {
     "en": "to shut down an engine",
     "es": "apagar un motor"
    },
    {
     "en": "traffic cone",
     "es": "cono de tránsito"
    }
   ],
   "radio": {
    "intro": "Así se estructura un llamado de socorro por falla de motor:",
    "lines": [
     "Mayday, mayday, mayday, Walden Tower, G-ABCD, engine failed. Will attempt to land your field, five miles south, four thousand feet, heading three six zero."
    ],
    "ref": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)"
   },
   "points": [
    "Describí el daño (carenado desgarrado, panal, álabes, ojiva).",
    "Dije qué hace la persona y qué lleva puesto.",
    "Propuse causas con lenguaje de posibilidad (may / could / perhaps).",
    "Expliqué qué haría la tripulación después de la falla.",
    "Sé la estructura de una llamada MAYDAY por falla de motor."
   ],
   "credit": {
    "text": "NTSB · dominio público",
    "url": "https://commons.wikimedia.org/wiki/File:Southwest_Airlines_Flight_1380_NTSB_Engine_Inspection_PHL_KPHL.jpg"
   }
  }
 ],
 "listening": [
  {
   "id": "en_lis_01",
   "type": "atis",
   "title": "ATIS · Georgetown",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Georgetown information Bravo.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time one four five five.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway two seven in use. Expect ILS approach runway two seven. Transition level five zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind two zero zero degrees, one two knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility eight thousand metres. Few clouds two thousand five hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature one six, dew point one zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero one eight.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Bravo."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Georgetown Ground, Fastair three four five, stand two four, request start up, information Bravo."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Bravo",
     "accept": [
      [
       "bravo"
      ],
      [
       "b"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "1455",
     "accept": [
      [
       "1455"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "27",
     "accept": [
      [
       "27"
      ]
     ]
    },
    {
     "label": "Aproximación esperada",
     "value": "ILS",
     "accept": [
      [
       "ils"
      ]
     ]
    },
    {
     "label": "Nivel de transición",
     "value": "50",
     "accept": [
      [
       "50"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "200° / 12 kt",
     "accept": [
      [
       "200",
       "12"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "8000 m",
     "accept": [
      [
       "8000"
      ],
      [
       "8",
       "km"
      ]
     ]
    },
    {
     "label": "Nubes",
     "value": "Few · 2500 ft",
     "accept": [
      [
       "2500"
      ],
      [
       "025"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "16 / 10",
     "accept": [
      [
       "16",
       "10"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1018",
     "accept": [
      [
       "1018"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Bravo",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "Cuando hay ATIS, se acusa recibo en la llamada inicial al aeródromo: «information Bravo».",
    "Al revelar, verás como modelo la llamada inicial del piloto con la letra del ATIS."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · Capítulo 1 (glosario) · p. 1-2 (PDF 11)",
    "cite": "The automatic provision of current, routine information to arriving and departing aircraft throughout 24 hours or a specified portion thereof:"
   }
  },
  {
   "id": "en_lis_02",
   "type": "atis",
   "title": "ATIS · Stephenville",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Stephenville information Charlie.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time zero six three zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway three six in use. ILS approach runway three six.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind three six zero degrees, two five knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility one thousand metres.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "RVR runway three six, touchdown six five zero metres, midpoint seven hundred metres, stop end five five zero metres.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Continuous moderate rain. Overcast six hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature seven, dew point six.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero zero one.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway wet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Charlie."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Charlie",
     "accept": [
      [
       "charlie"
      ],
      [
       "c"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "0630",
     "accept": [
      [
       "0630"
      ],
      [
       "630"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "36",
     "accept": [
      [
       "36"
      ]
     ]
    },
    {
     "label": "Aproximación",
     "value": "ILS",
     "accept": [
      [
       "ils"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "360° / 25 kt",
     "accept": [
      [
       "360",
       "25"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "1000 m",
     "accept": [
      [
       "1000"
      ],
      [
       "1",
       "km"
      ]
     ]
    },
    {
     "label": "RVR zona de toma de contacto",
     "value": "650 m",
     "accept": [
      [
       "650"
      ]
     ]
    },
    {
     "label": "RVR punto medio",
     "value": "700 m",
     "accept": [
      [
       "700"
      ]
     ]
    },
    {
     "label": "RVR final de pista",
     "value": "550 m",
     "accept": [
      [
       "550"
      ]
     ]
    },
    {
     "label": "Tiempo presente",
     "value": "Lluvia continua moderada",
     "accept": [
      [
       "rain"
      ],
      [
       "ra"
      ]
     ]
    },
    {
     "label": "Nubes",
     "value": "Overcast · 600 ft",
     "accept": [
      [
       "600"
      ],
      [
       "006"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "7 / 6",
     "accept": [
      [
       "7",
       "6"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1001",
     "accept": [
      [
       "1001"
      ]
     ]
    },
    {
     "label": "Estado de la pista",
     "value": "Mojada (wet)",
     "accept": [
      [
       "wet"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Charlie",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "Cuando hay varias lecturas de RVR, se transmiten en este orden: zona de toma de contacto, punto medio y final de pista.",
    "El viento, la visibilidad, la lluvia continua moderada, las nubes y el QNH se transmiten con fraseología estándar y las cifras una por una."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §10.2.2 · p. 10-2 (PDF 95)",
    "cite": "they are always transmitted commencing with the reading for the touchdown zone followed by the mid-point zone and ending with the roll-out/stop end zone report."
   }
  },
  {
   "id": "en_lis_03",
   "type": "atis",
   "title": "ATIS · Walden",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Walden information Delta.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time zero eight one five.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway zero nine in use.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway conditions zero nine: available width three two metres, covered with thin patches of ice, braking action poor. Snow up to three zero centimetres along edges.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind zero eight zero degrees, one zero knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility two thousand metres, light snow. Broken cloud one thousand five hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature minus two, dew point minus three.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero two two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Taxiway Golf closed due maintenance, use Alpha to vacate.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Delta."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Delta",
     "accept": [
      [
       "delta"
      ],
      [
       "d"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "0815",
     "accept": [
      [
       "0815"
      ],
      [
       "815"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "09",
     "accept": [
      [
       "9"
      ]
     ]
    },
    {
     "label": "Ancho disponible de la pista",
     "value": "32 m",
     "accept": [
      [
       "32"
      ]
     ]
    },
    {
     "label": "Superficie",
     "value": "Parches de hielo (thin patches of ice)",
     "accept": [
      [
       "ice"
      ],
      [
       "icy"
      ]
     ]
    },
    {
     "label": "Eficacia de frenado",
     "value": "Mala (poor)",
     "accept": [
      [
       "poor"
      ]
     ]
    },
    {
     "label": "Nieve a los costados",
     "value": "Hasta 30 cm",
     "accept": [
      [
       "30"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "080° / 10 kt",
     "accept": [
      [
       "80",
       "10"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "2000 m",
     "accept": [
      [
       "2000"
      ],
      [
       "2",
       "km"
      ]
     ]
    },
    {
     "label": "Tiempo presente",
     "value": "Nieve ligera",
     "accept": [
      [
       "light",
       "snow"
      ],
      [
       "sn"
      ]
     ]
    },
    {
     "label": "Nubes",
     "value": "Broken · 1500 ft",
     "accept": [
      [
       "1500"
      ],
      [
       "015"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "-2 / -3",
     "accept": [
      [
       "2",
       "3"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1022",
     "accept": [
      [
       "1022"
      ]
     ]
    },
    {
     "label": "Calle de rodaje cerrada",
     "value": "Golf",
     "accept": [
      [
       "golf"
      ]
     ]
    },
    {
     "label": "Calle para desocupar la pista",
     "value": "Alpha",
     "accept": [
      [
       "alpha"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Delta",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "«Runway conditions… braking action poor» y «snow up to 30 cm along edges» son frases estándar para informar el estado de la pista; «taxiway Golf closed due maintenance, use Alpha to vacate» avisa de una calle cerrada e indica por dónde salir de la pista.",
    "«Minus» se dice para las temperaturas negativas: «temperature minus 2, dewpoint minus 3»."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §4.10 · p. 4-16 (PDF 54)",
    "cite": "snow, slush or ice on a runway, a taxiway or an apron;"
   }
  },
  {
   "id": "en_lis_04",
   "type": "atis",
   "title": "ATIS · Kennington (salidas)",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Kennington departure information Echo.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time one one three zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway two seven in use.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind two five zero degrees, eight knots. CAVOK.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature two two, dew point one four.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero one zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Caution, construction work adjacent to gate three seven. Large flock of birds north of runway two seven near central taxiway. VASIS runway two seven unserviceable. Centre line taxiway lighting unserviceable.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Echo."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Echo",
     "accept": [
      [
       "echo"
      ],
      [
       "e"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "1130",
     "accept": [
      [
       "1130"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "27",
     "accept": [
      [
       "27"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "250° / 8 kt",
     "accept": [
      [
       "250",
       "8"
      ]
     ]
    },
    {
     "label": "Condiciones",
     "value": "CAVOK",
     "accept": [
      [
       "cavok"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "22 / 14",
     "accept": [
      [
       "22",
       "14"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1010",
     "accept": [
      [
       "1010"
      ]
     ]
    },
    {
     "label": "Obras",
     "value": "Junto a la puerta 37",
     "accept": [
      [
       "37"
      ]
     ]
    },
    {
     "label": "Aves",
     "value": "Bandada grande al norte de la pista 27",
     "accept": [
      [
       "bird"
      ],
      [
       "birds"
      ]
     ]
    },
    {
     "label": "Ayuda visual",
     "value": "VASIS pista 27 fuera de servicio",
     "accept": [
      [
       "vasis"
      ]
     ]
    },
    {
     "label": "Luces",
     "value": "Luces del eje de la calle de rodaje fuera de servicio",
     "accept": [
      [
       "centre"
      ],
      [
       "center"
      ],
      [
       "centreline"
      ],
      [
       "centerline"
      ],
      [
       "lighting"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Echo",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "La información esencial del aeródromo incluye obras, aves, superficies dañadas, nieve o agua y fallas de iluminación. CAVOK significa que la visibilidad, las nubes y el tiempo presente son mejores que los valores prescritos."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §4.10 · p. 4-16 (PDF 54)",
    "cite": "other temporary hazards, including parked aircraft and birds on the ground or in the air;"
   }
  },
  {
   "id": "en_lis_05",
   "type": "atis",
   "title": "ATIS · Georgetown (llegadas)",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Georgetown arrival information Foxtrot.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time one six zero five.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Expect radar vectors for ILS approach runway two four. Holding delay two zero minutes. Transition level five zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind two six zero degrees, two two knots, gusting three five knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility six thousand metres. Showers. Scattered cumulonimbus two thousand five hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature one eight, dew point one two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero zero eight.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind shear reported on final runway two four.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Foxtrot."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Foxtrot",
     "accept": [
      [
       "foxtrot"
      ],
      [
       "f"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "1605",
     "accept": [
      [
       "1605"
      ]
     ]
    },
    {
     "label": "Pista y aproximación",
     "value": "ILS pista 24",
     "accept": [
      [
       "ils",
       "24"
      ]
     ]
    },
    {
     "label": "Demora en espera",
     "value": "20 minutos",
     "accept": [
      [
       "20"
      ]
     ]
    },
    {
     "label": "Nivel de transición",
     "value": "50",
     "accept": [
      [
       "50"
      ]
     ]
    },
    {
     "label": "Viento con ráfagas",
     "value": "260° / 22 kt, ráfagas 35 kt",
     "accept": [
      [
       "260",
       "22",
       "35"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "6000 m",
     "accept": [
      [
       "6000"
      ],
      [
       "6",
       "km"
      ]
     ]
    },
    {
     "label": "Tiempo presente",
     "value": "Chubascos (showers)",
     "accept": [
      [
       "shower"
      ],
      [
       "showers"
      ],
      [
       "shra"
      ]
     ]
    },
    {
     "label": "Tipo de nube",
     "value": "Cumulonimbus",
     "accept": [
      [
       "cb"
      ],
      [
       "cumulonimbus"
      ]
     ]
    },
    {
     "label": "Altura de las nubes",
     "value": "2500 ft",
     "accept": [
      [
       "2500"
      ],
      [
       "025"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "18 / 12",
     "accept": [
      [
       "18",
       "12"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1008",
     "accept": [
      [
       "1008"
      ]
     ]
    },
    {
     "label": "Cizalladura (wind shear)",
     "value": "Reportada en final pista 24",
     "accept": [
      [
       "shear"
      ],
      [
       "windshear"
      ],
      [
       "ws"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Foxtrot",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "El viento con ráfagas se dice «wind one six zero degrees one eight knots gusting three zero knots». Mientras se pronostique o se reporte cizalladura (wind shear), ATC avisa a las demás aeronaves, hasta que informen que ya no existe."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §11.4 · p. 11-3 (PDF 99)",
    "cite": "When wind shear is forecast or is reported by aircraft, ATC will warn other aircraft until such time as aircraft report the phenomenon no longer exists."
   }
  },
  {
   "id": "en_lis_06",
   "type": "clearance",
   "title": "Autorización IFR antes de la salida",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, cleared to Kennington, via A one, flight level two eight zero, Wicken three Delta departure, squawk five five zero one."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Cleared to Kennington, via A one, flight level two eight zero, Wicken three Delta departure, squawk five five zero one, Fastair three four five."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Destino",
     "value": "Kennington",
     "accept": [
      [
       "kennington"
      ]
     ]
    },
    {
     "label": "Ruta",
     "value": "A1",
     "accept": [
      [
       "a1"
      ],
      [
       "a",
       "1"
      ]
     ]
    },
    {
     "label": "Nivel de vuelo",
     "value": "FL 280",
     "accept": [
      [
       "280"
      ],
      [
       "28000"
      ]
     ]
    },
    {
     "label": "Salida (SID)",
     "value": "Wicken 3 Delta",
     "accept": [
      [
       "wicken",
       "3"
      ]
     ]
    },
    {
     "label": "Código transponder",
     "value": "5501",
     "accept": [
      [
       "5501"
      ]
     ]
    }
   ],
   "notes": [
    "Una autorización de ruta de ATC siempre se colaciona. Abajo verás la colación modelo, que termina con el indicativo.",
    "La autorización de ruta no es una instrucción para despegar ni para entrar a la pista."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §2.8.3.5 · p. 2-13 (PDF 30) y ejemplo de §2.8.3.6",
    "cite": "The following shall always be read back: … ATC route clearances;"
   }
  },
  {
   "id": "en_lis_07",
   "type": "clearance",
   "title": "Instrucciones tras el despegue",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five heavy, Georgetown Departure, turn right heading zero four zero until passing flight level seven zero then direct Wicken VOR. Report passing flight level seven zero.",
     "pause": 3000
    },
    {
     "who": "atc",
     "text": "Fastair three four five, contact Alexander Control one two nine decimal one."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Right heading zero four zero until passing flight level seven zero then direct Wicken VOR, Fastair three four five."
    },
    {
     "who": "pilot",
     "text": "One two nine decimal one, Fastair three four five."
    }
   ],
   "keys": [
    {
     "label": "Categoría de estela",
     "value": "Heavy",
     "accept": [
      [
       "heavy"
      ]
     ]
    },
    {
     "label": "Dependencia",
     "value": "Georgetown Departure",
     "accept": [
      [
       "departure"
      ]
     ]
    },
    {
     "label": "Giro",
     "value": "A la derecha",
     "accept": [
      [
       "right"
      ]
     ]
    },
    {
     "label": "Rumbo",
     "value": "040",
     "accept": [
      [
       "40"
      ]
     ]
    },
    {
     "label": "Hasta pasar el nivel",
     "value": "FL 70",
     "accept": [
      [
       "70"
      ]
     ]
    },
    {
     "label": "Después",
     "value": "Directo a Wicken VOR",
     "accept": [
      [
       "wicken"
      ]
     ]
    },
    {
     "label": "Cambio de frecuencia",
     "value": "Alexander Control",
     "accept": [
      [
       "alexander"
      ]
     ]
    },
    {
     "label": "Frecuencia",
     "value": "129.1",
     "accept": [
      [
       "1291"
      ]
     ]
    }
   ],
   "notes": [
    "Además de la autorización de ruta, los vuelos IFR que salen pueden recibir instrucciones de salida para mantener la separación.",
    "En un informe de rumbo o de frecuencia, la colación repite los datos y termina con el indicativo."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §7.1.2 · p. 7-1 (PDF 67)",
    "cite": "In addition to the ATC route clearance, departing IFR flights may be given departure instructions in order to provide separation."
   }
  },
  {
   "id": "en_lis_08",
   "type": "clearance",
   "title": "Instrucciones de llegada (tres transmisiones)",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla. Esta vez son tres transmisiones seguidas.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, descend to four thousand feet, QNH one zero zero five, transition level five zero, expect ILS approach runway two four.",
     "pause": 3500
    },
    {
     "who": "atc",
     "text": "Fastair three four five, cleared straight-in ILS approach runway two four, report established.",
     "pause": 3500
    },
    {
     "who": "atc",
     "text": "Fastair three four five, contact Tower one one eight decimal seven."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Descending to four thousand feet, QNH one zero zero five, transition level five zero, expecting ILS approach runway two four, Fastair three four five."
    },
    {
     "who": "pilot",
     "text": "Cleared straight-in ILS approach runway two four, wilco, Fastair three four five."
    },
    {
     "who": "pilot",
     "text": "One one eight decimal seven, Fastair three four five."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Descender a",
     "value": "4000 ft",
     "accept": [
      [
       "4000"
      ],
      [
       "4",
       "000"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1005",
     "accept": [
      [
       "1005"
      ]
     ]
    },
    {
     "label": "Nivel de transición",
     "value": "50",
     "accept": [
      [
       "50"
      ]
     ]
    },
    {
     "label": "Aproximación esperada",
     "value": "ILS",
     "accept": [
      [
       "ils"
      ]
     ]
    },
    {
     "label": "Pista",
     "value": "24",
     "accept": [
      [
       "24"
      ]
     ]
    },
    {
     "label": "Autorización de aproximación",
     "value": "Cleared straight-in",
     "accept": [
      [
       "straight"
      ]
     ]
    },
    {
     "label": "Informar",
     "value": "Established",
     "accept": [
      [
       "established"
      ],
      [
       "est"
      ]
     ]
    },
    {
     "label": "Frecuencia de la torre",
     "value": "118.7",
     "accept": [
      [
       "1187"
      ]
     ]
    }
   ],
   "notes": [
    "La altitud 4 000 se transmite «four thousand feet». Cuando se cambia una parte de una autorización de nivel, se repite entera.",
    "«Wilco» en la segunda colación: entendí y cumpliré."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §7.3.1 · p. 7-2 (PDF 68)",
    "cite": "Approach control will normally advise, on initial contact, the type of approach to be expected."
   }
  },
  {
   "id": "en_lis_09",
   "type": "clearance",
   "title": "Instrucción de espera 1",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, hold at North Cross NDB flight level one zero zero, inbound track two five zero degrees, left hand pattern, outbound time one minute."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Punto de espera",
     "value": "North Cross NDB",
     "accept": [
      [
       "north",
       "cross"
      ],
      [
       "northcross"
      ]
     ]
    },
    {
     "label": "Nivel",
     "value": "FL 100",
     "accept": [
      [
       "100"
      ]
     ]
    },
    {
     "label": "Rumbo de acercamiento (inbound track)",
     "value": "250°",
     "accept": [
      [
       "250"
      ]
     ]
    },
    {
     "label": "Patrón",
     "value": "A la izquierda",
     "accept": [
      [
       "left"
      ]
     ]
    },
    {
     "label": "Tiempo del tramo de alejamiento",
     "value": "1 minuto",
     "accept": [
      [
       "1",
       "minute"
      ],
      [
       "1",
       "min"
      ]
     ]
    }
   ],
   "notes": [
    "Normalmente el circuito de espera está publicado; cuando el piloto pide una descripción detallada basada en una instalación, se usa esta fraseología.",
    "Los datos se pasan en este orden sugerido: punto, nivel, rumbo de acercamiento, sentido de los virajes y tiempo del tramo."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §7.3.3 · p. 7-5 (PDF 71)",
    "cite": "when the pilot requires a detailed description of the holding procedure based on a facility, the following phraseology should be used:"
   }
  },
  {
   "id": "en_lis_10",
   "type": "clearance",
   "title": "Instrucción de espera 2",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, hold on the two six five radial of Marlo VOR between two five miles and three zero miles DME, flight level one zero zero, inbound track zero eight five, right hand pattern, expected approach time one zero three two."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Radial",
     "value": "265 de Marlo VOR",
     "accept": [
      [
       "265"
      ]
     ]
    },
    {
     "label": "VOR",
     "value": "Marlo",
     "accept": [
      [
       "marlo"
      ]
     ]
    },
    {
     "label": "Entre",
     "value": "25 y 30 millas DME",
     "accept": [
      [
       "25",
       "30"
      ]
     ]
    },
    {
     "label": "Nivel",
     "value": "FL 100",
     "accept": [
      [
       "100"
      ]
     ]
    },
    {
     "label": "Rumbo de acercamiento (inbound track)",
     "value": "085°",
     "accept": [
      [
       "85"
      ]
     ]
    },
    {
     "label": "Patrón",
     "value": "A la derecha",
     "accept": [
      [
       "right"
      ]
     ]
    },
    {
     "label": "Hora prevista de aproximación",
     "value": "1032",
     "accept": [
      [
       "1032"
      ]
     ]
    }
   ],
   "notes": [
    "Los datos se pasan en este orden: punto o radial, nivel, rumbo de acercamiento, sentido de los virajes y tiempo del tramo si hace falta.",
    "«Expected approach time» es la hora a la que ATC espera que la aeronave salga del punto de espera para completar su aproximación."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §7.3.3 · p. 7-5 (PDF 71)",
    "cite": "when the pilot requires a detailed description of the holding procedure based on a facility, the following phraseology should be used:"
   }
  },
  {
   "id": "en_lis_11",
   "type": "clearance",
   "title": "Instrucción de rodaje",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, taxi to holding point runway two seven, give way to B seven four seven passing left to right, QNH one zero one nine."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Holding point runway two seven, QNH one zero one nine, giving way to B seven four seven, Fastair three four five."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Destino del rodaje",
     "value": "Punto de espera pista 27",
     "accept": [
      [
       "27"
      ]
     ]
    },
    {
     "label": "Ceder el paso a",
     "value": "B747",
     "accept": [
      [
       "747"
      ],
      [
       "b747"
      ]
     ]
    },
    {
     "label": "Sentido del cruce",
     "value": "De izquierda a derecha",
     "accept": [
      [
       "left",
       "right"
      ],
      [
       "l",
       "r"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1019",
     "accept": [
      [
       "1019"
      ]
     ]
    }
   ],
   "notes": [
    "Un rodaje siempre trae un límite de la autorización, normalmente el punto de espera de la pista en uso. Cuando la aeronave acusa recibo del ATIS, el controlador no necesita pasar la información de salida.",
    "El QNH es de los datos que siempre se colacionan."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §4.4.1 · p. 4-3 (PDF 41)",
    "cite": "Taxi instructions issued by a controller will always contain a clearance limit, which is the point at which the aircraft must stop until further permission to proceed is given."
   }
  },
  {
   "id": "en_lis_12",
   "type": "clearance",
   "title": "Autorización de despegue (dos transmisiones)",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla. Son dos transmisiones: la autorización de despegue y, más tarde, el cambio de frecuencia.",
   "lines": [
    {
     "who": "atc",
     "text": "Fastair three four five, climb straight ahead until two thousand five hundred feet before turning right, runway two four cleared for take-off.",
     "pause": 3500
    },
    {
     "who": "atc",
     "text": "Fastair three four five, contact Departure one two one decimal seven five zero."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Straight ahead two thousand five hundred feet, right turn, cleared for take-off runway two four, Fastair three four five."
    },
    {
     "who": "pilot",
     "text": "One two one decimal seven five zero, Fastair three four five."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "Fastair 345",
     "accept": [
      [
       "fastair",
       "345"
      ],
      [
       "345"
      ]
     ]
    },
    {
     "label": "Trayectoria inicial",
     "value": "Recto hasta 2500 ft",
     "accept": [
      [
       "2500"
      ]
     ]
    },
    {
     "label": "Después",
     "value": "Virar a la derecha",
     "accept": [
      [
       "right"
      ]
     ]
    },
    {
     "label": "Pista",
     "value": "24",
     "accept": [
      [
       "24"
      ]
     ]
    },
    {
     "label": "Autorización",
     "value": "Cleared for take-off",
     "accept": [
      [
       "cleared"
      ],
      [
       "take"
      ],
      [
       "takeoff"
      ]
     ]
    },
    {
     "label": "Frecuencia de Departure",
     "value": "121.750",
     "accept": [
      [
       "121750"
      ],
      [
       "12175"
      ]
     ]
    }
   ],
   "notes": [
    "Las instrucciones de salida pueden darse junto con la autorización de despegue para asegurar la separación. «Take-off» se usa solo para autorizar o cancelar el despegue.",
    "Es una autorización que siempre se colaciona: instrucciones de despegar, aterrizar, entrar, cruzar o mantener antes de una pista."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §4.5.9 · p. 4-8 (PDF 46)",
    "cite": "Departure instructions may be given with the take-off clearance."
   }
  },
  {
   "id": "en_lis_13",
   "type": "clearance",
   "title": "Autorización en ruta (una transmisión)",
   "scenario": "Escucha la autorización de ATC y escríbela completa, como si tuvieras que colacionarla.",
   "lines": [
    {
     "who": "atc",
     "text": "Golf Alpha Bravo, cleared direct Stephenville NDB, flight level seven zero. Enter controlled airspace flight level one zero zero or below. Hold Stephenville NDB flight level seven zero, right hand pattern, expected approach time five two."
    }
   ],
   "after": [
    {
     "who": "pilot",
     "text": "Cleared direct to Stephenville NDB flight level seven zero. Entering controlled airspace flight level one zero zero or below. Holding Stephenville NDB flight level seven zero right hand pattern, expecting approach time five two, Golf Alpha Bravo."
    }
   ],
   "keys": [
    {
     "label": "Indicativo",
     "value": "G-AB",
     "accept": [
      [
       "golf",
       "alpha",
       "bravo"
      ],
      [
       "g",
       "ab"
      ],
      [
       "gab"
      ]
     ]
    },
    {
     "label": "Directo a",
     "value": "Stephenville NDB",
     "accept": [
      [
       "stephenville"
      ]
     ]
    },
    {
     "label": "Nivel",
     "value": "FL 70",
     "accept": [
      [
       "70"
      ]
     ]
    },
    {
     "label": "Entrar al espacio controlado a",
     "value": "FL 100 o menos",
     "accept": [
      [
       "100"
      ]
     ]
    },
    {
     "label": "Patrón de espera",
     "value": "A la derecha",
     "accept": [
      [
       "right"
      ]
     ]
    },
    {
     "label": "Hora prevista de aproximación",
     "value": "52 (minutos)",
     "accept": [
      [
       "52"
      ]
     ]
    }
   ],
   "notes": [
    "Así se pasan una autorización directa, el límite de nivel para entrar al espacio controlado y una espera con hora prevista de aproximación.",
    "En la hora solo se transmiten los minutos: «expected approach time five two»."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §7.3.1 (ejemplo) · p. 7-3 (PDF 69)",
    "cite": "G-AB CLEARED DIRECT STEPHENVILLE NDB, FL 70. ENTER CONTROLLED AIRSPACE FL 100 OR BELOW. HOLD STEPHENVILLE NDB FL 70, RIGHT HAND PATTERN, EXPECTED APPROACH TIME 52."
   }
  },
  {
   "id": "en_lis_14",
   "type": "atis",
   "title": "ATIS · Walden",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Walden information Golf.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time zero nine two five.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway two seven in use.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Threshold runway two seven displaced five hundred feet due broken surface. Grass mowing in progress near centre of aerodrome.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind two nine zero degrees, one four knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility one five kilometres. Scattered cloud three thousand five hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature two zero, dew point one two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero one two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Golf."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Golf",
     "accept": [
      [
       "golf"
      ],
      [
       "g"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "0925",
     "accept": [
      [
       "0925"
      ],
      [
       "925"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "27",
     "accept": [
      [
       "27"
      ]
     ]
    },
    {
     "label": "Umbral desplazado",
     "value": "Umbral de la pista 27 desplazado 500 ft",
     "accept": [
      [
       "500"
      ]
     ]
    },
    {
     "label": "Motivo",
     "value": "Superficie rota (broken surface)",
     "accept": [
      [
       "broken"
      ],
      [
       "surface"
      ]
     ]
    },
    {
     "label": "Trabajos",
     "value": "Corte de pasto cerca del centro del aeródromo (grass mowing)",
     "accept": [
      [
       "mowing"
      ],
      [
       "mow"
      ],
      [
       "grass"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "290° / 14 kt",
     "accept": [
      [
       "290",
       "14"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "15 km",
     "accept": [
      [
       "15000"
      ],
      [
       "15"
      ]
     ]
    },
    {
     "label": "Nubes",
     "value": "Scattered · 3500 ft",
     "accept": [
      [
       "3500"
      ],
      [
       "035"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "20 / 12",
     "accept": [
      [
       "20",
       "12"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1012",
     "accept": [
      [
       "1012"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Golf",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "«Threshold runway 27 displaced 500 feet due broken surface» y «grass mowing in progress near centre of aerodrome» son frases estándar para avisar de un umbral desplazado y de trabajos en el aeródromo.",
    "Las cifras se dicen una por una y las cantidades redondas con «thousand» y «hundred»."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §10.3.4 · p. 10-2 (PDF 95)",
    "cite": "Other runway surface conditions which may be of concern to a pilot shall be transmitted at an appropriate time."
   }
  },
  {
   "id": "en_lis_15",
   "type": "atis",
   "title": "ATIS · Kennington",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Kennington information Hotel.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time one five four zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway three six in use. ILS approach runway three six. Transition level six zero.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind three five zero degrees, one eight knots, gusting three zero knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility four thousand metres. Thunderstorm with rain. Broken cumulonimbus one thousand eight hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature two four, dew point two two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero zero four.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Braking action reported by A three two zero at one five three five, medium to good.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information Hotel."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "Hotel",
     "accept": [
      [
       "hotel"
      ],
      [
       "h"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "1540",
     "accept": [
      [
       "1540"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "36",
     "accept": [
      [
       "36"
      ]
     ]
    },
    {
     "label": "Aproximación",
     "value": "ILS",
     "accept": [
      [
       "ils"
      ]
     ]
    },
    {
     "label": "Nivel de transición",
     "value": "60",
     "accept": [
      [
       "60"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "350° / 18 kt",
     "accept": [
      [
       "350",
       "18"
      ]
     ]
    },
    {
     "label": "Ráfagas",
     "value": "30 kt",
     "accept": [
      [
       "30"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "4000 m",
     "accept": [
      [
       "4000"
      ],
      [
       "4",
       "km"
      ]
     ]
    },
    {
     "label": "Tiempo presente",
     "value": "Tormenta con lluvia (thunderstorm)",
     "accept": [
      [
       "thunderstorm"
      ],
      [
       "ts"
      ],
      [
       "tsra"
      ]
     ]
    },
    {
     "label": "Tipo de nube",
     "value": "Cumulonimbus",
     "accept": [
      [
       "cb"
      ],
      [
       "cumulonimbus"
      ]
     ]
    },
    {
     "label": "Altura de las nubes",
     "value": "1800 ft",
     "accept": [
      [
       "1800"
      ],
      [
       "018"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "24 / 22",
     "accept": [
      [
       "24",
       "22"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1004",
     "accept": [
      [
       "1004"
      ]
     ]
    },
    {
     "label": "Frenado informado por",
     "value": "A320",
     "accept": [
      [
       "320"
      ]
     ]
    },
    {
     "label": "Eficacia de frenado",
     "value": "Media a buena (medium to good)",
     "accept": [
      [
       "medium"
      ],
      [
       "good"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información Hotel",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "«Braking action reported by (aircraft type) at (time) (assessment of braking action)» es la fórmula para retransmitir la valoración de frenado que dio un piloto; el avión, la hora y la valoración de este audio son datos de práctica.",
    "El viento con ráfagas se dice «wind three five zero degrees one eight knots gusting three zero knots»."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §10.3.2 · p. 10-2 (PDF 95)",
    "cite": "Reports from pilots may be retransmitted by a controller when it is felt that the information may prove useful to other aircraft:"
   }
  },
  {
   "id": "en_lis_16",
   "type": "atis",
   "title": "ATIS · Colinton",
   "scenario": "Escucha este ATIS y escribe todo lo que oigas, como si tomaras nota en cabina. Puedes repetirlo las veces que quieras.",
   "lines": [
    {
     "who": "atc",
     "text": "Colinton departure information India.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Time zero six four five.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Runway two four in use. Low visibility procedures in operation.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Wind two four zero degrees, four knots.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Visibility four hundred metres, fog.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "RVR runway two four, touchdown three five zero metres, midpoint three hundred metres, stop end two five zero metres.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Vertical visibility one hundred feet.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Temperature two, dew point two.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "QNH one zero three one.",
     "pause": 350
    },
    {
     "who": "atc",
     "text": "Advise on initial contact you have information India."
    }
   ],
   "keys": [
    {
     "label": "Letra de la información",
     "value": "India",
     "accept": [
      [
       "india"
      ],
      [
       "i"
      ]
     ]
    },
    {
     "label": "Hora",
     "value": "0645",
     "accept": [
      [
       "0645"
      ],
      [
       "645"
      ]
     ]
    },
    {
     "label": "Pista en uso",
     "value": "24",
     "accept": [
      [
       "24"
      ]
     ]
    },
    {
     "label": "Procedimientos de baja visibilidad",
     "value": "En operación (LVP)",
     "accept": [
      [
       "lvp"
      ],
      [
       "low",
       "visibility"
      ]
     ]
    },
    {
     "label": "Viento",
     "value": "240° / 4 kt",
     "accept": [
      [
       "240",
       "4"
      ]
     ]
    },
    {
     "label": "Visibilidad",
     "value": "400 m",
     "accept": [
      [
       "400"
      ]
     ]
    },
    {
     "label": "Fenómeno",
     "value": "Niebla (fog)",
     "accept": [
      [
       "fog"
      ],
      [
       "fg"
      ]
     ]
    },
    {
     "label": "RVR zona de toma de contacto",
     "value": "350 m",
     "accept": [
      [
       "350"
      ]
     ]
    },
    {
     "label": "RVR punto medio",
     "value": "300 m",
     "accept": [
      [
       "300"
      ]
     ]
    },
    {
     "label": "RVR final de pista",
     "value": "250 m",
     "accept": [
      [
       "250"
      ]
     ]
    },
    {
     "label": "Visibilidad vertical",
     "value": "100 ft",
     "accept": [
      [
       "100"
      ]
     ]
    },
    {
     "label": "Temperatura / punto de rocío",
     "value": "2 / 2",
     "accept": [
      [
       "2"
      ]
     ]
    },
    {
     "label": "QNH",
     "value": "1031",
     "accept": [
      [
       "1031"
      ]
     ]
    },
    {
     "label": "Instrucción final",
     "value": "Avisar en el primer contacto que tienes la información India",
     "accept": [
      [
       "advise"
      ],
      [
       "initial"
      ]
     ]
    }
   ],
   "notes": [
    "Formato de práctica con datos ficticios: el orden exacto y las frases de un ATIS real pueden variar según el país y el aeródromo.",
    "Cuando hay varias lecturas de RVR se transmiten en este orden: zona de toma de contacto, punto medio y final de pista.",
    "«Low visibility procedures in operation» y «vertical visibility» son frases de ATIS de práctica."
   ],
   "ref": {
    "src": "ICAO Doc 9432 · §10.2.2 · p. 10-2 (PDF 95)",
    "cite": "they are always transmitted commencing with the reading for the touchdown zone followed by the mid-point zone and ending with the roll-out/stop end zone report."
   }
  }
 ],
 "roleplays": [
  {
   "id": "en_rp_01",
   "title": "Falla de motor después de V1",
   "scenario": "Eres el piloto del Fastair 345, un A320 que despegó hace un momento de Walden por la pista 35. Pasada la velocidad V1 falló el motor 2 y el capitán continuó el despegue. Ya estás en el aire, subiendo por 800 pies con rumbo 350 (el de la pista), el avión está estable y quieres volver a Walden cuanto antes. La torre todavía no sabe nada.",
   "turns": [
    {
     "prompt": "Declare the emergency to Walden Tower.",
     "model": [
      "Mayday, mayday, mayday, Walden Tower, Fastair three four five, engine failure after take-off. Request immediate return to Walden. Passing eight hundred feet, heading three five zero."
     ],
     "points": [
      "Dije MAYDAY tres veces al comienzo.",
      "Nombré la estación (Walden Tower) y mi indicativo (Fastair 345, con las cifras una por una).",
      "Dije qué pasa (engine failure) y lo que quiero hacer (request immediate return).",
      "Di mi nivel y mi rumbo (passing 800 feet, heading 350).",
      "Seguí el orden recomendado (estación, indicativo, naturaleza, intención, posición) y hablé despacio y con claridad."
     ],
     "vocab": [
      {
       "en": "engine failure",
       "es": "falla de motor"
      },
      {
       "en": "after take-off",
       "es": "después del despegue"
      },
      {
       "en": "request immediate return",
       "es": "solicito regresar de inmediato"
      },
      {
       "en": "passing … feet",
       "es": "pasando … pies"
      },
      {
       "en": "heading",
       "es": "rumbo"
      }
     ],
     "note": "Después de V1 no se aborta: se continúa el despegue. Primero se vuela el avión y se asegura la trayectoria; la llamada por radio viene después.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)",
       "cite": "A distress message should contain as many as possible of the following elements, and, if possible, in the order shown:"
      },
      {
       "src": "FCTM 25 NOV 24 · PR-AEP-ENG · Engine Failure after V1 (PDF 505)",
       "cite": "If an engine fails after V1, the flight crew must continue the takeoff. The essential and primary tasks are associated with the aircraft handling."
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, Walden Tower, roger Mayday. Wind three five zero degrees, one zero knots, QNH one zero zero eight. Turn left heading two seven zero, climb to three thousand feet.",
       "pause": 0
      }
     ],
     "prompt": "Read back the tower’s instructions.",
     "model": [
      "Left heading two seven zero, climbing to three thousand feet, QNH one zero zero eight, Fastair three four five."
     ],
     "points": [
      "Colacioné el rumbo (left heading 270).",
      "Colacioné el nivel (climbing to 3 000 feet).",
      "Colacioné el QNH (1008): rumbo, nivel y reglaje del altímetro son de lo que siempre se colaciona.",
      "Terminé con mi indicativo (Fastair 345)."
     ],
     "vocab": [
      {
       "en": "turn left heading",
       "es": "vire a la izquierda al rumbo"
      },
      {
       "en": "climb to",
       "es": "ascienda a"
      },
      {
       "en": "QNH",
       "es": "reglaje del altímetro"
      },
      {
       "en": "read back",
       "es": "colacionar"
      }
     ],
     "refs": [
      {
       "src": "ICAO Doc 9432 · §2.8.3.5 · p. 2-13 (PDF 30)",
       "cite": "runway-in-use, altimeter settings, SSR codes, level instructions, heading and speed instructions"
      },
      {
       "src": "ICAO Doc 9432 · §2.8.3.7 · p. 2-14 (PDF 31)",
       "cite": "An aircraft should terminate the read-back by its call sign."
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, say persons on board and endurance.",
       "pause": 0
      }
     ],
     "prompt": "Answer the tower.",
     "model": [
      "Fastair three four five, one five six persons on board, endurance three hours."
     ],
     "points": [
      "Dije las personas a bordo (persons on board), cifra por cifra.",
      "Dije la autonomía (endurance) en horas.",
      "Usé mi indicativo."
     ],
     "vocab": [
      {
       "en": "persons on board",
       "es": "personas a bordo"
      },
      {
       "en": "endurance",
       "es": "autonomía (tiempo de combustible)"
      },
      {
       "en": "say",
       "es": "indique"
      }
     ],
     "note": "«Otra información útil» cierra el mensaje de socorro. En el A320, la página EMERGENCY del MCDU tiene justo los campos POB (personas a bordo) y ENDURANCE.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)",
       "cite": "any other useful information"
      },
      {
       "src": "FCOM 15 SEP 25 · DSC-46-10-40-30 · ATC — página EMERGENCY del MCDU (PDF 4353)",
       "cite": "POB and ENDURANCE fields are linked"
      }
     ]
    }
   ]
  },
  {
   "id": "en_rp_02",
   "title": "Falla de motor antes de V1",
   "scenario": "Eres el piloto del Fastair 345, un A320, en plena carrera de despegue de la pista 27 de Kennington, con la autorización de despegue ya dada. A unos 110 kt, antes de V1, falla el motor 1 con alarma de fuego. El capitán llama «STOP» y detiene el avión en la pista; ya está detenido.",
   "turns": [
    {
     "prompt": "Tell the tower that you are stopping.",
     "model": [
      "Fastair three four five, stopping."
     ],
     "points": [
      "Avisé a la torre lo antes posible.",
      "Usé la palabra STOPPING.",
      "Terminé con mi indicativo."
     ],
     "vocab": [
      {
       "en": "stopping",
       "es": "deteniéndome"
      },
      {
       "en": "reject the take-off",
       "es": "rechazar el despegue"
      },
      {
       "en": "as soon as practicable",
       "es": "lo antes posible"
      }
     ],
     "note": "«STOP» es la llamada del capitán dentro de la cabina. A la torre se le dice «stopping».",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §4.5.12 · p. 4-9 (PDF 47)",
       "cite": "When a pilot abandons the take-off manoeuvre, the control tower should be so informed as soon as practicable, and assistance or taxi instructions should be requested as required."
      },
      {
       "src": "FCTM 25 NOV 24 · PR-AEP-MISC · Rejected Takeoff (PDF 561)",
       "cite": "If a decision is made to reject the takeoff, the Captain calls \"STOP\"."
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, Kennington Tower, roger.",
       "pause": 0
      }
     ],
     "prompt": "Declare the emergency and request assistance.",
     "model": [
      "Mayday, mayday, mayday, Kennington Tower, Fastair three four five, engine fire, rejected take-off. Stopped on runway two seven. Request fire and rescue services. One five six persons on board."
     ],
     "points": [
      "Dije MAYDAY tres veces al comienzo.",
      "Nombré la estación (Kennington Tower) y mi indicativo.",
      "Dije qué pasa (engine fire, rejected take-off).",
      "Dije dónde estoy (stopped on runway 27).",
      "Pedí lo que necesito (request fire and rescue services).",
      "Añadí las personas a bordo (persons on board)."
     ],
     "vocab": [
      {
       "en": "engine fire",
       "es": "fuego en un motor"
      },
      {
       "en": "rejected take-off",
       "es": "despegue rechazado"
      },
      {
       "en": "stopped on the runway",
       "es": "detenido en la pista"
      },
      {
       "en": "fire and rescue services",
       "es": "bomberos y rescate"
      }
     ],
     "note": "Aquí corresponde MAYDAY: un fuego de motor es un peligro grave que necesita ayuda inmediata. Una alarma de fuego o una pérdida repentina de empuje entre 100 kt y V1 son motivos válidos para rechazar el despegue.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)",
       "cite": "A distress message should contain as many as possible of the following elements, and, if possible, in the order shown:"
      },
      {
       "src": "ICAO Doc 9432 · §9.1.2 · p. 9-1 (PDF 88)",
       "cite": "a condition of being threatened by serious and/or imminent danger and of requiring immediate assistance"
      },
      {
       "src": "FCTM 25 NOV 24 · PR-AEP-MISC · Rejected Takeoff (PDF 560)",
       "cite": "Fire warning, or severe damage … Sudden loss of engine thrust"
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, roger Mayday. Fire and rescue services are on their way. Say intentions.",
       "pause": 0
      }
     ],
     "prompt": "Tell the tower what you intend to do.",
     "model": [
      "Fastair three four five, we will remain on the runway and advise if we need to evacuate."
     ],
     "points": [
      "Dije que me quedo en la pista (remain on the runway).",
      "Dije que avisaré si hay que evacuar (advise if we need to evacuate).",
      "Usé mi indicativo."
     ],
     "vocab": [
      {
       "en": "remain on the runway",
       "es": "permanecer en la pista"
      },
      {
       "en": "advise",
       "es": "informar, avisar"
      },
      {
       "en": "evacuate",
       "es": "evacuar"
      },
      {
       "en": "intentions",
       "es": "intenciones"
      }
     ],
     "note": "No se debe dejar la pista mientras no esté absolutamente claro que no hace falta evacuar y que es seguro hacerlo; comunicar las intenciones a ATC forma parte de esa decisión.",
     "refs": [
      {
       "src": "FCTM 25 NOV 24 · PR-AEP-MISC · Rejected Takeoff (PDF 562)",
       "cite": "Do not attempt to vacate the runway, until it is absolutely clear that an evacuation is not necessary and that it is safe to do so."
      },
      {
       "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)",
       "cite": "intention of the person in command"
      }
     ]
    }
   ]
  },
  {
   "id": "en_rp_03",
   "title": "Pasajero con un problema de salud",
   "scenario": "Eres el piloto del Fastair 345, un A320, a 10 millas al norte de Walden, a 2 000 pies, en aproximación. Un pasajero tiene un posible infarto. No hay peligro inmediato para el avión, pero necesitas aterrizar con prioridad y que esperen una ambulancia.",
   "turns": [
    {
     "prompt": "Make the urgency call to Walden Tower.",
     "model": [
      "Pan-pan, pan-pan, pan-pan, Walden Tower, Fastair three four five, one zero miles north at two thousand feet. Passenger with suspected heart attack. Request priority landing."
     ],
     "points": [
      "Dije PAN PAN tres veces (no MAYDAY: el avión no está en peligro inmediato).",
      "Nombré la estación (Walden Tower) y mi indicativo.",
      "Incluí posición y nivel (10 millas al norte, 2 000 pies).",
      "Nombré el problema (passenger with suspected heart attack) y lo que pido (priority landing).",
      "Hablé despacio y con claridad."
     ],
     "vocab": [
      {
       "en": "suspected heart attack",
       "es": "posible infarto"
      },
      {
       "en": "priority landing",
       "es": "aterrizaje con prioridad"
      },
      {
       "en": "miles north",
       "es": "millas al norte"
      },
      {
       "en": "request",
       "es": "solicito"
      }
     ],
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.3.1 · p. 9-4 (PDF 91)",
       "cite": "An urgency message should contain as many of the elements detailed in 9.2.1.1 as are required by the circumstances."
      },
      {
       "src": "ICAO Doc 9432 · §9.1.2 · p. 9-1 (PDF 88)",
       "cite": "a condition concerning the safety of an aircraft or other vehicle, or of some person on board or within sight, but which does not require immediate assistance"
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, Walden Tower, number one, cleared straight-in approach runway one seven, wind one eight zero degrees, one zero knots, QNH one zero zero eight. Ambulance alerted.",
       "pause": 0
      }
     ],
     "prompt": "Read back the tower’s clearance.",
     "model": [
      "Cleared straight-in approach runway one seven, QNH one zero zero eight, Fastair three four five."
     ],
     "points": [
      "Colacioné la autorización (cleared straight-in approach runway 17).",
      "Colacioné el QNH (1008).",
      "Terminé con mi indicativo."
     ],
     "vocab": [
      {
       "en": "cleared straight-in approach",
       "es": "autorizado a aproximación directa"
      },
      {
       "en": "number one",
       "es": "número uno (primero en la secuencia)"
      },
      {
       "en": "ambulance alerted",
       "es": "ambulancia avisada"
      }
     ],
     "refs": [
      {
       "src": "ICAO Doc 9432 · §2.8.3.6 · p. 2-13 (PDF 30)",
       "cite": "Other clearances or instructions, including conditional clearances, shall be read back or acknowledged in a manner to clearly indicate that they have been understood and will be complied with."
      },
      {
       "src": "ICAO Doc 9432 · §2.8.3.7 · p. 2-14 (PDF 31)",
       "cite": "An aircraft should terminate the read-back by its call sign."
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, taxiway Golf closed due maintenance, use Alpha to vacate.",
       "pause": 0
      }
     ],
     "prompt": "Acknowledge the instruction.",
     "model": [
      "Vacating via Alpha, Fastair three four five."
     ],
     "points": [
      "Dije por dónde voy a desocupar la pista (vacating via Alpha).",
      "Terminé con mi indicativo."
     ],
     "vocab": [
      {
       "en": "taxiway closed",
       "es": "calle de rodaje cerrada"
      },
      {
       "en": "due maintenance",
       "es": "por mantenimiento"
      },
      {
       "en": "vacate",
       "es": "desocupar (la pista)"
      }
     ],
     "note": "Fraseología estándar para una calle cerrada: ATC indica por dónde salir de la pista y el piloto responde diciendo por dónde la desocupa.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §10.3 (ejemplo) · p. 10-3 (PDF 96)",
       "cite": "TAXIWAY GOLF CLOSED DUE MAINTENANCE USE ALPHA TO VACATE"
      }
     ]
    }
   ]
  },
  {
   "id": "en_rp_04",
   "title": "Pérdida de presión en crucero",
   "scenario": "Eres el piloto del Fastair 345, un A320, en crucero a FL 350 sobre la aerovía A1, en la posición North Cross NDB. De pronto se despresuriza la cabina. Empiezas un descenso de emergencia hacia FL 100 y tienes que avisar a ATC.",
   "turns": [
    {
     "prompt": "Tell ATC that you are making an emergency descent.",
     "model": [
      "Fastair three four five, position North Cross NDB, emergency descent to flight level one zero zero due to decompression.",
      "Mayday, mayday, mayday, Fastair three four five, position North Cross NDB, emergency descent to flight level one zero zero due to decompression."
     ],
     "points": [
      "Dije mi indicativo (Fastair 345).",
      "Dije dónde estoy (position North Cross NDB).",
      "Dije qué hago (emergency descent to flight level 100).",
      "Dije por qué (due to decompression).",
      "Hablé despacio y con claridad."
     ],
     "vocab": [
      {
       "en": "emergency descent",
       "es": "descenso de emergencia"
      },
      {
       "en": "decompression",
       "es": "descompresión"
      },
      {
       "en": "position",
       "es": "posición"
      },
      {
       "en": "flight level",
       "es": "nivel de vuelo"
      }
     ],
     "note": "Las dos formas sirven: la primera es la fraseología estándar del descenso de emergencia y la segunda antepone MAYDAY, porque una descompresión es un peligro grave e inmediato. En el procedimiento del A320 se avisa a ATC la naturaleza de la emergencia y las intenciones, y se considera poner el código 7700 en el transpondedor.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.4.1 · p. 9-5 (PDF 92)",
       "cite": "When an aircraft announces that it is making an emergency descent, the controller will take all possible action to safeguard other aircraft."
      },
      {
       "src": "FCOM 15 SEP 25 · PRO-ABN-CAB_PR · EMER DESCENT (PDF 6357)",
       "cite": "Notify ATC of the nature of the emergency, and state intention."
      },
      {
       "src": "ICAO Doc 9432 · §9.1.2 · p. 9-1 (PDF 88)",
       "cite": "a condition of being threatened by serious and/or imminent danger and of requiring immediate assistance"
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, roger. Turn right heading one eight zero. Descend to flight level one zero zero. Report level.",
       "pause": 0
      }
     ],
     "prompt": "Read back ATC’s instructions.",
     "model": [
      "Right heading one eight zero, descending to flight level one zero zero, will report level, Fastair three four five."
     ],
     "points": [
      "Colacioné el rumbo (right heading 180).",
      "Colacioné el nivel (flight level 100).",
      "Acepté informar el nivel (will report level).",
      "Terminé con mi indicativo."
     ],
     "vocab": [
      {
       "en": "turn right heading",
       "es": "vire a la derecha al rumbo"
      },
      {
       "en": "descend to",
       "es": "descienda a"
      },
      {
       "en": "report level",
       "es": "informe nivelado"
      },
      {
       "en": "will report",
       "es": "informaré"
      }
     ],
     "refs": [
      {
       "src": "ICAO Doc 9432 · §2.8.3.5 · p. 2-13 (PDF 30)",
       "cite": "runway-in-use, altimeter settings, SSR codes, level instructions, heading and speed instructions"
      },
      {
       "src": "ICAO Doc 9432 · §2.8.3.7 · p. 2-14 (PDF 31)",
       "cite": "An aircraft should terminate the read-back by its call sign."
      }
     ]
    },
    {
     "heard": [
      {
       "who": "atc",
       "text": "Fastair three four five, say intentions.",
       "pause": 0
      }
     ],
     "prompt": "Tell ATC your intentions.",
     "model": [
      "Fastair three four five, request diversion to Walden."
     ],
     "points": [
      "Usé REQUEST para pedir.",
      "Nombré el aeródromo (Walden).",
      "Usé mi indicativo."
     ],
     "vocab": [
      {
       "en": "request diversion",
       "es": "solicito desvío"
      },
      {
       "en": "intentions",
       "es": "intenciones"
      }
     ],
     "note": "Las intenciones del piloto al mando forman parte del mensaje de socorro.",
     "refs": [
      {
       "src": "ICAO Doc 9432 · §9.2.1.1 · p. 9-2 (PDF 89)",
       "cite": "intention of the person in command"
      }
     ]
    }
   ]
  }
 ],
 "pruebas": [
  {
   "n": 1,
   "mcq": [
    "en_q_01",
    "en_q_08",
    "en_q_18",
    "en_q_25",
    "en_q_39",
    "en_q_51",
    "en_q_62",
    "en_q_45"
   ],
   "images": [
    "en_img_01",
    "en_img_05"
   ],
   "listening": [
    "en_lis_01",
    "en_lis_08",
    "en_lis_03",
    "en_lis_11"
   ],
   "roleplay": "en_rp_01"
  },
  {
   "n": 2,
   "mcq": [
    "en_q_06",
    "en_q_11",
    "en_q_20",
    "en_q_29",
    "en_q_38",
    "en_q_55",
    "en_q_66",
    "en_q_72"
   ],
   "images": [
    "en_img_02",
    "en_img_07"
   ],
   "listening": [
    "en_lis_02",
    "en_lis_07",
    "en_lis_04",
    "en_lis_09"
   ],
   "roleplay": "en_rp_02"
  },
  {
   "n": 3,
   "mcq": [
    "en_q_05",
    "en_q_12",
    "en_q_22",
    "en_q_30",
    "en_q_44",
    "en_q_56",
    "en_q_67",
    "en_q_48"
   ],
   "images": [
    "en_img_03",
    "en_img_06"
   ],
   "listening": [
    "en_lis_05",
    "en_lis_10",
    "en_lis_14",
    "en_lis_12"
   ],
   "roleplay": "en_rp_03"
  },
  {
   "n": 4,
   "mcq": [
    "en_q_02",
    "en_q_10",
    "en_q_21",
    "en_q_33",
    "en_q_41",
    "en_q_53",
    "en_q_65",
    "en_q_73"
   ],
   "images": [
    "en_img_04",
    "en_img_08"
   ],
   "listening": [
    "en_lis_15",
    "en_lis_13",
    "en_lis_16",
    "en_lis_06"
   ],
   "roleplay": "en_rp_04"
  }
 ]
}
`;
