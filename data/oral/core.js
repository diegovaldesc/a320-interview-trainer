/* Entrevista oral · Preguntas base de la entrevista: meteorología, CRM, pasajeros, sistemas, emergencias y V1.
   24 preguntas (también las usa Need to know). Cada una trae su respuesta de referencia, su
   rúbrica (concepts o steps, criticalErrors) y sus fuentes internas (refs), que nunca se muestran.
   data/oral/index.js las reúne en ORAL_VOICE_BANK. */
window.ORAL_PARTS=window.ORAL_PARTS||{};
window.ORAL_PARTS["core"]=[
{id:"ov_microburst",question:"¿Qué es un microburst?",
 reference:"Un microburst es una corriente descendente intensa y localizada que al llegar al terreno se expande horizontalmente, produciendo cambios importantes en la dirección y velocidad del viento y generando windshear peligroso, especialmente cerca del terreno.",
 concepts:[
  {label:"Corriente descendente intensa",weight:2,required:true,accepted:["corriente descendente","downdraft","downburst","aire descendente","aire que desciende","corriente de aire hacia abajo","masa de aire que baja","aire que baja","corriente que baja","columna de aire que cae","aire que cae con fuerza","viento descendente","flujo descendente"]},
  {label:"Fenómeno localizado",weight:1,accepted:["localizado","localizada","zona pequena","area pequena","espacio reducido","fenomeno localizado","puntual","chico","chica","breve","corta duracion","de corta duracion"]},
  {label:"Expansión horizontal al llegar al terreno",weight:2,accepted:["se expande horizontalmente","se abre horizontalmente","se abre hacia los lados","se expande hacia los lados","diverge","divergencia al llegar al suelo","se dispersa hacia los lados","se esparce al tocar el suelo","como un hongo","en forma de hongo","se abre como un paraguas"]},
  {label:"Genera windshear",weight:2,required:true,accepted:["windshear","wind shear","cizalladura","cizalladura del viento","cambio brusco de viento","cambios de direccion y velocidad del viento","corte de viento"]},
  {label:"Peligroso cerca del terreno",weight:1,accepted:["baja altura","cerca del terreno","cerca del suelo","despegue","aterrizaje","aproximacion","fase critica"]}
 ],
 criticalErrors:[{accepted:["corriente ascendente","solo corriente ascendente","el aire sube"],penalty:3,feedback:"Un microburst se caracteriza principalmente por una corriente descendente, no ascendente."}]},

{id:"ov_windshear",question:"¿Qué es el windshear y por qué es peligroso durante el despegue o la aproximación?",
 reference:"El windshear es un cambio brusco de la velocidad y/o dirección del viento en una distancia relativamente corta. Es peligroso durante el despegue o la aproximación porque puede alterar rápidamente la sustentación y la trayectoria justo cuando hay poco margen de altura o energía para corregir.",
 concepts:[
  {label:"Cambio brusco de viento",weight:2,required:true,accepted:["cambio brusco","cambio repentino","cambio subito","variacion rapida","cambia de direccion","cambia de velocidad","cambio abrupto","cambio inesperado","de un momento a otro"]},
  {label:"En distancia/tiempo corto",weight:1,accepted:["distancia corta","poco tiempo","en poco espacio","rapidamente","en segundos","de golpe"]},
  {label:"Afecta sustentación/trayectoria",weight:2,accepted:["sustentacion","performance","trayectoria","velocidad indicada","energia","se pierde sustentacion","se descontrola"]},
  {label:"Peligroso en fases críticas de poco margen",weight:2,accepted:["baja altura","poca altura","poco margen","fase critica","fases criticas","cerca del suelo","cerca del terreno","margen de altura","poca energia"]}
 ],
 criticalErrors:[{accepted:["viento constante","viento estable y sostenido"],penalty:3,feedback:"El windshear se define por el cambio brusco, no por un viento sostenido y estable."}]},

{id:"ov_crm_windshear",question:"Antes del despegue detectas una condición de windshear que te hace pensar que la operación no es segura, pero el comandante quiere continuar. ¿Qué harías?",
 reference:"Expresaría claramente mi preocupación citando datos o el procedimiento aplicable, verificaría los límites correspondientes, y si la seguridad sigue comprometida, escalaría la intervención con mayor firmeza hasta lograr que se reconsidere la decisión.",
 concepts:[
  {label:"Expresar la preocupación claramente",weight:2,required:true,accepted:["expresar mi preocupacion","expresaria","comunicar la duda","decir lo que pienso","hablar claramente","plantear la duda","mi preocupacion","manifestar mi duda","inquietud"]},
  {label:"Apoyarse en datos/procedimiento",weight:2,accepted:["datos","procedimiento","limites","referencia tecnica","apoyarme en el manual","criterio establecido","manual","normativa","sop"]},
  {label:"Escalar si el riesgo persiste",weight:2,accepted:["escalar","insistir","ser mas firme","tomar el control si es necesario","elevar la preocupacion","intervenir con mas fuerza","tomar el control","asumir el control","tomar el mando"]}
 ],
 criticalErrors:[{accepted:["aceptar sin decir nada","no digo nada","me quedo callado","no comento nada"],penalty:3,feedback:"Un buen CRM exige expresar la preocupación con datos, no guardar silencio ante el comandante."}]},

{id:"ov_balanced_field",question:"¿Qué significa realmente el concepto de balanced field length en el despegue?",
 reference:"Significa que se selecciona V1 de modo que la distancia requerida para acelerar y detenerse sea igual a la distancia requerida para acelerar y continuar el despegue con un motor inoperativo hasta 35 ft. No es una característica fija de la pista, sino el resultado de un cálculo de performance para ese peso y esas condiciones.",
 concepts:[
  {label:"V1 selecciona el balance",weight:2,accepted:["v1","seleccion de v1","eligiendo v1","se calcula v1"]},
  {label:"Distancia de aceleración-parada",weight:2,required:true,accepted:["accelerate stop","aceleracion parada","abortar y detenerse","rechazar el despegue","distancia para frenar","acelerar y detenerse","abortar el despegue","distancia de frenado","detenerse en la pista"]},
  {label:"Distancia de aceleración-continuación con OEI hasta 35ft",weight:2,required:true,accepted:["accelerate go","continuar el despegue","motor inoperativo","35 ft","un motor parado","oei","35 pies","motor apagado","falla de motor"]},
  {label:"Es cálculo de performance, no característica fija de la pista",weight:1,accepted:["calculo","performance","depende del peso","no es la pista","no es asda","no es un valor fijo","varia con el peso","depende de las condiciones","se recalcula"]}
 ],
 criticalErrors:[{accepted:["asda es igual a toda","asda y toda son iguales","asda igual toda","son lo mismo","es igual a la toda"],penalty:3,feedback:"Balanced field no es que ASDA y TODA sean iguales en la pista; es el resultado de elegir V1 para esa condición específica de peso y performance."}]},

{id:"ov_stab_appr",question:"¿Qué elementos definen una aproximación estabilizada?",
 short:"Trayectoria correcta, configuración de aterrizaje, empuje sobre ralentí, velocidad entre VAPP y VAPP + 20 kt, razón de descenso de máximo 1 000 ft/min y checklist completado, a más tardar a 1 000 ft en IMC o 500 ft en VMC. Si no, go-around.",
 reference:"Para que la aproximación esté estabilizada, a más tardar a 1 000 ft sobre la pista en IMC, o a 500 ft en VMC, tiene que cumplirse todo esto:\n- Trayectoria lateral y vertical correcta.\n- Configuración de aterrizaje, la del briefing.\n- Empuje bien ajustado, normalmente sobre ralentí, para mantener la velocidad.\n- Velocidad entre VAPP y VAPP + 20 kt.\n- Razón de descenso no mayor a 1 000 ft/min.\n- Checklist de aterrizaje completado.\n- Sin desviaciones excesivas de parámetros.\n\nSi a esa altura no está estabilizada (salvo correcciones pequeñas por perturbaciones externas), o si se desestabiliza más abajo, se hace go-around.",
 relations:{alt:{window:6,single:true,otherNumbers:true,subjects:{imc:["imc"],vmc:["vmc"]},values:{a1000:["1000 ft","1 000 ft","1000 pies","1 000 pies","mil pies","1000"],a500:["500 ft","500 pies","quinientos pies","500"]},correct:{imc:["a1000"],vmc:["a500"]}}},
 criticalErrors:[{relation:"alt",wrong:true,penalty:3,feedback:"La altura de estabilización es 1 000 ft en IMC y 500 ft en VMC."}],
 concepts:[
  {label:"Trayectoria correcta",weight:1,accepted:["trayectoria","senda","alineado con la pista"]},
  {label:"Velocidad dentro del criterio",weight:2,accepted:["velocidad","vapp","dentro del rango"]},
  {label:"Configuración de aterrizaje",weight:1,accepted:["configuracion","flaps","tren afuera","gear down","tren abajo"]},
  {label:"Potencia y razón de descenso estables",weight:2,accepted:["potencia","thrust","razon de descenso","vertical speed","rate of descent","velocidad vertical","empuje"]},
  {label:"Altura de estabilización: 1 000 ft en IMC, 500 ft en VMC",weight:2,required:true,accepted:["1000 ft","500 ft","1 000 ft","altura de estabilizacion","1000 pies","mil pies","500 pies","quinientos pies"]},
  {label:"Checklist de aterrizaje completado",weight:1,accepted:["checklist completado","checklist de aterrizaje","lista de chequeo completada","checklist terminado","checklist realizado"]},
  {label:"Si no está estabilizada a esa altura: go-around",weight:2,accepted:["go around","si no go around","no esta estabilizada","no estabilizada","motor y al aire","ida al aire","frustrar","frustrada","sobrepaso"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-18-A · Stabilization criteria (PDF 9117)",cite:"IAS is between VApp and VApp +20 kt"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-18-A · Stabilization criteria (PDF 9117)",cite:"The descent rate does not exceed 1 000 ft/min;"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-18-A · Stabilization criteria (PDF 9117)",cite:"Landing Checklist is completed (all items accomplished and checklist read);"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-18-A · Stabilization criteria (PDF 9117)",cite:"There is no excessive flight parameter deviation."},
  {src:"FCTM 25 NOV 24 · PR-NP-SOP-260 · Considerations about go-around (PDF 406)",cite:"by 1 000 ft AAL in IMC, (or 500 ft AAL in VMC), or is not maintained until landing, or"}
 ]},

{id:"ov_pax_sick",question:"Tienes un pasajero gravemente enfermo en vuelo. ¿Cuál es tu enfoque?",
 reference:"Coordinaría con la tripulación de cabina, buscaría asistencia médica disponible, obtendría información clínica útil, evaluaría los aeropuertos y tiempos disponibles, y tomaría una decisión operacional coordinada con ATC y el soporte disponible.",
 concepts:[
  {label:"Coordinar con cabin crew",weight:2,accepted:["cabin crew","tripulacion de cabina","auxiliares","sobrecargos","tcp"]},
  {label:"Buscar asistencia médica",weight:2,accepted:["asistencia medica","medico a bordo","medlink","soporte medico","doctor","personal medico"]},
  {label:"Evaluar aeropuertos y tiempos",weight:2,accepted:["aeropuertos disponibles","desviar","tiempo de vuelo","alternos","aeropuerto mas cercano","aeropuertos y tiempos","evaluar los aeropuertos"]},
  {label:"Coordinar con ATC",weight:1,accepted:["atc","control de trafico","declarar la emergencia","torre","controlador"]}
 ],
 criticalErrors:[{accepted:["esperar hasta el final del vuelo","no hacer nada","esperar sin actuar"],penalty:3,feedback:"Un caso grave requiere evaluación y acción proactiva, no esperar sin actuar."}]},

{id:"ov_sterile",question:"¿Qué significa 'sterile cockpit' y por qué es importante?",
 reference:"Por debajo de 10.000 ft se deben evitar las conversaciones que no sean esenciales para la operación, tanto en cabina como con la tripulación de cabina, con el fin de facilitar la comunicación entre la tripulación y asegurar que la información de emergencia o de seguridad se transmita con claridad. También ayuda a reducir distracciones en una fase de mayor carga de trabajo.",
 concepts:[
  {label:"Restringe conversaciones no esenciales",weight:2,required:true,accepted:["restringe conversaciones","solo temas operacionales","sin charla","conversaciones no relacionadas","se restringen las conversaciones","actividades no relacionadas","evitar conversaciones","se evitan las conversaciones","no conversar de temas ajenos","no hablar de otras cosas","prohibido hablar de otros temas"]},
  {label:"Por debajo de 10.000 ft",weight:2,accepted:["fases criticas","despegue","aterrizaje","rodaje","por debajo de cierta altura","10000 pies","10 000 pies","10.000 pies","diez mil pies","bajo 10000","menor a 10000 pies","10 000 ft","10000 ft"]},
  {label:"Facilita la comunicación de información de emergencia/seguridad (y de paso reduce distracciones)",weight:2,accepted:["distracciones","carga de trabajo","concentracion","distraerse","distraer","enfocados","atencion","facilitar la comunicacion","informacion de emergencia","informacion de seguridad"]}
 ]},

{id:"ov_fbw",question:"¿Qué significa que el A320 sea fly-by-wire?",
 reference:"Que las órdenes del piloto en el sidestick se transmiten eléctricamente a computadores de control, que a su vez generan las órdenes a los actuadores de las superficies, dentro de las leyes de control aplicables según el estado del sistema.",
 concepts:[
  {label:"Órdenes eléctricas, no mecánicas directas",weight:2,required:true,accepted:["electricamente","señal electrica","no mecanico","sidestick","por cable","electronicamente","transmision electrica","electrica","impulsos electricos","de forma electrica","sin conexion mecanica","no hay conexion mecanica directa"]},
  {label:"Computadores de control",weight:2,accepted:["computadores","elac","sec","fac","calculan la orden"]},
  {label:"Leyes de control",weight:1,accepted:["normal law","alternate law","direct law","leyes de control","ley normal","ley alterna","ley alternada","ley directa"]}
 ]},

{id:"ov_tcas",question:"¿Por qué siempre se deben seguir las órdenes de una RA de TCAS, incluso si implica cruzar la altitud del tráfico?",
 reference:"Porque las órdenes de la RA buscan la mejor separación vertical posible entre ambas aeronaves en tiempo real, coordinándose automáticamente con el TCAS de la otra aeronave, y tienen prioridad sobre cualquier instrucción de ATC en ese momento.",
 concepts:[
  {label:"Coordinación entre ambos TCAS",weight:2,accepted:["coordinacion","coordinandose","ambos aviones","el otro trafico","se coordinan","coordina con","intruso"]},
  {label:"Prioridad sobre ATC",weight:2,required:true,accepted:["prioridad","por sobre atc","aunque atc diga otra cosa","antes que atc","controlador","torre","sin importar lo que diga"]},
  {label:"Busca la mejor separación vertical",weight:2,accepted:["separacion vertical","evitar colision","mejor solucion"]}
 ]},

{id:"ov_etops",question:"¿Qué es ETOPS, cuándo se exige históricamente, y por qué es tan relevante para una ruta bimotor de largo alcance?",
 reference:"Son las siglas de extended-range twin-engine operations; el glosario del avión lo abrevia Extended Twin Operations, y en la norma OACI se llama EDTO. Se aplica a rutas que se alejan de un aeródromo adecuado más allá de cierto tiempo de vuelo con un motor inoperativo a velocidad de crucero; 60 minutos es un valor de referencia típico en las tablas de distancia de desvío. Es relevante porque en una ruta bimotor lejos de tierra una falla de motor obliga a desviarse y volar un tiempo prolongado con un solo motor, así que en la práctica la operación exige demostrar la fiabilidad del motor y la autonomía de sistemas necesarias para completar ese desvío con seguridad.",
 concepts:[
  {label:"Extended twin-engine operations",weight:2,accepted:["extended range","extended twin","twin engine","twin engines"]},
  {label:"Tiempo de vuelo con un motor inoperativo",weight:2,required:true,accepted:["un motor inoperativo","motor parado","oei","motor fallado","falla de motor","motor que falla","un motor no funciona","con un motor menos"]},
  {label:"Distancia a aeródromo adecuado (~60 min)",weight:2,accepted:["aerodromo adecuado","alterno","60 minutos","aeropuerto adecuado"]},
  {label:"Por qué importa: volar prolongado con un motor lejos de tierra",weight:2,accepted:["volar con un solo motor","lejos de tierra","desviarse","fiabilidad del motor","autonomia de sistemas","completar el desvio con seguridad"]}
 ]},

{id:"ov_hydroplane",question:"¿Qué es el hidroplaneo y por qué es peligroso?",
 reference:"Es la pérdida parcial o total del contacto efectivo entre el neumático y el pavimento debido a una película de agua, lo que degrada el frenado y el control direccional en tierra.",
 concepts:[
  {label:"Película de agua entre neumático y pista",weight:2,accepted:["pelicula de agua","agua entre el neumatico","pista mojada","capa de agua","llanta"]},
  {label:"Pérdida de contacto neumático-pavimento",weight:2,required:true,accepted:["pierde contacto","del contacto","contacto efectivo","no toca la pista","se separa del pavimento","no tocan la pista","deja de tocar","no esta tocando","flota sobre el agua","flotando","se separa del suelo"]},
  {label:"Degrada frenado y control direccional",weight:2,accepted:["frenado","control direccional","direccion","no responde","frenos","frenar"]}
 ]},

{id:"ov_autobrake",question:"¿Cuál es el principio de funcionamiento del autobrake?",
 reference:"En el aterrizaje (LO y MED) comanda automáticamente la presión de frenado para alcanzar y mantener una desaceleración objetivo según el modo seleccionado, ajustándose a las condiciones reales de la pista, en lugar de aplicar una presión fija. En un despegue abortado, MAX manda la presión máxima apenas se genera la orden de los ground spoilers.",
 relations:{modo:{window:15,subjects:{lomed:["lo y med","low y med","low y medium","lo med","low","med","medium","modo lo"],max:["max","modo max"]},values:{decel:["desaceleracion objetivo","desaceleracion","deceleracion","desaceleracion constante"],presion:["presion maxima","maxima presion","frenado maximo","maximo frenado","maxima frenada"]},correct:{lomed:["decel"],max:["presion"]}}},
 criticalErrors:[{relation:"modo",wrong:true,penalty:3,feedback:"Está al revés: LO y MED buscan una desaceleración objetivo; MAX, en un despegue abortado, manda la presión máxima."}],
 concepts:[
  {label:"LO y MED: objetivo de desaceleración, no presión fija",weight:2,required:true,accepted:["desaceleracion objetivo","no presion fija","se ajusta","desaceleracion constante","desaceleracion determinada","no aplica siempre la misma presion","varia la presion"]},
  {label:"Automático según modo seleccionado",weight:2,accepted:["modo seleccionado","low","med","max","automatico","automaticamente","bajo","medio","maximo"]},
  {label:"Se adapta a condiciones reales",weight:1,accepted:["se adapta","condiciones de pista","ajusta la presion","ajustandose","condiciones reales"]}
 ]},

{id:"ov_engfire",question:"Camina conmigo por la secuencia de memory items ante un ENG 1(2) FIRE en vuelo, y explica por qué es ese orden.",
 reference:"Primero se lleva el thrust lever del motor afectado a IDLE, luego ENG MASTER a OFF, después se presiona el ENG FIRE pushbutton para armar el extintor, y se descarga el AGENT 1 tras esperar unos 10 segundos, tiempo que permite que el N1 disminuya, reduciendo la ventilación de la góndola y así mejorando la eficacia del agente extintor.",
 steps:[
  {concept:"Thrust lever a IDLE primero",weight:2,required:true,order:1,accepted:["thrust lever idle","thrust lever a idle","palanca a idle","reducir empuje","a idle","ralenti","ralentí","palanca a ralenti"]},
  {concept:"ENG MASTER OFF",weight:2,required:true,order:2,accepted:["eng master off","eng master a off","apagar el motor","master off","a off"]},
  {concept:"ENG FIRE pushbutton arma el extintor",weight:2,required:true,order:3,accepted:["fire pushbutton","armar el extintor","fire pb","boton de fuego","pulsador de fuego","aprieto el boton"]},
  {concept:"Esperar ~10s antes de AGENT 1",weight:2,required:true,order:4,accepted:["10 segundos","esperar antes del agente","agent 1","diez segundos"]},
  {concept:"Por qué: N1 disminuye, mejora eficacia",weight:1,order:5,accepted:["n1 disminuye","n1 disminuya","mas eficaz","mejor efectividad","mejora la eficacia","mejora eficacia"]}
 ]},

{id:"ov_allengfail",question:"En un ALL ENGINES FAILURE, ¿qué harías respecto de la velocidad y por qué es tan importante mantenerla?",
 reference:"Mantendría la optimum relight speed publicada, 280 kt / Mach 0.77 (300 kt / Mach 0.77 en algunos MSN), ya que esa velocidad favorece el reinicio de los motores y evita condiciones como el engine core lock tras una pérdida total de motores en operación de alta potencia.",
 concepts:[
  {label:"Optimum relight speed",weight:2,required:true,accepted:["optimum relight speed","velocidad de relight","280 kt","300 kt","0.77","mach 0.77","punto 77"]},
  {label:"Favorece el reinicio de motores",weight:2,accepted:["relight","reencender","reiniciar motores","molinete","arranque a molinete"]},
  {label:"Evita engine core lock",weight:2,accepted:["core lock","bloqueo del nucleo","engine core lock"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · PRO-ABN-ENG · ENG ALL ENGINES FAILURE (PDF 6890)",cite:"OPT RELIGHT SPD............................................................................................................... 280/0.77"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-ENG · ENG ALL ENGINES FAILURE, otros MSN (PDF 6912)",cite:"OPT RELIGHT SPD............................................................................................................... 300/0.77"},
  {src:"FCOM 15 SEP 25 · PRO-ABN-ENG · ENG ALL ENGINES FAILURE (PDF 6890)",cite:"it is mandatory to fly at or above the optimum relight speed in order to prevent engine core lock."}
 ]},

{id:"ov_decompression",question:"Ante una descompresión que requiere un EMER DESCENT, explica qué acciones tomarías y por qué el orden de esas acciones es importante.",
 reference:"Primero las máscaras de oxígeno de la tripulación, porque sin ellas ningún otro paso posterior es seguro. Luego se establece comunicación entre pilotos. Lo recomendado es mantener el AP y el A/THR conectados; si el A/THR no está activo se llevan los thrust levers a IDLE, y los speed brakes a FULL para perder altitud rápidamente. Tanto el ALT como el HDG se manejan en el FCU con turn antes que pull: primero se gira al valor deseado y luego se tira para activarlo de inmediato. En el ALT, si se hace pull antes de girar, el avión sigue apuntando a la altitud anterior y no desciende, retrasando el oxígeno y aumentando el riesgo de hipoxia. En el HDG, pull saca al avión de NAV para dejar de seguir el plan de vuelo y poder desviarse de la aerovía según lo exija la emergencia (por ejemplo alejarse de tráfico en la misma ruta), incluso en una emergencia sobre el mar sin terreno de por medio. El objetivo es FL100 o el MEA/MORA aplicable, el que sea mayor, descendiendo a la velocidad máxima apropiada.",
 steps:[
  {concept:"Máscaras de oxígeno primero",weight:2,required:true,order:1,accepted:["mascaras de oxigeno","oxigeno","primero el oxigeno"]},
  {concept:"Por qué primero: sin oxígeno nada más es seguro",weight:1,order:1,accepted:["sin oxigeno","sin ellas","antes que nada","por seguridad propia","primero uno mismo","ningun otro paso","paso posterior es seguro","otro paso es seguro"]},
  {concept:"Mantener AP y A/THR conectados (técnica recomendada)",weight:1,order:2,accepted:["a thr","auto thrust","autothrust","mantener el ap","mantener conectado el autopilot","dejar conectado el autopilot","ap y athr"]},
  {concept:"Thrust idle (si A/THR no activo) y speed brakes full",weight:2,required:true,order:2,accepted:["thrust idle","thrust a idle","speed brakes full","speed brakes a full","spoilers","full speed brake","speed brake full"]},
  {concept:"Turn antes que pull en el ALT: si se hace pull antes, no desciende",weight:2,order:3,accepted:["turn","pull","girar","selector de altitud","no desciende","retrasa el descenso","riesgo de hipoxia"]},
  {concept:"Girar el HDG para salir de NAV y desviarse de la ruta",weight:2,order:3,accepted:["aerovia","desviarse de la ruta","cambio de rumbo","cambiar rumbo","virar","salir de nav","dejar de seguir el plan de vuelo","hdg"]},
  {concept:"Objetivo FL100 o MEA/MORA",weight:1,order:4,accepted:["fl100","mea","mora","el mayor"]}
 ]},

{id:"ov_smoke",question:"Si detectas humo o vapores en cockpit y no puedes identificar la fuente de inmediato, explica qué harías y por qué no conviene esperar a diagnosticar antes de actuar.",
 reference:"Iniciaría una diversión y un descenso hacia FL100 o el MEA/MORA aplicable de inmediato, sin esperar a identificar primero la fuente, porque el tiempo es crítico y no conviene demorar la acción para controlar el origen; conviene estar ya actuando sobre el escenario más exigente mientras en paralelo se sigue intentando identificar y aislar el humo.",
 concepts:[
  {label:"Iniciar diversión de inmediato",weight:2,accepted:["diversion","desviar","aeropuerto mas cercano","alterno","aeropuerto alterno"]},
  {label:"Descenso hacia FL100/MEA-MORA",weight:2,accepted:["descenso","fl100","mea","mora"]},
  {label:"No esperar a diagnosticar antes de actuar",weight:2,required:true,accepted:["sin esperar","no esperar a identificar","actuar de inmediato","antes de saber la causa","sin saber la fuente","independiente de la causa","no importa la causa","sin importar la fuente"]},
  {label:"Seguir identificando en paralelo",weight:1,accepted:["identificar la fuente","aislar el humo","en paralelo","al mismo tiempo","mientras tanto","se sigue buscando"]}
 ]},

{id:"ov_stall",question:"Durante un stall recovery, ¿qué haces además de aplicar nose-down pitch, y por qué?",
 reference:"Aplicando nose-down pitch para reducir el ángulo de ataque, simultáneamente se nivelan las alas (bank wings level) para evitar complicar la recuperación con una componente de bank, y una vez que la aeronave sale del stall se aumenta el empuje suavemente mientras se retraen los speed brakes si estaban extendidos, recuperando la trayectoria de vuelo (flight path) suavemente y considerando FLAPS 1 si está en configuración limpia por debajo de 20000 ft.",
 steps:[
  {concept:"Nose-down pitch / ángulo de ataque (simultáneo con nivelar alas)",weight:1,required:true,order:1,accepted:["nose down","pitch abajo","bajar la nariz","angulo de ataque","picar","picada"]},
  {concept:"Nivelar las alas / wings level (simultáneo con nose-down)",weight:2,required:true,order:1,accepted:["wings level","nivela","alas nivel","bank wings level","bank","estabilizar las alas"]},
  {concept:"Aumentar empuje al salir del stall",weight:2,required:true,order:2,accepted:["aumenta el empuje","aumenta empuje","thrust","potencia"]},
  {concept:"Retraer speed brakes",weight:1,order:2,accepted:["retrae","speed brakes in","speed brakes retra","aerofrenos"]},
  {concept:"Recuperar la trayectoria de vuelo suavemente / considerar FLAPS 1",weight:1,order:2,accepted:["flight path","recuperar la trayectoria","flaps 1","recobrar vuelo nivelado"]}
 ]},

{id:"ov_elec_emer",question:"Si terminas en ELEC EMER CONFIG, ¿qué esperarías tener disponible y qué deberías extremar?",
 reference:"Esperaría el RAT desplegado y el emergency generator alimentando la red esencial, con equipos limitados: de radio solo quedan VHF 1, HF 1 (en los aviones que lo tienen) y ATC 1. Hay que extremar dos cosas distintas. Los motores reciben combustible solo por gravedad (FUEL GRVTY FEED), sin bombas, así que hay que evitar G negativas. Y no hay que bajar de 140 kt, la velocidad mínima en esta configuración: el RAT puede alimentar el generador hasta unos 125 kt, pero a esa velocidad puede no lograrlo en el flare.",
 relations:{vel:{window:6,single:true,otherNumbers:true,otherWindow:6,subjects:{min:["velocidad minima","minimo","minima","no bajar de","no hay que bajar de"]},values:{v140:["140 kt","140 nudos","140"]},correct:{min:["v140"]}}},
 criticalErrors:[{relation:"vel",wrong:true,penalty:3,feedback:"La velocidad mínima del RAT en ELEC EMER CONFIG es 140 kt."},{accepted:["g positivas"],penalty:3,feedback:"Con gravity feed hay que evitar las G negativas, no las positivas."},{accepted:["apu alimenta el emergency generator","apu mueve el emergency generator","apu alimenta el emer gen","apu mueve el emer gen","apu alimenta el generador de emergencia"],penalty:3,feedback:"El emergency generator lo mueve el circuito Blue, presurizado por el RAT; el APU no interviene."},{accepted:["todos los equipos","todo disponible","todo sigue funcionando","todos los equipos siguen disponibles"],penalty:3,feedback:"En ELEC EMER CONFIG los equipos quedan limitados: de radio, solo VHF 1, HF 1 (si está instalado) y ATC 1."}],
 concepts:[
  {label:"RAT desplegado / emergency generator",weight:2,required:true,accepted:["rat","ram air turbine","emergency generator","generador de emergencia"]},
  {label:"Equipos limitados (radio/nav)",weight:2,accepted:["equipos limitados","radio limitado","navegacion limitada","equipos de radio","radio y navegacion","solo vhf 1","vhf 1","solo queda un"]},
  {label:"Fuel gravity feed sin bombas: evitar G negativas",weight:1,accepted:["gravity feed","sin bombas","alimentacion por gravedad","g negativas"]},
  {label:"Evitar velocidad baja para no hacer stall al RAT",weight:2,accepted:["no bajar de 140","no hay que bajar de 140","nunca bajar de 140","minimo 140","minima 140","minima de 140","140 kt","140 nudos","ciento cuarenta nudos","evitar stall del rat","stall al rat","stall del rat"]}
 ]},

{id:"ov_hyd_arch",question:"Observa el diagrama del sistema hidráulico y explica su arquitectura: cuántos sistemas hay, qué presuriza a cada uno, y qué respaldos existen.",
 image:"assets/hydraulic-architecture.png",
 imageAlt:"Diagrama esquemático del sistema hidráulico del A320: tres circuitos con sus reservorios, bombas, acumuladores y válvulas.",
 reference:"Hay tres sistemas hidráulicos independientes que operan continuamente: verde, azul y amarillo, cada uno con su propio reservorio y sin transferencia de fluido entre ellos. La presión normal es 3000 PSI; el azul trabaja a 2500 PSI cuando lo alimenta el RAT. El verde lo presuriza una bomba del motor 1. El amarillo lo presuriza una bomba del motor 2, y también una bomba eléctrica que permite usarlo en tierra con los motores apagados. El azul lo presuriza normalmente una bomba eléctrica. El RAT puede presurizarlo en emergencia: se despliega automáticamente al perderse AC BUS 1 y AC BUS 2 con velocidad superior a 100 kt, y también puede desplegarse manualmente con RAT MAN ON. PTU conecta el verde y el amarillo y actúa automáticamente cuando la diferencia de presión entre ambos supera 500 PSI, lo que también permite presurizar el verde en tierra sin motores. Cada sistema tiene un acumulador para cubrir demandas transitorias, y el verde y el amarillo tienen una válvula de corte de fuego en la línea de su bomba de motor, operada por el pushbutton ENG FIRE.",
 relations:{
  bombas:{window:12,single:true,subjects:{verde:["verde","green"],amarillo:["amarillo","yellow"],azul:["azul","blue"]},values:{motor1:["motor 1","motor uno","motor numero 1","eng 1","engine 1"],motor2:["motor 2","motor dos","motor numero 2","eng 2","engine 2"]}},
  fuentes:{window:12,subjects:{verde:["verde","green"],amarillo:["amarillo","yellow"],azul:["azul","blue"]},values:{electrica:["bomba electrica","electrica","electric pump","electric"],rat:["rat","ram air turbine"]}},
  presion:{window:8,single:true,subjects:{normal:["normal","normalmente"],rat:["rat","ram air turbine"],azul:["azul","blue"]},values:{p3000:["3000 psi","3000"],p2500:["2500 psi","2500"]}}
 },
 concepts:[
  {label:"Tres sistemas independientes (verde/azul/amarillo), sin transferencia de fluido entre ellos",weight:2,required:true,accepted:["tres sistemas","no se transfiere","sin transferencia","cada uno independiente","tres circuitos","no hay transferencia de fluido"]},
  {label:"Verde: bomba del motor 1",weight:2,required:true,link:["bombas","verde","motor1"]},
  {label:"Amarillo: bomba del motor 2",weight:2,required:true,link:["bombas","amarillo","motor2"]},
  {label:"Amarillo: también bomba eléctrica (permite operar en tierra)",weight:1,link:["fuentes","amarillo","electrica"]},
  {label:"Azul: bomba eléctrica normalmente",weight:2,required:true,link:["fuentes","azul","electrica"]},
  {label:"Azul: RAT en emergencia",weight:1,link:["fuentes","azul","rat"]},
  {label:"PTU conecta verde y amarillo (~500 PSI)",weight:2,accepted:["ptu","power transfer unit","500 psi","transferencia de potencia","conecta verde y amarillo"]},
  {label:"Acumuladores cubren demandas transitorias",weight:1,accepted:["acumulador","acumuladores","demandas transitorias","mantener la presion"]},
  {label:"Fire shutoff valves en las bombas de motor",weight:1,accepted:["fire shutoff","valvula de corte de fuego","eng fire","corte de fuego"]},
  {label:"Presión normal 3000 PSI",weight:1,accepted:["3000 psi"]}
 ],
 criticalErrors:[{accepted:["se puede transferir fluido entre sistemas","comparten el mismo fluido","estan interconectados directamente","es un solo sistema hidraulico"],penalty:3,feedback:"Los tres sistemas son independientes: el fluido nunca se transfiere entre ellos (PTU transfiere potencia hidráulica de un sistema a otro, no fluido)."},
  {link:["bombas","verde","motor2"],penalty:3,feedback:"El verde lo presuriza la bomba del motor 1, no la del motor 2."},
  {link:["bombas","amarillo","motor1"],penalty:3,feedback:"El amarillo lo presuriza la bomba del motor 2 (y su bomba eléctrica), no la del motor 1."},
  {link:["presion","normal","p2500"],penalty:4,feedback:"La presión normal es 3000 PSI; 2500 PSI es la del azul cuando lo alimenta el RAT."}]},

{id:"ov_elec_arch",question:"Observa el diagrama de arquitectura eléctrica y explica: qué alimenta normalmente las barras AC y DC, qué queda conectado permanentemente a las baterías, y qué respalda al sistema si se pierden todos los generadores principales.",
 image:"assets/electrical-architecture.png",
 imageAlt:"Diagrama esquemático de la arquitectura eléctrica del A320: barras DC y AC, baterías, transformadores rectificadores y generadores.",
 reference:"En operación normal, GEN 1 y GEN 2, accionados por los motores, alimentan el AC BUS 1 y el AC BUS 2 a través de sus contactores de línea. El APU GEN o el EXT PWR pueden reemplazar a cualquiera de los generadores de motor, y los BUS TIE CONT permiten que una sola fuente alimente ambas barras AC, sin conectar nunca dos generadores en paralelo. Del lado DC, el TR 1 y el TR 2 convierten AC a DC: el TR 1 alimenta el DC BUS 1, el DC BAT BUS y el DC ESS BUS, y el TR 2 el DC BUS 2. Las baterías, BAT 1 y BAT 2, quedan permanentemente conectadas a su HOT BUS incluso con todo apagado, y se conectan al DC BAT BUS por su BAT CONT para cargarse o para respaldar la red esencial. Si se pierden todos los generadores principales (sin AC BUS 1 ni AC BUS 2) y el avión va a más de 100 kt, el RAT se despliega y presuriza el circuito hidráulico azul, que mueve el EMER GEN; el EMER GEN alimenta el AC ESS BUS y, a través del ESS TR, el DC ESS BUS. Si tampoco hay EMER GEN, la BAT 1 alimenta el AC ESS BUS a través del inversor estático (STAT INV), que transforma su DC en AC, y la BAT 2 alimenta el DC ESS BUS.",
 relations:{emer:{window:10,subjects:{emergen:["emer gen","generador de emergencia","emergency generator"]},values:{azul:["azul","blue","circuito azul","hidraulico azul"],verde:["verde","green"],amarillo:["amarillo","yellow"],rat:["rat","ram air turbine"]},correct:{emergen:["azul","rat"]}},conv:{window:8,subjects:{tr:["tr","tr 1","tr 2","trs","transformador rectificador","transformadores rectificadores","ess tr"],inv:["stat inv","inversor estatico","static inverter","inversor"]},values:{acdc:["ac a dc","de ac a dc","ac en dc"],dcac:["dc a ac","de dc a ac","dc en ac"]},correct:{tr:["acdc"],inv:["dcac"]}},emerbus:{window:8,subjects:{emergen:["emer gen","generador de emergencia","emergency generator"]},values:{ess:["ac ess bus","ac ess","dc ess bus","red esencial","lo esencial","barras esenciales"],main:["ac bus 1","ac bus 2","toda la red","barras principales","las barras principales"]},correct:{emergen:["ess"]}},bat:{window:10,subjects:{bat:["baterias","bateria","bat 1","bat 2","batteries"]},values:{hot:["hot bus","hot buses","barra caliente","barras calientes"]}}},
 concepts:[
  {label:"GEN 1 y GEN 2 (motor) alimentan AC BUS 1/2 normalmente",weight:2,required:true,accepted:["gen 1 y gen 2","gen 1 y el gen 2","los dos generadores de motor","generadores de los motores","generador de cada motor","cada generador de motor","gen line cont"]},
  {label:"APU GEN o EXT PWR pueden reemplazar a los generadores de motor",weight:2,accepted:["apu gen","poder externo","external power","ext pwr","reemplazar","generador de la apu"]},
  {label:"BUS TIE conecta AC BUS 1 y AC BUS 2",weight:1,accepted:["bus tie","conecta las dos barras","comparten alimentacion","interconecta ac bus"]},
  {label:"TR 1 y TR 2 convierten AC a DC para DC BUS 1/2",weight:2,required:true,link:["conv","tr","acdc"],accepted:["transformador rectificador","transformadores rectificadores","rectifica","rectifican"]},
  {label:"Baterías conectadas permanentemente a HOT BUS",weight:2,required:true,link:["bat","bat","hot"]},
  {label:"Sin generadores principales: el RAT (sobre 100 kt) mueve el EMER GEN por el circuito azul, que alimenta la red esencial",weight:2,required:true,link:[["emer","emergen","azul"],["emer","emergen","rat"]]},
  {label:"STAT INV: respaldo final (BAT 1 a AC) si tampoco hay EMER GEN",weight:1,accepted:["stat inv","inversor estatico","static inverter","invierte dc a ac","dc a ac"]}
 ],
 criticalErrors:[{accepted:["generadores en paralelo","conectan en paralelo","conectados en paralelo","trabajan en paralelo","funcionan en paralelo"],penalty:3,feedback:"Los generadores nunca se conectan en paralelo: cada barra recibe energía de una sola fuente a la vez."},{relation:"emerbus",wrong:true,penalty:3,feedback:"El EMER GEN alimenta solo lo esencial: el AC ESS BUS y, por el ESS TR, el DC ESS BUS; no el AC BUS 1 ni el AC BUS 2."},{accepted:["apu gen no puede reemplazar","apu no puede reemplazar","apu gen no reemplaza","apu no reemplaza"],penalty:3,feedback:"El APU GEN puede reemplazar a uno o a los dos generadores de motor."},{relation:"emer",wrong:true,penalty:3,feedback:"El EMER GEN lo mueve el circuito hidráulico azul (con el RAT)."},{relation:"conv",wrong:true,penalty:2,feedback:"Los TR convierten AC en DC; el STAT INV convierte DC de las baterías en AC."},{accepted:["las baterias solo se conectan si fallan los generadores","las baterias no hacen nada mientras haya generadores"],penalty:3,feedback:"Las baterías quedan conectadas permanentemente a su HOT BUS incluso con todo apagado; no es algo que se active solo cuando fallan los generadores."}]},

{id:"ov_icing",question:"¿Cuándo enciendes el engine anti-ice y cuándo el wing anti-ice en el A320?",
 reference:"Hay condiciones de engelamiento con 10 °C o menos (la OAT en tierra y después del despegue, la TAT en vuelo) y humedad visible, como nubes, lluvia o nieve. El engine anti-ice lo enciendo cuando hay o se esperan esas condiciones, también en tierra, sin esperar a ver hielo; la excepción es el ascenso y el crucero con SAT bajo -40 °C, y en el descenso lo enciendo igual aunque la SAT esté bajo -40 °C. El wing anti-ice lo puedo encender para prevenir hielo en el borde de ataque, y lo debo encender si hay evidencia de hielo: en el indicador visual, en los wipers o con la alerta SEVERE ICE DETECTED.",
 concepts:[
  {label:"Condiciones de engelamiento: 10 °C o menos y humedad visible",weight:2,required:true,accepted:["10 grados","diez grados","10 c","humedad visible","icing conditions","condiciones de engelamiento","engelamiento"]},
  {label:"Engine anti-ice cuando hay o se esperan, sin esperar a ver hielo",weight:2,required:true,accepted:["sin esperar","antes de ver hielo","no esperar","se esperan","anticipadas","se anticipan","antes de que haya hielo"]},
  {label:"Excepción: ascenso y crucero con SAT bajo -40 °C (en el descenso, ON igual)",weight:1,accepted:["40 grados","menos 40","bajo 40","sat","cuarenta"]},
  {label:"Wing anti-ice: puede para prevenir y debe con evidencia de hielo",weight:2,accepted:["evidencia de hielo","indicador visual","wipers","limpiaparabrisas","severe ice","hielo acumulado","acumulacion de hielo","prevenir"]}
 ],
 refs:[
  {src:"FCOM 15 SEP 25 · LIM-ICE_RAIN Definition of icing conditions (PDF 9947)",cite:"Icing conditions exist when the OAT (on ground or after takeoff) or the TAT (in flight) is at or"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-09 Taxi (PDF 9016)",cite:"Turn on engine anti-ice during all ground operations, when icing conditions exist or are anticipated."},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-09 Taxi (PDF 9016)",cite:"flight crew must turn on the engine anti-ice and should not wait until seeing ice"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-13 After takeoff (PDF 9073)",cite:"Icing Conditions) exist or are anticipated, except during climb and cruise when the SAT is below"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-16 Descent preparation (PDF 9102)",cite:"Engine anti-ice must be set to ON before and during descent, even If the SAT is below -40 °C"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-13 After takeoff (PDF 9074)",cite:"The flight crew may turn on the wing anti-ice to prevent ice accretion on the wing leading edge"},
  {src:"FCOM 15 SEP 25 · PRO-NOR-SOP-13 After takeoff (PDF 9074)",cite:"The flight crew must turn on the wing anti-ice if there is evidence of ice accretion, such as ice on"}
 ]},

{id:"ov_v1_reject",question:"Durante el despegue, antes de V1, se presenta una falla o anomalía. ¿Qué consideras para decidir si rechazas el despegue?",
 reference:"Depende de la velocidad. Por debajo de 100 kt la decisión queda a criterio del comandante, y conviene considerar seriamente rechazar ante cualquier alerta ECAM. Entre 100 kt y V1 hay que estar go-minded: muy pocas condiciones justifican rechazar — básicamente fuego o daño severo, pérdida súbita de empuje de un motor, una indicación inequívoca de que el avión no volará de forma segura, o cualquier alerta ECAM. El llamado de V1 tiene precedencia sobre cualquier otro llamado, y la decisión de rechazar debe tomarse antes de V1: el comandante mantiene la mano en las palancas de empuje hasta V1, sea o no el piloto que está volando.",
 relations:{fase:{window:12,subjects:{bajo:["por debajo de 100","debajo de 100","bajo 100","menos de 100","antes de 100","por debajo de los 100"],sobre:["entre 100","sobre 100","encima de 100","mas de 100","despues de 100","pasado 100","pasando 100"]},values:{criterio:["criterio del comandante","a discrecion","discrecion del comandante","a criterio"],go:["go minded","muy pocas","pocas razones","pocas condiciones"]},correct:{bajo:["criterio"],sobre:["go"]}}},
 concepts:[
  {label:"Por debajo de 100 kt: criterio del comandante, considerar rechazar ante cualquier ECAM",weight:2,link:["fase","bajo","criterio"]},
  {label:"Entre 100 kt y V1: go-minded, muy pocas razones válidas (fuego/daño severo, pérdida súbita de empuje, indicación inequívoca de que no volará seguro, o alerta ECAM)",weight:2,required:true,accepted:["go minded","fuego","dano severo","perdida subita de empuje","no volara de forma segura","no va a volar seguro","alerta ecam","pocas razones","muy pocas condiciones"]},
  {label:"Sobre V1: el llamado de V1 tiene precedencia sobre cualquier otro",weight:2,required:true,accepted:["v1 tiene precedencia","precedencia sobre cualquier otro llamado","por sobre cualquier otro llamado","tiene prioridad","va primero","antes que cualquier otro llamado","primero que cualquier otro"]},
  {label:"La decisión debe tomarse antes de V1; el comandante mantiene la mano en las palancas hasta V1",weight:1,accepted:["mano en las palancas","mano en los thrust levers","mano en las thrust levers","hasta v1","antes de llegar a v1"]}
 ],
 criticalErrors:[{relation:"fase",wrong:true,penalty:3,feedback:"Está al revés: por debajo de 100 kt la decisión es a criterio del comandante; entre 100 kt y V1 hay que estar go-minded."},{accepted:["se puede rechazar despues de v1","rechazar despues de v1 es seguro","despues de v1 igual se puede parar"],penalty:3,feedback:"Después de V1 el despegue debe continuarse; la decisión de rechazar solo puede tomarse antes de V1."}]},

{id:"ov_v1_continue",question:"Si un motor falla justo después de V1, ¿qué harías y por qué es tan importante continuar el despegue en ese momento?",
 reference:"Continuaría el despegue: sobre V1 no es seguro intentar detenerse porque puede no alcanzar la pista restante. En VR roto con una razón continua de unos 3° por segundo hacia 12,5° de pitch y sigo las órdenes de SRS, que apuntan a la velocidad a la que ocurrió la falla, entre V2 y V2 + 15 kt. Si hace falta más margen, con FLEX puedo poner TOGA (no es obligatorio); con derated, nunca bajo la velocidad F. La tarea esencial y prioritaria es volar el avión — estabilizar actitud y velocidad y establecer la trayectoria correcta — antes de empezar cualquier procedimiento ECAM.",
 concepts:[
  {label:"Continuar el despegue, no rechazar",weight:2,required:true,accepted:["continuar el despegue","continuo el despegue","seguir con el despegue","no rechazo","no abortar","sigo el despegue","continuo con el despegue","despego igual"]},
  {label:"Por qué: sobre V1 puede no alcanzar a detenerse en la pista restante",weight:2,required:true,accepted:["no alcanza a detenerse","no alcanza la pista","pista restante","no es posible detener el avion","no se puede parar"]},
  {label:"Seguir las órdenes de SRS (entre V2 y V2 + 15 kt); TOGA solo si hace falta margen, nunca bajo F con derated",weight:2,accepted:["toga","srs","v2","v2 mas 15","ordenes de srs"]},
  {label:"Prioridad: volar el avión (estabilizar actitud/velocidad/trayectoria) antes del ECAM",weight:2,required:true,accepted:["volar el avion","aviar primero","estabilizar la aeronave","antes del ecam","antes de empezar el ecam","tarea esencial es volar"]}
 ],
 criticalErrors:[{accepted:["intentaria rechazar el despegue","tratar de parar el avion","frenar y detenerme"],penalty:3,feedback:"Sobre V1 el despegue debe continuarse; intentar rechazar en ese punto es justo lo que la V1 busca evitar."}]},

{id:"ov_pan_mayday",question:"¿Cuál es la diferencia entre declarar un PAN PAN y un MAYDAY, y qué información hay que entregar en un llamado de MAYDAY?",
 reference:"PAN PAN se usa para una urgencia: una condición que afecta la seguridad de la aeronave o de alguien a bordo, pero sin peligro grave e inminente. MAYDAY se reserva para una situación de socorro, con peligro grave e inminente que requiere asistencia inmediata, y se dice tres veces: MAYDAY, MAYDAY, MAYDAY. El mensaje incluye la estación a la que se llama, el callsign, la naturaleza de la emergencia, las intenciones de la tripulación, la posición, el nivel y el rumbo, y si el tiempo lo permite, almas a bordo y combustible remanente.",
 relations:{tipo:{window:10,negations:["no","nunca","jamas","sin"],subjects:{pan:["pan pan"],mayday:["mayday"]},values:{urgencia:["urgencia","urgency"],socorro:["socorro","distress","peligro grave","peligro inminente","grave e inminente","asistencia inmediata"]},correct:{pan:["urgencia"],mayday:["socorro"]}}},
 concepts:[
  {label:"PAN PAN: urgencia, sin peligro grave e inminente",weight:2,required:true,link:["tipo","pan","urgencia"]},
  {label:"MAYDAY: socorro/distress, peligro grave e inminente, requiere asistencia inmediata",weight:2,required:true,link:["tipo","mayday","socorro"]},
  {label:"Triple llamado: MAYDAY MAYDAY MAYDAY",weight:1,accepted:["mayday mayday mayday","tres veces","llamado triple","se dice tres veces"]},
  {label:"Naturaleza de la emergencia",weight:2,required:true,accepted:["naturaleza de la emergencia","que esta pasando","tipo de emergencia","cual es el problema"]},
  {label:"Intenciones de la tripulación",weight:1,accepted:["intenciones","que van a hacer","plan de accion"]},
  {label:"Posición, nivel y rumbo",weight:1,accepted:["posicion","nivel","rumbo","altitud","donde estan"]},
  {label:"Almas a bordo y combustible remanente",weight:1,accepted:["almas a bordo","personas a bordo","combustible remanente","fuel remanente","cuanta gente"]}
 ],
 criticalErrors:[{relation:"tipo",wrong:true,penalty:3,feedback:"PAN PAN es una urgencia; MAYDAY es socorro, con peligro grave e inminente."},{accepted:["mayday es menos grave que pan pan","pan pan es mas grave que mayday","son lo mismo pan pan y mayday"],penalty:3,feedback:"Es al revés: MAYDAY es el llamado más grave (socorro/peligro inminente); PAN PAN es para una urgencia sin peligro inminente."}]}
];
