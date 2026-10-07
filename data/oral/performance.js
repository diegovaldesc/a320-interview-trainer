/* Entrevista oral · Performance: MAC y pesos, cost index, combustible, pista contaminada, FLEX y derate, despegue y segmentos, velocidades límite.
   21 preguntas (también las usa Need to know). Cada una trae su respuesta de referencia, su
   rúbrica (concepts o steps, criticalErrors) y sus fuentes internas (refs), que nunca se muestran.
   data/oral/index.js las reúne en ORAL_VOICE_BANK. */
window.ORAL_PARTS=window.ORAL_PARTS||{};
window.ORAL_PARTS["performance"]=[
{id:"ov_mac_envelope",question:"¿Qué es el MAC% y cuál es la envolvente operacional del A320?",
 short:"Es la posición del centro de gravedad (CG) expresada como porcentaje de la mean aerodynamic chord (MAC). La envolvente es el rango de %MAC, según el peso, dentro del cual tiene que estar el CG.",
 reference:"El MAC% dice dónde está el centro de gravedad (CG): es un porcentaje de la mean aerodynamic chord (MAC, la cuerda aerodinámica media), medido desde su leading edge (borde de ataque). 0% es el leading edge y 100% el trailing edge.\n\nLa envolvente del CG es el rango de %MAC dentro del cual tiene que estar el CG. Tiene un límite delantero y uno trasero, que cambian con el peso, para despegue, vuelo, aterrizaje y zero fuel weight (ZFW).\n\nEn la cabina se ve en la escala del pitch trim wheel del pedestal, que va aproximadamente del 15 al 41% MAC. La banda verde marca el rango de trim válido para el despegue: el CG de despegue del loadsheet tiene que caer dentro de ella.\n\nEl A320 está certificado con dos límites delanteros: el básico y el extended forward, que admite un CG más adelantado. Si el loadsheet indica T1, la performance se calcula con el CG básico; si no, con extended forward.\n\nUn CG adelantado hace que al avión le cueste rotar y penaliza la performance. Un CG atrasado reduce la estabilidad y el avión tiende a rotar solo.",
 concepts:[
  {label:"El %MAC indica la posición del centro de gravedad",weight:2,required:true,accepted:["centro de gravedad","posicion del centro","el cg","cg","ce ge","center of gravity"]},
  {label:"MAC: cuerda aerodinámica media (cuerda de referencia del ala)",weight:2,required:true,accepted:["cuerda aerodinamica media","cuerda media aerodinamica","cuerda media","cuerda de referencia","cuerda aerodinamica","mean aerodynamic chord"]},
  {label:"Porcentaje medido desde el borde de ataque de la MAC",weight:1,accepted:["borde de ataque","desde el borde","leading edge","lemac"]},
  {label:"Envolvente del CG: rango de %MAC con límite delantero y trasero según el peso",weight:2,accepted:["limites delantero y trasero","limite delantero","limite trasero","limite adelantado","limite atrasado","envolvente de peso","envolvente de centrado","peso y centrado","cg envelope","limites del cg","limites del centro de gravedad","rango de mac","cg adelantado","cg atrasado","muy adelante","muy atras","muy adelantado","muy atrasado"]},
  {label:"Rango aproximado en el volante de trim: 15 a 41% MAC, con banda verde para el despegue",weight:2,accepted:["41","cuarenta y uno","15 al 41","15 a 41","15 y 41","banda verde","arco verde","franja verde","green band"]},
  {label:"A320: límite delantero básico (T1) y extended forward",weight:2,accepted:["extended forward","ext fwd","basic","basico","t1","t 1","extendido hacia adelante"]},
  {label:"Efecto del CG adelantado (cuesta rotar, penaliza la performance) y atrasado (menos estabilidad)",weight:1,accepted:["rotar","rotacion","estabilidad","autoridad","distancia de aterrizaje","penaliza"]},
  {label:"Uso operacional: loadsheet, ZFWCG en el FMS, trim de despegue",weight:1,accepted:["loadsheet","load sheet","hoja de carga","zfwcg","trim","estabilizador","ths","init b"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · LIM-AG-WGHT · Center of Gravity Limits (PDF 9812)",cite:"CG limits are given in percentage of the reference chord length aft of the leading edge."},
  {src:"FCOM 15 SEP 25 · LIM-AG-WGHT · Center of Gravity Limits (PDF 9809)",cite:"The CG envelope provides the CG limits for the highest certified MTOW, MLW and MZFW."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-04 · Use of Extended Forward (PDF 8935)",cite:"The A320 is certified for basic and extended forward CG. Whenever the loadsheet indicates that the CG condition is \"T1\", use Basic (T1) for the FlySmart performance calculations."},
  {src:"FCOM 15 SEP 25 · EFB-LDG-40 · SBRJ basic CG envelope (PDF 10181; tabla: 50 t sin viento 1 205 m)",cite:"REQUIRED LANDING DISTANCE CONF FULL – BASIC CG ENVELOPE"},
  {src:"FCOM 15 SEP 25 · EFB-LDG-40 · SBRJ extended CG envelope (PDF 10182; tabla: 50 t sin viento 1 237 m)",cite:"REQUIRED LANDING DISTANCE CONF FULL – EXTENDED CG ENVELOPE"},
  {src:"DAN 121 ED3 ENM7 · 121.1217 (e) Peso y balance (PDF 171)",cite:"Cada vez que la posición del centro de gravedad de la aeronave para peso vacío se desplace más de 0,5% de la cuerda media aerodinámica."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-30 · Pitch trim wheel (PDF 3145)",cite:"Before takeoff, the pilot sets the THS to the angular value, determined as a function of the aircraft CG, using the CG scale on the wheel."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-30 · Pitch trim wheel (PDF 3145)",cite:"The limits of the THS normal setting range for takeoff are indicated by a green band on the pitch trim wheel."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-30 · Pedestal (PDF 3143; figura de baja resolución: la escala de CG del volante de trim tiene marcas en 20, 25, 30, 35 y 41; la primera, de alrededor de 15, no se lee con certeza. El usuario recuerda 15-41)",cite:"PEDESTAL"},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff pitch trim setting (PDF 300)",cite:"The aircraft performs a safe takeoff, provided that the pitch trim setting is within the green band on the pitch trim wheel."},
  {src:"A320 Tutorials REV15 · After start, pitch trim (PDF 167)",cite:"The Takeoff CG value must be within the green band limits."},
  {src:"FCTM 25 NOV 24 · AS-FM-10 · General (PDF 199)",cite:"A ZFW or ZFWCG entry error in MCDU INIT B page induces calculation errors that are to be highlighted."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff pitch trim setting (PDF 300)",cite:"With an aft CG and the pitch trim set to the nose-up limit, the pilots will most probably have to counteract an early autorotation until VR is reached."}
 ]},

{id:"ov_weights",question:"Explica los pesos operativos del avión: factory weight, empty weight, basic weight, dry operating weight y zero fuel weight.",
 short:"Son pesos que se van sumando: el avión vacío de fábrica, después lo que agrega el operador, después la carga paga y al final el combustible. Cada uno tiene su máximo estructural.",
 reference:"Se construyen uno sobre otro (los nombres cambian un poco entre operadores):\n- Factory weight o manufacturer's empty weight (MEW): estructura, motores, sistemas y equipos fijos, con solo los fluidos de sistemas cerrados.\n- Operating empty weight (OEW, peso vacío operativo): el MEW más los ítems del operador, como combustible no utilizable, aceite, equipos de emergencia, asientos, galleys y la tripulación con su equipaje.\n- Dry operating weight (DOW, peso operativo en seco): el avión listo para ese vuelo, sin combustible utilizable ni carga paga (el OEW más lo propio del vuelo, como el catering). En el plan de vuelo, el basic weight es esa base a la que se le suma la carga paga.\n- Zero fuel weight (ZFW): el DOW más la carga paga (pasajeros, equipaje y carga).\n\nCon el combustible de despegue se llega al takeoff weight (TOW); restando el trip fuel queda el landing weight, y sumando el combustible de rodaje, el peso de rampa.\n\nCada uno tiene su máximo estructural: MZFW (por la flexión en la raíz del ala cuando no hay combustible en las alas que la alivie), MTOW, MLW y MTW.",
 concepts:[
  {label:"Peso de fábrica (MEW): estructura, motores y sistemas",weight:2,required:true,accepted:["peso de fabrica","factory weight","manufacturer","mew","peso vacio de fabrica","peso del fabricante"]},
  {label:"Peso vacío operativo o básico (OEW): MEW más los ítems del operador",weight:2,accepted:["peso vacio operativo","operational empty weight","operating empty weight","oew","items del operador","equipamiento del operador","combustible no utilizable","basic weight","peso basico"]},
  {label:"DOW: listo para el vuelo, sin combustible utilizable ni carga paga",weight:2,required:true,accepted:["dry operating weight","dow","peso operativo en seco","peso operacional seco","peso operativo seco","sin combustible utilizable","listo para el vuelo","listo para volar"]},
  {label:"ZFW: DOW más la carga paga",weight:2,required:true,accepted:["zero fuel weight","zfw","peso cero combustible","peso sin combustible","dow mas carga paga","dow mas la carga paga","dow mas el payload"]},
  {label:"TOW, peso de aterrizaje y de rampa con el combustible",weight:1,accepted:["peso de despegue","takeoff weight","tow","peso de aterrizaje","landing weight","peso de rampa","ramp weight","peso de rodaje","taxi weight"]},
  {label:"Cada uno tiene su máximo estructural (MZFW, MTOW, MLW, MTW)",weight:2,accepted:["mzfw","mtow","mlw","mtw","maximo estructural","maximos estructurales","maximum zero fuel","peso maximo"]},
  {label:"Razón del MZFW: flexión en la raíz del ala",weight:1,accepted:["raiz del ala","flexion","momento flector","alivio","alivia","combustible en las alas"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · B.2.1 Aircraft Weight Definitions (PDF 41)",cite:"Manufacturer’s Empty Weight (MEW) : The weight of the structure, power plant, furnishings, systems and other items of equipment that are considered an integral part of the aircraft."},
  {src:"Getting to Grips with Aircraft Performance · B.2.1 Aircraft Weight Definitions (PDF 41)",cite:"Operational Empty Weight (OEW) : The manufacturer’s weight empty plus the operator’s items, i.e. the flight and cabin crew and their baggage, unusable fuel, engine oil, emergency equipment"},
  {src:"Getting to Grips with Aircraft Performance · B.2.1 Aircraft Weight Definitions (PDF 41)",cite:"Dry Operating Weight (DOW) : The total weight of an aircraft ready for a specific type of operation excluding all usable fuel and traffic load."},
  {src:"Getting to Grips with Aircraft Performance · B.2.1 Aircraft Weight Definitions (PDF 42)",cite:"ZFW = DOW + traffic load"},
  {src:"Getting to Grips with Aircraft Performance · B.2.4 MZFW (PDF 43)",cite:"Bending moments, which apply at the wing root, are maximum when the quantity of fuel in the wings is minimum"},
  {src:"A320 Tutorials REV15 · Calculate EZFW (PDF 123)",cite:"BASIC WT = Basic Weight of aircraft"}
 ]},

{id:"ov_cost_index",question:"¿Qué es el cost index?",
 short:"Es la relación entre el costo del tiempo y el costo del combustible. El FMGS lo usa para calcular la velocidad ECON y el nivel óptimo que dan el menor costo total del vuelo.",
 reference:"CI = costo del tiempo ÷ costo del combustible, expresado en kg/min o en 100 lb/h. Lo define la aerolínea para cada ruta.\n\nEl FMGS lo usa, junto con el peso, el nivel de crucero, el viento y la temperatura, para calcular la velocidad ECON de ascenso, crucero y descenso, y el nivel óptimo.\n- CI 0: mínimo consumo, es decir, máximo alcance.\n- CI 999: mínimo tiempo, es decir, máxima velocidad.\n\nEl objetivo es el menor costo total del vuelo, no solo ahorrar combustible. Un CI de 30 no quiere decir que se consumen 30 kg por minuto. La tripulación normalmente no lo cambia, salvo por una razón operacional, por ejemplo bajarlo si el combustible extra se acerca a cero. Con un motor fallado, el FMS usa la velocidad de long range cruise con un motor.",
 concepts:[
  {label:"Relación costo del tiempo / costo del combustible",weight:2,required:true,accepted:["costo del tiempo","coste del tiempo","costo de tiempo","costo del combustible","coste del combustible","relacion entre el costo","tiempo y combustible","tiempo versus combustible","time cost"]},
  {label:"El FMGS lo usa para la velocidad ECON y el nivel óptimo",weight:2,accepted:["econ","velocidad economica","econ speed","econ mach","velocidad optima","nivel optimo","opt fl","fmgs","fms"]},
  {label:"CI 0: mínimo consumo (máximo alcance)",weight:2,accepted:["ci 0","cost index cero","ci cero","minimo consumo","minimo combustible","maximo alcance","max range"]},
  {label:"CI máximo (999): mínimo tiempo, máxima velocidad",weight:2,accepted:["999","minimo tiempo","maxima velocidad","mas rapido","mayor velocidad"]},
  {label:"Lo define la aerolínea para cada ruta",weight:1,accepted:["aerolinea","operador","compania","cada ruta","por ruta"]},
  {label:"Busca el menor costo total, no solo ahorrar combustible",weight:1,accepted:["costo total","coste total","costo del vuelo","no solo ahorrar","no solo combustible","costo operativo"]}
 ],
 criticalErrors:[{accepted:["fuel flow","flujo de combustible","caudal de combustible"],penalty:2,feedback:"El cost index no es un fuel flow: un CI de 30 kg/min significa que un minuto de vuelo cuesta lo mismo que 30 kg de combustible, no que se consumen 30 kg por minuto."}],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-40-20 · Cost Index (PDF 1689)",cite:"CI is the ratio of flight time cost (CT) to fuel cost (CF)."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-40-20 · Cost Index (PDF 1689)",cite:"CI = 0 corresponds to minimum fuel consumption (Max Range)."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-40-20 · Cost Index (PDF 1689)",cite:"CI = 999 corresponds to minimum time."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-40-20 · Cost Index (PDF 1689)",cite:"The airline's operations department usually defines the cost index, to optimize each company route."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-40-10 · Optimization (PDF 1676)",cite:"The FMGS computes the optimum target speed (ECON SPD/MACH) as a function of:"},
  {src:"Getting to Grips with Aircraft Performance · F.2.1.3 Economic Mach Number (PDF 136)",cite:"This does not mean the fuel flow is 30 kg/min."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-150 · Cost Index (PDF 313)",cite:"then it is appropriate to reduce the CI."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-20-10-25 · PERF CRZ page (PDF 1903)",cite:"EO LRC replaces automatically the cost index value in case of engine out."}
 ]},

{id:"ov_fuel_dan121",question:"¿Cuáles son los mínimos de combustible según la DAN 121?",
 short:"Se arma por partes: rodaje, trayecto, contingencia (5%, mínimo 5 minutos), alternativa, reserva final de 30 minutos a 1 500 ft, adicional si hace falta y discrecional.",
 reference:"La norma arma el combustible mínimo por partes:\n- Rodaje: lo que se consume en tierra antes del despegue y después del aterrizaje, incluido el APU.\n- Trayecto (trip): desde el despegue hasta aterrizar en destino.\n- Contingencia: el 5% del trayecto, pero nunca menos que 5 minutos de espera a 1 500 ft sobre el destino.\n- Alternativa: aproximación frustrada en destino, ascenso, ruta, descenso y aterrizaje en el alternativo. Si no se requiere alternativo, 15 minutos de espera a 1 500 ft sobre el destino; para un aeródromo aislado, 2 horas de crucero normal, incluida la reserva final.\n- Reserva final (avión a turbina): 30 minutos a velocidad de espera a 1 500 ft sobre el aeródromo.\n- Adicional: lo que falte para una falla de motor o una despresurización en el punto más crítico, más 15 minutos de espera y la aproximación, o para el escenario EDTO.\n- Discrecional: a criterio del comandante.\n\nEn vuelo se declara “combustible mínimo” si cualquier cambio haría aterrizar con menos que la reserva final, y MAYDAY combustible si se calcula aterrizar con menos que ella.",
 concepts:[
  {label:"Combustible de rodaje (incluye APU)",weight:1,accepted:["rodaje","taxi"]},
  {label:"Combustible de trayecto (trip)",weight:1,accepted:["trayecto","trip","combustible de viaje","viaje"]},
  {label:"Contingencia: 5% del trayecto, mínimo 5 minutos de espera a 1 500 ft",weight:2,required:true,accepted:["contingencia","contingency","5 por ciento","cinco por ciento","cinco minutos"]},
  {label:"Combustible de alternativa",weight:2,accepted:["alternativa","alternativo","alterno","alternate"]},
  {label:"Reserva final: 30 minutos de espera a 1 500 ft",weight:2,required:true,accepted:["reserva final","final reserve","treinta minutos","reserva"]},
  {label:"Adicional (falla de motor, despresurización, EDTO) y discrecional",weight:1,accepted:["adicional","additional","discrecional","extra","falla de motor","despresurizacion","edto"]},
  {label:"Casos especiales: sin alternativo 15 minutos; aeródromo aislado 2 horas",weight:1,accepted:["quince minutos","sin alternativo","sin alterno","dos horas","2 horas","aislado","aeropuerto aislado","aerodromo aislado"]},
  {label:"En vuelo: combustible mínimo y MAYDAY combustible",weight:1,accepted:["combustible minimo","minimum fuel","mayday","emergencia de combustible"]}
 ],
 refs:[
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(1) (PDF 71)",cite:"Combustible para el rodaje (inicial y final), que será la cantidad de combustible que, según lo previsto, se consumirá antes del despegue"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(3) (PDF 71)",cite:"Será el 5% del combustible previsto para el trayecto"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(3) (PDF 71)",cite:"pero en ningún caso será inferior a la cantidad requerida para volar durante cinco minutos a la velocidad de espera a 450 metros (1 500 pies) sobre el aeródromo de destino en condiciones normales"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(4)(iii)(B) (PDF 72)",cite:"la cantidad de combustible que se necesita para volar durante dos horas con un consumo en crucero normal sobre el aeródromo de destino, incluyendo el combustible de reserva final."},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(4)(iv) (PDF 72)",cite:"durante 15 minutos a velocidad de espera a 450 metros (1 500 pies) sobre la elevación del aeródromo de destino en condiciones normales"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(5)(ii) (PDF 72)",cite:"Para avión con motores de turbina, la cantidad de combustible que se necesita para volar durante 30 minutos a velocidad de espera a 450 metros (1 500 pies)"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(6)(i) (PDF 72)",cite:"Aeródromo de Alternativa en caso de falla de motor o pérdida de presurización"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (c)(7) (PDF 73)",cite:"Combustible discrecional, será la cantidad extra de combustible que, a juicio del Piloto al Mando, debe llevarse."},
  {src:"DAN 121 ED3 ENM7 · 121.233 (f)(5) (PDF 73)",cite:"declarando COMBUSTIBLE MÍNIMO"},
  {src:"DAN 121 ED3 ENM7 · 121.233 (f)(6) (PDF 73)",cite:"MAYDAY-MAYDAY- MAYDAY COMBUSTIBLE"}
 ]},

{id:"ov_contaminated_rwy",question:"¿Cuándo se considera que una pista está contaminada y qué cambia para el despegue?",
 short:"Cuando más del 25% de la pista está cubierta por agua, slush o nieve de más de 3 mm, o por hielo o nieve compactada. Para el despegue: no hay FLEX, el cálculo cambia (15 ft, reversores, tope de peso de pista seca) y hay espesores máximos.",
 reference:"Una pista está contaminada cuando más del 25% de su superficie en uso (largo y ancho) está cubierta por un contaminante:\n- Fluido de más de 3 mm: agua estancada (standing water), slush, nieve húmeda o seca.\n- Duro: nieve compactada, hielo (ice) o hielo mojado (wet ice).\n\nCon 3 mm o menos de agua la pista está mojada (wet), no contaminada; seca es la que no tiene humedad visible. Los contaminantes fluidos reducen la fricción, frenan la aceleración (precipitation drag) y causan hidroplaneo; los duros solo reducen la fricción.\n\nPara el despegue cambian tres cosas:\n- No se puede usar FLEX: se despega con TOGA o con derated.\n- El cálculo tiene dos alivios: si falla un motor, basta con llegar a 15 ft al final de la takeoff distance (screen height) en vez de 35 ft, y en la accelerate-stop distance se cuentan los reversores. Como esos alivios podrían dar más peso que en pista seca, nunca se puede despegar con más peso que el de pista seca en las mismas condiciones.\n- Hay un espesor máximo: hay datos de performance solo hasta 13 mm de agua o slush, 30 mm de nieve húmeda y 100 mm de nieve seca.\n\nLos alivios del cálculo valen igual en pista mojada; la prohibición del FLEX y los espesores máximos son solo de la pista contaminada.",
 concepts:[
  {label:"Parte significativa de la superficie (tradicionalmente más del 25%)",weight:2,required:true,accepted:["25","25 por ciento","veinticinco por ciento","parte significativa","parte importante","porcion significativa"]},
  {label:"Contaminante fluido de más de 3 mm: agua estancada, slush, nieve",weight:2,required:true,accepted:["3 mm","3 milimetros","tres milimetros","agua estancada","slush","nieve","standing water","aguanieve"]},
  {label:"Contaminante duro: nieve compactada, hielo",weight:2,accepted:["hielo","nieve compactada","compactada","ice"]},
  {label:"Diferencia con pista mojada (hasta 3 mm) y seca",weight:1,accepted:["mojada","wet","seca"]},
  {label:"Efectos: menos fricción, resistencia por precipitación, hidroplaneo",weight:2,accepted:["friccion","frenado","hidroplaneo","aquaplaning","resistencia por precipitacion","precipitacion"]},
  {label:"Cambios en el despegue: sin FLEX, screen height de 15 ft, reversores, no más peso que en seca, espesores máximos",weight:1,accepted:["screen height","15 ft","15 pies","quince pies","reversores","reversas","reversa","peso que en pista seca","peso de pista seca","13 mm","13 milimetros","flex"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Descriptions (PDF 10127)",cite:"A runway is contaminated when a significant portion (depending on the applicable regulation) of its surface is covered with:"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Descriptions (PDF 10127)",cite:"In terms of performance, a contaminated runway is a runway covered by a fluid contaminant with a depth of more than 3 mm (1/8 in)."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Descriptions (PDF 10127)",cite:"Hard contaminants only reduce friction forces."},
  {src:"DAN 121 ED3 ENM7 · Apéndice 10, definiciones (PDF 407)",cite:"Una pista está contaminada cuando más del 25% de su superficie"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-20 · Wet runway (PDF 10125)",cite:"A runway is considered as wet, when the surface is covered by any visible moisture or water up to and including 3 mm (1/8 in) depth."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Performance calculation (PDF 10129)",cite:"However, it is not allowed to take off at a weight higher than the weight on a dry runway."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Performance calculation (PDF 10129)",cite:"The screen height at the end of the takeoff segment is 15 ft, instead of 35 ft."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Restrictions (PDF 10130)",cite:"FLEX takeoff is not permitted on contaminated runways."},
  {src:"Getting to Grips with Aircraft Performance · C.5.5.4.3 Takeoff flight path on wet and contaminated runways (PDF 87)",cite:"On a wet or contaminated runway, the screen height (height at the end of the TOD) is 15 feet."},
  {src:"Getting to Grips with Aircraft Performance · C.5.5.4.4 Takeoff weight (PDF 88)",cite:"On a wet or contaminated runway, the takeoff mass must not exceed that permitted for a takeoff on a dry runway under the same conditions"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-30-30 · Performance calculation (PDF 10129)",cite:"Takeoff performance on contaminated runways can be calculated with the benefit of thrust reversers."}
 ]},

{id:"ov_flex_derate_contam",question:"En una pista contaminada, ¿qué diferencia hay entre usar FLEX y usar derated?",
 short:"En pista contaminada el FLEX está prohibido y el derated permitido. El FLEX calcula las velocidades mínimas de control con todo el empuje, así que la V1 no puede bajar; el derated las calcula con menos empuje, baja la V1 y acorta la ASD.",
 reference:"En pista contaminada el FLEX está prohibido y el derated está permitido. La diferencia está en con qué empuje se calculan las velocidades.\n\nFLEX: el empuje se reduce con una flex temperature, pero el cálculo parte del empuje máximo de despegue del motor, es decir, de toda su potencia nominal, y las velocidades mínimas de control (VMCG en tierra, VMCA en el aire) se calculan con todo el empuje disponible. Es así porque en FLEX se puede poner TOGA en cualquier momento, y si falla un motor y se pone TOGA en el otro, la asimetría y la guiñada son las máximas. La VMCG es la velocidad mínima a la que, si falla el motor crítico con el otro a empuje máximo, el avión se mantiene en la pista solo con el rudder, sin nosewheel steering y sin salirse más de 30 ft del eje; por debajo de ella, poner TOGA con un motor fallado puede sacar al avión de la pista. Por eso la V1 nunca puede ser menor que esa VMCG: como es alta, la V1 no puede bajar mucho y la accelerate-stop distance (ASD) queda larga, que es justo lo que no sirve en pista contaminada. Además, el FLEX solo tiene datos para pista seca o mojada.\n\nDerated: el empuje máximo es un rating certificado más bajo (TOGA menos un porcentaje, por ejemplo D04 o D08), y las velocidades de despegue, la VMCG y la VMCA se calculan con ese empuje reducido. Las velocidades mínimas de control bajan, la V1 puede ser menor y la ASD se acorta, lo que mejora el peso en pistas cortas o contaminadas cuando el límite es la VMCG. Tiene datos para pista seca, mojada y contaminada.\n\nEl precio: como todo se calculó con menos empuje, no se puede poner TOGA antes de la velocidad F. Con un motor fallado, TOGA a baja velocidad daría más guiñada de la que supuso el cálculo y puede llevar a perder el control del avión.",
 concepts:[
  {label:"El FLEX está prohibido en pista contaminada",weight:2,required:true,accepted:["flex esta prohibido","flex prohibido","prohibido el flex","prohibido usar flex","no se permite flex","no se permite el flex","no se puede usar flex","no se puede usar el flex","no puedo usar flex","no se usa flex","flex no esta permitido","flex no se permite","flex no se puede","flex no esta autorizado"]},
  {label:"FLEX: flex temperature; las velocidades mínimas de control salen de todo el empuje",weight:2,accepted:["flex temperature","temperatura asumida","temperatura flexible","assumed temperature","tflex","temperatura flex","potencia nominal","todo el empuje","toga disponible","toga en cualquier momento","en cualquier momento"]},
  {label:"El derated sí está permitido en pista contaminada",weight:2,required:true,accepted:["derate esta permitido","derated esta permitido","derate permitido","derated permitido","derate se permite","derated se permite","derate autorizado","derated autorizado","se puede usar derate","se puede usar el derate","derate se puede usar","derated se puede usar","si esta permitido","si se puede usar","cualquier estado de pista","seca mojada o contaminada","todo tipo de pista"]},
  {label:"Derated: rating certificado con performance propia",weight:2,accepted:["rating certificado","rating reducido","rating de empuje","empuje certificado","nivel certificado","certificado","datos propios","propia performance","performance propia","tablas propias","sus propias tablas","limite de operacion"]},
  {label:"Menor VMCG/VMCA: V1 menor y menor accelerate-stop distance",weight:2,accepted:["vmcg","vmca","velocidad minima de control","velocidades minimas de control","v1","v 1","accelerate stop distance","asd","aceleracion parada","acelerar y parar","acelerar y frenar"]},
  {label:"Con derated no se pone TOGA antes de la velocidad F",weight:1,accepted:["no se selecciona toga","no seleccionar toga","no se puede seleccionar toga","no se puede poner toga","no puedo poner toga","no usar toga","toga no esta permitido","velocidad f","antes de la velocidad f"]}
 ],
 criticalErrors:[{accepted:["flex esta permitido en pista contaminada","flex se permite en pista contaminada","flex se puede usar en pista contaminada","se puede usar flex en pista contaminada","derate esta prohibido en pista contaminada","derated esta prohibido en pista contaminada"],penalty:3,feedback:"Es al revés: el FLEX está prohibido en pista contaminada; el derated sí está permitido porque tiene performance certificada para ese estado de pista."}],
 refs:[
  {src:"FCOM 15 SEP 25 · LIM-ENG · Flex Takeoff (PDF 9922)",cite:"FLEX takeoff is not permitted on contaminated runways."},
  {src:"FCOM 15 SEP 25 · LIM-ENG · Derated Takeoff (PDF 9922)",cite:"The use of derated takeoff is permitted regardless of the runway condition (dry, wet, or contaminated)."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-30 · Derated Takeoff Principle (PDF 10118)",cite:"The derated takeoff enables to improve the takeoff performance if the TOW is limited by VMCG."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-40 · Flexible Takeoff vs Derated Takeoff (PDF 10121)",cite:"Possible above F speed"},
  {src:"FCTM 25 NOV 24 · PR-NP-SP-10-10-1 · Takeoff performances (PDF 438)",cite:"When available, a derated takeoff thrust results in lower minimum control speeds and, therefore, in a lower V1."},
  {src:"Getting to Grips with Aircraft Performance · C.7.1.1 Flexible takeoff (PDF 92)",cite:"This method is derived from the approved maximum takeoff thrust rating, and thus uses the same certified minimum control speeds."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Performance considerations (PDF 506)",cite:"The application of TOGA very rapidly supplies a large thrust increase but this comes with a significant increase in yawing moment and an increased pitch rate."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Performance considerations (PDF 506)",cite:"If the takeoff is performed at derated takeoff thrust, selecting TOGA at a speed below F can lead to loss of control of the aircraft."},
  {src:"Getting to Grips with Aircraft Performance · B.1.3.1 VMCG (PDF 36)",cite:"may not deviate more than 30 ft laterally from the centreline at any point."}
 ]},

{id:"ov_appr_ldg_climb",question:"¿Cuál es la diferencia entre approach climb y landing climb?",
 short:"Son los dos gradientes mínimos para un go-around: el approach climb con un motor inoperativo y configuración de aproximación (2,1% en bimotor), y el landing climb con todos los motores y configuración de aterrizaje (3,2%).",
 reference:"Son los dos gradientes mínimos de ascenso que se exigen para un go-around.\n- Approach climb: un motor inoperativo, TOGA en el motor que queda, tren arriba y configuración de aproximación (en Airbus CONF 2 o 3), a una velocidad entre 1,23 y 1,41 VS1g. Exige 2,1% en un bimotor (2,7% en un cuadrimotor).\n- Landing climb: todos los motores operativos, con el empuje disponible 8 segundos después de llevar las thrust levers de idle a TOGA, tren abajo y configuración de aterrizaje (CONF 3 o FULL), entre 1,13 y 1,23 VS1g. Exige 3,2% para todos los aviones.\n\nEn Airbus el que limita es el approach climb, así que el peso máximo por gradiente de go-around se calcula con él. Ese gradiente empeora con la altitud, la temperatura y el uso de bleeds, y en una aproximación CAT II o III se exige 2,5% o el gradiente publicado.",
 concepts:[
  {label:"Approach climb: un motor inoperativo",weight:2,required:true,accepted:["un motor inoperativo","motor inoperativo","un motor fallado","motor fallado","motor critico","oei","monomotor","n 1"]},
  {label:"Approach climb: tren arriba y configuración de aproximación",weight:2,accepted:["tren arriba","tren retraido","tren recogido","configuracion de aproximacion","flaps de aproximacion"]},
  {label:"Approach climb: 2,1% en bimotor",weight:2,required:true,accepted:["2 1","dos coma uno"]},
  {label:"Landing climb: todos los motores operativos",weight:2,required:true,accepted:["todos los motores","ambos motores","los dos motores","all engines","motores operativos","todos operativos"]},
  {label:"Landing climb: tren abajo y configuración de aterrizaje",weight:2,accepted:["tren abajo","tren extendido","tren afuera","configuracion de aterrizaje","conf full","flaps full"]},
  {label:"Landing climb: 3,2%",weight:2,accepted:["3 2","tres coma dos"]},
  {label:"Empuje disponible a los 8 segundos (idle a TOGA)",weight:1,accepted:["8 segundos","ocho segundos"]},
  {label:"En Airbus limita el approach climb; CAT II/III exige 2,5%",weight:1,accepted:["el que limita","limitante","limita","peso maximo","2 5","dos coma cinco","cat ii","cat 2","cat iii"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · E.3.3.1 Approach Climb (PDF 121)",cite:"This corresponds to an aircraft’s climb capability, assuming that one engine is inoperative."},
  {src:"Getting to Grips with Aircraft Performance · E.3.3.1 Approach Climb (PDF 121)",cite:"2- engine aircraft: 2.1%"},
  {src:"Getting to Grips with Aircraft Performance · E.3.3.2 Landing Climb (PDF 122)",cite:"The objective of this constraint is to ensure aircraft climb capability in case of a missed approach with all engines operating."},
  {src:"Getting to Grips with Aircraft Performance · E.3.3.2 Landing Climb (PDF 122)",cite:"Thrust available 8 seconds after initiation of thrust control movement from minimum flight idle to TOGA thrust"},
  {src:"Getting to Grips with Aircraft Performance · E.3.3.2 Landing Climb (PDF 122)",cite:"The minimum gradient to be demonstrated is 3.2% for all aircraft types."},
  {src:"Getting to Grips with Aircraft Performance · E.3.3.2 Landing Climb (PDF 122)",cite:"For all Airbus aircraft, this constraint is covered by the approach climb requirement."},
  {src:"Getting to Grips with Aircraft Performance · E.4.2.2 CAT II or CAT III Approach (PDF 127)",cite:"In case of a CAT II/III approach, the gradient is 2.5% (all aircraft types)"}
 ]},

{id:"ov_improve_takeoff",question:"¿Cómo se puede mejorar la performance de despegue cuando el peso está limitado?",
 short:"Separando lo que no se elige de lo que sí: configuración de flaps, packs OFF, optimizar las velocidades (V1 y V2), TOGA en vez de FLEX o derated, usar toda la pista y, si no alcanza, menos peso o esperar menos temperatura.",
 reference:"Primero se separa lo que no se elige (la pista, los obstáculos, la temperatura, la presión, el viento y el estado de la pista) de lo que sí se puede optimizar:\n- Configuración: CONF 1+F da mejor gradiente en pistas largas o cuando limita el ascenso; CONF 3 acorta la distancia en pistas cortas; CONF 2 es el compromiso cuando hay obstáculos.\n- Aire acondicionado: despegar con packs en OFF, o con bleed del APU, devuelve empuje.\n- Velocidades, que son la mayor fuente de ganancia: una V1 más alta favorece la takeoff distance y los obstáculos, pero empeora la accelerate-stop distance y la energía de frenos; una V2 más alta (improved climb) mejora el gradiente si sobra pista.\n- Empuje: TOGA en vez de FLEX, o derated si el límite es la VMCG en una pista corta o contaminada.\n- Pista: despegar desde la cabecera, sin intersección, y elegir la pista y el viento más favorables.\n\nUsar anti-ice solo cuando corresponde y, si aun así no alcanza, reducir el peso o esperar una temperatura más baja.",
 concepts:[
  {label:"Configuración de flaps: 1+F para ascenso, 3 para pista corta, 2 compromiso",weight:2,required:true,accepted:["conf 1","1 f","conf 2","conf 3","configuracion","flaps"]},
  {label:"Aire acondicionado: packs en OFF o bleed del APU",weight:2,accepted:["packs off","packs en off","packs apagados","sin packs","packs","aire acondicionado","bleed del apu","apu bleed"]},
  {label:"Optimización de velocidades: V1 y V2 (improved climb)",weight:2,accepted:["v1","v2","improved climb","optimizacion de velocidades","velocidades"]},
  {label:"Empuje: TOGA en vez de FLEX, derated si limita la VMCG",weight:2,accepted:["toga","derate","derated","empuje maximo"]},
  {label:"Pista: toda la longitud sin intersección, pista y viento favorables",weight:1,accepted:["interseccion","intersecciones","cabecera","toda la pista","largo de pista","otra pista","viento de frente","viento en contra","headwind","pendiente"]},
  {label:"Anti-ice solo si corresponde; reducir peso o esperar menor temperatura",weight:1,accepted:["anti ice","antihielo","reducir peso","bajar peso","reducir el peso","menos peso","temperatura mas baja","menor temperatura","baje la temperatura","esperar","esperando"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · EFB-TOF-10 · Takeoff Parameters (PDF 10107)",cite:"From the takeoff performance parameters that can be optimized, the takeoff speeds optimization has the largest effect on the gain of takeoff weight."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-50 · Takeoff Recommendations (PDF 10133)",cite:"As a general rule, CONF 1+F gives better performance on long runways (better climb gradient), whereas CONF 3 gives better performance on short runways (shorter takeoff distances)."},
  {src:"Getting to Grips with Aircraft Performance · J.2.2 Air Conditioning (PDF 197)",cite:"Air conditioning, when switched on during takeoff, decreases the available power and thus degrades the takeoff performance."},
  {src:"Getting to Grips with Aircraft Performance · J.2.3.2 V1/VR Ratio Influence (PDF 199)",cite:"On the contrary, the obstacle-limited weight is improved with a higher V1, as the takeoff distance is reduced."},
  {src:"Getting to Grips with Aircraft Performance · J.2.3.3 V2/VS Ratio Influence (PDF 202)",cite:"any V2/VS increase results in better climb gradients (1st and 2nd segment)"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-30 · Derated Takeoff Principle (PDF 10118)",cite:"The derated takeoff enables to improve the takeoff performance if the TOW is limited by VMCG."},
  {src:"FCTM 25 NOV 24 · PR-NP-SP-10-10-1 · Takeoff performances (PDF 438)",cite:"If anti-ice is used, the flight crew must apply the applicable performance penalty."}
 ]},

{id:"ov_eng_fail_cruise",question:"Si falla un motor en crucero, ¿qué estrategias de descenso existen (standard y obstacle, o drift down) y cómo se vuela cada una?",
 short:"Hay tres estrategias: standard (M 0,78 / 300 kt, la que se usa normalmente), obstacle o drift down (a green dot, para quedar lo más alto posible sobre terreno) y fixed speed para ETOPS.",
 reference:"Hay tres estrategias: standard, obstacle (drift down) y fixed speed para ETOPS. Si no hay un procedimiento previsto para la ruta, se usa la standard.\n\nEn todas: thrust levers a MCT, autothrust desconectado, un rumbo apropiado, determinar la altitud de recuperación con un motor y descender en OPEN DES con velocidad seleccionada, como mínimo green dot. Después, el ECAM.\n- Standard: M 0,78 / 300 kt, que mantiene el avión dentro de la envolvente de windmill relight, descendiendo hacia el REC MAX con un motor (el nivel máximo en long range cruise que muestra la página PROG). Cuando la V/S baja de 500 ft/min, se selecciona V/S −500 y se vuelve a conectar el autothrust.\n- Obstacle: sobre terreno se vuela a green dot, la velocidad de máxima fineza, para descender con menor razón y menor ángulo y mantener la mayor altitud posible, hasta el drift down ceiling. Al quedar libre del terreno se vuelve a la standard.\n\nEn la planificación, la trayectoria neta (net flight path) debe librar el terreno por 2 000 ft dentro de 5 NM a cada lado de la ruta.",
 concepts:[
  {label:"Palancas a MCT",weight:2,required:true,accepted:["mct","m c t","maximo continuo","maximum continuous","empuje maximo continuo","potencia maxima continua"]},
  {label:"Autothrust desconectado; descenso en OPEN DES con velocidad seleccionada",weight:1,accepted:["desconecta el autothrust","desconectar el autothrust","autothrust off","autothrust desconectado","athr off","a thr off","open des","open descent","descenso abierto","velocidad seleccionada"]},
  {label:"Nombra las estrategias standard y obstacle (drift down)",weight:1,accepted:["standard","estandar","obstacle","obstaculos","drift down"]},
  {label:"Standard: M 0,78 / 300 kt (envolvente de reencendido)",weight:2,required:true,accepted:["0 78","m 78","78","300 kt","300 nudos","300 kts","reencendido","relight","molinete","windmill"]},
  {label:"Standard: descender al REC MAX con un motor (LRC); V/S -500 al final",weight:1,accepted:["rec max","recommended max","largo alcance","long range","lrc","500"]},
  {label:"Obstacle: green dot, máxima fineza, menor razón y ángulo, mayor altitud",weight:2,required:true,accepted:["green dot","punto verde","maxima fineza","mejor fineza","maxima eficiencia","sustentacion resistencia"]},
  {label:"Techo de drift down y volver a la standard al librar el terreno",weight:1,accepted:["techo de drift down","drift down ceiling","libre del terreno","librar el terreno","libre de obstaculos","se vuelve a la standard","volver a la standard","revertir"]},
  {label:"Planificación: trayectoria neta a 2 000 ft del terreno, 5 NM a cada lado",weight:1,accepted:["2 000 pies","2000 pies","dos mil pies","trayectoria neta","5 nm","5 millas","cinco millas"]}
 ],
 refs:[
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Engine Failure During Cruise (PDF 509)",cite:"When an engine failure occurs during cruise, three possible strategies apply:"},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Engine Failure During Cruise (PDF 509)",cite:"Unless a specific procedure has been established before dispatch (considering ETOPS or mountainous areas), the standard strategy is used."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Engine Failure During Cruise (PDF 509)",cite:"The crew must not decelerate below green dot."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Standard strategy (PDF 510)",cite:"The speed of 0.78/300 kt is chosen to ensure the aircraft is within the stabilized windmill engine relight in-flight envelope."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Standard strategy (PDF 510)",cite:"When the V/S becomes less than 500 ft/min, select V/S -500 ft/min and A/THR on."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Obstacle strategy (PDF 510)",cite:"The speed target in this case is green dot. The procedure is similar to the standard strategy, but as the speed target is now green dot, the rate and angle of descent are reduced."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Obstacle strategy (PDF 511)",cite:"When clear of obstacles, revert to Standard Strategy."},
  {src:"FCOM 15 SEP 25 · DSC-22_20-10-50 · Engine-out in cruise phase (PDF 1730)",cite:"The engine-out descent strategy requires disconnection of the autothrust, and descent in OPEN DES mode."},
  {src:"Getting to Grips with Aircraft Performance · D.2.1.1 Drift Down procedure (PDF 98)",cite:"represents the best lift-to-drag ratio speed, where aerodynamic efficiency is maximum."},
  {src:"DAN 121 ED3 ENM7 · Apéndice 10, en ruta con un motor inactivo (PDF 412)",cite:"con un margen vertical de por lo menos 600 metros (2 000 pies), todo el terreno y obstáculos situados a lo largo de la ruta hasta 9,3 kilómetros (5 NM) a cada lado de la derrota prevista."}
 ]},

{id:"ov_cg_effects",question:"¿Qué efectos tiene un centro de gravedad (CG) adelantado y uno atrasado?",
 short:"Un CG adelantado hace al avión más estable pero pesado para rotar, y penaliza la performance. Un CG atrasado lo hace menos estable, con tendencia a rotar solo y más riesgo de tail strike.",
 reference:"CG adelantado (nose heavy): el avión tiende a bajar la nariz. Para equilibrarlo, la cola tiene que empujar más hacia abajo, y esa carga se suma al peso: suben un poco las velocidades y las distancias de despegue y aterrizaje. Por eso calcular con el CG extended forward penaliza la performance; por ejemplo, la landing distance requerida a 50 t pasa de 1 205 a 1 237 m.\n\nEn el despegue, con el trim al límite de nariz abajo, el avión se siente heavy to rotate y responde lento al input normal del sidestick. Hay que ajustar el input sin sobrerreaccionar. Una rotación lenta alarga la takeoff distance y deja menos margen sobre los obstáculos. A cambio, es muy estable en pitch.\n\nCG atrasado (tail heavy): el avión tiende a levantar la nariz. En el despegue, con el trim al límite de nariz arriba, puede empezar a rotar solo antes de VR (early autorotation), y hay que contrarrestarlo hasta VR sin sobrerreaccionar. Rotar antes de tiempo deja más pitch al despegar y menos espacio entre la cola y la pista: aumenta el riesgo de tail strike, y el avión despega con menos margen de velocidad.\n\nTambién es menos estable y los mandos se sienten más sensibles. Por eso, en direct law, el A320 ajusta la deflexión máxima del elevator según el CG.",
 concepts:[
  {label:"CG adelantado: nariz pesada, más estable",weight:2,required:true,accepted:["cg adelantado","centro de gravedad adelantado","nose heavy","nariz pesada","morro pesado","muy estable","estable en pitch"]},
  {label:"CG adelantado: pesado para rotar, rotación lenta",weight:2,accepted:["heavy to rotate","pesado para rotar","cuesta rotar","rotacion lenta","rota lento","rotar lento","responde lento"]},
  {label:"CG adelantado: más carga en la cola, penaliza la performance (más velocidad y distancia)",weight:2,accepted:["penaliza la performance","penaliza","mas distancia","mas pista","takeoff distance","landing distance","extended forward","carga en la cola","empujar hacia abajo","velocidad de perdida"]},
  {label:"CG atrasado: cola pesada, menos estable",weight:2,required:true,accepted:["cg atrasado","centro de gravedad atrasado","tail heavy","cola pesada","menos estable","inestable","menos estabilidad"]},
  {label:"CG atrasado: tiende a rotar solo antes de VR (early autorotation)",weight:2,accepted:["rotar solo","rota solo","autorotation","autorotacion","early rotation","rotacion temprana","antes de vr","levantar la nariz","levanta la nariz"]},
  {label:"CG atrasado: riesgo de tail strike",weight:2,accepted:["tail strike","tailstrike","golpe de cola","toque de cola","cola contra la pista"]},
  {label:"Corregir sin sobrerreaccionar; mandos más sensibles con CG atrasado",weight:1,accepted:["sobrerreaccionar","sobre reaccionar","overreact","sin sobrecorregir","mas sensibles","sensibles","sensible"]}
 ],
 refs:[
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff pitch trim setting (PDF 300)",cite:"With a forward CG and the pitch trim set to the nose-down limit, the PF will feel an aircraft"},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff pitch trim setting (PDF 300)",cite:"With an aft CG and the pitch trim set to the nose-up limit, the pilots will most probably have to counteract an early autorotation until VR is reached."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff pitch trim setting (PDF 300)",cite:"In either case the pilot may have to modify their normal control input in order to achieve the desired rotation rate, but should be cautious not to overreact."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Tail strike avoidance (PDF 299)",cite:"Whatever the cause of the early rotation, the result is an increased pitch attitude at liftoff, and therefore, a reduced tail clearance."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Rotation (PDF 298)",cite:"The takeoff run and the takeoff distance increase"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Direct law (PDF 3140)",cite:"It is a compromise between adequate controllability with the CG forward, and not-too-sensitive control with the CG aft."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-04 · Use of Extended Forward (PDF 8935)",cite:"The A320 is certified for basic and extended forward CG."},
  {src:"FCOM 15 SEP 25 · EFB-LDG-40 · SBRJ extended CG envelope (PDF 10182; tabla: 50 t sin viento 1 237 m vs 1 205 m con CG basico)",cite:"REQUIRED LANDING DISTANCE CONF FULL – EXTENDED CG ENVELOPE"}
 ]},

{id:"ov_flex_derate_def",question:"¿Qué es el FLEX y qué es el derated?",
 short:"Las dos son formas de despegar con menos empuje que el máximo. FLEX reduce el empuje con una temperatura asumida y deja TOGA disponible siempre; derated es un rating de empuje más bajo y certificado, con sus propias velocidades mínimas de control.",
 reference:"Se usan cuando el peso real es menor que el máximo permitido: con menos empuje se alarga la vida del motor, mejora su confiabilidad y bajan los costos de mantenimiento.\n\nFLEX (flexible takeoff): se calcula la flex temperature (TFLEX), la temperatura a la que el peso real sería justo el máximo, y el motor da el empuje TOGA que tendría a esa temperatura. El cálculo parte de toda la potencia nominal del motor y usa las mismas velocidades mínimas de control, por eso se puede poner TOGA en cualquier momento. No es un límite de operación. La TFLEX no puede ser mayor que la TFLEX máxima (la reducción no puede pasar del 25% del empuje máximo), ni menor que la flat rating temperature (TREF), ni menor que la OAT. Solo se usa en pista seca o mojada, y algunos ítems de la MEL no lo permiten.\n\nDerated: es un rating de empuje máximo más bajo, fijo y certificado (D04, D08, D12…, es decir TOGA −4%, −8%…), con sus propios datos de performance para pista seca, mojada o contaminada. Es un límite normal de operación. Como el empuje máximo es menor, bajan la VMCG y la VMCA, lo que mejora el peso cuando limita la VMCG (pistas cortas o contaminadas); si limita la VMCA, no mejora. Como todo se calculó con menos empuje, no se pone TOGA antes de la velocidad F.",
 concepts:[
  {label:"Ambos: despegue con menos empuje cuando el peso es menor que el máximo (vida del motor, mantenimiento)",weight:1,accepted:["empuje reducido","menos empuje","vida del motor","vida util del motor","mantenimiento","confiabilidad","peso real","peso menor"]},
  {label:"FLEX: temperatura asumida (flex temperature)",weight:2,required:true,accepted:["flex temperature","temperatura asumida","temperatura flexible","temperatura flex","tflex","assumed temperature"]},
  {label:"FLEX: parte de toda la potencia nominal; TOGA disponible en cualquier momento",weight:2,accepted:["toga disponible","toga en cualquier momento","en cualquier momento","potencia nominal","todo el empuje","empuje maximo","no es un limite"]},
  {label:"FLEX: TFLEX entre TREF/OAT y la máxima (reducción máxima 25%)",weight:1,accepted:["25","veinticinco por ciento","tref","flat rating","oat","temperatura exterior","tflex maxima","maxima flex"]},
  {label:"FLEX solo en pista seca o mojada",weight:1,accepted:["seca o mojada","pista seca","pista mojada"]},
  {label:"Derated: rating de empuje más bajo y certificado (D04, D08…)",weight:2,required:true,accepted:["rating certificado","rating de empuje","rating mas bajo","empuje certificado","d04","d08","d 04","d 08","4 por ciento"]},
  {label:"Derated: bajan VMCG/VMCA, mejora el peso si limita la VMCG (pistas cortas o contaminadas)",weight:2,accepted:["vmcg","vmca","velocidades minimas de control","pistas cortas","pista corta"]},
  {label:"Derated: no se pone TOGA antes de la velocidad F",weight:1,accepted:["velocidad f","f speed","antes de f","no se pone toga","no se puede poner toga","no toga"]}
 ],
 criticalErrors:[{accepted:["flex esta permitido en pista contaminada","flex se permite en pista contaminada","se puede usar flex en pista contaminada","flex se puede usar en pista contaminada"],penalty:3,feedback:"El FLEX no está permitido en pista contaminada: solo se usa en pista seca o mojada."}],
 refs:[
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-10 · General (PDF 10111)",cite:"The actual takeoff weight of the aircraft is often lower than the maximum regulatory takeoff weight."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-20 · Flexible takeoff principle (PDF 10114)",cite:"This temperature is referred to as TFLEX (Flex Temperature)."},
  {src:"Getting to Grips with Aircraft Performance · C.7.1.1 Flexible takeoff (PDF 92)",cite:"This method is derived from the approved maximum takeoff thrust rating, and thus uses the same certified minimum control speeds."},
  {src:"Getting to Grips with Aircraft Performance · C.7.1.1 Flexible takeoff (PDF 92)",cite:"In addition, thrust reduction cannot exceed 25% of the maximum takeoff thrust"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-20 · Flexible takeoff limitations (PDF 10116)",cite:"Some items listed in the MEL and CDL do not permit a flexible takeoff."},
  {src:"FCOM 15 SEP 25 · DSC-70-90-40-50 · Engine display (PDF 4803)",cite:"There are several levels of derated takeoff: D04, D08, D12, D16, D20"},
  {src:"Getting to Grips with Aircraft Performance · C.7.2.1 Derated takeoff (PDF 94)",cite:"the thrust for takeoff is considered as a normal takeoff operating limit."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-30 · Derated takeoff principle (PDF 10118)",cite:"The principle is to impose a lower engine rating to benefit from lower minimum control speeds."},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-30 · Derated takeoff principle (PDF 10119)",cite:"Therefore derated takeoff would not improve the takeoff weight if VMCA limited."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Performance considerations (PDF 506)",cite:"If the takeoff is performed at derated takeoff thrust, selecting TOGA at a speed below F can lead to loss of control of the aircraft."}
 ]},

{id:"ov_balanced_unbalanced",question:"¿Qué es una pista balanceada y una pista descompensada?",
 short:"Es un concepto para elegir la V1. En la pista balanceada la V1 hace que la ASD sea igual a la TOD; en la descompensada se elige una V1 distinta, para que una de las dos sea mayor, según lo que convenga.",
 reference:"No es algo físico de la pista: es un criterio para elegir la V1. Lo que se compara es la distancia que el avión necesita ese día: la takeoff distance con un motor fallado hasta 35 ft (TOD) y la accelerate-stop distance (ASD). Al subir la V1, la TOD se acorta (se acelera más tiempo con los dos motores) y la ASD se alarga; al bajarla pasa lo contrario.\n\nPista balanceada (o compensada): la V1 se elige de modo que la ASD sea igual a la TOD. Si el motor falla justo en V1, abortar o seguir necesitan la misma distancia: el avión queda detenido en el mismo punto donde, si hubiera seguido, habría alcanzado 35 ft y V2. Si la pista da el mismo largo para frenar y para seguir (sin stopway ni clearway), esa V1 es la que pide menos pista, porque la pista tiene que alcanzar para la más larga de las dos; esa distancia mínima se llama balanced field length. Si la pista mide justo eso, el avión queda detenido al final de la pista.\n\nPista descompensada (no balanceada): la V1 se elige de modo que la ASD y la TOD sean distintas, y cualquiera de las dos puede quedar mayor, según lo que mejore la situación. Una stopway (más distancia para frenar) o una clearway (más distancia para despegar) permite aumentar el peso para un largo de pista dado, pero no son necesarias: si sobra pista, se puede desbalancear igual.\n\nPor qué se desbalancea: para aprovechar la distancia que sobra de un lado y ganar peso, o más FLEX. Si limita continuar (la TOD o los obstáculos) y sobra distancia para frenar, conviene una V1 más alta; si limita frenar (la ASD, la energía de frenos, una pista mojada o contaminada), una V1 más baja. Además, la V1 tiene límites: no puede ser menor que la VMCG, ni mayor que la VR o que la velocidad máxima de energía de frenos (VMBE).\n\nCómo se desbalancea: moviendo la V1. En el A320 lo hace el EFB, que optimiza la V1 para el mayor peso. En pistas largas el peso suele quedar limitado por el ascenso, que no depende de la V1, y entonces hay un rango de V1 con el mismo peso máximo.\n\nEjemplo, la 17L de SCEL (Santiago): tiene 3 750 m para la carrera, 3 750 m para despegar y 3 750 m para acelerar y parar, es decir, no tiene stopway ni clearway. Si ese día el A320 con la V1 balanceada necesita 2 400 m (número de ejemplo), le sobran 1 350 m. Bajando la V1, la ASD baja (por ejemplo a 2 200 m) y la TOD sube (por ejemplo a 2 700 m), y las dos caben; subiéndola pasa lo contrario y también caben. El largo de la pista da el margen, sin stopway ni clearway.",
 concepts:[
  {label:"Es un concepto o criterio para elegir la V1 (no algo físico de la pista)",weight:1,accepted:["concepto","criterio","no es algo fisico","no es fisico","elegir la v1","seleccionar la v1","se elige la v1"]},
  {label:"Se comparan las distancias necesarias: TOD (motor fallado, hasta 35 ft) y ASD",weight:2,required:true,accepted:["accelerate stop distance","asd","distancia de aceleracion parada","aceleracion parada","acelerar y parar","takeoff distance","tod","distancia de despegue"]},
  {label:"Subir la V1 acorta la TOD y alarga la ASD (y al revés)",weight:2,accepted:["subir la v1","v1 mas alta","bajar la v1","v1 mas baja","sube la v1","baja la v1","mover la v1","se mueve la v1","correr la v1","se alarga","se acorta","pasa lo contrario"]},
  {label:"Balanceada: la V1 hace que la ASD sea igual a la TOD",weight:2,required:true,accepted:["asd igual a la tod","tod igual a la asd","asd sea igual","tod sea igual","asd es igual","tod es igual","son iguales","misma distancia","mismo punto"]},
  {label:"La V1 balanceada es la que pide menos pista (balanced field length)",weight:1,accepted:["balanced field","menos pista","distancia minima","menor distancia","la mas larga de las dos"]},
  {label:"Descompensada: ASD y TOD distintas; cualquiera puede ser mayor",weight:2,required:true,accepted:["distintas","diferentes","descompensada","desbalanceada","no balanceada","cualquiera de las dos","una mayor que la otra"]},
  {label:"Stopway o clearway permiten más peso, pero no hacen falta si sobra pista",weight:2,accepted:["stopway","clearway","sobra pista","pista larga","no son necesarias","no hacen falta"]},
  {label:"Por qué: aprovechar la distancia que sobra para ganar peso o más FLEX",weight:1,accepted:["ganar peso","mas peso","aumentar el peso","mayor peso","mas flex","aprovechar"]},
  {label:"Límites de la V1: VMCG, VR y energía de frenos (VMBE)",weight:1,accepted:["vmcg","vmbe","energia de frenos","brake energy","vr"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · C.3.1.5 Influence of V1 on accelerate-go/stop distances (PDF 59)",cite:"For a given takeoff weight, any increase in V1 leads to a reduction in both TODN-1 and TORN-1."},
  {src:"Getting to Grips with Aircraft Performance · C.3.1.5 Influence of V1 on accelerate-go/stop distances (PDF 59)",cite:"On the contrary, for a given takeoff weight, any increase in V1 leads to an increase in both the ASDN-1 and ASDN."},
  {src:"Getting to Grips with Aircraft Performance · C.3.1.5 Influence of V1 on accelerate-go/stop distances (PDF 59)",cite:"This speed is called “balanced V1”, and the corresponding distance is called “balanced field”."},
  {src:"Getting to Grips with Aircraft Performance · C.3.2.5 Influence of V1 on the runway-limited takeoff weight (PDF 65)",cite:"This graph clearly shows that a maximum takeoff weight is achieved in a particular range of V1."},
  {src:"Getting to Grips with Aircraft Performance · C.2.1.2 Decision speed V1 (PDF 48)",cite:"VMCG ≤ VEF ≤ V1"},
  {src:"Getting to Grips with Aircraft Performance · C.2.2.1 Maximum brake energy speed (PDF 52)",cite:"the speed at which a full stop can be achieved for a given takeoff weight is limited to a maximum value (VMBE)."},
  {src:"Getting to Grips with Aircraft Performance · J.2.4.3.3 MTOW limited by three limitations (PDF 205)",cite:"In this particular case, a V1 range exists."},
  {src:"Getting to Grips with Aircraft Performance · J.2.4.3.3 MTOW limited by three limitations (PDF 205)",cite:"In this case, the effective takeoff V1 speed remains at the operator’s discretion."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Configuration (PDF 299)",cite:"On medium or long runways, the second segment limitation becomes the limiting factor"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-20-20-20 · Flexible takeoff definition (PDF 10113)",cite:"When the actual takeoff weight is lower than the maximum performance limited takeoff weight, the aircraft may comply with the regulatory requirements with a reduced thrust, called flexible takeoff thrust."}
 ],
 extRefs:[{src:"AIP Chile · SCEL INFO RWY · DGAC AMDT 99 (15 MAY 2025)",url:"https://aipchile.dgac.gob.cl/dasa/aip_chile_con_contenido/aipmap/SCEL/SCEL%20INFO%20RWY.pdf",cite:"17L: TORA 3750 m, TODA 3750 m, ASDA 3750 m, LDA 3750 m, ancho 55 m; elevación del aeródromo 1555 ft"}]},

{id:"ov_improved_climb",question:"¿Qué es el improved climb y cuándo conviene usarlo?",
 short:"Es usar la pista que sobra para subir las velocidades de despegue, sobre todo la V2, y así ascender con mejor gradiente. Conviene cuando el peso está limitado por el ascenso o los obstáculos y sobra pista.",
 reference:"Es una forma de optimizar el despegue: se suben las velocidades de despegue, sobre todo la V2 (y con ella la VR y la V1), por encima de sus valores mínimos.\n\nPor qué funciona: con una V2 más alta el avión vuela más cerca de su velocidad de mejor gradiente, así que asciende mejor en el first y el second segment y libra mejor los obstáculos. Sube el peso máximo limitado por ascenso y por obstáculos.\n\nCuándo conviene: cuando el peso está limitado por el ascenso con un motor fallado (en el second segment un bimotor necesita al menos 2,4%) o por obstáculos, y además sobra pista. El caso típico es un aeropuerto alto o caluroso con una pista larga: el empuje baja, pero la pista alcanza de sobra.\n\nEl precio y los límites: con más velocidad aumentan la takeoff distance y la accelerate-stop distance; la V1 más alta exige más a los frenos (límite de brake energy), y la velocidad de despegue no puede pasar el límite de los neumáticos (tire speed: 195 kt de ground speed en el A320). Se sube hasta que uno de estos límites, o el largo de la pista, lo impide. El final takeoff segment se vuela a green dot, así que la V2 no lo cambia.\n\nEn el A320 no hay que activar nada: el EFB optimiza la V1 y la V2 automáticamente para dar el mayor peso posible.",
 concepts:[
  {label:"Se suben las velocidades de despegue, sobre todo la V2 (y con ella VR y V1)",weight:2,required:true,accepted:["subir la v2","v2 mas alta","aumentar la v2","subir las velocidades","velocidades mas altas","aumentar las velocidades","v2 alta"]},
  {label:"Mejor gradiente en el first y second segment y frente a obstáculos: más peso limitado por ascenso",weight:2,required:true,accepted:["mejor gradiente","mejor ascenso","asciende mejor","gradiente de ascenso","climb gradient","second segment","segundo segmento","obstaculos"]},
  {label:"Conviene cuando limita el ascenso u obstáculos y sobra pista",weight:2,accepted:["sobra pista","pista larga","pista sobrante","exceso de pista","limitado por ascenso","limita el ascenso","climb limited"]},
  {label:"Second segment: mínimo 2,4% en bimotor",weight:1,accepted:["2 4","dos coma cuatro"]},
  {label:"Precio: más takeoff distance y más accelerate-stop distance",weight:1,accepted:["takeoff distance","accelerate stop distance","mas distancia","mas pista","distancia de despegue","aceleracion parada","usando la pista","usa la pista","usa mas pista"]},
  {label:"Límites: energía de frenos y velocidad de neumáticos (195 kt GS)",weight:2,accepted:["brake energy","energia de frenos","frenos","tire speed","neumaticos","neumatico","195"]},
  {label:"En el A320 el EFB lo optimiza automáticamente",weight:1,accepted:["automaticamente","automatico","efb","flysmart","optimiza"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · J.2.3.3 V2/VS ratio influence (PDF 201)",cite:"As a general rule, for a given V1/VR ratio, any increase in the V2/VS ratio leads to an increase in the one-engine-out and the all-engine takeoff distances."},
  {src:"Getting to Grips with Aircraft Performance · J.2.3.3 V2/VS ratio influence (PDF 202)",cite:"As shown in Figure J4, any V2/VS increase results in better climb gradients (1st and 2nd segment) and, therefore, in better climb limited MTOWs (1st segment, 2nd segment, obstacle)."},
  {src:"Getting to Grips with Aircraft Performance · J.2.3.3 V2/VS ratio influence (PDF 202)",cite:"On the other hand, as the final takeoff segment is flown at green dot speed, it is not influenced by V2 speed variations."},
  {src:"Getting to Grips with Aircraft Performance · J.2.3.3 V2/VS ratio influence (PDF 203)",cite:"The lift-off speed, VLOF, is limited by the tire speed (Vtire)."},
  {src:"Getting to Grips with Aircraft Performance · C.2.2.2 Maximum tire speed (PDF 52)",cite:"For almost all Airbus aircraft models, VTIRE is equal to 195 knots (Ground Speed)."},
  {src:"Getting to Grips with Aircraft Performance · C.4.2.2 Obstacle clearance (PDF 72)",cite:"As an example, the minimum required climb gradient during the second segment must be 2.4% for a two-engine aircraft."},
  {src:"Getting to Grips with Aircraft Performance · C.6.1 Speed optimization process (PDF 88)",cite:"The performance software provided by Airbus automatically carries out this optimized computation"}
 ]},

{id:"ov_takeoff_segments",question:"¿Cuáles son los segmentos del despegue y qué gradiente exige cada uno?",
 short:"Con un motor fallado, la trayectoria de despegue se divide en first, second, third (aceleración) y final segment. El second segment es el que más suele limitar: exige 2,4% en un bimotor.",
 reference:"Después de una falla de motor en VEF, el avión tiene que cumplir gradientes mínimos de ascenso con un motor inoperativo. Airbus divide la trayectoria en cuatro segmentos; algunos textos juntan los dos últimos en un tercer segmento con dos partes.\n\n- First segment: desde el liftoff (VLOF) hasta que el tren queda arriba. Motor crítico inoperativo y el otro con takeoff thrust (TOGA o FLEX), tren replegándose, flaps y slats de despegue, velocidad entre VLOF y V2. Gradiente mínimo: positivo en bimotor (0,3% trimotor, 0,5% cuatrimotor).\n- Second segment: desde el tren arriba hasta la acceleration altitude, como mínimo 400 ft sobre la pista. Takeoff thrust, tren arriba, flaps y slats de despegue, a V2 (en el A320 el SRS mantiene entre V2 y V2 + 15 kt, según la velocidad a la que falló el motor). Gradiente mínimo: 2,4% en bimotor (2,7% trimotor, 3,0% cuatrimotor). Es el que más suele limitar el peso, sobre todo con obstáculos.\n- Third segment (aceleración): en la acceleration altitude se acelera de V2 a green dot retrayendo flaps y slats, todavía con takeoff thrust. La acceleration altitude se sube si hay obstáculos, pero tiene un máximo: el TOGA con un motor está limitado a 10 minutos, y en ese tiempo hay que llegar a configuración limpia.\n- Final segment: configuración limpia, a green dot (la final takeoff speed, al menos 1,25 VS) y con MCT, hasta al menos 1 500 ft. Gradiente mínimo: 1,2% en bimotor (1,5% trimotor, 1,7% cuatrimotor).\n\nPara los obstáculos se usa la net flight path (la real menos 0,8% en un bimotor), que tiene que pasar al menos 35 ft sobre cada obstáculo.",
 concepts:[
  {label:"Con un motor inoperativo; cuatro segmentos (first, second, third o aceleración, final)",weight:1,accepted:["cuatro segmentos","4 segmentos","tres segmentos","motor inoperativo","motor fallado","falla de motor"]},
  {label:"First segment: del liftoff al tren arriba; gradiente positivo en bimotor",weight:2,required:true,accepted:["first segment","primer segmento","tren arriba","tren retraido","tren replegandose","replegando el tren","positivo","positiva"]},
  {label:"Second segment: del tren arriba a la acceleration altitude (mínimo 400 ft), a V2",weight:2,required:true,accepted:["second segment","segundo segmento","400 ft","400 pies","cuatrocientos pies","acceleration altitude","altitud de aceleracion"]},
  {label:"Second segment: 2,4% en bimotor, el que más suele limitar",weight:2,required:true,accepted:["2 4","dos coma cuatro","mas limitante","el que mas limita","mas restrictivo","limita el peso"]},
  {label:"Third segment: aceleración de V2 a green dot retrayendo flaps (TOGA máximo 10 min)",weight:2,accepted:["third segment","tercer segmento","aceleracion","acelera","retrayendo flaps","retraccion de flaps","10 minutos","diez minutos"]},
  {label:"Final segment: limpio, a green dot, con MCT, hasta 1 500 ft",weight:2,accepted:["final segment","segmento final","mct","maximo continuo","maxima continua","1500 ft","1500 pies","1 500 ft","mil quinientos"]},
  {label:"Final segment: 1,2% en bimotor",weight:1,accepted:["1 2","uno coma dos"]},
  {label:"Velocidades: V2 en el second segment, green dot al final",weight:1,accepted:["green dot","punto verde","a v2","velocidad v2","1 25 vs"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · C.4.1.2 Takeoff segments and climb requirements (PDF 67)",cite:"After an engine failure at VEF, whatever the operational conditions, the aircraft must fulfill minimum climb gradients, as required by JAR/FAR 25.121."},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.2 Takeoff segments (PDF 68; tabla C4: 0.0% / 2.4% / 1.2% bimotor, 0.5% / 3.0% / 1.7% cuatrimotor)",cite:"Table C4: Takeoff Segment Characteristics"},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.3.1 Minimum acceleration height (PDF 69)",cite:"So, below 400 feet, the speed must be maintained constant to a minimum of V2."},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.3.1 Minimum acceleration height (PDF 69)",cite:"1.2% for a two-engined airplane"},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.3.2 Maximum acceleration height (PDF 69)",cite:"The Maximum Takeoff Thrust (TOGA) is certified for use for a maximum of 10 minutes, in case of an engine failure at takeoff"},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.3.2 Maximum acceleration height (PDF 69)",cite:"As a result, the enroute configuration (end of the third segment) must be achieved within a maximum of 10 minutes after takeoff"},
  {src:"Getting to Grips with Aircraft Performance · C.4.1.1 Takeoff flight path definitions (PDF 66)",cite:"Final takeoff speed: Speed greater than 1.25 Vs, chosen equal to Green Dot speed (best climb gradient speed)"},
  {src:"Getting to Grips with Aircraft Performance · C.4.2.1 Gross and net takeoff flight paths (PDF 71)",cite:"0.8% for two-engine aeroplanes"},
  {src:"Getting to Grips with Aircraft Performance · C.4.2.2 Obstacle clearance (PDF 72)",cite:"An operator shall ensure that the net take-off flight path clears all obstacles by a vertical distance of at least 35 ft."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"If one engine fails, the speed target is the current aircraft speed at the engine failure detection."}
 ]},

{id:"ov_tailwind_takeoff",question:"¿Cómo es el procedimiento de despegue con viento de cola?",
 short:"Se estabiliza el empuje en 50% N1 con el sidestick todo adelante, se sueltan frenos y se lleva el empuje rápido a cerca de 70% N1 y luego de a poco hasta el takeoff thrust a los 40 kt de ground speed. Máximo 15 kt de cola.",
 reference:"El límite es 15 kt de viento de cola para despegar (10 kt en algunos MSN). La performance se calcula con el viento real reportado, y el cálculo cuenta el 150% del viento de cola.\n\nLa técnica es la misma que con viento cruzado de más de 20 kt:\n1. Anunciar “TAKEOFF” y llevar las thrust levers a 50% N1 (1,05 EPR en motores IAE).\n2. Poner el sidestick todo adelante (full forward).\n3. Soltar frenos.\n4. Llevar las thrust levers a FLX o TOGA: el empuje sube rápido hasta cerca de 70% N1 y después de a poco, para tener el takeoff thrust a los 40 kt de ground speed (en los motores IAE, el empuje sube de forma progresiva hasta ese mismo punto). El comandante mantiene la mano en las thrust levers hasta V1.\n5. En la carrera, mantener el sidestick adelante hasta 80 kt y soltarlo de a poco hasta dejarlo neutro a los 100 kt. El PM confirma “THRUST SET” antes de 80 kt.\n\nEn el despegue normal (sin viento de cola y con cruzado de hasta 20 kt) el sidestick va a la mitad adelante y las thrust levers van a FLX o TOGA de una vez.",
 concepts:[
  {label:"Límite: 15 kt de viento de cola",weight:1,accepted:["15 kt","15 nudos","quince nudos","15 knots"]},
  {label:"Empuje inicial: 50% N1 (1,05 EPR en IAE)",weight:2,required:true,accepted:["50 n1","50 por ciento","50 de n1","cincuenta por ciento","1 05 epr","1 05"]},
  {label:"Sidestick todo adelante (full forward)",weight:2,required:true,accepted:["full forward","todo adelante","completamente adelante","sidestick adelante","palanca adelante","sidestick full"]},
  {label:"Soltar frenos con el empuje estabilizado",weight:1,accepted:["soltar frenos","suelto frenos","liberar frenos","brakes release","soltar los frenos","suelta los frenos"]},
  {label:"Empuje rápido a cerca de 70% N1 y progresivo hasta takeoff thrust a 40 kt de ground speed",weight:2,required:true,accepted:["70","setenta por ciento","40 kt","cuarenta nudos","progresivo","progresivamente","de a poco"]},
  {label:"Sidestick adelante hasta 80 kt, neutro a 100 kt",weight:1,accepted:["80 kt","ochenta nudos","100 kt","cien nudos","neutro"]},
  {label:"El comandante con la mano en las thrust levers hasta V1",weight:1,accepted:["hasta v1","mano en las thrust levers","mano en las palancas","mano en los aceleradores"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · LIM-AG-OPS · Tailwind takeoff (PDF 9791)",cite:"Maximum tailwind for takeoff......................................................................................................15 kt"},
  {src:"FCOM 15 SEP 25 · EFB-TOF-10 · Takeoff parameters (PDF 10106)",cite:"In accordance with regulation, the computation is based on 150 % of the entered tailwind, and 50 % of the entered headwind."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-12 · Thrust setting, motores IAE (PDF 9062)",cite:"Increase thrust progressively to reach takeoff thrust by 40 kt ground speed"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-12 · Thrust setting (PDF 9062)",cite:"THRUST.......................................................................................................... 50 % N1"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-12 · Thrust setting (PDF 9061)",cite:"In the case of tailwind, or if crosswind is above 20 kt:"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-12 · Thrust setting (PDF 9063)",cite:"Increase thrust rapidly to about 70 % N1 then progressively to reach takeoff thrust by 40 kt"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-12 · Thrust setting (PDF 9061)",cite:"apply full forward sidestick until the airspeed reaches 80 kt. Release the sidestick gradually to reach neutral at 100 kt."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-120 · Takeoff roll (PDF 296)",cite:"The PM must check that the thrust is set by 80 kt and must announce \"Thrust Set\"."}
 ]},

{id:"ov_vmc_cg_weight",question:"¿Cómo afectan el CG y el peso a la VMCA y la VMCG, y cuál es el caso más desfavorable?",
 short:"Las dos son más altas (peor) con el CG atrasado, porque el rudder tiene menos brazo, y con poco peso. El caso más desfavorable es CG atrasado y peso liviano.",
 reference:"VMCG: velocidad mínima en tierra a la que, si falla de golpe el motor crítico con el otro a empuje máximo, el avión se controla solo con el rudder, sin nosewheel steering y sin salirse más de 30 ft del eje. VMCA: lo mismo en vuelo, manteniendo vuelo recto con un bank máximo de 5° hacia el motor bueno.\n\nImportan porque las velocidades de despegue no pueden ser menores que ellas: la V1 no puede ser menor que la VMCG, la VR tiene que ser al menos 1,05 VMCA y la V2 al menos 1,1 VMCA. Una VMC más alta obliga a ir más rápido, usar más pista y llevar menos peso.\n\nCG: el rudder corrige la guiñada como una palanca, y su brazo es la distancia entre el CG y la cola. Con el CG atrasado el brazo se acorta, el rudder hace menos fuerza de giro y hace falta más velocidad: el CG atrasado es el peor caso.\n\nPeso: en la VMCA, el bank de 5° usa parte de la sustentación para empujar el avión hacia el motor bueno, y eso ayuda al rudder. Esa ayuda depende del peso, así que un avión liviano recibe menos y su VMCA es más alta. En la VMCG no hay bank que ayude, y un avión liviano tiene menos peso sobre las ruedas (menos agarre) y menos inercia para resistir la guiñada.\n\nResumen: el caso más desfavorable es CG atrasado y peso liviano. En el A320 la VMCG y la VMCA vienen en una tabla solo por altitud (y configuración, en la VMCG), porque ya están calculadas para el caso más desfavorable; a mayor altitud el motor da menos empuje y las VMC bajan.",
 concepts:[
  {label:"Motor crítico fallado, el otro a empuje máximo, control solo con el rudder",weight:2,required:true,accepted:["motor critico","rudder","timon de direccion","empuje maximo","falla de golpe","falla repentina"]},
  {label:"VMCG: sin nosewheel steering, máximo 30 ft del eje",weight:1,accepted:["nosewheel","rueda de nariz","30 ft","30 pies","treinta pies"]},
  {label:"VMCA: vuelo recto con un bank máximo de 5°",weight:1,accepted:["5 grados","cinco grados","bank","alabeo","inclinacion"]},
  {label:"Las velocidades de despegue no pueden ser menores (V1, VR, V2): VMC alta = peor performance",weight:1,accepted:["1 05","1 1","mas velocidad","mas pista","no pueden ser menores","mas alta es peor"]},
  {label:"CG atrasado: menos brazo del rudder, VMC más alta (peor caso)",weight:2,required:true,accepted:["cg atrasado","centro de gravedad atrasado","aft cg","brazo","palanca"]},
  {label:"Peso liviano: menos ayuda del bank en la VMCA, menos agarre en la VMCG (peor caso)",weight:2,required:true,accepted:["peso liviano","peso ligero","avion liviano","avion ligero","poco peso","bajo peso","light weight"]},
  {label:"En el A320 vienen en tabla por altitud: a mayor altitud, VMC menores",weight:1,accepted:["altitud","tabla","menos empuje"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · B.1.3.1 VMCG (PDF 35)",cite:"VMCG, the minimum control speed on the ground, is the calibrated airspeed during the take-off run"},
  {src:"Getting to Grips with Aircraft Performance · B.1.3.1 VMCG (PDF 36)",cite:"may not deviate more than 30 ft laterally from the centreline at any point."},
  {src:"Getting to Grips with Aircraft Performance · B.1.3.1 VMCG (PDF 36)",cite:"The most unfavourable weight in the range of take-off weights."},
  {src:"Getting to Grips with Aircraft Performance · B.1.3.2 VMCA (PDF 36)",cite:"maintain straight flight with an angle of bank of not more than 5 degrees."},
  {src:"Getting to Grips with Aircraft Performance · C.2.1.3 Rotation speed (PDF 50)",cite:"VR ≥ 1.05 VMCA"},
  {src:"Getting to Grips with Aircraft Performance · C.2.1.5 Takeoff climb speed (PDF 51)",cite:"V2 ≥ 1.1 VMCA"},
  {src:"FCOM 15 SEP 25 · LIM-AG-SPD · Minimum control speeds (PDF 9798)",cite:"MINIMUM CONTROL SPEEDS IN THE AIR (VMCA) AND ON THE GROUND (VMCG)"}
 ]},

{id:"ov_limit_speeds",question:"¿Cuáles son las velocidades límite más importantes del A320?",
 short:"Las principales son VMO/MMO (350 kt / M 0,82), la VFE de cada configuración de flaps, VLE y VLO para el tren, VA, y las velocidades mínimas de control VMCG, VMCA y VMCL.",
 reference:"- VMO/MMO: velocidad y Mach máximos de operación, 350 kt / M 0,82. No se pueden pasar a propósito en ninguna fase del vuelo.\n- VFE: la máxima para cada configuración de flaps. En el A320: CONF 1 230 kt, CONF 1+F 215 kt, CONF 2 200 kt, CONF 3 185 kt y FULL 177 kt. VFE NEXT es la máxima para la siguiente posición de flaps.\n- VLE: la máxima con el tren abajo, 280 kt / M 0,67.\n- VLO: la máxima para mover el tren: 250 kt / M 0,60 para extenderlo y 220 kt / M 0,54 para retraerlo.\n- VA: maximum design maneuvering speed, la máxima estructural para deflexión completa de mandos en alternate o direct law.\n- VMCG: la mínima en tierra, durante el despegue, a la que se controla el avión solo con los mandos primarios si falla de golpe el motor crítico con el otro a takeoff thrust.\n- VMCA: la mínima de control en vuelo, con un bank máximo de 5°, en configuración de despegue y tren arriba. VMCL: lo mismo en configuración de aproximación.\n\nTambién: la velocidad máxima de los neumáticos es 195 kt de ground speed, y con la ventanilla abierta, 200 kt. La VMCG y la VMCA cambian con la altitud.",
 concepts:[
  {label:"VMO/MMO: 350 kt / M 0,82",weight:2,required:true,accepted:["vmo","mmo","350","0 82","punto ochenta y dos"]},
  {label:"VFE por configuración (230/215/200/185/177 kt) y VFE NEXT",weight:2,required:true,accepted:["vfe","230","215","185","177","vfe next"]},
  {label:"VLE: 280 kt / M 0,67 con el tren abajo",weight:2,accepted:["vle","280"]},
  {label:"VLO: 250 kt para extender, 220 kt para retraer",weight:2,accepted:["vlo","250","220"]},
  {label:"VA: velocidad de maniobra, deflexión completa de mandos",weight:1,accepted:["maneuvering","maniobra","deflexion completa"]},
  {label:"VMCG, VMCA y VMCL: velocidades mínimas de control",weight:2,accepted:["vmcg","vmca","vmcl","minima de control","minimas de control"]},
  {label:"Otras: neumáticos 195 kt de ground speed, ventanilla 200 kt",weight:1,accepted:["195","neumaticos","ventanilla"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_10-50-30 · Limit speeds (PDF 1297)",cite:"Maximum design maneuvering speed."},
  {src:"FCOM 15 SEP 25 · DSC-22_10-50-30 · Limit speeds (PDF 1297)",cite:"Maximum speed for the next (further extended) flap lever position."},
  {src:"Getting to Grips with Aircraft Performance · B.1.2 Operating limit speeds (PDF 35)",cite:"VMO or MMO are the speeds that may not be"},
  {src:"FCOM 15 SEP 25 · LIM-AG-SPD · Maximum speeds with the landing gear extended (PDF 9797)",cite:"Maximum speed with the landing gear extended (VLE)"},
  {src:"FCOM 15 SEP 25 · LIM-AG-SPD · Maximum tire speed (PDF 9797)",cite:"Maximum ground speed............................................................................................................... 195 kt"},
  {src:"FCOM 15 SEP 25 · LIM-AG-SPD · Cockpit window open maximum speed (PDF 9795)",cite:"COCKPIT WINDOW OPEN MAXIMUM SPEED"},
  {src:"Getting to Grips with Aircraft Performance · B.1.2 Operating limit speeds (PDF 35; tabla A320: VFE 230/215/200/185/177 kt)",cite:"FOR THE A320-200"}
 ]},

{id:"ov_green_dot",question:"¿Qué es el green dot?",
 short:"Es la velocidad de mejor relación sustentación/resistencia en configuración limpia, y la de operación con un motor fallado en limpio. Se usa al final del despegue con falla de motor, en el drift down (obstacle strategy) y con los dos motores apagados.",
 reference:"Es la velocidad de mejor relación sustentación/resistencia (best lift-to-drag ratio, máxima fineza) en configuración limpia, y la velocidad de operación con un motor fallado en limpio. Aparece como un punto verde en la escala de velocidad del PFD y la calcula el FAC con el peso del FMS. En el A320 es aproximadamente 2 × peso (t) + 85 kt bajo 20 000 ft, y sobre 20 000 ft se suma 1 kt cada 1 000 ft.\n\nUsos:\n- Falla de motor en el despegue: después de acelerar en la acceleration altitude y retraer flaps, al llegar a green dot se pone OP CLB y MCT, y se sube a green dot porque da el mejor gradiente de ascenso. Es la velocidad del final takeoff segment.\n- Falla de motor en crucero, obstacle strategy (drift down): se desciende a green dot, con la menor razón y el menor ángulo de descenso, para quedarse lo más alto posible. En la standard strategy no se usa green dot: se desciende a M 0,78 / 300 kt, y green dot es solo el mínimo.\n- Falla de los dos motores: green dot es la velocidad de mejor planeo.",
 concepts:[
  {label:"Mejor relación sustentación/resistencia (máxima fineza) en limpio",weight:2,required:true,accepted:["lift to drag","sustentacion resistencia","maxima fineza","mejor fineza","mejor planeo","maxima eficiencia"]},
  {label:"Velocidad de operación con un motor fallado en configuración limpia",weight:2,required:true,accepted:["motor fallado","engine out","configuracion limpia","limpio","clean"]},
  {label:"Punto verde en el PFD, calculado por el FAC con el peso",weight:1,accepted:["punto verde","pfd","fac"]},
  {label:"A320: aproximadamente 2 × peso + 85 kt bajo 20 000 ft",weight:1,accepted:["85","dos por el peso","20 000","20000"]},
  {label:"Falla de motor en el despegue: final takeoff segment a green dot con MCT (mejor gradiente)",weight:2,accepted:["final takeoff","segmento final","ultimo tramo","mct","mejor gradiente","op clb"]},
  {label:"Drift down con la obstacle strategy (en la standard: M 0,78 / 300 kt)",weight:2,accepted:["obstacle strategy","estrategia obstacle","obstacle","drift down","standard strategy","0 78","300 kt"]},
  {label:"Con los dos motores apagados: mejor planeo",weight:1,accepted:["dos motores","ambos motores","all engine","mejor planeo","planeo"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_10-50-20 · Characteristic speeds (PDF 1282)",cite:"Engine-out operating speed in clean configuration."},
  {src:"FCOM 15 SEP 25 · DSC-22_10-50-20 · Characteristic speeds (PDF 1282)",cite:"Also corresponds to the final takeoff speed."},
  {src:"FCOM 15 SEP 25 · DSC-22_10-50-20 · Characteristic speeds (PDF 1282)",cite:"Below 20 000 ft equal to 2 × weight (metric tons) +85"},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Final takeoff segment (PDF 507)",cite:"When the speed trend arrow reaches the Green Dot speed, pull the ALT knob to engage OP CLB."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Final takeoff segment (PDF 507)",cite:"Green Dot speed that provides the best climb gradient."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Standard strategy (PDF 510)",cite:"Set speed target M 0.78/300 kt."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · Obstacle strategy (PDF 510)",cite:"The speed target in this case is green dot."},
  {src:"FCTM 25 NOV 24 · PR-AEP-ENG · All engine failure (PDF 497)",cite:"This section requires flying at green dot speed, that is the best lift-to-drag ratio"}
 ]},

{id:"ov_srs",question:"¿Qué es el SRS y qué velocidad busca?",
 short:"Es el modo vertical managed de despegue y go-around: mueve el pitch para mantener una velocidad. En el despegue busca V2 en tierra y V2 + 10 kt en el aire; con falla de motor, la velocidad que tenía, entre V2 y V2 + 15 kt.",
 reference:"El SRS (Speed Reference System) es el modo vertical managed que se usa en el despegue y en el go-around: con el elevator controla la velocidad para llevar el avión por una trayectoria vertical.\n\nEn el despegue:\n- En tierra la velocidad objetivo es V2; ya en el aire, V2 + 10 kt.\n- Si falla un motor, busca la velocidad que tenía el avión cuando se detectó la falla, limitada entre V2 y V2 + 15 kt.\n- Protecciones: asegura un ascenso mínimo de 120 ft/min, limita el pitch a 18° (22,5° con windshear) y la velocidad objetivo a V2 + 15 kt.\n- Se activa en tierra con slats o flaps extendidos, V2 ingresada en el MCDU y las thrust levers en TOGA o en FLX (con temperatura FLEX o derate ingresado).\n- Se desactiva en la acceleration altitude, al capturar una altitud (sobre 400 ft RA) o al elegir otro modo vertical. Con un motor fallado no se desactiva solo en la acceleration altitude con un motor.\n\nEn el go-around (SRS GA) busca la mayor entre la velocidad que tenía al activarse y la VAPP, con un tope igual a la menor entre VLS + 25 kt (VLS + 15 kt con un motor fallado) y VMAX − 5 kt.",
 concepts:[
  {label:"Modo vertical managed de despegue y go-around (Speed Reference System)",weight:2,required:true,accepted:["speed reference system","modo vertical","managed","despegue y go around","modo de despegue"]},
  {label:"Controla la velocidad con el pitch (elevator)",weight:1,accepted:["pitch","elevator","elevador","controla la velocidad","mantiene la velocidad","mantener una velocidad"]},
  {label:"En tierra V2; en el aire V2 + 10 kt",weight:2,required:true,accepted:["v2 10","10 kt","diez nudos","v2 mas diez"]},
  {label:"Con falla de motor: la velocidad de la falla, entre V2 y V2 + 15 kt",weight:2,accepted:["v2 15","15 kt","quince nudos","v2 mas quince","velocidad que tenia","velocidad de la falla"]},
  {label:"Protecciones: 120 ft/min y pitch máximo 18° (22,5° con windshear)",weight:1,accepted:["120","18","22 5","windshear"]},
  {label:"Se desactiva en la acceleration altitude o con otro modo vertical",weight:1,accepted:["acceleration altitude","altitud de aceleracion","accel alt","otro modo"]},
  {label:"SRS GA: la mayor entre la velocidad al activarse y la VAPP",weight:1,accepted:["vapp","srs ga","go around"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"The SRS mode is a managed vertical mode, used during takeoff and during go-around."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"When the aircraft is on ground, V2 is the speed target."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"When the aircraft is airborne, V2+10 kt becomes the speed target."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"A flight path angle protection, that ensures a minimum vertical speed of 120 ft/min"},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · SRS TO mode (PDF 2433)",cite:"A speed protection limiting the target speed to V2+15 kt."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-20-20 · Disengagement conditions (PDF 2434)",cite:"In Engine Out conditions, the SRS mode does not automatically disengage at EO ACCEL"},
  {src:"FCOM 15 SEP 25 · DSC-22_30-40-90-20 · SRS GA mode (PDF 2561)",cite:"The speed target is the memorized aircraft speed at SRS GA engagement or VAPP, whichever is higher."}
 ]},

{id:"ov_gs_mini",question:"¿Qué es la función ground speed mini?",
 short:"Es una función del FMGS que, en la aproximación con velocidad managed, sube la velocidad objetivo cuando aumenta el viento de frente, para que la energía del avión no baje del mínimo con que tocaría la pista a VAPP con el viento de la torre.",
 reference:"Funciona en la aproximación con velocidad managed (fase de approach del FMS). Aprovecha la inercia del avión cuando el viento cambia: mantiene la energía sobre un mínimo, que es la que tendría al tocar la pista a VAPP con el viento reportado por la torre. La ground speed correspondiente es el ground speed mini, que no se muestra en pantalla.\n\n- VAPP: la mayor entre VLS + 1/3 de la componente de viento de frente de la torre (ese tercio va entre 0 y 15 kt) y VLS + 5 kt.\n- Velocidad objetivo (el triángulo magenta): VAPP + 1/3 × (viento de frente actual − viento de frente de la torre).\n- Si el viento de frente aumenta, la velocidad objetivo sube; nunca baja de VAPP, y su máximo es la VFE NEXT (VFE − 5 kt en FULL).\n\nNo corrige las velocidades green dot, S y F. En los MSN más antiguos se suma la diferencia completa de viento en vez de un tercio.",
 concepts:[
  {label:"Aproximación con velocidad managed",weight:2,required:true,accepted:["velocidad managed","managed speed","managed","aproximacion"]},
  {label:"Aprovecha la inercia: mantiene la energía sobre un mínimo",weight:2,required:true,accepted:["inercia","energia","energia minima","nivel de energia"]},
  {label:"El mínimo: tocar la pista a VAPP con el viento de la torre",weight:2,accepted:["viento de la torre","tower wind","viento reportado","vapp"]},
  {label:"Sube la velocidad objetivo si aumenta el viento de frente (un tercio de la diferencia)",weight:2,accepted:["viento de frente","headwind","un tercio","1 3","sube la velocidad","aumenta la velocidad","triangulo magenta"]},
  {label:"Límites: nunca bajo VAPP, máximo VFE NEXT",weight:1,accepted:["vfe next","vfe","nunca baja","no baja de vapp","minimo vapp"]},
  {label:"No corrige green dot, S y F; el ground speed mini no se muestra",weight:1,accepted:["green dot","no se muestra","no se ve"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · Ground speed mini function (PDF 2636)",cite:"The Ground Speed Mini function does not correct Green Dot, S and F speeds."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · Ground speed mini function (PDF 2636)",cite:"The minimum energy level is the energy level the aircraft will have at touchdown with an indicated airspeed equal to VAPP"},
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · Ground speed mini function (PDF 2636)",cite:"The Ground Speed Mini is not displayed to the flight crew."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · VAPP computation (PDF 2637)",cite:"VAPP = VLS + 5 kt."},
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · Managed speed target computation (PDF 2637)",cite:"Managed speed target = VAPP + 1/3 x (CURRENT HEADWIND COMPONENT - TWR"},
  {src:"FCOM 15 SEP 25 · DSC-22_30-60-20 · Managed speed target computation (PDF 2637)",cite:"VAPP, as the minimum value"}
 ]},

{id:"ov_coffin_corner",question:"Coffin corner: ¿el límite de arriba es el MMO o el Mach crítico? ¿Qué pasa si se sobrepasa?",
 short:"El límite de arriba que se respeta es el MMO (M 0,82). El Mach crítico no es un límite: es donde aparecen las primeras ondas de choque, y los jets vuelan por encima de él. En el A320, si se pasa el MMO, suena el OVERSPEED y actúa la high speed protection.",
 reference:"Qué es: a medida que el avión sube con un peso dado, el rango de velocidades útil se angosta. Por abajo está el low speed buffet, cerca de la pérdida; por arriba, el high speed buffet, que aparece cuando las ondas de choque sobre el ala desprenden el flujo. Donde los dos límites se juntan está el techo aerodinámico: eso es el coffin corner.\n\nEl margen: para no volar pegado a ese techo se deja margen contra el buffet. El REC MAX del FMGS da al menos 0,3 g de margen (acepta un nivel algo más alto mientras quede al menos 0,2 g), y sobre 20 000 ft la VLS se corrige por Mach para mantener 0,2 g.\n\nEl límite de arriba es el MMO, M 0,82 en el A320: no se puede pasar a propósito en ninguna fase del vuelo. En un ejemplo de Airbus para un A320 a FL330 con 70 t, el rango con margen de 1,3 g va de M 0,73 a M 0,82: el techo de arriba coincide con el MMO.\n\nEl Mach crítico es otra cosa: el Mach al que en algún punto del ala el aire llega a Mach 1 y aparecen las primeras ondas de choque. No es un límite: los jets vuelan normalmente por encima de él. El problema aparece cuando esas ondas crecen tanto que desprenden el flujo.\n\nSi se pasa el MMO en el A320: suena el aviso OVERSPEED (MMO + 0,006 o VMO + 4 kt). En normal law actúa la high speed protection: quita de a poco la autoridad de nariz abajo, mete una orden de nariz arriba y limita el bank a 40°; con el sidestick suelto, el avión se pasa un poco y vuelve. El AP se desconecta a MMO + 0,04. En alternate law la velocidad máxima pasa a 320 kt, y en direct law a 320 kt / M 0,77.",
 concepts:[
  {label:"Coffin corner: se juntan el low speed buffet (pérdida) y el high speed buffet",weight:2,required:true,accepted:["low speed buffet","high speed buffet","buffet de baja","buffet de alta","se juntan","perdida","stall","techo aerodinamico"]},
  {label:"El límite de arriba es el MMO (M 0,82)",weight:2,required:true,accepted:["mmo","0 82","punto ochenta y dos","maximum operating mach"]},
  {label:"Mach crítico: primeras ondas de choque; no es un límite, se vuela por encima",weight:2,required:true,accepted:["ondas de choque","onda de choque","shock wave","no es un limite","por encima del mach critico","mach 1"]},
  {label:"Margen contra el buffet: REC MAX con 0,3 g (mínimo 0,2 g)",weight:1,accepted:["0 3 g","0 3","rec max","margen","1 3 g","1 3"]},
  {label:"Si se pasa: aviso OVERSPEED",weight:1,accepted:["overspeed","sobrevelocidad"]},
  {label:"Normal law: high speed protection (orden de nariz arriba, el AP se desconecta)",weight:2,accepted:["high speed protection","proteccion de alta velocidad","nariz arriba","nose up","se desconecta"]},
  {label:"Sin esa protección: máximo 320 kt (alternate o direct law)",weight:1,accepted:["320","alternate law","direct law","ley alterna","ley directa"]}
 ],
 refs:[
  {src:"Getting to Grips with Aircraft Performance · F.3.3.2.1 Buffet phenomenon (PDF 146)",cite:"In fact, at high speed, compressibility effects produce shock waves on the upper wing surface."},
  {src:"Getting to Grips with Aircraft Performance · F.3.3.2.2 Buffet limit (PDF 147)",cite:"minimum Mach appears for low speed buffet and a maximum Mach for high speed"},
  {src:"Getting to Grips with Aircraft Performance · F.3.3.2.3 Pressure altitude effect (PDF 148)",cite:"When nmax = 1, the aircraft has reached the lift ceiling."},
  {src:"Getting to Grips with Aircraft Performance · F.3.3.2.3 Pressure altitude effect (PDF 149)",cite:"This load factor limit is generally fixed to 1.3."},
  {src:"Getting to Grips with Aircraft Performance · F.3.3.2.4 A320 example (PDF 150)",cite:"Mmax = M0.82"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP · Climb, PROG page (PDF 9075)",cite:"The displayed REC MAX FL gives the aircraft at least a 0.3 g buffet margin."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-10-20 · High speed protection (PDF 3092)",cite:"As the speed increases above VMO/MMO, the sidestick nose-down authority is progressively"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-10-20 · High speed protection (PDF 3093)",cite:"The autopilot disconnects at VMO + 15 kt and MMO + 0.04."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3121)",cite:"In addition, the aural OVERSPEED alert (VMO + 4 or MMO + 0.006) remains available."}
 ]}
];
