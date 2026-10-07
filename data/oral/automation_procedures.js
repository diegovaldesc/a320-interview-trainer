/* Entrevista oral · FMGS, leyes de vuelo, RVSM, ECAM, emergencia con ATC y golden rules.
   9 preguntas (también las usa Need to know). Cada una trae su respuesta de referencia, su
   rúbrica (concepts o steps, criticalErrors) y sus fuentes internas (refs), que nunca se muestran.
   data/oral/index.js las reúne en ORAL_VOICE_BANK. */
window.ORAL_PARTS=window.ORAL_PARTS||{};
window.ORAL_PARTS["automation_procedures"]=[
{id:"ov_fmgs_functions",question:"Explica qué hacen el flight management, el flight guidance y el flight augmentation.",
 short:"Son las tres funciones del FMGS: el flight management navega, maneja el plan de vuelo y calcula la performance; el flight guidance maneja el AP, el FD y el A/THR; y el flight augmentation (FAC) maneja la guiñada, la flight envelope y las alertas de baja energía y windshear.",
 reference:"El FMGS (Flight Management and Guidance System) tiene 2 FMGC (Flight Management and Guidance Computer), cada uno con una parte de flight management (FM) y otra de flight guidance (FG), 2 MCDU, la FCU (Flight Control Unit) y 2 FAC (Flight Augmentation Computer).\n\n- Flight management: navegación y sintonía de radioayudas (para calcular la posición), plan de vuelo lateral y vertical, predicción y optimización de la performance (velocidades, niveles, tiempos y combustible, con el cost index) y manejo de las pantallas.\n- Flight guidance: el AP (autopilot), el FD (flight director) y el A/THR (autothrust). Guía el avión en modo managed, con los objetivos del FM, o selected, desde la FCU.\n- Flight augmentation (FAC): función de guiñada (yaw damper y turn coordination, rudder trim y rudder travel limit); flight envelope (calcula las velocidades de la escala del PFD, como VLS, VFE, green dot, S y F, y la protección alpha floor); alerta de baja energía (“SPEED SPEED SPEED”); y detección de windshear.",
 concepts:[
  {label:"FMGS: 2 FMGC (FM + FG), 2 MCDU, FCU y 2 FAC",weight:1,accepted:["fmgc","fmgs","mcdu","fcu"]},
  {label:"Flight management: navegación, posición y radioayudas",weight:2,required:true,accepted:["navegacion","posicion","radioayudas","radio ayudas","navaids","nav radios"]},
  {label:"Flight management: plan de vuelo lateral y vertical",weight:2,accepted:["plan de vuelo","flight plan","lateral y vertical","flight planning"]},
  {label:"Flight management: predicción y optimización de la performance (cost index)",weight:2,accepted:["performance","predicciones","prediccion","optimizacion","cost index"]},
  {label:"Flight guidance: AP, FD y A/THR (managed o selected)",weight:2,required:true,accepted:["autopilot","autopiloto","piloto automatico","flight director","director de vuelo","autothrust","a thr","ap"]},
  {label:"Flight augmentation: guiñada (yaw damper, turn coordination, rudder trim y travel limit)",weight:2,required:true,accepted:["yaw damper","guinada","rudder trim","rudder travel","turn coordination","amortiguador de guinada"]},
  {label:"Flight augmentation: flight envelope (velocidades del PFD, alpha floor)",weight:2,accepted:["flight envelope","envolvente","alpha floor","vls","velocidades del pfd","green dot"]},
  {label:"Flight augmentation: alerta de baja energía y detección de windshear",weight:1,accepted:["baja energia","low energy","speed speed speed","windshear"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-22_10-10 · Description (PDF 1211)",cite:"The Flight Management Guidance System (FMGS) contains the following units:"},
  {src:"FCOM 15 SEP 25 · DSC-22_10-10 · Description (PDF 1211)",cite:"Two Flight Augmentation Computers (FAC)."},
  {src:"FCOM 15 SEP 25 · DSC-22_10-10 · Flight management guidance computer (PDF 1212)",cite:"Navigation and management of navigation radios"},
  {src:"FCOM 15 SEP 25 · DSC-22_10-10 · Flight management guidance computer (PDF 1212)",cite:"Prediction and optimization of performance"},
  {src:"FCOM 15 SEP 25 · DSC-22_10-10 · Flight management guidance computer (PDF 1212)",cite:"Autothrust (A/THR) command."},
  {src:"FCOM 15 SEP 25 · DSC-22_40-10 · General (PDF 2701)",cite:"The aircraft has two flight augmentation computers (FACs) that perform four main functions:"},
  {src:"FCOM 15 SEP 25 · DSC-22_40-10 · General (PDF 2701)",cite:"Yaw damping and turn coordination"},
  {src:"FCOM 15 SEP 25 · DSC-22_40-10 · General (PDF 2701)",cite:"Alpha-floor protection"},
  {src:"FCOM 15 SEP 25 · DSC-22_40-10 · General (PDF 2701)",cite:"Windshear detection function"}
 ]},

{id:"ov_fc_laws",question:"Explica la normal law, la alternate law y la direct law del A320.",
 short:"La normal law da todas las protecciones; la alternate law mantiene el control por factor de carga pero con protecciones reducidas; la direct law es una relación directa entre el sidestick y las superficies, sin protecciones y con trim manual.",
 reference:"Normal law: es la de siempre. En pitch, el sidestick pide factor de carga, con trim automático; en roll, tasa de alabeo. Tiene todas las protecciones: pitch attitude, load factor, high speed, high angle of attack (con alpha floor) y bank angle. Tiene modos en tierra, en vuelo y flare, que entra a 50 ft RA en el aterrizaje.\n\nAlternate law: aparece tras ciertas fallas, por ejemplo dos ADR o dos IR, los dos ELAC o algunas fallas hidráulicas dobles. En pitch sigue pidiendo factor de carga con trim automático, pero se pierden las protecciones de pitch attitude, high speed, high angle of attack y bank angle. Quedan protecciones reducidas: load factor limitation, pitch attitude limitation (solo en limpio), low speed stability (con stall warning) y high speed stability. El roll pasa a direct law, el yaw queda solo con yaw damper (±5°), no hay alpha floor y la velocidad máxima es 320 kt. Existe además la alternate law without reduced protections, que solo deja la load factor limitation. Al bajar el tren, el pitch pasa a direct law.\n\nDirect law: el sidestick mueve directamente las superficies (la deflexión máxima depende del CG), sin protecciones, sin alpha floor y sin trim automático (“USE MAN PITCH TRIM”). Roll directo, de unos 30°/s en limpio y 25°/s con slats; yaw con los pedales, sin yaw damper. Siguen las alertas de stall y overspeed. Máximo 320 kt / M 0,77.\n\nTambién existen la abnormal attitude law y el mechanical backup (pitch con el pitch trim wheel y yaw con los pedales).",
 concepts:[
  {label:"Normal law: factor de carga con trim automático y todas las protecciones",weight:2,required:true,accepted:["normal law","ley normal","factor de carga","load factor","todas las protecciones","protecciones completas"]},
  {label:"Protecciones de la normal law: pitch attitude, load factor, high speed, high angle of attack (alpha floor), bank angle",weight:2,accepted:["pitch attitude","high speed","alto angulo de ataque","angle of attack","alpha floor","alpha prot","bank angle"]},
  {label:"Alternate law: tras ciertas fallas, protecciones reducidas",weight:2,required:true,accepted:["alternate law","ley alterna","protecciones reducidas","reduced protections"]},
  {label:"Alternate law: roll directo; al bajar el tren el pitch pasa a direct law",weight:2,accepted:["bajar el tren","tren abajo","gear down","roll directo","roll pasa a direct","pasa a direct law","pasa a ley directa"]},
  {label:"Direct law: relación directa sidestick-superficie, sin protecciones",weight:2,required:true,accepted:["direct law","ley directa","relacion directa","directamente las superficies","stick to elevator","sin protecciones"]},
  {label:"Direct law: trim manual (USE MAN PITCH TRIM)",weight:2,accepted:["trim manual","man pitch trim","manual pitch trim","trimar manualmente","sin trim automatico"]},
  {label:"Velocidad máxima en alternate y direct law: 320 kt (M 0,77 en direct)",weight:1,accepted:["320","0 77"]},
  {label:"Además: abnormal attitude law y mechanical backup",weight:1,accepted:["mechanical backup","respaldo mecanico","backup mecanico","abnormal attitude","pitch trim wheel"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-27-20-10-20 · Flare mode (PDF 3088)",cite:"When the aircraft passes 50 ft RA, the THS is frozen and the normal flight mode changes to flare"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-10-20 · Protections (PDF 3088)",cite:"The normal law protects the aircraft throughout the flight envelope, as follows :"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3119)",cite:"In flight, the pitch alternate law is similar to the normal law and is based on load factor demand."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3119)",cite:"In alternate law, when the flight crew selects L/G down, the pitch control law switches to the pitch direct law"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3120)",cite:"Only the yaw damping function is available."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3120)",cite:"The load factor limitation is similar to the load factor limitation in normal law."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Direct law (PDF 3140)",cite:"The pitch direct law is a direct stick-to-elevator relationship"},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Direct law (PDF 3140)",cite:"There is no automatic trim : the pilot must trim manually."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Direct law (PDF 3140)",cite:"With the aircraft in the clean configuration, the maximum roll rate is about 30 °/s."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Reconfiguration (PDF 3109)",cite:"MAX SPEED           320 kt/M 0.77"}
 ]},

{id:"ov_dual_ra_direct",question:"¿Qué falla hace que los controles de vuelo pasen de normal law directamente a direct law al bajar el tren?",
 short:"La doble falla de radio altímetros (RA 1 + 2): el avión sigue en normal law, pero al extender el tren pasa directo a direct law, sin pasar por alternate law.",
 reference:"La doble falla de radio altímetros (RA 1 + 2). El avión sigue en normal law, pero al extender el tren pasa a direct law en pitch y roll (el yaw queda en alternate), sin protecciones. Si además fallan los dos LGCIU, el cambio ocurre al seleccionar CONF 2.\n\nProcedimiento (NAV RA 1 + 2 FAULT): aterrizar en CONF 3 con GPWS LDG FLAP 3 en ON, VAPP = VREF + 10 kt y calcular la landing distance. El LOC está disponible; el G/S no. Quedan inoperativos los callouts automáticos de altura, el GPWS, la CAT 2, el autoland GLS, la detección reactiva de windshear y el TCAS.\n\nPor qué es “la única”: otras fallas llevan primero a alternate law, y la alternate law siempre pasa a direct law al bajar el tren; algunas fallas de IR dan direct law de inmediato. La doble falla de RA es la que va de normal law directo a direct law al bajar el tren.",
 concepts:[
  {label:"La doble falla de radio altímetros (RA 1 + 2)",weight:3,required:true,accepted:["radio altimetro","radio altimetros","radioaltimetro","radioaltimetros","radio altimeter","doble ra","dual ra","ambos ra","los dos ra","ra 1 y 2"]},
  {label:"Sigue en normal law y pasa a direct law al extender el tren",weight:2,required:true,accepted:["al bajar el tren","al extender el tren","tren abajo","gear down","l g down","extension del tren"]},
  {label:"Si fallan los dos LGCIU, el cambio es al seleccionar CONF 2",weight:1,accepted:["lgciu","landing gear control"]},
  {label:"Aterrizar en CONF 3, VREF + 10 kt, calcular la landing distance",weight:2,accepted:["vref 10","vref mas 10","vref mas diez","landing distance","distancia de aterrizaje"]},
  {label:"LOC disponible y G/S no; inoperativos GPWS, callouts, CAT 2, TCAS y windshear reactivo",weight:1,accepted:["gpws","tcas","callouts","g s","glide slope","loc"]},
  {label:"Otras fallas pasan primero por alternate law",weight:1,accepted:["alternate law","ley alterna","primero alterna","pasan por alterna"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Flight controls law reconfiguration (PDF 3111)",cite:"2 Radio Altimeters at L/G EXTN"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-NAV · NAV RA 1 AND 2 FAULT (PDF 8606)",cite:"At landing gear extension, flight controls revert to direct law in both pitch and roll"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-NAV · NAV RA 1 AND 2 FAULT (PDF 8606)",cite:"GPWS LDG FLAP 3"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-NAV · NAV RA 1 AND 2 FAULT (PDF 8606)",cite:"APPR SPD..........................................................VREF+10 KT"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-NAV · NAV RA 1 AND 2 FAULT (PDF 8606)",cite:"LOC*, LOC, F-LOC*  , and F-LOC  modes are available via the LOC pb."},
  {src:"FCOM 15 SEP 25 · DSC-27-20-20 · Alternate law (PDF 3119)",cite:"In alternate law, when the flight crew selects L/G down, the pitch control law switches to the pitch direct law"}
 ]},

{id:"ov_rvsm_equipment",question:"¿Qué equipos se requieren para volar en espacio RVSM?",
 short:"2 ADR y 2 DMC, 1 transponder, 1 función de autopilot, 1 canal de la FCU, 2 funciones de PFD para la altitud y 1 FWC para la alerta de altitud.",
 reference:"RVSM (Reduced Vertical Separation Minimum) es la separación vertical de 1 000 ft entre FL290 y FL410. Además de la aprobación del avión y del operador, tienen que funcionar:\n- 2 ADR + 2 DMC.\n- 1 transponder.\n- 1 función de autopilot.\n- 1 canal de la FCU, para seleccionar la altitud y enganchar OP CLB / OP DES.\n- 2 funciones de PFD, para la indicación de altitud.\n- 1 FWC, para la alerta de altitud.\n\nAntes del vuelo se revisan la MEL y el pronóstico (turbulencia), y en tierra cada altímetro tiene que diferir menos de 75 ft de la elevación del aeropuerto. Si un equipo falla antes de entrar, se pide una nueva autorización para evitar el espacio RVSM. Dentro: AP enganchado en crucero y en los cambios de nivel, no pasarse más de 150 ft del nivel asignado, comparar los altímetros más o menos cada hora y reportar las fallas al final del vuelo.",
 concepts:[
  {label:"2 ADR y 2 DMC",weight:2,required:true,accepted:["2 adr","dos adr","adr","dmc","air data"]},
  {label:"1 transponder",weight:2,required:true,accepted:["transponder","transpondedor"]},
  {label:"1 función de autopilot",weight:2,required:true,accepted:["autopilot","autopiloto","piloto automatico","ap"]},
  {label:"1 canal de la FCU",weight:1,accepted:["fcu","canal de la fcu","flight control unit"]},
  {label:"2 PFD para la indicación de altitud",weight:1,accepted:["pfd","indicacion de altitud","altimetros"]},
  {label:"1 FWC para la alerta de altitud",weight:1,accepted:["fwc","alerta de altitud","altitude alert","flight warning"]},
  {label:"RVSM: 1 000 ft entre FL290 y FL410",weight:1,accepted:["290","410","1000 ft","1000 pies","1 000 ft","mil pies"]},
  {label:"Procedimiento: nueva autorización si falla antes de entrar; 150 ft; altímetros cada hora",weight:1,accepted:["nueva autorizacion","150","cada hora","75 ft","75 pies"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · Required equipments/functions for RVSM (PDF 9655)",cite:"2 ADRs + 2 DMCs"},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · Required equipments/functions for RVSM (PDF 9655)",cite:"1 FCU channel (for altitude target selection and OP CLB/OP DES mode engagement)"},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · Required equipments/functions for RVSM (PDF 9655)",cite:"1 FWC (for altitude alert function)."},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · RVSM normal procedure (PDF 9656)",cite:"If any of the required equipment fails before the aircraft enters RVSM airspace, the flight crew"},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · RVSM normal procedure (PDF 9656)",cite:"PFDs and the airport elevation is less than 75 ft."},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · RVSM normal procedure (PDF 9657)",cite:"Ensure that autopilot is engaged for cruise, and for flight level changes."},
  {src:"FCOM 15 SEP 25 · PRO-SPO-50 · RVSM normal procedure (PDF 9657)",cite:"During flight level transitions, do not exceed or go below the assigned flight level by more than"},
  {src:"DAN 121 ED3 ENM7 · RVSM (PDF 88)",cite:"vertical mínima reducida (RVSM) de 1000 pies (300 metros) entre FL290 y"}
 ]},

{id:"ov_ecam_priorities",question:"Ante una falla, ¿en qué orden se aplican los procedimientos (memory items, OEB, ECAM, QRH) y qué se hace después?",
 short:"Primero volar. Después: memory items u OEB immediate actions, luego el OEB, luego el ECAM y después el QRH (las QRH summaries en ELEC EMER CONFIG o doble falla hidráulica). Al terminar, si hay tiempo, el FCOM.",
 reference:"Primero volar: mantener una trayectoria segura antes de leer nada. En el despegue o en un go-around, las acciones READ & DO empiezan desde 400 ft AGL; antes, solo si la trayectoria es segura.\n\nEl orden básico es:\n1. MEMORY ITEMS u OEB immediate actions, de memoria.\n2. OEB.\n3. ECAM: el procedimiento, las páginas de sistema y el STATUS.\n4. QRH. Las QRH summaries se usan después de “ECAM ACTIONS COMPLETE”, en ELEC EMER CONFIG o en una doble falla hidráulica.\n\nSe aplica un procedimiento a la vez: se termina, salvo que pida otro o aparezca algo que obligue a reevaluar, como humo en cabina. Al terminar, se vuelve al reparto normal de tareas y, si hay tiempo, se revisa el FCOM, sin alargar el vuelo para eso.\n\nEs la secuencia básica: la tripulación usa su criterio y la adapta a la situación real.",
 steps:[
  {concept:"Primero volar: trayectoria segura (desde 400 ft AGL en despegue o go-around)",order:1,weight:2,accepted:["primero volar","fly the aircraft","volar el avion","trayectoria segura","400 ft","400 pies"]},
  {concept:"Memory items u OEB immediate actions",order:2,weight:2,required:true,accepted:["memory items","memory item","acciones de memoria","recall items","immediate actions","acciones inmediatas"]},
  {concept:"OEB",order:3,weight:1,accepted:["oeb"]},
  {concept:"ECAM",order:4,weight:2,required:true,accepted:["ecam"]},
  {concept:"QRH (summaries en ELEC EMER CONFIG o doble falla hidráulica)",order:5,weight:2,accepted:["qrh","summaries"]},
  {concept:"FCOM si hay tiempo, sin alargar el vuelo",order:6,weight:1,accepted:["fcom","si hay tiempo","si el tiempo lo permite","sin alargar"]}
 ],
 refs:[
  {src:"FCTM 25 NOV 24 · AOP-30-10 · Sequence of procedure (PDF 154)",cite:"In the case of abnormal or emergency situations, the flight crew should apply the procedures in the following sequence, as appropriate:"},
  {src:"FCTM 25 NOV 24 · AOP-30-10 · Sequence of procedure (PDF 154)",cite:"MEMORY ITEMS or OEB immediate actions"},
  {src:"FCTM 25 NOV 24 · AOP-30-10 · Sequence of procedure (PDF 154)",cite:"the flight crew should exercise their judgment and adapt the sequence of actions to the real conditions."},
  {src:"FCTM 25 NOV 24 · AOP-30-10 · One procedure at a time (PDF 154)",cite:"When the flight crew applies a procedure, they must complete the procedure, unless:"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · General (PDF 158)",cite:"the first priority of the flight crew is to maintain a safe flight path before the flight crew performs any READ & DO actions."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · General (PDF 158)",cite:"the flight crew should delay READ & DO actions until the aircraft reaches a minimum of 400 ft AGL."},
  {src:"FCTM 25 NOV 24 · AOP-30-60 · Use of summaries (PDF 168)",cite:"The QRH summaries are QRH procedures created to help the flight crew to perform actions in the case of an ELEC EMER CONFIG or a dual hydraulic failure."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"However, the flight crew should not prolong the flight to refer to the FCOM."}
 ]},

{id:"ov_ecam_handling",question:"Describe cómo se maneja un ECAM entre el PF y el PM, desde que aparece la alerta hasta “ECAM ACTIONS COMPLETE”.",
 short:"El primero que lo ve apaga la alarma; el PM lee y confirma la falla; el PF, con el avión controlado, ordena “ECAM ACTIONS”; el PM ejecuta y pide confirmación antes de cada CLEAR; en el STATUS se hace STOP ECAM; luego CONTINUE ECAM hasta “ECAM ACTIONS COMPLETE”.",
 reference:"1. El primero que ve la alerta apaga el MASTER WARNING o el MASTER CAUTION.\n2. El PM lee el título de la falla y la confirma mirando el panel overhead y/o la página SD antes de tocar nada (los sensores pueden ser otros que los que dispararon la alerta).\n3. El PF considera si hay un OEB y, con el avión controlado y la trayectoria estable, ordena “ECAM ACTIONS” (si hay varias fallas, solo para la primera). Desde ahí el PF vuela, navega y comunica.\n4. El PM hace las acciones en voz alta (READ & DO). Antes de borrar pide “CLEAR (sistema)?”; el PF verifica y confirma “CLEAR (sistema)”, y el PM presiona CLR. Lo mismo con cada página SD.\n5. Cuando aparece el STATUS, el PM dice “STATUS” y el PF ordena “STOP ECAM”. Se hace el acceleration flow pattern (flaps y tren arriba si fue al despegar), los checklists normales pendientes, y se considera un reset de sistema (solo los de la tabla del QRH, nunca de memoria) o un ENG RELIGHT si el motor falló sin daño.\n6. El PF ordena “CONTINUE ECAM”. El PM lee el STATUS, repasa sus procedimientos para anticipar la carga de trabajo y pide “REMOVE STATUS?”; el PF confirma, el PM presiona STS y anuncia “ECAM ACTIONS COMPLETE”.\n\nTambién se hace STOP ECAM para algo que necesita a los dos (hablar con ATC, cambiar la configuración, ajustar los altímetros). Las thrust levers las mueve el PF con confirmación del PM, y el ENG MASTER, el IR y los controles con guarda se confirman entre los dos antes de moverlos.",
 steps:[
  {concept:"El primero que la ve apaga el MASTER WARNING o MASTER CAUTION",order:1,weight:1,accepted:["master warning","master caution","apaga la alarma","apagar la alarma","silencia la alarma","cancela la alarma","primero que la ve"]},
  {concept:"El PM lee el título de la falla y la confirma (overhead o página SD)",order:2,weight:2,required:true,accepted:["lee el titulo","titulo de la falla","nombre de la falla","lee la falla","confirma la falla","overhead","pagina sd"]},
  {concept:"El PF, con el avión controlado, ordena “ECAM ACTIONS”",order:3,weight:2,required:true,accepted:["ecam actions","acciones ecam"]},
  {concept:"El PM ejecuta y pide confirmación antes de cada CLEAR",order:4,weight:2,accepted:["clear","read and do","read do","ejecuta las acciones","hace las acciones"]},
  {concept:"En el STATUS: “STOP ECAM” (flow pattern, checklists, resets)",order:5,weight:2,required:true,accepted:["stop ecam"]},
  {concept:"“CONTINUE ECAM”, lectura del STATUS y “ECAM ACTIONS COMPLETE”",order:6,weight:1,accepted:["continue ecam","remove status","actions complete"]}
 ],
 refs:[
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM tasksharing (PDF 159)",cite:"First flight crewmember who notices"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM tasksharing (PDF 159)",cite:"The PM should check/inspect the overhead panel and/or associated SD, in order to analyze and confirm the failure, before they take any action."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM tasksharing (PDF 160)",cite:"When the ECAM displays several failures, the PF calls out \"ECAM ACTIONS\" for the first ECAM only."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM tasksharing (PDF 160)",cite:"Before the PM presses the CLR pb, the flight crew should carefully check that all actions have been performed."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · Stop ECAM (PDF 160)",cite:"When necessary, the flight crew should stop the ECAM actions when they need to perform actions which require acknowledgement, check or crosscheck from both flight crewmembers"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · Stop ECAM (PDF 161)",cite:"In all cases, the flight crew must stop the ECAM actions before reading the STATUS page"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · Stop ECAM (PDF 161)",cite:"The flight crew must not apply the system reset procedure from memory."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · Tasksharing rules (PDF 158)",cite:"Obtain PF confirmation before clearing any ECAM."},
  {src:"FCTM 25 NOV 24 · AOP-30-20 · Tasksharing rules for thrust levers operation (PDF 156)",cite:"Therefore, the PM should not operate the thrust levers."}
 ]},

{id:"ov_ecam_after",question:"Una vez completadas las acciones ECAM/QRH/OEB, ¿qué hace la tripulación?",
 short:"Vuelve al reparto normal de tareas, revisa el FCOM si hay tiempo (sin alargar el vuelo), evalúa la situación con el STATUS (combustible, landing distance y otros aspectos), decide e informa a ATC, cabina, pasajeros y operaciones.",
 reference:"- Vuelve al reparto normal de tareas (normal operations task sharing).\n- Si hay tiempo, revisa el FCOM para buscar información adicional, pero sin alargar el vuelo para eso.\n- Evalúa la situación llamando el STATUS cuando convenga: la penalidad de combustible (cuánto queda en destino o en el alternativo), la penalidad de landing distance (calcularla para destino o alternativo) y los aspectos operacionales, de mantenimiento y comerciales.\n- Toma la decisión.\n- Informa a ATC, a la tripulación de cabina, a los pasajeros y a operaciones de la aerolínea, según corresponda.",
 concepts:[
  {label:"Volver al reparto normal de tareas",weight:2,required:true,accepted:["reparto normal","task sharing","tareas normales","reparto de tareas","normal operations"]},
  {label:"FCOM si hay tiempo, sin alargar el vuelo",weight:1,accepted:["fcom","si hay tiempo","si el tiempo lo permite","sin alargar","sin prolongar"]},
  {label:"Evaluar con el STATUS: combustible y landing distance",weight:2,required:true,accepted:["status","combustible","fuel","landing distance","distancia de aterrizaje","evaluar","evalua la situacion"]},
  {label:"Aspectos operacionales, de mantenimiento y comerciales",weight:1,accepted:["mantenimiento","comerciales","comercial","operacionales"]},
  {label:"Tomar la decisión",weight:2,accepted:["decision","decidir","decide"]},
  {label:"Informar a ATC, cabina, pasajeros y operaciones",weight:2,required:true,accepted:["informar","informa","atc","cabina","pasajeros","operaciones","control de transito"]}
 ],
 refs:[
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"Resume the Normal Operations Task sharing rules"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"If time permits, review the FCOM for additional information on the applicable procedure(s)."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"Check any fuel penalty factor, and check the remaining fuel at destination or diversion airport"},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"Consider all the operational, maintenance and commercial aspects."},
  {src:"FCTM 25 NOV 24 · AOP-30-30 · ECAM/QRH/OEB actions completed (PDF 162)",cite:"Inform the ATC, the cabin crew, the passengers, and airline operations as required."}
 ]},

{id:"ov_emergency_atc",question:"¿Qué datos le das al controlador cuando declaras una emergencia?",
 short:"MAYDAY (o PAN PAN) tres veces, a quién llamas, tu callsign, qué pasa, tus intenciones, posición, nivel y rumbo; y como información útil, almas a bordo, combustible en tiempo y mercancías peligrosas. Squawk 7700.",
 reference:"El mensaje empieza con MAYDAY tres veces (o PAN PAN tres veces) y, en lo posible en este orden, incluye: la estación a la que se llama, la identificación del avión (callsign), la naturaleza de la emergencia (qué falló), las intenciones del comandante, la posición, el nivel y el rumbo, y cualquier otra información útil. Además se pone el transponder en 7700.\n\nLa información útil que normalmente se agrega:\n- Almas a bordo (souls on board).\n- Combustible que queda, expresado en tiempo de vuelo (endurance, en horas y minutos); en tierra, a los servicios de emergencia se les da en kg.\n- Mercancías peligrosas a bordo (dangerous goods), las que indica el NOTOC.\n\nEl PF, una vez que recuperó una trayectoria estable, informa a ATC y a la cabina la situación y las intenciones.",
 concepts:[
  {label:"MAYDAY (o PAN PAN) tres veces",weight:1,accepted:["mayday","pan pan","tres veces"]},
  {label:"Estación llamada e identificación (callsign)",weight:1,accepted:["callsign","indicativo","identificacion","matricula","estacion"]},
  {label:"Naturaleza de la emergencia (origen de la falla)",weight:2,required:true,accepted:["naturaleza de la emergencia","naturaleza","origen de la falla","que fallo","tipo de emergencia","que esta pasando"]},
  {label:"Intenciones del comandante",weight:2,required:true,accepted:["intenciones","intencion","que vamos a hacer"]},
  {label:"Posición, nivel y rumbo",weight:1,accepted:["posicion","nivel","rumbo","altitud"]},
  {label:"Almas a bordo",weight:2,required:true,accepted:["almas a bordo","almas","souls","personas a bordo","pob"]},
  {label:"Combustible en tiempo (endurance); en tierra, en kg",weight:2,accepted:["endurance","horas de combustible","autonomia","combustible en tiempo","horas y minutos","minutos de combustible","combustible remanente","kg en tierra"]},
  {label:"Mercancías peligrosas (dangerous goods, NOTOC)",weight:1,accepted:["mercancias peligrosas","dangerous goods","carga peligrosa","notoc","materiales peligrosos"]},
  {label:"Squawk 7700",weight:1,accepted:["7700","squawk"]}
 ],
 refs:[
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.1.3 (PDF 88)",cite:"should preferably be spoken three times at the start of the initial distress or urgency call."},
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.2.1.1 (PDF 89)",cite:"A distress message should contain as many as possible of the following elements, and, if possible, in the order shown:"},
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.2.1.1 (PDF 89)",cite:"nature of the distress condition;"},
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.2.1.1 (PDF 89)",cite:"intention of the person in command;"},
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.2.1.1 (PDF 89)",cite:"position, level and heading of the aircraft; and"},
  {src:"ICAO Doc 9432 · Manual of Radiotelephony 9.2.1.2 (PDF 90)",cite:"including the activation of the appropriate SSR code, 7700"},
  {src:"FCOM 15 SEP 25 · DSC-46-10-40-30 · ATC EMERGENCY page (PDF 4354)",cite:"Enters the maximum remaining flight time, limited by fuel autonomy."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules (PDF 8911)",cite:"The PF must then inform ATC and the cabin crew of:"},
  {src:"DAN 121 ED3 ENM7 · 121.105 Transporte de mercancías peligrosas (PDF 43)",cite:"La información al piloto al mando (NOTOC)."}
 ]},

{id:"ov_golden_rules",question:"¿Cuáles son las golden rules de Airbus?",
 short:"Son cuatro: 1) fly, navigate, communicate, en ese orden; 2) usar el nivel de automatización apropiado; 3) entender el FMA en todo momento; 4) actuar si las cosas no salen como se espera.",
 reference:"1. Fly, navigate, communicate: en ese orden y con buen reparto de tareas. Fly: el PF vuela y controla la trayectoria, y el PM monitorea activamente y avisa las desviaciones. Navigate: saber dónde estás, dónde deberías estar, adónde vas, y dónde están el mal tiempo, el terreno y los obstáculos. Communicate: entre los pilotos, con ATC, con la cabina y con el personal de tierra; en una emergencia, el PF primero recupera una trayectoria estable y después informa a ATC y a la cabina la situación y las intenciones. El mensaje clave: fly the aircraft.\n2. Usar el nivel de automatización apropiado en todo momento, incluido el vuelo manual (acordado entre los dos pilotos), y entender qué efecto tiene.\n3. Entender el FMA en todo momento: monitorear, anunciar, confirmar y entender los modos.\n4. Actuar si las cosas no salen como se espera: el PF baja el nivel de automatización (de managed a selected, o de selected a vuelo manual), y el PM comunica, cuestiona al PF si hace falta y, si es necesario, toma el control.",
 concepts:[
  {label:"1. Fly, navigate, communicate (en ese orden)",weight:2,required:true,accepted:["fly navigate communicate","volar navegar comunicar","fly navigate","volar navegar","fly the aircraft"]},
  {label:"2. Nivel de automatización apropiado",weight:2,required:true,accepted:["nivel de automatizacion","automatizacion apropiada","automation","automatizacion"]},
  {label:"3. Entender el FMA (monitorear, anunciar, confirmar)",weight:2,required:true,accepted:["fma","flight mode annunciator","modos"]},
  {label:"4. Actuar si las cosas no salen como se espera",weight:2,required:true,accepted:["actuar","tomar accion","take action","no salen como se espera","no sale como se espera","no va como se espera"]},
  {label:"El PF baja el nivel de automatización; el PM comunica, cuestiona y toma el control",weight:1,accepted:["managed a selected","selected a manual","vuelo manual","toma el control","tomar el control","take over","cuestiona","challenge"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8909)",cite:"Fly. Navigate. Communicate: In this order and with appropriate tasksharing."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8911)",cite:"Fly the Aircraft, Fly the Aircraft, Fly the Aircraft"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8912)",cite:"Use the appropriate level of automation at all times."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8912)",cite:"Understand the FMA at all times."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8912)",cite:"Take action if things do not go as expected."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8913)",cite:"From managed guidance to selected guidance, or"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-01 · Golden rules for pilots (PDF 8913)",cite:"Take over, when necessary."}
 ]}
];
