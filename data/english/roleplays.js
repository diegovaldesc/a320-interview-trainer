/* Inglés OACI · Role-plays con ATC · 4 elementos. data/english/index.js los reúne.
   Las fuentes (cite, src, refs) son internas: nunca se muestran. */
window.ENGLISH_PARTS=window.ENGLISH_PARTS||{};
window.ENGLISH_PARTS["roleplays"]=[
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
];
