/* Inglés OACI · Audios (ATIS y autorizaciones) que la app lee con voces del dispositivo · 16 elementos. data/english/index.js los reúne.
   Las fuentes (cite, src, refs) son internas: nunca se muestran. */
window.ENGLISH_PARTS=window.ENGLISH_PARTS||{};
window.ENGLISH_PARTS["listening"]=[
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
];
