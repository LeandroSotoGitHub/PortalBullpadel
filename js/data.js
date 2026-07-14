// -- DATA . modelos de datos del portal Bullpadel 2026 --------------------
// Imagenes: ya no se embeben en base64. Se referencian por ruta relativa
// (ver img/palas/ e img/materiales/), con un pequeno helper de resolucion
// para no romper el caso "Custom Weight" (cod !== id, sin archivo extraido
// hoy, igual que en el IMGS/ITEM_IMGS original: se oculta, no rompe).
function palaImgSrc(id) { return `img/palas/${id}.jpg`; }
const ITEM_IMG_MISSING = new Set(['CustomWeight']);
function itemImgSrc(cod) { return ITEM_IMG_MISSING.has(cod) ? '' : `img/materiales/${cod}.png`; }

const PALAS = [
  {
    id:"vertex05", sku:"BP-PRO-V05-2026",
    nombre:"Vertex 05", linea:"PROLINE",
    nivel:"Profesional", estilo:"Polivalente",
    forma:"Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25,4 cm", superficie:"530 cm²",
    exterior:"X-Tend Carbon 12K", interior:"MultiEva",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["Vertex Core","Curv:Aktiv","Vibradrive","Hesacore","SmartHoles","TotalChannel","CarbonTube", "Topspin"],
    materiales:["X12","ME"],
    jugador:"Juan Tello",
    perfilJugador:"Jugadores avanzados o profesionales que buscan una pala polivalente de alto rendimiento, con potencia y control equilibrados en todas las situaciones de juego.",
    descTecnica:"Hemos perfeccionado el corazón de la Vertex para ofrecer un rendimiento aún más avanzado. Su doble puente en diagonal, ahora con una geometría más triangular, optimiza la distribución de fuerzas entre las aristas de la pala. El resultado es una pala de alto rendimiento que ofrece mayor estabilidad y control, permitiendo al jugador imprimir una mayor potencia y precisión tanto desde el fondo de pista como en la red.",
    sensacionJuego:"La Vertex 05 ofrece un comportamiento equilibrado en todas las situaciones de juego. Responde con precisión tanto en el fondo de pista como en la red, generando potencia sin sacrificar el control. Recomendada para jugadores que buscan una pala versátil con un rendimiento consistente en cada intercambio.",
    argumentoVenta:"La pala más completa de la gama PROLINE: tecnología de competición que no encasilla al jugador en un solo estilo. Un solo modelo que responde a todo.",
    relacionados:["vertex05geo","vertex05hybrid","xplo26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"vertex05geo", sku:"BP-PRO-V05G-2026",
    nombre:"Vertex 05 Geo", linea:"PROLINE",
    nivel:"Profesional", estilo:"Polivalente / Ofensivo",
    forma:"Geométrica", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 26 cm", superficie:"541 cm²",
    exterior:"X-Tend Carbon 3K", interior:"MultiEva",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["GeometricCore","Curv:Aktiv","Vibradrive","Hesacore","SmartHoles","CarbonTube", "Topspin"],
    materiales:["X3","ME"],
    jugador:"Pablo Cardona",
    perfilJugador:"Jugadores profesionales con juego ofensivo que buscan mayor área de contacto y ángulo de lanzamiento sin perder la precisión del carbono 3K.",
    descTecnica:"La Vertex 05 Geo redefine su estructura para ofrecer una nueva dimensión en potencia y jugabilidad sin precedentes. El marco geométrico Geometric Shape maximiza el área de contacto en las posiciones de las 2 y las 10 horas, incrementando el ángulo de lanzamiento al impactar con la pelota.",
    sensacionJuego:"La Vertex 05 Geo amplía el área de contacto efectiva gracias a su marco geométrico, incrementando el ángulo de lanzamiento en los puntos más exigentes de la cara. Diseñada para jugadores que combinan juego ofensivo con alta exigencia técnica en cada golpe.",
    argumentoVenta:"La Vertex que ataca más. El marco GEO amplía la zona de golpeo donde más se necesita — las 2 y las 10. Ideal para el jugador que quiere potencia con dirección.",
    relacionados:["vertex05","neuron02edge","xplo26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"vertex05hybrid", sku:"BP-PRO-V05H-2026",
    nombre:"Vertex 05 Hybrid", linea:"PROLINE",
    nivel:"Profesional", estilo:"Polivalente / Defensivo",
    forma:"Híbrida", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25 cm", superficie:"531 cm²",
    exterior:"X-Tend Carbon 12K", interior:"MultiEva",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["Vertex Core","Curv:Aktiv","Vibradrive","Hesacore","SmartHoles","CarbonTube", "Topspin"],
    materiales:["X12","ME"],
    jugador:null,
    perfilJugador:"Jugadores profesionales que priorizan el control y la manejabilidad desde el fondo de pista, con potencia suficiente para el juego de ataque.",
    descTecnica:"La Vertex 05 Hybrid comparte el nuevo corazón con doble puente en diagonal y geometría más triangular que optimiza la distribución de fuerzas. La forma híbrida ofrece un balance más bajo y manejable, ideal para jugadores que prefieren el control desde el fondo.",
    sensacionJuego:"La Vertex 05 Hybrid mantiene la tecnología de la familia Vertex con un balance orientado hacia el control. Su forma híbrida facilita el manejo en situaciones de defensa y permite una transición natural entre el fondo de pista y la red.",
    argumentoVenta:"La Vertex para el jugador que defiende y contraataca. Más manejable que la Vertex 05 estándar, con el mismo corazón de alto rendimiento.",
    relacionados:["vertex05","neuron02","hack04hybrid26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"vertex05comfort", sku:"BP-PRO-V05C-2026",
    nombre:"Vertex 05 Comfort", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Polivalente",
    forma:"Diamante", peso:"360-370 g", perfil:"38 mm",
    balance:"≈ 25,4 cm", superficie:"530 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["Vertex Core","Curv:Aktiv","Vibradrive","Hesacore","SmartHoles", "Topspin"],
    materiales:["FX","ME"],
    jugador:null,
    perfilJugador:"Jugadores avanzados que buscan el rendimiento de la gama Vertex con mayor comodidad y menor fatiga en sesiones prolongadas.",
    descTecnica:"La Vertex 05 Comfort incorpora la arquitectura de corazón de la gama Vertex con materiales de mayor absorción en la superficie exterior. Proporciona el rendimiento de una pala de alto nivel con una respuesta más amortiguada.",
    sensacionJuego:"La Vertex 05 Comfort incorpora la arquitectura de corazón de la gama Vertex con materiales de mayor absorción en la superficie exterior. Proporciona el rendimiento de una pala de alto nivel con una respuesta más amortiguada, reduciendo la fatiga en sesiones prolongadas.",
    argumentoVenta:"Todo el rendimiento Vertex, con fibra Fibrix que absorbe el impacto sin robarle potencia al golpe. Al final del partido el brazo está descansado.",
    relacionados:["vertex05","hack04comfort26","xplocomfort26"],
    nota:"Solo disponible fuera de Europa",
    tipo_pala:"standard"
  },
  {
    id:"vertex05w", sku:"BP-PRO-V05W-2026",
    nombre:"Vertex 05 W", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Polivalente",
    forma:"Diamante", peso:"350-360 g", perfil:"38 mm",
    balance:"≈ 25,4 cm", superficie:"530 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["Vertex Core","Curv:Aktiv","Vibradrive","Hesacore","SmartHoles", "Topspin"],
    materiales:["FX","ME"],
    jugador:"Delfi Brea",
    perfilJugador:"Jugadoras avanzadas que requieren velocidad de mano y precisión en la red, con un peso optimizado que facilita la manejabilidad.",
    descTecnica:"La Vertex 05 Woman está diseñada específicamente para jugadoras de nivel avanzado, con un peso optimizado que facilita la velocidad de mano y la precisión en la red. Incorpora todas las tecnologías de la familia Vertex 05 en un formato más ligero y manejable.",
    sensacionJuego:"La Vertex 05 W está diseñada específicamente para jugadoras de nivel avanzado, con un peso optimizado que facilita la velocidad de mano y la precisión en la red. Incorpora todas las tecnologías de la familia Vertex 05 en un formato más ligero y manejable.",
    argumentoVenta:"La pala de Delfi Brea: más liviana que el resto de la familia Vertex, pero igual de precisa y potente. En la mano se siente ágil y rápida.",
    relacionados:["vertex05wcloud","elitew","wonder"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"hack0426", sku:"BP-PRO-H04-2026",
    nombre:"Hack 04 26", linea:"PROLINE",
    nivel:"Profesional", estilo:"Ofensivo",
    forma:"Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 26,4 cm", superficie:"522 cm²",
    exterior:"Tricarbon 18K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio / Duro",
    tecnologias:["Hack","TorsionConcept","Tricore","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["T18","ME"],
    jugador:null,
    perfilJugador:"Jugadores profesionales con estilo ofensivo que buscan potencia dinámica y máxima transferencia de energía en cada golpe de ataque.",
    descTecnica:"La gama Hack redefine la experiencia de juego con el concepto de potencia dinámica: la potencia que se genera a través de la velocidad del jugador, transformando la energía cinética en impactos poderosos y precisos.",
    sensacionJuego:"La pala que más duele golpear del otro lado. La Hack 04 26 genera potencia con el movimiento del brazo, no con la fuerza bruta. Una sensación adictiva para el jugador ofensivo.",
    argumentoVenta:"10 años de evolución en una pala. La Hack 04 26 convierte la velocidad del swing en potencia explosiva — el jugador ofensivo que la prueba no vuelve atrás.",
    relacionados:["hack04hybrid26","hack04comfort26","xplo26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"hack04hybrid26", sku:"BP-PRO-H04H-2026",
    nombre:"Hack 04 Hybrid 26", linea:"PROLINE",
    nivel:"Profesional", estilo:"Defensivo",
    forma:"Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25 cm", superficie:"529 cm²",
    exterior:"Aluminized Carbon 18K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio / Blando",
    tecnologias:["Hack","TotalChannel","Tricore","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain", "Hexature"],
    materiales:["A18","ME"],
    jugador:null,
    perfilJugador:"Jugadores profesionales que buscan dominar el contraataque, combinando potencia dinámica y control desde cualquier posición de la pista.",
    descTecnica:"La Hack 04 Hybrid incorpora la tecnología TotalChannel y un triple puente en el corazón, ofreciendo un equilibrio entre la potencia explosiva de la gama Hack y la estabilidad necesaria para el juego defensivo.",
    sensacionJuego:"La Hack que defiende como ataca. La forma híbrida equilibra todo: potencia en los ataques, estabilidad en los bloqueos. Cuando la pelota viene rápida, esta pala la devuelve con intereses.",
    argumentoVenta:"La Hack para el jugador completo. Aluminized Carbon 18K da potencia con una amortiguación que ningún carbono puro puede ofrecer.",
    relacionados:["hack0426","hack04hybridcloud","neuron02"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"hack04comfort26", sku:"BP-PRO-H04C-2026",
    nombre:"Hack 04 Comfort 26", linea:"PROLINE",
    nivel:"Profesional", estilo:"Ofensivo",
    forma:"Diamante", peso:"360-370 g", perfil:"38 mm",
    balance:"≈ 26,4 cm", superficie:"522 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["Hack","TorsionConcept","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["FX","ME"],
    jugador:null,
    perfilJugador:"Jugadores profesionales con historial de lesiones en brazo o codo que no quieren sacrificar potencia de ataque.",
    descTecnica:"La Hack 04 Comfort mantiene el carácter ofensivo de la línea Hack con una superficie Fibrix que reduce la transmisión de impacto. Permite un juego agresivo y preciso con menor exigencia física.",
    sensacionJuego:"La potencia de la Hack sin el sacrificio físico. La fibra Fibrix suaviza el golpe lo justo para que el brazo no se resienta, pero la bola igual sale fuerte.",
    argumentoVenta:"Para el jugador agresivo que cuida el brazo: toda la potencia Hack con Fibrix que absorbe lo que no tiene que llegar al codo.",
    relacionados:["hack0426","hack04hybridcloud","xplocomfort26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"hack04hybridcloud", sku:"BP-PRO-H04HC-2026",
    nombre:"Hack 04 Hybrid Cloud", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Confort",
    forma:"Híbrida", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25 cm", superficie:"529 cm²",
    exterior:"Elastic Fiber", interior:"CloudEva",
    rugoso:"3D Grain", tacto:"Blando",
    tecnologias:["Hack","TotalChannel","Vibradrive","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["EF","CE"],
    jugador:null,
    perfilJugador:"Jugadores avanzados que priorizan la comodidad y la protección articular sin renunciar a la efectividad del juego.",
    descTecnica:"La Hack 04 Hybrid Cloud lleva la filosofía de potencia dinámica de la gama Hack a un perfil de máximo confort. Combina la estructura híbrida con Elastic Fiber y CloudEva para una experiencia sin vibraciones.",
    sensacionJuego:"La Hack para el jugador que quiere disfrutar. Sin vibración, sin dureza, sin sacrificio. La bola sale bien igual — pero el brazo lo agradece.",
    argumentoVenta:"La pala que protege el brazo sin comprometer el rendimiento. Elastic Fiber + CloudEva = el sistema anti-lesión más completo de la gama Hack.",
    relacionados:["hack04comfort26","neuron02cloud","vertex05wcloud"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"neuron02", sku:"BP-PRO-N02-2026",
    nombre:"Neuron 02", linea:"PROLINE",
    nivel:"Profesional", estilo:"Defensivo",
    forma:"Híbrida", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25,5 cm", superficie:"525 cm²",
    exterior:"X-Tend Carbon 3K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Duro",
    tecnologias:["Nerve","Prismlock","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["X3","ME"],
    jugador:"Fede Chingotto",
    perfilJugador:"Jugadores profesionales y avanzados con juego de control y alta exigencia técnica, que buscan precisión absoluta en cada golpe.",
    descTecnica:"La Neuron 02 está concebida para el jugador de control que exige precisión en cada situación. Su corazón de alto rendimiento y el perfil multifacetado Cristal Edge proporcionan el equilibrio perfecto entre potencia y control extremo.",
    sensacionJuego:"La pala de los que controlan el partido desde el fondo. Cada golpe va donde tiene que ir, sin sorpresas. La Neuron 02 es firme, precisa y muy directa.",
    argumentoVenta:"La pala de Chingotto: control total desde cualquier ángulo. PrismLock y Nerve hacen el marco más rígido y eficiente del catálogo de control.",
    relacionados:["neuron02edge","neuron02cloud","vertex05hybrid"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"neuron02edge", sku:"BP-PRO-N02E-2026",
    nombre:"Neuron 02 Edge", linea:"PROLINE",
    nivel:"Profesional", estilo:"Ofensivo",
    forma:"Geométrica / Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 26 cm", superficie:"535 cm²",
    exterior:"X-Tend Carbon 3K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Duro",
    tecnologias:["Nerve","Prismlock","GeometricCore","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["X3","ME"],
    jugador:"Fede Chingotto",
    perfilJugador:"Jugadores profesionales que combinan un juego de control técnico con la capacidad de generar potencia explosiva bajo presión máxima.",
    descTecnica:"La Neuron 02 Edge incorpora PrismLock y un formato GEO en la cabeza que maximiza el efecto palanca. Desarrollada para jugadores que requieren control absoluto con potencia explosiva en los momentos decisivos.",
    sensacionJuego:"Para el jugador que quiere controlarlo todo y atacar cuando toca. La forma GEO agrega palanca justo donde se ejecutan los remates. Control total con un golpe extra de potencia.",
    argumentoVenta:"La Neuron que ataca. PrismLock da rigidez de cristal y el GEO da potencia cuando se necesita. Para el jugador técnico que quiere decidir el punto.",
    relacionados:["neuron02","vertex05geo","xplo26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"neuron02cloud", sku:"BP-PRO-N02CL-2026",
    nombre:"Neuron 02 Cloud", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Confort",
    forma:"Híbrida", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 25,5 cm", superficie:"525 cm²",
    exterior:"Elastic Fiber", interior:"CloudEva",
    rugoso:"3D Grain", tacto:"Blando",
    tecnologias:["Nerve","Vibradrive","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["EF","CE"],
    jugador:null,
    perfilJugador:"Jugadores técnicos avanzados que priorizan la protección articular sin renunciar al control y la precisión de la gama Neuron.",
    descTecnica:"La Neuron 02 Cloud conserva la arquitectura técnica de la Neuron 02 con una configuración de materiales orientada al máximo confort. Mismo nivel de precisión y control con golpeo más suave.",
    sensacionJuego:"El control total de la Neuron 02, pero sin que el brazo pague el precio. La versión Cloud transforma cada golpe en algo suave y fluido — sin vibración, sin impacto duro.",
    argumentoVenta:"Toda la precisión de la Neuron con Elastic Fiber y CloudEva. Para el jugador técnico que quiere seguir jugando muchos años sin lesionarse.",
    relacionados:["neuron02","hack04hybridcloud","vertex05wcloud"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"vertex05wcloud", sku:"BP-PRO-V05WCL-2026",
    nombre:"Vertex 05 W Cloud", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Confort",
    forma:"Diamante", peso:"350-360 g", perfil:"38 mm",
    balance:"≈ 25,4 cm", superficie:"530 cm²",
    exterior:"Elastic Fiber", interior:"CloudEva",
    rugoso:"Top Spin", tacto:"Blando",
    tecnologias:["Vertex Core","Curv:Aktiv","Vibradrive","SmartHoles", "Topspin"],
    materiales:["EF","CE"],
    jugador:null,
    perfilJugador:"Jugadoras avanzadas con historial de lesiones o alta frecuencia de juego que necesitan protección articular sin sacrificar el rendimiento.",
    descTecnica:"La Vertex 05 W Cloud combina las tecnologías de la familia Vertex con Elastic Fiber y CloudEva para una experiencia de juego de máximo confort y mínima transmisión de vibraciones.",
    sensacionJuego:"La Vertex más cómoda que existe. Cloud Eva en el núcleo y Elastic Fiber en la cara — dos materiales pensados para que el brazo no sufra. La bola sale bien de todas formas.",
    argumentoVenta:"La combinación más inteligente para la jugadora que cuida el cuerpo: tecnologías Vertex + el binomio Elastic Fiber / CloudEva. Sin vibraciones, sin dolor.",
    relacionados:["vertex05w","neuron02cloud","hack04hybridcloud"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"xplo26", sku:"BP-PRO-XPLO-2026",
    nombre:"XPLO 26", linea:"PROLINE",
    nivel:"Profesional", estilo:"Ofensivo",
    forma:"Geométrica", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 26,5 cm", superficie:"535 cm²",
    exterior:"X-Tend Carbon 12K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio / Duro",
    tecnologias:["ExoFrame","TotalChannel","Custom Weight","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["X12","ME"],
    jugador:"Martín Di Nenno",
    perfilJugador:"Jugadores profesionales con juego ofensivo que buscan la máxima potencia explosiva disponible en el catálogo Bullpadel.",
    descTecnica:"La XPLO 26 es la pala más potente en la historia de Bullpadel. Su diseño geométrico y las tecnologías ExoFrame y TotalChannel maximizan la transferencia de energía en cada golpe.",
    sensacionJuego:"La pala más explosiva del catálogo. No hay más que decir. Cuando la golpeás fuerte, la bola sale como un tiro. La sensación de rematar con esta pala es difícil de encontrar en otra.",
    argumentoVenta:"La pala más potente de la historia de Bullpadel. Diseñada con Di Nenno para llevar la potencia dinámica al máximo. El cliente que busca potencia no necesita ver más.",
    relacionados:["xplocomfort26","hack0426","neuron02edge"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"xplocomfort26", sku:"BP-PRO-XPLOC-2026",
    nombre:"XPLO Comfort 26", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Ofensivo",
    forma:"Geométrica", peso:"365-375 g", perfil:"38 mm",
    balance:"≈ 26,5 cm", superficie:"535 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["ExoFrame","TotalChannel","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["FX","ME"],
    jugador:null,
    perfilJugador:"Jugadores avanzados que quieren la potencia XPLO con mayor accesibilidad y comodidad, sin necesidad de ser jugadores profesionales.",
    descTecnica:"La XPLO Comfort reúne todas las características de la XPLO con fibra Fibrix en el núcleo exterior. Experiencia de juego explosiva con una respuesta más cómoda.",
    sensacionJuego:"La potencia de la XPLO sin los límites. La fibra Fibrix suaviza lo justo para que cualquier jugador pueda sacarle todo el partido sin arriesgar el brazo.",
    argumentoVenta:"La XPLO para el jugador que juega 3 veces por semana. Toda la explosividad, con el Fibrix que cuida el brazo. El paso natural desde una pala avanzada.",
    relacionados:["xplo26","hack04comfort26","pearl26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"icon26", sku:"BP-PRO-ICON-2026",
    nombre:"Icon 26", linea:"PROLINE",
    nivel:"Profesional", estilo:"Ofensivo",
    forma:"Diamante", peso:"370-375 g", perfil:"38 mm",
    balance:"≈ 26 cm", superficie:"535 cm²",
    exterior:"X-Tend Carbon 12K", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["TorsionConcept","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["X12","ME"],
    jugador:"Juan Martín Díaz",
    perfilJugador:"Jugadores que buscan una pala con identidad propia y alto rendimiento ofensivo, combinando potencia y efecto en cada golpe.",
    descTecnica:"La Icon 26 es un homenaje a la grandeza, diseñada junto a Juan Martín Díaz. Carbono 12K y TorsionConcept generan una combinación de potencia y efecto que distingue cada golpe.",
    sensacionJuego:"Una pala que se siente especial desde que la agarrás. Potente, técnica y con un spin que se nota diferente. Para el jugador que quiere que su pala diga algo sobre cómo juega.",
    argumentoVenta:"La pala de Juan Martín Díaz: una leyenda del pádel en cada golpe. Identidad visual única y TorsionConcept para multiplicar la potencia de cada smash.",
    relacionados:["xplo26","hack0426","pearl26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"pearl26", sku:"BP-PRO-PEARL-2026",
    nombre:"Pearl 26", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Ofensivo",
    forma:"Diamante", peso:"355-365 g", perfil:"38 mm",
    balance:"≈ 26 cm", superficie:"535 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["Prismlock","Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["FX","ME"],
    jugador:null,
    perfilJugador:"Jugadores que buscan potencia ofensiva con menor fatiga y peso reducido, ideales para sesiones largas sin sacrificar el rendimiento.",
    descTecnica:"La Pearl 26 ofrece una relación óptima entre ligereza y rendimiento ofensivo. Su corazón con estructura de triangulación distribuye eficientemente la energía del golpe.",
    sensacionJuego:"Liviana, potente y muy cómoda. La Pearl está pensada para el jugador que quiere atacar sin cargarse el brazo. La forma triangular del corazón distribuye la energía del golpe de forma más eficiente.",
    argumentoVenta:"Ligereza y potencia en equilibrio: la Pearl es la opción para el jugador que quiere atacar toda la sesión sin que el brazo le pase la factura.",
    relacionados:["xplocomfort26","flowlegend","hack04comfort26"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"wonder", sku:"BP-PRO-WND-2026",
    nombre:"Wonder", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Polivalente",
    forma:"Híbrida", peso:"350-360 g", perfil:"38 mm",
    balance:"≈ 25,5 cm", superficie:"516 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["Vibradrive","Hesacore","SmartHoles","CarbonTube", "3D Grain"],
    materiales:["FX","ME"],
    jugador:"Claudia Fernández",
    perfilJugador:"Jugadoras avanzadas con juego completo que buscan rendimiento en defensa y ataque sin comprometerse con un solo estilo.",
    descTecnica:"Diseñada con Claudia Fernández para ofrecer un perfil polivalente de alto nivel. Incorpora un corazón exclusivo Hyper Core y nuevo concepto de perfil lateral.",
    sensacionJuego:"La pala de Claudia Fernández transmite exactamente lo que ella juega: soltura, potencia y carácter. Se defiende bien, ataca bien y responde igual en todas las situaciones.",
    argumentoVenta:"La jugadora que no quiere limitarse a un solo estilo. La Wonder lo hace todo bien — defensa, ataque, red, fondo. Inspirada en el juego de Claudia Fernández.",
    relacionados:["elitew","flowlegend","vertex05w"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"elitew", sku:"BP-PRO-ELITEW-2026",
    nombre:"Elite W", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Polivalente",
    forma:"Lágrima", peso:"350-360 g", perfil:"38 mm",
    balance:"≈ 25,8 cm", superficie:"524 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["Vibradrive","Hesacore","SmartHoles", "3D Grain"],
    materiales:["FX","ME"],
    jugador:null,
    perfilJugador:"Jugadoras exigentes que priorizan la agilidad y la maniobrabilidad, con potencia suficiente para dominar desde cualquier posición.",
    descTecnica:"La Elite W está diseñada para jugadoras exigentes que requieren una pala ligera y de alta maniobrabilidad. Su forma de lágrima y peso reducido permiten reacciones rápidas en la red.",
    sensacionJuego:"Ligera, manejable y con mucho carácter. La Elite W se mueve rápido en la mano — en la red respondés antes, en el fondo llegás mejor. No hace falta hacer fuerza.",
    argumentoVenta:"La pala más ágil de la gama femenina PROLINE. Para la jugadora que quiere imponer su ritmo sin cargar peso innecesario.",
    relacionados:["wonder","pearl26","vertex05w"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"flowlegend", sku:"BP-PRO-FLOW-2026",
    nombre:"Flow Legend", linea:"PROLINE",
    nivel:"Avanzado", estilo:"Ofensivo",
    forma:"Diamante", peso:"350-360 g", perfil:"38 mm",
    balance:"≈ 26 cm", superficie:"523 cm²",
    exterior:"Fibrix", interior:"MultiEva",
    rugoso:"3D Grain", tacto:"Intermedio",
    tecnologias:["FlowForce","Vibradrive","Hesacore","SmartHoles", "3D Grain"],
    materiales:["FX","ME"],
    jugador:"Alejandra Salazar",
    perfilJugador:"Jugadoras avanzadas que buscan potencia y ligereza combinadas, con rendimiento sólido en juego de red y precisión desde el fondo.",
    descTecnica:"Inspirada en el juego de Alejandra Salazar para jugadoras que buscan equilibrio perfecto entre ligereza y rendimiento. FlowForce optimiza la transferencia de energía en el brazo.",
    sensacionJuego:"Para la jugadora que quiere fluir. Liviana, potente y muy fácil de usar. La bola sale bien tanto en defensa como al atacar cerca de la red. Un arma elegante para un juego elegante.",
    argumentoVenta:"La pala de Alejandra Salazar: ligereza de campeonato con FlowForce que lleva toda la energía del swing a la bola. Para la jugadora que quiere más con menos esfuerzo.",
    relacionados:["wonder","elitew","pearl26"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"ionicpower26", sku:"BP-NXT-IPWR-2026",
    nombre:"Ionic Power 26", linea:"NEXT",
    nivel:"Intermedio", estilo:"Ofensivo",
    forma:"Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"Alto", superficie:null,
    exterior:"Glaphite", interior:"MultiEva",
    rugoso:null, tacto:"Intermedio",
    tecnologias:["XForce","SmartHoles"],
    materiales:["GP","ME"],
    jugador:null,
    perfilJugador:"Jugadores intermedios con estilo ofensivo que buscan maximizar la potencia y el control con materiales de mayor rendimiento que las gamas básicas.",
    descTecnica:"La Ionic Power 26 es la referencia ofensiva de la línea NEXT. Forma de diamante y sistema XForce para una plataforma sólida de juego potente y directo.",
    sensacionJuego:"La entrada al carbono con todo el rendimiento. La Ionic Power es ágil, potente y muy manejable — el balance alto ayuda a generar potencia sin necesitar una técnica depurada.",
    argumentoVenta:"El salto natural desde palas básicas: Glaphite da potencia con comodidad, XForce da firmeza en el marco. Para el jugador intermedio que quiere rendir más.",
    relacionados:["ioniccontrol26","ioniclight26","vertexadvance"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"ioniccontrol26", sku:"BP-NXT-ICTR-2026",
    nombre:"Ionic Control 26", linea:"NEXT",
    nivel:"Intermedio", estilo:"Defensivo",
    forma:"Redonda", peso:"365-375 g", perfil:"38 mm",
    balance:"Alto", superficie:null,
    exterior:"Glaphite", interior:"MultiEva",
    rugoso:null, tacto:"Intermedio",
    tecnologias:["SmartHoles"],
    materiales:["GP","ME"],
    jugador:null,
    perfilJugador:"Jugadores intermedios que priorizan el control y la consistencia por sobre la potencia, con foco en el desarrollo técnico.",
    descTecnica:"La Ionic Control 26 combina innovación y tecnología avanzada para jugadores que buscan el máximo control sin sacrificar potencia. Estructura de alta estabilidad y durabilidad.",
    sensacionJuego:"Para el jugador que quiere ganar los puntos con cabeza. La Ionic Control es precisa y consistente — siempre responde igual, sin sorpresas.",
    argumentoVenta:"Control y estabilidad para el jugador intermedio que está perfeccionando su técnica. Glaphite y forma redonda: la combinación perfecta para consolidar el juego.",
    relacionados:["ionicpower26","ioniclight26","hack02advance"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"ioniclight26", sku:"BP-NXT-ILTG-2026",
    nombre:"Ionic Light 26", linea:"NEXT",
    nivel:"Intermedio", estilo:"Polivalente",
    forma:"Híbrida", peso:"350-360 g", perfil:"38 mm",
    balance:"Medio", superficie:null,
    exterior:"Glaphite", interior:"MultiEva",
    rugoso:null, tacto:"Intermedio",
    tecnologias:["SmartHoles"],
    materiales:["GP","ME"],
    jugador:null,
    perfilJugador:"Jugadores intermedios que no han definido su estilo de juego y buscan una pala versátil y manejable para todas las situaciones.",
    descTecnica:"La Ionic Light 26 combina tecnología de última generación con diseño ergonómico. Formato híbrido y balance medio para versatilidad total en ataque y defensa.",
    sensacionJuego:"La pala más versátil de la línea NEXT. Ni muy ofensiva ni muy defensiva — sirve para todo. El balance medio y el peso reducido la hacen fácil de llevar todo el partido.",
    argumentoVenta:"Para el jugador en desarrollo que no quiere limitarse: la Ionic Light es equilibrio total. Útil en cualquier situación del partido.",
    relacionados:["ionicpower26","ioniccontrol26","vertexadvance"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"vertexadvance", sku:"BP-ADV-VADV-2026",
    nombre:"Vertex Advance", linea:"ADVANCE",
    nivel:"Amateur", estilo:"Polivalente",
    forma:"Diamante", peso:"365-375 g", perfil:"38 mm",
    balance:"Bajo", superficie:null,
    exterior:"Glaphite", interior:"Evalastic",
    rugoso:"Top Spin", tacto:"Intermedio",
    tecnologias:["Vertex Core","CarbonTube","SmartHoles", "Topspin"],
    materiales:["GP","EL"],
    jugador:null,
    perfilJugador:"Jugadores amateurs con criterio que buscan rendimiento real con materiales accesibles. El salto desde palas de iniciación hacia algo más serio.",
    descTecnica:"La Vertex Advance lleva la tecnología del corazón Vertex a un formato accesible. Air React Channel en marco aerodinámico con núcleo Evalastic para comodidad y durabilidad.",
    sensacionJuego:"La potencia de la Vertex en un formato más accesible. La Vertex Advance es firme, directa y tiene mucha salida de bola para ser una pala de iniciación avanzada.",
    argumentoVenta:"El primer modelo serio de Bullpadel. El jugador que ya tiene técnica y quiere empezar a sentir lo que es una pala de rendimiento real.",
    relacionados:["hack02advance","ionicpower26","ioniclight26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"hack02advance", sku:"BP-ADV-H02A-2026",
    nombre:"Hack 02 Advance", linea:"ADVANCE",
    nivel:"Amateur", estilo:"Defensivo",
    forma:"Redonda", peso:"365-375 g", perfil:"38 mm",
    balance:"Medio", superficie:null,
    exterior:"Glaphite", interior:"Evalastic",
    rugoso:null, tacto:"Intermedio",
    tecnologias:["Hack","Nerve","CarbonTube","SmartHoles"],
    materiales:["GP","EL"],
    jugador:null,
    perfilJugador:"Jugadores amateurs con estilo defensivo que buscan consistencia y comodidad en cada golpe, con un núcleo que perdona los impactos no perfectos.",
    descTecnica:"La Hack 02 Advance traslada el concepto de control de la línea Hack a la gama ADVANCE. Forma redonda, núcleo Evalastic y corazón Hack Core para mayor fiabilidad.",
    sensacionJuego:"El control de la Hack adaptado para el jugador que está creciendo. Forma redonda, balance medio y un núcleo cómodo que perdona los golpes no perfectos.",
    argumentoVenta:"Para el amateur defensivo que quiere fiabilidad: Hack Core mejora los golpes descentrados y Evalastic mantiene el rendimiento toda la temporada.",
    relacionados:["vertexadvance","ioniccontrol26","indigactr26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"indigapwr26", sku:"BP-TOUR-IPWR-2026",
    nombre:"Indiga PWR 26", linea:"TOUR",
    nivel:"Iniciación", estilo:"Defensivo",
    forma:"Híbrida", peso:"360-370 g", perfil:"38 mm",
    balance:"Medio", superficie:null,
    exterior:"Polyglass", interior:"SoftEva",
    rugoso:null, tacto:"Blando",
    tecnologias:["CarbonTube"],
    materiales:["PG","SE"],
    jugador:null,
    perfilJugador:"Jugadores en iniciación que buscan una pala con proyección de rendimiento, cómoda y durable para el juego habitual.",
    descTecnica:"La Indiga PWR 26 combina Polyglass en las caras con marco CarbonTube para durabilidad y ligereza. SoftEva garantiza comodidad en cada golpe.",
    sensacionJuego:"La primera pala seria para el jugador que empieza a tomarse el pádel en serio. Cómoda, durable y con buena salida de bola — no es una pala de juguete.",
    argumentoVenta:"Para el jugador que empieza a invertir en serio: Polyglass + CarbonTube a un precio accesible. La pala de iniciación que no frena el desarrollo.",
    relacionados:["indigactr26","indigaw26","hack02advance"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"indigactr26", sku:"BP-TOUR-ICTR-2026",
    nombre:"Indiga CTR 26", linea:"TOUR",
    nivel:"Iniciación", estilo:"Defensivo",
    forma:"Redonda", peso:"360-370 g", perfil:"38 mm",
    balance:"Bajo", superficie:null,
    exterior:"Polyglass", interior:"SoftEva",
    rugoso:null, tacto:"Blando",
    tecnologias:[],
    materiales:["PG","SE"],
    jugador:null,
    perfilJugador:"Jugadores en iniciación que priorizan el control y la facilidad de manejo para aprender la técnica correcta desde el principio.",
    descTecnica:"La Indiga CTR 26 es ultraligera y muy manejable. Forma redonda y balance bajo para control excepcional y facilidad en el manejo.",
    sensacionJuego:"Ultraligera y muy fácil de manejar. La Indiga CTR 26 está pensada para que la pelota vaya donde se la manda, sin complicaciones.",
    argumentoVenta:"Para el jugador que está aprendiendo: redonda, liviana, balance bajo. El control viene solo — la pala no es un obstáculo sino una herramienta.",
    relacionados:["indigapwr26","indigaw26","ioniccontrol26"],
    nota:null,
    tipo_pala:"standard"
  },
  {
    id:"indigaw26", sku:"BP-TOUR-IW-2026",
    nombre:"Indiga W 26", linea:"TOUR",
    nivel:"Iniciación", estilo:"Defensivo",
    forma:"Redonda", peso:"350-360 g", perfil:"38 mm",
    balance:"Bajo", superficie:null,
    exterior:"Polyglass", interior:"SoftEva",
    rugoso:null, tacto:"Blando",
    tecnologias:[],
    materiales:["PG","SE"],
    jugador:null,
    perfilJugador:"Jugadoras en iniciación que buscan comodidad, ligereza y facilidad de manejo en cada partido, sin fatiga.",
    descTecnica:"La Indiga W 26 está diseñada para jugadoras en iniciación que buscan comodidad y facilidad de manejo. Ligera y manejable con núcleo SoftEva.",
    sensacionJuego:"Diseñada para que jugar sea un placer desde el primer día. Liviana, cómoda y linda — la Indiga W no cansa el brazo y se maneja sola.",
    argumentoVenta:"La pala de iniciación para jugadoras que quieren disfrutar desde el primer día: liviana, cómoda y con todo lo necesario para aprender bien.",
    relacionados:["indigactr26","elitew","ioniclight26"],
    nota:null,
    tipo_pala:"w"
  },
  {
    id:"hackjr26", sku:"BP-JNR-H04JR-2026",
    nombre:"Hack JR 26", linea:"JUNIOR",
    nivel:"Junior",  estilo:"Polivalente",
    forma:"Diamante", peso:"335-345 g", perfil:"35 mm",
    balance:"Medio", superficie:null,
    exterior:"Polyglass", interior:"Evalastic",
    rugoso:null, tacto:null,
    tecnologias:["Hack","CarbonTube"],
    materiales:["PG","EL"],
    jugador:"Paquito Navarro",
    perfilJugador:"Jugadores junior con alto nivel de juego que buscan una pala con las mismas tecnologías de adulto en un formato adaptado a su etapa de formación.",
    descTecnica:"La Hack JR 26 es la pala de Paquito Navarro adaptada a junior. Corazón Hack, marco CarbonTube y superficie Polyglass en formato apropiado para la formación de alto rendimiento.",
    sensacionJuego:"La pala de Paquito Navarro en tamaño junior. No es una pala de niño — tiene las mismas tecnologías que las palas de adulto, adaptadas para el jugador joven que ya se lo toma en serio.",
    argumentoVenta:"Para el junior serio: tecnologías de adulto (Hack Core, CarbonTube) en el tamaño correcto. El jugador joven que aspira a más.",
    relacionados:["indigapwr26","vertexadvance","hack02advance"],
    nota:null,
    tipo_pala:"junior"
  }
];

/* ── 2. MATERIALES ─────────────────────────────────────────────────────── */
// Separados de TECNOLOGIAS para queries independientes

const MATERIALES = [
  { id:"T18", cod:"T18", nombre:"Tricarbon 18K",      categoria:"Fibras de carbono",  tipo:"exterior",
    bg:"#FDE8EA", tc:"#A32D2D",
    descTecnica:"Fibra de carbono con cintas de menor grosor entrelazadas en tres direcciones. Genera mayor reacción en el golpeo y mejor retorno de la bola.",
    sensacion:"La pala se siente rígida, viva y directa. El golpe es seco y explosivo — la bola sale con mucha velocidad sin necesidad de hacer fuerza.",
    pitch:"La fibra más premium del catálogo: el carbono trabaja en 3 ejes simultáneos, lo que multiplica la energía de cada golpe.",
    vsOtros:"Más rígida y reactiva que el XtendCarbon 12K. Sin fibra de vidrio — toda la respuesta es carbono puro." },
  { id:"X12", cod:"X12", nombre:"XtendCarbon 12K",   categoria:"Fibras de carbono",  tipo:"exterior",
    bg:"#FDE8EA", tc:"#A32D2D",
    descTecnica:"Fibra de carbono biaxial con 12.000 filamentos. 20–30% más ligera que el carbono convencional, con mayor rigidez estructural.",
    sensacion:"Golpe limpio, preciso y con mucha salida de bola. La pala se siente equilibrada entre potencia y control.",
    pitch:"La fibra de la gama Vertex 05 y XPLO: tecnología de competición que no sacrifica manejabilidad.",
    vsOtros:"Más liviana que el Tricarbon 18K pero con menos reactividad explosiva. Más rígida y precisa que el Fibrix o el Glaphite." },
  { id:"X3",  cod:"X3",  nombre:"XtendCarbon 3K",    categoria:"Fibras de carbono",  tipo:"exterior",
    bg:"#FDE8EA", tc:"#A32D2D",
    descTecnica:"Fibra de carbono de alta resistencia de 3.000 filamentos. Alta velocidad de reacción y ligereza asombrosa.",
    sensacion:"Pala muy rápida en la mano, con una respuesta casi inmediata al impacto. Sensación de control total.",
    pitch:"La fibra de la Neuron 02 y la Vertex 05 Geo: pensada para control extremo a alta velocidad.",
    vsOtros:"Más orientada al control que el 12K. Menos explosiva pero más manejable." },
  { id:"GP",  cod:"GP",  nombre:"Glaphite",           categoria:"Fibras de carbono",  tipo:"exterior",
    bg:"#FDE8EA", tc:"#A32D2D",
    descTecnica:"Fibra desarrollada por Bullpadel que mezcla carbono con fibra de vidrio. La superficie de la pala es flexible y resistente al mismo tiempo.",
    sensacion:"Golpe suave y cómodo. La pala absorbe parte del impacto — ideal para sesiones largas sin fatiga.",
    pitch:"La fibra inteligente para el jugador que quiere mejorar sin lesionarse: carbono + vidrio en equilibrio.",
    vsOtros:"Más cómoda que cualquier carbono puro. Menos explosiva que X12 o T18, pero mucho más accesible." },
  { id:"FX",  cod:"FX",  nombre:"Fibrix HybridFiber", categoria:"Fibras híbridas",    tipo:"exterior",
    bg:"#FAEEDA", tc:"#633806",
    descTecnica:"Fibra híbrida de X-Glass y Carbono, fusionada con resina más elástica. Mayor flexión y elasticidad al núcleo.",
    sensacion:"La pala tiene una sensación suave y absorbente, con buena salida de bola sin ser explosiva.",
    pitch:"La fibra del jugador avanzado que quiere potencia sin pagar el precio físico del carbono puro.",
    vsOtros:"Más cómoda que cualquier carbono puro. Más potente y técnica que el Polyglass." },
  { id:"EF",  cod:"EF",  nombre:"Elastic Fiber",      categoria:"Fibras híbridas",    tipo:"exterior",
    bg:"#FAEEDA", tc:"#633806",
    descTecnica:"Fibra extremadamente flexible de bajo módulo elástico. Prioriza el confort y la salida de bola con mínimo esfuerzo.",
    sensacion:"La pala más blanda y amortiguada de la gama. La sensación es casi esponjosa. Cero vibración en el brazo.",
    pitch:"Para el jugador que sufre lesiones: absorbe todo el impacto antes de que llegue al codo o al hombro.",
    vsOtros:"La más blanda de todas las fibras. Claramente diferente al Fibrix (más firme) y al Glaphite (más potente)." },
  { id:"A18", cod:"A18", nombre:"Aluminized Carbon 18K", categoria:"Fibras híbridas", tipo:"exterior",
    bg:"#FAEEDA", tc:"#633806",
    descTecnica:"Carbono 18K aleado con fibras de aluminio. Reduce la rigidez del carbono generando un tacto más blando sin renunciar a la salida de bola.",
    sensacion:"Golpe potente pero con amortiguación inesperada para ser carbono 18K. La pala se siente premium.",
    pitch:"Lo mejor de dos mundos: potencia del carbono 18K con la comodidad que nadie esperaría a ese nivel.",
    vsOtros:"Más potente que el Fibrix y el Elastic Fiber. Más cómoda que el Tricarbon 18K puro." },
  { id:"PG",  cod:"PG",  nombre:"Polyglass",          categoria:"Fibras básicas",     tipo:"exterior",
    bg:"#EAF3DE", tc:"#27500A",
    descTecnica:"Fibra obtenida de vidrio fundido. Equilibrio perfecto entre flexibilidad y resistencia como recubrimiento del núcleo.",
    sensacion:"Pala cómoda y predecible. La bola sale bien en cualquier golpe, sin sorpresas.",
    pitch:"La fibra que acompaña al jugador que crece: durable, consistente y a un precio justo.",
    vsOtros:"Más blanda y accesible que todas las opciones de carbono. Ideal para TOUR y JUNIOR." },
  { id:"ME",  cod:"ME",  nombre:"MultiEva",           categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"Núcleo de 2 densidades: capa exterior compacta para potencia contra bolas rápidas; capa interior blanda para mayor control en bolas lentas.",
    sensacion:"La pala se siente inteligente. Contra golpes duros responde con potencia; contra bolas lentas, con control.",
    pitch:"El núcleo más sofisticado del catálogo: dos comportamientos en uno.",
    vsOtros:"Más completo que el SoftEva (uniforme) y el HardEva (siempre duro). El más versátil." },
  { id:"BE",  cod:"BE",  nombre:"BlackEva",           categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"EVA de alta elasticidad y densidad para máximo confort y sensación. Alta memoria de recuperación y rebote constante.",
    sensacion:"Pala premium con tacto firme y salida de bola muy consistente. Nunca pierde el rebote.",
    pitch:"El núcleo que no envejece: mantiene el mismo rendimiento desde el primer día hasta el último del año.",
    vsOtros:"Más consistente en el tiempo que el MultiEva. Más firme que el SoftEva." },
  { id:"SE",  cod:"SE",  nombre:"SoftEva",            categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"La goma SoftEva permite mayor estabilidad y homogeneidad, duplicando la capacidad de respuesta en todo tipo de golpes.",
    sensacion:"Pala estable y predecible. Responde igual en cualquier punto de la cara. Sin golpes raros ni zonas muertas.",
    pitch:"La consistencia que necesita el jugador que aprende: sin importar cómo golpees, la pala responde igual.",
    vsOtros:"Más homogénea que el MultiEva (dos zonas distintas). Más firme que el CloudEva." },
  { id:"CE",  cod:"CE",  nombre:"CloudEva",           categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"Núcleo ultrablando de baja densidad. Absorción máxima de impacto, salida de bola con mínimo esfuerzo.",
    sensacion:"La sensación más blanda de todos los EVA. La bola sale suave y flotante. Cero vibración, cero dolor.",
    pitch:"Para el jugador que quiere disfrutar más y sufrir menos: la pala trabaja sola y protege el brazo.",
    vsOtros:"El EVA más blando del catálogo. Su opuesto directo es el HardEva." },
  { id:"HE",  cod:"HE",  nombre:"HardEva",            categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"Núcleo sándwich de altas densidades. Sensación firme, seca y precisa con dominio total del golpeo.",
    sensacion:"La sensación más firme y directa. El golpe es seco, preciso y con mucho control de dirección.",
    pitch:"El núcleo de los jugadores que quieren dominar cada punto: el golpe es exactamente el que se le da.",
    vsOtros:"El polo opuesto al CloudEva. Más firme que el MultiEva y el BlackEva. Material de referencia Bullpadel — no utilizado en palas de la gama 2026." },
  { id:"EL",  cod:"EL",  nombre:"Evalastic",          categoria:"Núcleos EVA",        tipo:"interior",
    bg:"#E6F1FB", tc:"#0C447C",
    descTecnica:"Sus características de densidad y elasticidad proporcionan gran confort en el golpeo. Mantiene el rendimiento inicial con el tiempo.",
    sensacion:"Pala confortable y consistente, sin ser ni muy blanda ni muy dura. Estable desde el primer día.",
    pitch:"La pala de iniciación que no envejece: el rendimiento del primer partido se mantiene toda la temporada.",
    vsOtros:"Más básica que el MultiEva o el BlackEva pero suficiente para amateur o junior." }
];


/* ── 3. TECNOLOGÍAS ────────────────────────────────────────────────────── */

const TECNOLOGIAS = [
  { id:"TS",  cod:"TS",  nombre:"Topspin",           categoria:"Superficie",          seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Acabado con grano arenoso en la última capa para mayor agarre sobre la pelota y potenciar los efectos en cada golpe.",
    sensacion:"La bola se pega más tiempo a la cara de la pala. El spin sale mucho más pronunciado y con menos esfuerzo.",
    pitch:"Para el jugador que quiere jugar con efecto sin cambiar su técnica: la superficie hace el trabajo.",
    vsOtros:"El 3D Grain tiene rugosidad tridimensional más pronunciada — ambos generan spin pero el 3D Grain es más agresivo." },
  { id:"3G",  cod:"3G",  nombre:"3D Grain",          categoria:"Superficie",          seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Superficie rugosa en 3D para potenciar los efectos. Mayor fricción al contacto, más tiempo de contacto y control sobre los efectos.",
    sensacion:"La bola queda en la pala una fracción de segundo más. Permite cargar más spin, especialmente en bandejas.",
    pitch:"El máximo spin del catálogo: la textura tridimensional agarra la bola desde cualquier ángulo.",
    vsOtros:"Más agresivo que el Topspin. Presente en palas de mayor exigencia técnica." },
  { id:"HC",  cod:"HC",  nombre:"Hesacore",          categoria:"Puño y grip",         seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Grip en panal que crea mayor superficie de contacto. Reduce el esfuerzo, las vibraciones y las lesiones hasta un 15%.",
    sensacion:"El mango se siente más grueso y seguro. Las vibraciones de los golpes descentrados se sienten mucho menos.",
    pitch:"Reduce las lesiones hasta un 15%. Para el cliente con codo de pádel puede ser la diferencia entre jugar o no jugar.",
    vsOtros:"Hesacore actúa en el grip. Vibradrive actúa en la unión del mango. Se complementan perfectamente." },
  { id:"VD",  cod:"VD",  nombre:"Vibradrive",        categoria:"Puño y grip",         seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Pieza de caucho de alta elasticidad intercalada en el montaje del puño. Absorbe la mayor parte de las vibraciones en golpes descentrados.",
    sensacion:"Los golpes fuera del centro no pegan en el brazo. Nada retumba ni molesta.",
    pitch:"Como tener un amortiguador integrado en el mango. Para el jugador con historial de lesiones en codo o muñeca.",
    vsOtros:"Vibradrive está en la estructura interna del mango. Hesacore en el grip exterior. Los dos se complementan." },
  { id:"W",   cod:"W",   nombre:"Vertex Core",       categoria:"Estructura interna",  seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Corazón con doble puente en diagonal y geometría triangular. Optimiza la distribución de fuerzas entre las aristas de la pala.",
    sensacion:"La pala se siente muy equilibrada. Los golpes no se van hacia ningún lado — hay sensación de seguridad en cada impacto.",
    pitch:"El corazón más evolucionado de Bullpadel: distribuye la energía de forma más eficiente.",
    vsOtros:"Vertex prioriza equilibrio potencia-control; el Hack prioriza rigidez y control en golpes descentrados." },
  { id:"H",   cod:"H",   nombre:"Hack",              categoria:"Estructura interna",  seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Corazón de rigidez aumentada para mejorar el control de los golpes descentrados y equilibrio de pesos perfecto.",
    sensacion:"La pala se siente firme y estable. Cuando el golpe no sale del centro perfecto, la pala no tiembla.",
    pitch:"Para el jugador agresivo que a veces golpea fuera del centro: Hack garantiza que cada golpe salga limpio.",
    vsOtros:"Hack más rígido y orientado al control; Vertex equilibra más potencia con control." },
  { id:"3C",  cod:"3C",  nombre:"Tricore",           categoria:"Estructura interna",  seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Vectores de mayor grosor para reducir vibraciones. Canal AIR REACT que atraviesa el corazón — flujo de aire rápido y sin turbulencias.",
    sensacion:"La pala se siente potente y estable. La bola sale con más velocidad de la esperada. Las vibraciones casi desaparecen.",
    pitch:"El canal de aire que atraviesa el corazón acelera la bola desde adentro de la pala.",
    vsOtros:"Tricore combina anti-vibración con aerodinámica interna. Diferente al Vertex Core (geométrico) y al Hack (rigidez)." },
  { id:"GC",  cod:"GC",  nombre:"GeometricCore",     categoria:"Estructura interna",  seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Nuevo corazón con aletas estructurales en la parte superior para maximizar la potencia y la resistencia a la flexión.",
    sensacion:"La pala se siente muy reactiva en la zona alta. Los smashes y bandejas tienen más potencia sin perder dirección.",
    pitch:"El corazón construido como ingeniería aeronáutica: las aletas canalizan la fuerza donde más importa.",
    vsOtros:"Más orientado al ataque que el Vertex Core. Su diferencia con el Hack: potencia sobre rigidez." },
  { id:"FF",  cod:"FF",  nombre:"FlowForce",         categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Tecnología integrada en el brazo de la pala. Proporciona refuerzos longitudinales que optimizan la transferencia de energía.",
    sensacion:"La pala mantiene la potencia aunque el brazo esté cansado. La energía del movimiento no se pierde.",
    pitch:"La pala que no cansa: FlowForce lleva la energía del swing directo a la bola.",
    vsOtros:"FlowForce está en el brazo de la pala. Diferente a ExoFrame (marco exterior) y TorsionConcept (torsión del brazo)." },
  { id:"CA",  cod:"CA",  nombre:"Curv:Aktiv",        categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Giro de las caras laterales que crea una sección variable a lo largo del perfil, similar a un doble marco que trabaja en dos direcciones.",
    sensacion:"La pala tiene más superficie activa. Los golpes ligeramente descentrados salen mejor de lo esperado.",
    pitch:"Un marco que trabaja en dos direcciones: más área de golpeo efectiva, más consistencia en cada intercambio.",
    vsOtros:"Curv:Aktiv es tecnología de forma del marco. Diferente al ExoFrame (rigidez) y al Hexature (refuerzo interno)." },
  { id:"EX",  cod:"EX",  nombre:"ExoFrame",          categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Exoesqueleto externo de sección variable que refuerza estratégicamente el marco exterior en los puntos clave del impacto.",
    sensacion:"El marco se siente rígido y sólido. Los golpes al borde no producen vibración molesta.",
    pitch:"El marco más rígido de la gama: sin pérdida de energía por flexión, todo el golpe va a la bola.",
    vsOtros:"ExoFrame refuerza el exterior del marco. Hexature refuerza el interior. Juntos forman el sistema más completo." },
  { id:"TO",  cod:"TO",  nombre:"TorsionConcept",    categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Los brazos de la pala giran estructuralmente 25 grados, generando una torsión controlada que optimiza la transferencia de energía.",
    sensacion:"Al atacar, la pala tiene una mordida diferente — el swing se transforma en potencia de forma muy eficiente.",
    pitch:"Física aplicada al pádel: los brazos giran para multiplicar la potencia de cada smash.",
    vsOtros:"TorsionConcept actúa en los brazos. Diferente a FlowForce (brazo único). Su diferencial es la torsión activa." },
  { id:"HT",  cod:"HT",  nombre:"Hexature",          categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Estructura hexagonal interna aumentada en 3mm de grosor a lo largo del marco. Mayor estabilidad y resistencia.",
    sensacion:"La pala se siente muy sólida. Nada flexiona, nada vibra. Los golpes potentes salen con firmeza total.",
    pitch:"Un bastidor de panal hexagonal recorre todo el marco: las vibraciones no roban energía del golpe.",
    vsOtros:"Hexature refuerza desde el interior del marco. ExoFrame desde el exterior. Juntos son el sistema más completo." },
  { id:"XF",  cod:"XF",  nombre:"XForce",            categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Refuerzo estructural adicional al marco con canal interno que reduce torsiones no deseadas.",
    sensacion:"La pala se siente firme y directa. El marco no cede con golpes fuertes.",
    pitch:"Más firmeza en el marco, golpe más limpio. Para el jugador que quiere precisión.",
    vsOtros:"XForce es un refuerzo adicional orientado a palas NEXT. Más accesible que ExoFrame o Hexature." },
  { id:"CT",  cod:"CT",  nombre:"CarbonTube",        categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Marco construido 100% con carbono entrelazado bidireccional. Máxima rigidez mecánica y equilibrio perfecto entre potencia y control.",
    sensacion:"El marco se siente de una pieza. Los golpes potentes no producen ninguna vibración extraña.",
    pitch:"El marco más puro de carbono: rigidez total, sin compromisos.",
    vsOtros:"CarbonTube es el estándar de marco en PROLINE. Diferente a los marcos con Polyglass (más blandos)." },
  { id:"N",   cod:"N",   nombre:"Nerve",             categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Canales en el lateral del marco que aumentan la rigidez, reducen el peso y consiguen mayor control en los golpes.",
    sensacion:"La pala se siente más liviana de lo que pesa. Los canales la hacen más ágil sin perder rigidez.",
    pitch:"La pala que pesa menos pero rinde más: Nerve saca material donde sobra y refuerza donde importa.",
    vsOtros:"Exclusivo de palas de control como la Neuron 02. Aligera el marco sin perder rigidez." },
  { id:"PL",  cod:"PL",  nombre:"Prismlock",         categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Triangulación estructural avanzada para maximizar la rigidez del marco y optimizar la precisión. Inspirada en el facetado de redes cristalinas.",
    sensacion:"La pala tiene una respuesta idéntica en cada golpe, independientemente de dónde contacte la bola.",
    pitch:"Rígida como un cristal: cada golpe tiene la misma respuesta, siempre, sin importar la presión del partido.",
    vsOtros:"Prismlock es triangulación del marco. Diferente al Hexature (hexagonal) y al ExoFrame (exoesqueleto externo)." },
  { id:"SH",  cod:"SH",  nombre:"SmartHoles",        categoria:"Perforación",         seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Sistema avanzado de distribución de agujeros diseñado a medida para cada pala según su geometría y materiales.",
    sensacion:"La pala corta el aire de forma eficiente sin perder potencia. Los golpes rápidos tienen menos resistencia.",
    pitch:"Los agujeros no son decoración: cada uno está calculado para esa pala específica.",
    vsOtros:"Presente en casi toda la gama PROLINE. La perforación estándar de las líneas TOUR y ADVANCE no tiene este diseño." },
  { id:"TC",  cod:"TC",  nombre:"TotalChannel",      categoria:"Aerodinámica",        seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Maximiza la velocidad generada por el movimiento del jugador, transformando energía cinética en contragolpes poderosos y precisos.",
    sensacion:"La pala parece que agarra velocidad con el movimiento del brazo. Los contragolpes tienen más potencia de la esperada.",
    pitch:"La pala que multiplica la velocidad de tu brazo: TotalChannel convierte cada movimiento en más potencia.",
    vsOtros:"TotalChannel es aerodinámica del marco completo. Diferente a SmartHoles (agujeros) y FlowForce (brazo)." },
  { id:"CW",  cod:"CustomWeight", nombre:"Custom Weight",    categoria:"Marco",               seccion:"tec",
    bg:"#F5F3FF", tc:"#3C3489",
    descTecnica:"Mediante un proceso de compresión del material en el marco, se forma un canal perimetral que refuerza la estructura de la pala e incorpora hendiduras estratégicas para la colocación del sistema de pesas intercambiables.",
    sensacion:"Permite ajustar el balance y el peso de la pala según las preferencias del jugador. Una personalización que se siente en cada golpe.",
    pitch:"La pala que se adapta a vos: el sistema de pesas permite tunear el balance entre potencia y control sin cambiar de modelo.",
    vsOtros:"Custom Weight es exclusivo de la XPLO 26 — la única pala del catálogo 2026 con sistema de peso ajustable." }
];


/* ── 5. JUGADORES EMBAJADORES ──────────────────────────────────────────── */

const JUGADORES = [
  { id:"juan-tello",      nombre:"Juan Tello",        pais:"España",    circuito:"Premier Padel",
    ranking:"Top 10",    estilo:"Polivalente",
    palas:["vertex05"],
    bio:"Uno de los jugadores más completos del circuito actual. Juan Tello destaca por su capacidad de dominar el punto desde cualquier posición de la pista." },
  { id:"pablo-cardona",   nombre:"Pablo Cardona",     pais:"España",    circuito:"Premier Padel",
    ranking:"Top 30",    estilo:"Ofensivo",
    palas:["vertex05geo"],
    bio:"Jugador de ataque potente y preciso. Pablo Cardona apuesta por la Vertex 05 Geo para maximizar su capacidad de golpeo desde todas las posiciones." },
  { id:"martin-dinenno",  nombre:"Martín Di Nenno",   pais:"Argentina", circuito:"Premier Padel",
    ranking:"Top 5",     estilo:"Ofensivo",
    palas:["xplo26"],
    bio:"Uno de los jugadores más potentes del circuito mundial. Martín Di Nenno es la referencia del juego explosivo y la pala XPLO 26 fue diseñada a su imagen." },
  { id:"fede-chingotto",  nombre:"Fede Chingotto",    pais:"Argentina", circuito:"Premier Padel",
    ranking:"Top 5",     estilo:"Control / Ofensivo",
    palas:["neuron02","neuron02edge"],
    bio:"Referente del control técnico en el circuito. Fede Chingotto combina una defensa impenetrable con un contraataque letal, reflejado en la gama Neuron 02." },
  { id:"juanma-diaz",     nombre:"Juan Martín Díaz",  pais:"España",    circuito:"Retirado / Icono",
    ranking:"Leyenda",   estilo:"Polivalente",
    palas:["icon26"],
    bio:"Considerado uno de los mejores jugadores de la historia del pádel. La Icon 26 es un homenaje a su legado y su forma de entender el juego." },
  { id:"paquito-navarro", nombre:"Paquito Navarro",   pais:"España",    circuito:"Premier Padel",
    ranking:"Top 20",    estilo:"Polivalente",
    palas:["hackjr26"],
    bio:"Una de las personalidades más carismáticas del pádel mundial. Paquito Navarro presta su nombre y estilo a la Hack JR 26, la pala de referencia para el junior de alto nivel." },
  { id:"alejandra-salazar", nombre:"Alejandra Salazar", pais:"España",  circuito:"Premier Padel",
    ranking:"Top 5 Femenino", estilo:"Ofensivo",
    palas:["flowlegend"],
    bio:"Leyenda del pádel femenino mundial. Alejandra Salazar es la inspiración detrás de la Flow Legend, una pala que combina su potencia con su elegancia característica." },
  { id:"claudia-fernandez", nombre:"Claudia Fernández", pais:"España",  circuito:"Premier Padel",
    ranking:"Top 10 Femenino", estilo:"Polivalente",
    palas:["wonder"],
    bio:"Jugadora completa con un juego que lo abarca todo. La Wonder fue diseñada junto a Claudia Fernández para reflejar su capacidad de rendir en todas las facetas del juego." },
  { id:"delfi-brea",      nombre:"Delfi Brea",        pais:"Argentina", circuito:"Premier Padel",
    ranking:"Top 5 Femenino",  estilo:"Polivalente",
    palas:["vertex05w","vertex05wcloud"],
    bio:"Referente del pádel femenino argentino e internacional. Delfi Brea juega con la Vertex 05 W, la pala que combina la tecnología PROLINE con el formato femenino optimizado." }
];


/* ── 6. USUARIOS ───────────────────────────────────────────────────────── */
// IMPORTANTE: No existe registro público. Las credenciales son asignadas
// manualmente por el equipo Bullpadel (owner o vendedores autorizados).

const USUARIOS = [
  {
    id: "usr-001",
    nombre: "Admin Bullpadel",
    email: "admin@bullpadel.com",
    password: "bp2026admin",        // TODO: hashear antes de producción
    clienteMayorista: null,
    rol: "owner",
    estado: "activo",
    fechaAlta: "2026-01-01",
    creadoPor: "sistema"
  },
  {
    id: "usr-002",
    nombre: "Vendedor Demo",
    email: "vendedor@bullpadel.com",
    password: "vendedor2026",
    clienteMayorista: null,
    rol: "vendedor",
    estado: "activo",
    fechaAlta: "2026-01-15",
    creadoPor: "usr-001"
  },
  {
    id: "usr-003",
    nombre: "Distribuidor Demo",
    email: "distribuidor@ejemplo.com",
    password: "distri2026",
    clienteMayorista: "Deportes Ejemplo S.A.",
    rol: "usuario",
    estado: "activo",
    fechaAlta: "2026-02-01",
    creadoPor: "usr-002"
  }
];


/* ── 7. ROLES Y PERMISOS ───────────────────────────────────────────────── */

const ROLES = {

  // ── Owner: acceso total ──────────────────────────────────────────────────
  owner: {
    nombre: "Owner",
    descripcion: "Acceso total al portal — gestión, contenido, usuarios y configuración.",
    permisos: {
      // Contenido
      verCatalogo:          true,
      verMateriales:        true,
      verComparador:        true,
      verTablaGama:         true,
      verGuiaVenta:         true,
      verCapacitaciones:    true,
      verCompetencia:       true,
      verConfiguracion:     true,
      verRecomendador:      true,
      verAdminPanel:        true,
      verRecomendador:      true,
      verMediaCenter:       true,   // Media Center: visible para los 3 roles, sin restricción

      // Usuarios
      gestionarUsuarios:    true,   // ver listado de usuarios
      crearUsuarios:        true,   // crear owners, vendedores y usuarios
      editarUsuarios:       true,   // editar cualquier usuario
      cambiarRoles:         true,   // cambiar rol de cualquier usuario
      cambiarContrasenas:   true,   // cambiar contraseña de cualquier usuario
      activarDesactivar:    true,   // activar / desactivar cualquier usuario
      eliminarUsuarios:     true,   // eliminar usuarios (excepto a sí mismo)

      // Contenido y configuración
      editarContenido:      true,   // editar palas, materiales, tecnologías
      verConfiguracion:     true,   // ver y editar CONFIG

      // Restricciones — ninguna
      puedeCrearOwners:     true,
      puedeCrearVendedores: true,
      puedeCrearUsuarios:   true
    }
  },

  // ── Vendedor: gestión parcial ────────────────────────────────────────────
  vendedor: {
    nombre: "Vendedor",
    descripcion: "Acceso comercial completo y gestión de usuarios con rol usuario.",
    permisos: {
      // Contenido
      verCatalogo:          true,
      verMateriales:        true,
      verComparador:        true,
      verTablaGama:         true,
      verGuiaVenta:         true,
      verCapacitaciones:    true,
      verCompetencia:       true,   // puede ver comparativa con competencia
      verConfiguracion:     false,  // no puede ver configuración global
      verRecomendador:      true,
      verAdminPanel:        true,   // panel admin limitado (solo sus usuarios)
      verRecomendador:      true,
      verMediaCenter:       true,   // Media Center: visible para los 3 roles, sin restricción

      // Usuarios — solo puede gestionar usuarios creados por él
      gestionarUsuarios:    true,   // ver sus propios usuarios creados
      crearUsuarios:        true,   // solo puede crear rol "usuario"
      editarUsuarios:       true,   // solo usuarios creados por él
      cambiarRoles:         false,  // no puede cambiar roles
      cambiarContrasenas:   true,   // solo contraseñas de sus usuarios
      activarDesactivar:    true,   // solo sus usuarios
      eliminarUsuarios:     false,  // no puede eliminar usuarios

      // Contenido y configuración
      editarContenido:      false,  // no puede editar contenido general
      verConfiguracion:     false,

      // Restricciones explícitas
      puedeCrearOwners:     false,  // no puede crear owners
      puedeCrearVendedores: false,  // no puede crear otros vendedores
      puedeCrearUsuarios:   true,   // solo puede crear usuarios/distribuidores
      noPuedeEliminarOwners: true,  // restricción explícita
      noPuedeCambiarRolesCriticos: true
    }
  },

  // ── Usuario / Distribuidor: acceso al catálogo ───────────────────────────
  usuario: {
    nombre: "Usuario / Distribuidor",
    descripcion: "Acceso al catálogo de producto, comparador y materiales. Sin herramientas internas.",
    permisos: {
      // Contenido — acceso parcial
      verCatalogo:          true,
      verMateriales:        true,
      verComparador:        true,   // comparador Bullpadel si está habilitado en CONFIG
      verTablaGama:         true,
      verGuiaVenta:         true,   // puede ver guía de venta
      verCapacitaciones:    true,   // puede ver capacitaciones
      verCompetencia:       false,  // no puede ver comparativa con competencia
      verConfiguracion:     false,
      verRecomendador:      true,
      verAdminPanel:        false,
      verRecomendador:      true,
      verMediaCenter:       true,   // Media Center: visible para los 3 roles, sin restricción

      // Descargas
      descargarArchivos:    true,   // puede descargar archivos permitidos por CONFIG

      // Usuarios — ningún permiso
      gestionarUsuarios:    false,
      crearUsuarios:        false,
      editarUsuarios:       false,
      cambiarRoles:         false,
      cambiarContrasenas:   false,
      activarDesactivar:    false,
      eliminarUsuarios:     false,

      // Contenido
      editarContenido:      false,

      // Restricciones explícitas
      puedeCrearOwners:     false,
      puedeCrearVendedores: false,
      puedeCrearUsuarios:   false,
      registroPublico:      false,  // no existe registro público
      solicitudAcceso:      false   // no existe solicitud de acceso
    }
  }

};


/* ── 8. COMPARATIVA CON COMPETENCIA ────────────────────────────────────── */
// Datos orientativos para el equipo de ventas — no para mostrar al cliente final

const COMPETENCIA = [
  {
    marca: "Head",
    posicionamiento: "Premium técnico, fuerte en carbono y potencia",
    fortalezas: ["Gran presencia en el circuito profesional","Reconocimiento de marca global","Tecnología de carbono avanzada"],
    debilidades: ["Precio elevado en gama alta","Menos versatilidad en gama media"],
    comparativaBullpadel: "Bullpadel compite directamente en el segmento PROLINE. Diferencial: tecnologías propias (Vibradrive, Hesacore, SmartHoles) y mayor variedad de perfiles dentro de la gama.",
    parecidosEnBullpadel: ["xplo26","hack0426","neuron02edge"]
  },
  {
    marca: "Babolat",
    posicionamiento: "Equilibrio entre confort y potencia, fuerte en la gama media",
    fortalezas: ["Reconocimiento del mundo del tenis","Buena relación precio/rendimiento en gama media","Diseños atractivos"],
    debilidades: ["Menor especialización en pádel puro","Tecnologías menos diferenciadas"],
    comparativaBullpadel: "Bullpadel como marca exclusiva de pádel tiene mayor especialización técnica. La gama NEXT y ADVANCE de Bullpadel compite directamente en precio y rendimiento.",
    parecidosEnBullpadel: ["ionicpower26","ioniccontrol26","vertexadvance"]
  },
  {
    marca: "Nox",
    posicionamiento: "Potencia y ataque, perfil español de alto rendimiento",
    fortalezas: ["Palas muy ofensivas","Buena relación calidad/precio","Diseños agresivos"],
    debilidades: ["Menos variedad en perfiles de control","Menor confort en gamas bajas"],
    comparativaBullpadel: "La gama Hack de Bullpadel compite directamente con la propuesta ofensiva de Nox. Diferencial: el sistema anti-vibración (Vibradrive + Hesacore) y mayor accesibilidad en comodidad.",
    parecidosEnBullpadel: ["hack0426","hack04hybrid26","xplo26"]
  },
  {
    marca: "Adidas",
    posicionamiento: "Marketing aspiracional, diseño y reconocimiento de marca",
    fortalezas: ["Reconocimiento de marca global","Fuerte en indumentaria y accesorios","Inversión en marketing de influencers"],
    debilidades: ["Tecnología de pala menos diferenciada","Precio premium no siempre justificado técnicamente"],
    comparativaBullpadel: "Bullpadel gana en especialización técnica y valor por precio. El argumento de venta es siempre: somos la marca que solo hace pádel — y se nota.",
    parecidosEnBullpadel: ["vertex05","vertex05geo","pearl26"]
  }
];


/* ── 9. CONFIGURACIÓN DE MÓDULOS ───────────────────────────────────────── */

const CONFIG = {

  portal: {
    nombre:    "Portal Bullpadel 2026",
    version:   "v22.0",
    temporada: "2026",
    idioma:    "es",
    moneda:    "ARS"
  },

  // ── Acceso y autenticación ───────────────────────────────────────────────
  auth: {
    requiereLoginGlobal: true,    // Fase 2: todo el portal requiere login
    registroPublico:     false,   // NO existe registro público
    solicitudAcceso:     false,   // NO existe solicitud de acceso
    creacionUsuarios:    "manual" // solo owner o vendedores autorizados crean usuarios
  },

  // ── Módulos: activo, requiereLogin, rolesPermitidos ─────────────────────
  // La visibilidad real se aplica en applyRolePermissions() via ROLES[rol].permisos
  // rolesPermitidos aquí es referencia de diseño — la fuente de verdad son ROLES.
  modulos: {
    catalogo:       { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    materiales:     { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    comparador:     { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    tablaGama:      { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    guiaVenta:      { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    capacitaciones: { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor","usuario"] },
    competencia:    { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor"] },
    // adminPanel: visibilidad controlada por ROLES[rol].permisos.verAdminPanel
    // owner → panel completo | vendedor → panel limitado (solo sus usuarios)
    adminPanel:          { activo: true, requiereLogin: true, rolesPermitidos: ["owner","vendedor"] },
    adminPanelLimitado:  { activo: true, requiereLogin: true, rolesPermitidos: ["vendedor"] }
  },

  // ── Permisos de descarga ─────────────────────────────────────────────────
  descargas: {
    habilitado:      true,
    rolesPermitidos: ["owner","vendedor","usuario"],
    formatosPermitidos: ["pdf","jpg","png"]
  },

  // ── UI ───────────────────────────────────────────────────────────────────
  ui: {
    colores: { primario: "#C8102E", negro: "#0f0f01", blanco: "#ffffff" },
    maxPalasComparador: 3,
    paginacionCatalogo: false
  }

};

// ── ITEMS (array unificado Mat+Tech — usado por renderItems) ─────────────
// Compatibilidad con la sección Materiales y Tecnologías del portal.
// Fusiona MATERIALES y TECNOLOGIAS en el formato que espera renderItems().

const ITEMS = [
  ...MATERIALES.map(m => ({
    cod: m.cod, nom: m.nombre, tipo: "mat", cat: m.categoria,
    bg: m.bg, tc: m.tc,
    desc: m.descTecnica, sensacion: m.sensacion,
    pitch: m.pitch, vsOtros: m.vsOtros
  })),
  ...TECNOLOGIAS.map(t => ({
    cod: t.cod, nom: t.nombre, tipo: "tech", cat: t.categoria,
    bg: t.bg, tc: t.tc,
    desc: t.descTecnica, sensacion: t.sensacion,
    pitch: t.pitch, vsOtros: t.vsOtros
  }))
];

// ── GUIA_STEPS ───────────────────────────────────────────────────────────

const GUIA_STEPS = [
  {
    num: 1,
    nav: "Bienvenida",
    title: "Bienvenida",
    subtitle: "El primer contacto define el tono de toda la venta",
    content: `
      <div class="step-grid step-grid-2">
        <div class="step-block">
          <div class="step-block-label">Qué evitar</div>
          <div class="step-warn">"Hola, ¿cómo estás?" — Respuesta habitual: "Estoy mirando."</div>
          <p style="font-size:13px;color:#777;line-height:1.5">Una apertura genérica cierra la conversación antes de empezar.</p>
        </div>
        <div class="step-block">
          <div class="step-block-label">Cómo abrir</div>
          <div class="step-say">"¿Necesitás asesoramiento o estás viendo opciones?"</div>
          <div class="step-say">"¿Estás buscando pala o algún accesorio?"</div>
          <div class="step-quote">Preguntas abiertas generan conversación. El objetivo es que el cliente hable.</div>
        </div>
      </div>
      <div class="step-block" style="margin-top:16px">
        <div class="step-block-label">Lenguaje corporal</div>
        <div class="step-grid step-grid-3" style="margin-top:0">
          <div class="signal-item">Contacto visual directo</div>
          <div class="signal-item">Actitud activa y disponible</div>
          <div class="signal-item">Sonrisa y predisposición</div>
        </div>
      </div>
    `
  },
  {
    num: 2,
    nav: "Detección",
    title: "Detección de necesidades",
    subtitle: "Escuchar primero — recomendar después",
    content: `
      <div class="step-grid step-grid-3">
        <div class="step-block">
          <div class="step-block-label">Su juego</div>
          <ul class="step-list">
            <li>¿Hace cuánto jugás al pádel?</li>
            <li>¿Cuántas veces por semana jugás?</li>
            <li>¿Qué tipo de juego tenés? ¿Más de fondo o de red?</li>
          </ul>
        </div>
        <div class="step-block">
          <div class="step-block-label">Su pala actual</div>
          <ul class="step-list">
            <li>¿Qué pala estás usando hoy?</li>
            <li>¿Qué te gusta de esa pala?</li>
            <li>¿Qué sentís que te falta?</li>
          </ul>
        </div>
        <div class="step-block">
          <div class="step-block-label">Su objetivo</div>
          <ul class="step-list">
            <li>¿Qué querés mejorar?</li>
            <li>¿Buscás más control, potencia o comodidad?</li>
            <li>¿Tenés alguna molestia en el brazo o el codo?</li>
          </ul>
        </div>
      </div>
      <div class="step-block" style="margin-top:16px">
        <div class="step-block-label">Qué debemos identificar</div>
        <div class="step-grid step-grid-3" style="margin-top:0">
          <div class="signal-item">Nivel de juego</div>
          <div class="signal-item">Frecuencia semanal</div>
          <div class="signal-item">Estilo ofensivo / defensivo</div>
          <div class="signal-item">Sensaciones buscadas</div>
          <div class="signal-item">Historial de lesiones</div>
          <div class="signal-item">Presupuesto disponible</div>
        </div>
        <div class="step-quote" style="margin-top:12px">El cliente no siempre sabe qué necesita, pero sí sabe cómo se siente jugando.</div>
      </div>
    `
  },
  {
    num: 3,
    nav: "Interpretación",
    title: "Interpretación",
    subtitle: "Traducir lo que dice el cliente a una necesidad técnica",
    content: `
      <div class="step-block" style="margin-bottom:16px">
        <div class="step-block-label">Guía rápida — si el cliente dice...</div>
        <table class="qref-table">
          <thead><tr><th>El cliente dice…</th><th>Posible necesidad</th><th>Qué buscar</th></tr></thead>
          <tbody>
            <tr><td>"La pelota no me sale"</td><td>Más salida y confort</td><td>Soft EVA + balance medio</td></tr>
            <tr><td>"La siento pesada"</td><td>Más manejabilidad</td><td>Balance bajo, menos peso</td></tr>
            <tr><td>"Me vibra mucho"</td><td>Más absorción</td><td>Goma blanda, Vibradrive</td></tr>
            <tr><td>"Quiero más potencia"</td><td>Mayor transferencia</td><td>Balance alto, carbono</td></tr>
            <tr><td>"Me cansa el brazo"</td><td>Menor exigencia física</td><td>Formato redondo, Elastic Fiber</td></tr>
            <tr><td>"Quiero más control"</td><td>Mayor precisión</td><td>Balance bajo, formato redondo</td></tr>
          </tbody>
        </table>
      </div>
      <div class="step-grid step-grid-3">
        <div class="step-block">
          <div class="step-block-label">Formato</div>
          <table class="qref-table">
            <thead><tr><th>Formato</th><th>Sensación</th></tr></thead>
            <tbody>
              <tr><td>Redonda</td><td>Control y facilidad</td></tr>
              <tr><td>Híbrida</td><td>Equilibrio</td></tr>
              <tr><td>Diamante</td><td>Potencia</td></tr>
            </tbody>
          </table>
        </div>
        <div class="step-block">
          <div class="step-block-label">Balance</div>
          <table class="qref-table">
            <thead><tr><th>Balance</th><th>Sensación</th></tr></thead>
            <tbody>
              <tr><td>Bajo</td><td>Control y manejabilidad</td></tr>
              <tr><td>Medio</td><td>Equilibrio</td></tr>
              <tr><td>Alto</td><td>Mayor potencia</td></tr>
            </tbody>
          </table>
        </div>
        <div class="step-block">
          <div class="step-block-label">Goma</div>
          <table class="qref-table">
            <thead><tr><th>Goma</th><th>Sensación</th></tr></thead>
            <tbody>
              <tr><td>Soft EVA</td><td>Confort y absorción</td></tr>
              <tr><td>MultiEva</td><td>Equilibrio salida/respuesta</td></tr>
              <tr><td>HardEva</td><td>Precisión y potencia</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="qref-rule">A mayor rigidez, mayor transferencia de energía — y mayor exigencia técnica.</div>
    `
  },
  {
    num: 4,
    nav: "Recomendación",
    title: "Recomendación por perfil",
    subtitle: "La pala correcta para cada jugador",
    content: `
      <div class="step-grid step-grid-3" style="margin-bottom:16px">
        <div class="perfil-card ini">
          <div class="perfil-nivel ini">Inicial · Recreativo</div>
          <div class="perfil-title">Prioriza comodidad</div>
          <ul class="perfil-list">
            <li>Formato redondo o híbrido</li>
            <li>Balance bajo o medio</li>
            <li>Soft EVA</li>
            <li>Fibra de vidrio o carbono flexible</li>
          </ul>
          <div class="perfil-frase">"Te va a ayudar a jugar más cómodo y a sentir mejor la pelota sin exigir tanto el brazo."</div>
        </div>
        <div class="perfil-card med">
          <div class="perfil-nivel med">Intermedio</div>
          <div class="perfil-title">Busca evolucionar</div>
          <ul class="perfil-list">
            <li>Formato híbrido</li>
            <li>Balance medio</li>
            <li>MultiEva</li>
            <li>Carbono</li>
          </ul>
          <div class="perfil-frase">"Es una pala equilibrada que te permite seguir mejorando sin perder comodidad."</div>
        </div>
        <div class="perfil-card avz">
          <div class="perfil-nivel avz">Avanzado · Competitivo</div>
          <div class="perfil-title">Máxima respuesta</div>
          <ul class="perfil-list">
            <li>Formato diamante</li>
            <li>Balance medio / alto</li>
            <li>Carbono</li>
            <li>MultiEva</li>
          </ul>
          <div class="perfil-frase">"Te va a dar una respuesta más explosiva y mayor transferencia de energía."</div>
        </div>
      </div>
      <div class="step-block">
        <div class="step-block-label">Método FABS — cómo presentar la pala</div>
        <div class="fabs-row"><span class="fabs-badge fabs-c">Característica</span><span class="fabs-text">Qué tiene la pala técnicamente</span></div>
        <div class="fabs-row"><span class="fabs-badge fabs-v">Ventaja</span><span class="fabs-text">Qué hace esa característica</span></div>
        <div class="fabs-row"><span class="fabs-badge fabs-b">Beneficio</span><span class="fabs-text">Qué le aporta al jugador en la pista</span></div>
        <div class="fabs-example">"Esta pala incorpora Soft EVA <strong style="font-style:normal;color:#A32D2D">(Característica)</strong>, que absorbe mejor el impacto <strong style="font-style:normal;color:#0C447C">(Ventaja)</strong>, lo que te da mayor comodidad y reduce la fatiga durante el juego <strong style="font-style:normal;color:#27500A">(Beneficio)</strong>."</div>
      </div>
    `
  },
  {
    num: 5,
    nav: "Validación",
    title: "Validación",
    subtitle: "Confirmar que la propuesta está alineada antes de cerrar",
    content: `
      <div class="step-grid step-grid-2">
        <div class="step-block">
          <div class="step-block-label">Preguntas de validación</div>
          <div class="step-say">"¿Es el tipo de sensación que estás buscando?"</div>
          <div class="step-say">"¿Te resulta cómoda en la mano? ¿El peso está bien?"</div>
          <div class="step-say">"¿Te imaginás jugando con esta pala?"</div>
          <div class="step-quote" style="margin-top:12px">Si hay dudas en este paso, volvé a la detección. Una objeción no resuelta bloquea el cierre.</div>
        </div>
        <div class="step-block">
          <div class="step-block-label">Señales de que el cliente está listo</div>
          <ul class="step-list">
            <li>Consulta precio o financiación</li>
            <li>Compara entre dos modelos</li>
            <li>Vuelve a tomar una pala</li>
            <li>Pregunta por stock o disponibilidad</li>
            <li>Hace preguntas sobre el uso o cuidado</li>
          </ul>
        </div>
      </div>
    `
  },
  {
    num: 6,
    nav: "Cierre",
    title: "Cierre de venta",
    subtitle: "Simplificar, reafirmar y dar seguridad",
    content: `
      <div class="step-grid step-grid-2">
        <div class="step-block">
          <div class="step-block-label">Frases de cierre</div>
          <div class="step-say">"Por lo que me contaste, esta es la opción que mejor encaja con tu juego."</div>
          <div class="step-say">"Creo que esta pala te va a dar exactamente lo que estás buscando."</div>
          <div class="step-say">"Vamos con esta opción."</div>
          <div class="step-say">"Te la preparo."</div>
        </div>
        <div class="step-block">
          <div class="step-block-label">Claves del cierre</div>
          <ul class="step-list">
            <li>No agregar información nueva — genera más dudas</li>
            <li>Reafirmar la recomendación con seguridad</li>
            <li>Simplificar la decisión del cliente</li>
            <li>Transmitir convicción — el cliente compra la seguridad del asesor</li>
          </ul>
          <div class="step-quote" style="margin-top:12px">La seguridad del asesor reduce la duda del cliente.</div>
        </div>
      </div>
    `
  },
  {
    num: 7,
    nav: "Cross Selling",
    title: "Cross Selling",
    subtitle: "Completar la experiencia del jugador",
    content: `
      <div class="step-block" style="margin-bottom:16px">
        <div class="step-block-label">Regla</div>
        <div class="step-quote">Siempre sugerir con argumento y alineado al uso. Nunca ofrecer por ofrecer.</div>
      </div>
      <div class="cross-grid">
        <div class="cross-cat">
          <div class="cross-cat-title">Básicos</div>
          <div class="cross-tags">
            <span class="cross-tag">Overgrips</span>
            <span class="cross-tag">Pelotas</span>
            <span class="cross-tag">Protectores</span>
            <span class="cross-tag">Medias</span>
            <span class="cross-tag">Gorras</span>
            <span class="cross-tag">Muñequeras</span>
          </div>
        </div>
        <div class="cross-cat">
          <div class="cross-cat-title">Performance</div>
          <div class="cross-tags">
            <span class="cross-tag" style="background:var(--rojo-soft);color:#A32D2D">Hesacore</span>
            <span class="cross-tag" style="background:var(--rojo-soft);color:#A32D2D">Ease Vibes</span>
            <span class="cross-tag" style="background:var(--rojo-soft);color:#A32D2D">Custom Weight</span>
          </div>
        </div>
      </div>
      <div class="step-block" style="margin-top:16px">
        <div class="step-block-label">Ejemplo</div>
        <div class="step-say">"Para esta pala te recomiendo un overgrip adicional — mejora el agarre y protege el mango."</div>
        <div class="step-say">"Si tenés molestias en el codo, el Hesacore reduce las vibraciones hasta un 15%."</div>
      </div>
    `
  },
  {
    num: 8,
    nav: "Fidelización",
    title: "Fidelización",
    subtitle: "La experiencia no termina con la compra",
    content: `
      <div class="step-grid step-grid-2">
        <div class="step-block">
          <div class="step-block-label">En el momento de entrega</div>
          <ul class="step-list">
            <li>Explicar los cuidados básicos del producto</li>
            <li>Entregar la pala en perfectas condiciones</li>
            <li>Comentar cómo se rompe la pala correctamente</li>
            <li>Agradecer la compra con genuinidad</li>
          </ul>
        </div>
        <div class="step-block">
          <div class="step-block-label">Para la próxima visita</div>
          <ul class="step-list">
            <li>Invitar a volver cuando quiera consultar algo</li>
            <li>Comentar novedades de producto si las hay</li>
            <li>Recordar que estás disponible para el seguimiento</li>
          </ul>
          <div class="step-quote" style="margin-top:12px">Un cliente que vuelve es más valioso que uno nuevo. La fidelización empieza en esta conversación.</div>
        </div>
      </div>
    `
  }
];


const CAPACITACIONES = [
  {
    num: 1,
    label: "Módulo 1",
    name: "Bullpadel — La marca",
    desc: "Conocer a fondo la marca que representamos: su historia, valores, posicionamiento y por qué es diferente.",
    objetivos: ["Explicar el origen y la historia de Bullpadel","Comunicar los valores de la marca","Identificar el posicionamiento frente a la competencia","Conocer a los jugadores embajadores"],
    checklist: [
          "Puedo explicar el origen y la historia de Bullpadel.",
          "Identifico los valores principales de la marca.",
          "Conozco el rol de los jugadores embajadores y sus palas.",
          "Puedo diferenciar a Bullpadel de la competencia con criterio."
        ],
    quiz: { title: "Quiz del módulo", questions: [
          { question: "¿Cuál es el objetivo de conocer la historia y origen de Bullpadel?", options: ["Memorizar fechas sin aplicarlas", "Entender el contexto de la marca que representamos", "Definir precios de venta", "Comparar stock entre productos"], correct: 1, explanation: "Conocer la marca ayuda a vender con más criterio y representar mejor su identidad." },
          { question: "¿Cómo debería presentarse Bullpadel ante un cliente?", options: ["Como una marca especialista en pádel", "Como una tienda online", "Como una marca de cualquier deporte", "Como una marca enfocada solo en profesionales"], correct: 0, explanation: "Bullpadel se diferencia por su especialización en pádel y amplitud de gama." },
          { question: "¿Por qué importan los jugadores embajadores?", options: ["Porque permiten vender solo por fama", "Porque ayudan a conectar producto, estilo de juego y aspiración", "Porque reemplazan la ficha técnica", "Porque definen el precio del producto"], correct: 1, explanation: "Los embajadores sirven como referencia, pero siempre hay que recomendar según el jugador." }
        ] },
    units: [
      {
        title: "Historia y origen",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">Los comienzos</div>
            <div class="cap-p">Bullpadel nació en España en <strong>1995</strong>, en pleno auge del pádel en el mercado ibérico. Desde sus primeros años, la marca apostó por el desarrollo tecnológico propio como diferencial competitivo, alejándose del modelo de fabricación genérica que dominaba el mercado en esa época.</div>
            <div class="cap-p">A diferencia de otras marcas que importaban productos terminados, Bullpadel construyó su propio departamento de I+D, lo que le permitió desarrollar materiales y tecnologías exclusivas que hoy son referencia en el sector.</div>
            <div class="cap-highlight"><strong>Dato clave:</strong> Bullpadel es una de las pocas marcas del sector que desarrolla y patenta sus propios materiales y tecnologías. Esto no es marketing — es ingeniería.</div>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">Crecimiento internacional</div>
            <div class="cap-p">Con presencia en más de <strong>40 países</strong>, Bullpadel consolidó su posición como una de las marcas de pádel más reconocidas a nivel mundial. Su expansión fue acompañada por la presencia en los circuitos profesionales más importantes, lo que le dio visibilidad global y validación técnica.</div>
            <div class="cap-stat-grid">
              <div class="cap-stat"><div class="cap-stat-num">+30</div><div class="cap-stat-label">años en el mercado</div></div>
              <div class="cap-stat"><div class="cap-stat-num">+40</div><div class="cap-stat-label">países con presencia</div></div>
              <div class="cap-stat"><div class="cap-stat-num">N°1</div><div class="cap-stat-label">en ventas en España</div></div>
              <div class="cap-stat"><div class="cap-stat-num">Top 3</div><div class="cap-stat-label">marcas globales del sector</div></div>
            </div>
          </div>
        `
      },
      {
        title: "Valores y posicionamiento",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">La identidad de la marca</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Innovación real</div><div class="cap-card-text">No se vende innovación — se desarrolla. Cada tecnología tiene un proceso de I+D detrás antes de llegar al mercado.</div></div>
              <div class="cap-card"><div class="cap-card-title">Especialización</div><div class="cap-card-text">"The Padel Specialist" no es un slogan vacío. Bullpadel hace pádel exclusivamente — sin desvíos a otros deportes.</div></div>
              <div class="cap-card"><div class="cap-card-title">Accesibilidad</div><div class="cap-card-text">Desde la pala de iniciación hasta la de competición profesional, la misma filosofía de calidad en toda la gama.</div></div>
              <div class="cap-card"><div class="cap-card-title">Rendimiento</div><div class="cap-card-text">La validación de los mejores jugadores del mundo no es casualidad — es el resultado de años de desarrollo conjunto.</div></div>
            </div>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">Posicionamiento frente a la competencia</div>
            <div class="cap-highlight">Bullpadel no compite por precio — compite por valor. La conversación correcta con el cliente no es "¿cuánto cuesta?" sino "¿qué necesitás y por qué esta pala lo resuelve mejor?"</div>
          </div>
        `
      },
      {
        title: "Jugadores embajadores",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">El equipo Bullpadel 2026</div>
            <div class="cap-p">Los embajadores de Bullpadel no son solo imagen — participan activamente en el desarrollo de las palas. Cada modelo de la gama PROLINE está concebido en colaboración con el jugador que lo lleva.</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Juan Tello</div><div class="cap-card-text">Vertex 05 — juego polivalente de alto nivel, referente del circuito masculino.</div></div>
              <div class="cap-card"><div class="cap-card-title">Pablo Cardona</div><div class="cap-card-text">Vertex 05 Geo — potencia y precisión en formato geométrico.</div></div>
              <div class="cap-card"><div class="cap-card-title">Martín Di Nenno</div><div class="cap-card-text">XPLO 26 — la pala más potente de la historia de Bullpadel.</div></div>
              <div class="cap-card"><div class="cap-card-title">Fede Chingotto</div><div class="cap-card-text">Neuron 02 — control total, referente del juego defensivo-ofensivo.</div></div>
              <div class="cap-card"><div class="cap-card-title">Juan Martín Díaz</div><div class="cap-card-text">Icon 26 — leyenda del pádel mundial, icono de la marca.</div></div>
              <div class="cap-card"><div class="cap-card-title">Alejandra Salazar</div><div class="cap-card-text">Flow Legend — potencia y elegancia en el juego femenino.</div></div>
              <div class="cap-card"><div class="cap-card-title">Claudia Fernández</div><div class="cap-card-text">Wonder — versatilidad y rendimiento para la jugadora completa.</div></div>
              <div class="cap-card"><div class="cap-card-title">Delfi Brea</div><div class="cap-card-text">Vertex 05 W — precisión y agilidad en el juego femenino de élite.</div></div>
            </div>
            <div class="cap-highlight" style="margin-top:16px"><strong>Para el vendedor:</strong> conocer a los jugadores genera credibilidad inmediata. Si el cliente sigue el circuito y vos sabés quién usa qué pala, la conversación cambia de nivel.</div>
          </div>
        `
      }
    ]
  },
  {
    num: 2,
    label: "Módulo 2",
    name: "El mundo del pádel",
    desc: "Entender el deporte que vendemos: su crecimiento, sus circuitos y por qué es el momento ideal para estar en el sector.",
    objetivos: ["Conocer el contexto de crecimiento del pádel en Argentina y el mundo","Identificar los principales circuitos profesionales","Entender por qué el cliente actual está más informado","Hablar con criterio sobre el ecosistema del deporte"],
    checklist: [
          "Entiendo el contexto de crecimiento del pádel en Argentina.",
          "Conozco los principales circuitos profesionales.",
          "Puedo explicar por qué el cliente actual está más informado.",
          "Identifico la oportunidad de mercado actual."
        ],
    quiz: { title: "Quiz del módulo", questions: [
          { question: "¿Por qué es importante entender el crecimiento del pádel?", options: ["Para saber que hay una oportunidad de mercado", "Para reemplazar la capacitación de producto", "Para vender sin preguntar", "Para evitar hablar con el cliente"], correct: 0, explanation: "El crecimiento del deporte ayuda a entender el contexto y la oportunidad comercial." },
          { question: "¿Qué aportan los circuitos profesionales?", options: ["Visibilidad, referencia y aspiración", "Precios de venta", "Stock disponible", "Códigos SKU"], correct: 0, explanation: "Los circuitos profesionales impulsan la visibilidad del deporte y de los jugadores." },
          { question: "¿Qué caracteriza al nuevo perfil del jugador?", options: ["Busca productos al azar", "Está más informado y compara más antes de comprar", "No le interesan las palas", "Solo compra por precio"], correct: 1, explanation: "El jugador actual suele estar más informado y necesita mejor asesoramiento." }
        ] },
    units: [
      {
        title: "El pádel en números",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">Crecimiento global</div>
            <div class="cap-p">El pádel es el deporte de raqueta de mayor crecimiento en el mundo en la última década. Lo que comenzó como un fenómeno principalmente español e iberoamericano se expandió a Europa, Oriente Medio, Estados Unidos y Asia.</div>
            <div class="cap-stat-grid">
              <div class="cap-stat"><div class="cap-stat-num">+25M</div><div class="cap-stat-label">jugadores en el mundo</div></div>
              <div class="cap-stat"><div class="cap-stat-num">+90</div><div class="cap-stat-label">países con canchas</div></div>
              <div class="cap-stat"><div class="cap-stat-num">+25%</div><div class="cap-stat-label">crecimiento anual Argentina</div></div>
              <div class="cap-stat"><div class="cap-stat-num">3,5M</div><div class="cap-stat-label">jugadores activos en Argentina</div></div>
              <div class="cap-stat"><div class="cap-stat-num">+8.000</div><div class="cap-stat-label">canchas en Argentina</div></div>
            </div>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">El nuevo jugador argentino</div>
            <div class="cap-p">El jugador de pádel en Argentina es cada vez más exigente e informado. Investiga antes de comprar, sigue el circuito profesional, consume contenido en redes sociales y llega al punto de venta con opiniones formadas.</div>
            <div class="cap-highlight"><strong>Consecuencia directa:</strong> el cliente no llega a descubrir productos. Llega a validar su decisión. El vendedor que no está a su altura pierde la venta — no por precio, sino por falta de criterio.</div>
          </div>
        `
      },
      {
        title: "Los circuitos profesionales",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">Premier Padel</div>
            <div class="cap-p">El circuito profesional más importante del mundo, organizado en colaboración con la Federación Internacional de Pádel (FIP) y Qatar Sports Investments. Concentra a los mejores jugadores del planeta y tiene presencia en los principales mercados globales.</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Formato</div><div class="cap-card-text">Torneos por categorías: P1, P2 y Major. Los Major son los eventos más importantes del año.</div></div>
              <div class="cap-card"><div class="cap-card-title">Relevancia</div><div class="cap-card-text">Es el circuito que el cliente sigue. Conocer los resultados y los jugadores genera conexión inmediata.</div></div>
              <div class="cap-card"><div class="cap-card-title">Bullpadel en Premier Padel</div><div class="cap-card-text">Varios jugadores del equipo Bullpadel compiten en el circuito Premier Padel, dando visibilidad de primer nivel a la marca.</div></div>
            </div>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">Otros circuitos relevantes</div>
            <div class="cap-table-wrap">
              <table class="cap-table">
                <thead><tr><th>Circuito</th><th>Ámbito</th><th>Por qué importa</th></tr></thead>
                <tbody>
                  <tr><td>FIP Gold / Silver</td><td>Internacional</td><td>Torneos de desarrollo para jugadores de nivel avanzado</td></tr>
                  <tr><td>APT Padel Tour</td><td>Latinoamérica</td><td>El circuito profesional más importante de Sudamérica</td></tr>
                  <tr><td>Circuito Argentino</td><td>Argentina</td><td>Torneos nacionales y provinciales, muy activos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `
      },
      {
        title: "Por qué es el momento",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">La oportunidad de mercado</div>
            <div class="cap-p">El pádel en Argentina está en su momento de mayor crecimiento histórico. Nuevas canchas abren cada semana, los clubes tradicionales de tenis y fútbol incorporan pádel, y el deporte se consolida en segmentos etarios y sociales muy amplios.</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Jugadores nuevos</div><div class="cap-card-text">Miles de personas se inician cada mes — el mercado de palas de iniciación y avanzada crece sostenidamente.</div></div>
              <div class="cap-card"><div class="cap-card-title">Jugadores en evolución</div><div class="cap-card-text">El jugador que empezó hace 2-3 años ya está listo para dar el salto a una pala de mayor rendimiento.</div></div>
              <div class="cap-card"><div class="cap-card-title">Jugadores competitivos</div><div class="cap-card-text">El circuito amateur crece — hay más jugadores que participan en torneos y necesitan equipamiento de nivel.</div></div>
            </div>
            <div class="cap-highlight" style="margin-top:12px"><strong>Para el vendedor:</strong> en este contexto, cada cliente que entra a la tienda representa una oportunidad de venta que va más allá de la pala. Pelotas, accesorios, indumentaria — el ticket promedio puede ser significativamente mayor con el asesoramiento correcto.</div>
          </div>
        `
      }
    ]
  },
  {
    num: 3,
    label: "Módulo 3",
    name: "Conocer el producto",
    desc: "Dominar la gama Bullpadel 2026: líneas, materiales y tecnologías — explicados con criterio y sin tecnicismos innecesarios.",
    objetivos: ["Identificar las líneas de producto y a qué jugador va cada una","Explicar los materiales clave en lenguaje simple","Conectar tecnologías con beneficios reales","Leer una ficha técnica y traducirla al cliente"],
    checklist: [
          "Identifico las líneas PROLINE, NEXT, ADVANCE, TOUR y JUNIOR.",
          "Puedo explicar la diferencia entre materiales en lenguaje simple.",
          "Sé leer una ficha técnica y traducirla al cliente.",
          "Conecto materiales y tecnologías con beneficios concretos."
        ],
    quiz: { title: "Quiz del módulo", questions: [
          { question: "¿Cuál es la forma correcta de usar una ficha técnica en venta?", options: ["Leer todos los datos sin explicarlos", "Traducir los datos técnicos en beneficios para el jugador", "Usarla para cargar productos en ecommerce", "Usarla solo para definir precios"], correct: 1, explanation: "La ficha técnica debe convertirse en argumentos simples y comerciales." },
          { question: "¿Qué indica el balance de una pala?", options: ["Dónde se siente el peso de la pala", "El precio final", "El stock disponible", "La fecha de lanzamiento"], correct: 0, explanation: "El balance ayuda a entender si la pala se siente más orientada a potencia, control o manejabilidad." },
          { question: "¿Cómo conviene explicar materiales y tecnologías?", options: ["Como nombres técnicos aislados", "Como beneficios concretos en cancha", "Como datos de stock", "Como argumentos médicos"], correct: 1, explanation: "El cliente no compra el nombre técnico; compra el beneficio que siente en el juego." },
          { question: "¿Qué frase representa mejor este módulo?", options: ["No vendas datos. Traducí beneficios.", "Vendé siempre la pala más cara.", "Mostrá solo la pala del jugador profesional.", "No preguntes al cliente."], correct: 0, explanation: "El objetivo del módulo es convertir datos técnicos en argumentos comerciales." }
        ] },
    units: [
      {
        title: "Las líneas de producto",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">La arquitectura de la gama</div>
            <div class="cap-p">Bullpadel organiza su gama en líneas que van del jugador profesional al junior. Cada línea tiene una identidad clara y un perfil de jugador definido.</div>
            <table class="cap-table">
              <thead><tr><th>Línea</th><th>Jugador objetivo</th><th>Materiales</th><th>Precio relativo</th></tr></thead>
              <tbody>
                <tr><td>PROLINE</td><td>Avanzado y profesional</td><td>Carbono premium, MultiEva</td><td>Alto</td></tr>
                <tr><td>NEXT</td><td>Intermedio en evolución</td><td>Glaphite, MultiEva</td><td>Medio-alto</td></tr>
                <tr><td>ADVANCE</td><td>Amateur con criterio</td><td>Glaphite, Evalastic</td><td>Medio</td></tr>
                <tr><td>TOUR</td><td>Iniciación</td><td>Polyglass, SoftEva</td><td>Accesible</td></tr>
                <tr><td>JUNIOR</td><td>Jugadores jóvenes</td><td>Polyglass, Evalastic</td><td>Accesible</td></tr>
              </tbody>
            </table>
            <div class="cap-highlight"><strong>Regla de recomendación:</strong> nunca subestimar al cliente. Un jugador que juegas 4 veces por semana con 2 años de experiencia puede estar listo para PROLINE aunque no lo sepa todavía.</div>
          </div>
        `
      },
      {
        title: "Materiales en lenguaje simple",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">La cara exterior — qué afecta</div>
            <div class="cap-p">El material exterior determina la rigidez de la pala, la salida de bola y la transmisión de sensaciones. A mayor calidad del carbono, mayor precisión — pero también mayor exigencia técnica.</div>
            <table class="cap-table">
              <thead><tr><th>Material</th><th>En simple</th><th>Para quién</th></tr></thead>
              <tbody>
                <tr><td>Carbono 12K / 3K</td><td>Máxima precisión y potencia</td><td>Jugadores avanzados y profesionales</td></tr>
                <tr><td>Fibrix / Aluminized</td><td>Potencia con más comodidad</td><td>Avanzado que cuida el brazo</td></tr>
                <tr><td>Glaphite</td><td>Buen rendimiento, cómoda</td><td>Intermedio en evolución</td></tr>
                <tr><td>Polyglass</td><td>Confort y durabilidad</td><td>Iniciación y junior</td></tr>
              </tbody>
            </table>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">El núcleo EVA — qué afecta</div>
            <div class="cap-p">El núcleo es el corazón de la pala. Determina la sensación de golpeo, la absorción de vibraciones y el nivel de confort.</div>
            <table class="cap-table">
              <thead><tr><th>Núcleo</th><th>En simple</th><th>Para quién</th></tr></thead>
              <tbody>
                <tr><td>MultiEva</td><td>Dos densidades — responde diferente según la bola</td><td>El más versátil — recomendable para casi todos</td></tr>
                <tr><td>CloudEva</td><td>El más blando — máximo confort</td><td>Lesiones, mucho juego, brazo delicado</td></tr>
                <tr><td>SoftEva</td><td>Estable y predecible</td><td>Iniciación y jugadores en aprendizaje</td></tr>
                <tr><td>Evalastic</td><td>Confort duradero</td><td>Amateur y junior</td></tr>
              </tbody>
            </table>
            <div class="cap-highlight"><strong>La pregunta clave para el núcleo:</strong> "¿Tenés alguna molestia en el codo o el hombro?" — Si la respuesta es sí, CloudEva o Elastic Fiber son la primera recomendación.</div>
          </div>
        `
      },
      {
        title: "Cómo leer una ficha técnica",
        recursos: {
          videoUrl:        "https://www.youtube.com/watch?v=RUCyQGcICnM",
          videoLabel:      "Ver video: Cómo leer una ficha técnica",
          infografiaUrl:   "https://drive.google.com/file/d/1_aEbC-EyN4A_Iln4Yiq1-uiFJnrEe8e8/view?usp=sharing",
          infografiaLabel: "Descargar infografía: De dato técnico a argumento de venta",
          frase:           "No vendas datos. Traducí beneficios."
        },
        content: `
          <div class="cap-section">
            <div class="cap-section-title">Los datos que importan</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Forma</div><div class="cap-card-text">Redonda = control. Híbrida = equilibrio. Diamante = potencia. Es lo primero que dice dónde está el centro de gravedad del juego.</div></div>
              <div class="cap-card"><div class="cap-card-title">Balance</div><div class="cap-card-text">Bajo = más control y manejabilidad. Alto = más potencia. El balance en cm indica dónde está el peso de la pala.</div></div>
              <div class="cap-card"><div class="cap-card-title">Peso</div><div class="cap-card-text">Las palas de mujer suelen ser 10-20g más livianas. Más peso no siempre es mejor — depende del juego y la física del jugador.</div></div>
              <div class="cap-card"><div class="cap-card-title">Perfil</div><div class="cap-card-text">El grosor del canto. A mayor perfil, mayor potencial de potencia. 38mm es el estándar en las palas de adulto.</div></div>
              <div class="cap-card"><div class="cap-card-title">Comp. exterior</div><div class="cap-card-text">El material de la cara. Define la rigidez y la sensación de golpeo.</div></div>
              <div class="cap-card"><div class="cap-card-title">Núcleo</div><div class="cap-card-text">La goma interior. Define el confort y la absorción de vibraciones.</div></div>
            </div>
            <div class="cap-highlight" style="margin-top:12px"><strong>Ejercicio práctico:</strong> tomá una pala del showroom y describila usando solo estos 6 parámetros, sin leer la ficha. Luego comprobá. Si coincidís en 4 de 6, estás listo para el piso de ventas.</div>
          </div>
        `
      }
    ]
  },
  {
    num: 4,
    label: "Módulo 4",
    name: "El vendedor Bullpadel",
    desc: "Integrar todo el conocimiento en una venta consultiva real: del primer contacto a la fidelización.",
    objetivos: ["Aplicar el flujo de venta en situaciones reales","Conectar el perfil del jugador con la pala correcta","Usar el método FABS con naturalidad","Generar una experiencia que fidelice al cliente"],
    checklist: [
          "Aplico el flujo de venta en situaciones reales.",
          "Conozco el perfil de jugador y puedo recomendar según él.",
          "Uso el método FABS con naturalidad.",
          "Respondo objeciones conectando necesidad con beneficio."
        ],
    quiz: { title: "Quiz del módulo", questions: [
          { question: "¿Cuál es el rol del vendedor Bullpadel?", options: ["Mostrar productos sin preguntar", "Actuar como asesor especializado", "Vender solo por precio", "Recomendar siempre la pala profesional"], correct: 1, explanation: "El vendedor debe entender al cliente y recomendar según necesidad, nivel y estilo." },
          { question: "¿Cuál es una buena primera acción antes de recomendar?", options: ["Preguntar cómo juega y qué busca mejorar", "Mostrar la pala más cara", "Hablar solo de tecnología", "Cerrar la venta rápido"], correct: 0, explanation: "Una buena recomendación empieza con una buena pregunta." },
          { question: "¿Cómo se debe responder a una objeción?", options: ["Forzando la venta", "Escuchando, aclarando y conectando necesidad con beneficio", "Ignorando la duda", "Cambiando de tema"], correct: 1, explanation: "Responder objeciones requiere entender la preocupación y traducirla en una recomendación útil." },
          { question: "¿Qué frase resume mejor el rol del asesor?", options: ["La mejor pala es la más técnica", "La mejor pala es la que mejor acompaña al jugador", "La mejor pala es la más cara", "La mejor pala es la que tenga más tecnologías"], correct: 1, explanation: "La recomendación correcta depende del jugador, no solo del producto." }
        ] },
    units: [
      {
        title: "El asesor especializado",
        recursos: {
          videoUrl:        "https://youtu.be/HncgWSHBsGw",
          videoLabel:      "Ver video: Perfil del jugador y recomendación",
          infografiaUrl:   "https://drive.google.com/file/d/1l57yHELJ5YkX9vIqkxEKOIbansfXjHGS/view?usp=sharing",
          infografiaLabel: "Descargar infografía: Perfil del jugador y recomendación",
          frase:           "La mejor recomendación empieza con una buena pregunta."
        },
        content: `
          <div class="cap-section">
            <div class="cap-section-title">El cambio de rol</div>
            <div class="cap-p">En el contexto actual del pádel argentino, el vendedor dejó de ser un intermediario entre el producto y el cliente. Hoy es un <strong>asesor especializado</strong> cuyo valor está en la interpretación y la recomendación, no en la transacción.</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Antes</div><div class="cap-card-text">El cliente no sabía nada. El vendedor mostraba opciones. La venta dependía del stock y del precio.</div></div>
              <div class="cap-card"><div class="cap-card-title">Hoy</div><div class="cap-card-text">El cliente investigó. Llega con opiniones. La venta depende de la confianza que genera el asesor.</div></div>
            </div>
            <div class="cap-highlight" style="margin-top:12px">El cliente que confía en el asesor reduce sus dudas, toma decisiones más rápido y tiene más probabilidad de volver. La venta es consecuencia de la relación, no al revés.</div>
          </div>
          <div class="cap-section">
            <div class="cap-section-title">Qué espera el cliente de Bullpadel</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">Conocimiento técnico</div><div class="cap-card-text">Que le expliquen la diferencia real entre modelos, no que le repitan la ficha.</div></div>
              <div class="cap-card"><div class="cap-card-title">Recomendación clara</div><div class="cap-card-text">Que le digan cuál es la pala para su juego, no que le muestren 10 opciones.</div></div>
              <div class="cap-card"><div class="cap-card-title">Cercanía</div><div class="cap-card-text">Que hablen "de jugador a jugador" — que entiendan lo que siente en la pista.</div></div>
              <div class="cap-card"><div class="cap-card-title">Seguridad</div><div class="cap-card-text">Que le transmitan que están haciendo la elección correcta.</div></div>
            </div>
          </div>
        `
      },
      {
        title: "Situaciones de venta frecuentes",
        recursos: {
          videoUrl:        "https://www.youtube.com/watch?v=zy7CPZWvBxA",
          videoLabel:      "Ver video: Argumentos de venta y objeciones",
          infografiaUrl:   "https://drive.google.com/file/d/11lVuqw_dpSaHLmeSkT92Pc30FoCoKFzC/view?usp=sharing",
          infografiaLabel: "Descargar infografía: Argumentos de venta y objeciones",
          frase:           "No vendas características aisladas. Vendé beneficios."
        },
        content: `
          <div class="cap-section">
            <div class="cap-section-title">Casos reales del mostrador</div>
            <div class="cap-highlight" style="margin-bottom:16px">Estos son los escenarios más frecuentes. Practicar la respuesta hasta que salga natural es el objetivo de este módulo.</div>
            <table class="cap-table">
              <thead><tr><th>Situación</th><th>Qué hacer</th><th>Frase orientativa</th></tr></thead>
              <tbody>
                <tr><td>"No sé qué pala comprar"</td><td>Detección completa — no saltear preguntas</td><td>"Contame cómo jugás y te ayudo a encontrar la que más te conviene."</td></tr>
                <tr><td>"Quiero la más cara"</td><td>Validar que es la correcta para su nivel</td><td>"Antes de elegir, contame cómo jugás — así me aseguro de que sea la mejor para vos."</td></tr>
                <tr><td>"Me duele el codo"</td><td>CloudEva / Elastic Fiber + Hesacore + Vibradrive</td><td>"Tenemos palas especialmente pensadas para eso — el material absorbe las vibraciones antes de que lleguen al brazo."</td></tr>
                <tr><td>"Vi una más barata en internet"</td><td>No competir por precio — competir por valor</td><td>"Lo que te llevo diferente es el asesoramiento y la garantía de que estás eligiendo bien para tu juego."</td></tr>
                <tr><td>"Es para regalar"</td><td>Preguntar por el jugador — no asumir nivel</td><td>"¿Cuánto juega la persona? Así te recomiendo algo que le venga bien, no solo lindo."</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        title: "El asesor completo",
        content: `
          <div class="cap-section">
            <div class="cap-section-title">El checklist del buen asesor</div>
            <div class="cap-cards">
              <div class="cap-card"><div class="cap-card-title">✓ Conoce la gama</div><div class="cap-card-text">Sabe qué pala recomendar según el perfil sin consultar la ficha técnica.</div></div>
              <div class="cap-card"><div class="cap-card-title">✓ Escucha primero</div><div class="cap-card-text">Hace preguntas antes de mostrar productos. No supone el nivel del cliente.</div></div>
              <div class="cap-card"><div class="cap-card-title">✓ Habla simple</div><div class="cap-card-text">Traduce las tecnologías a beneficios concretos. No recita especificaciones.</div></div>
              <div class="cap-card"><div class="cap-card-title">✓ Cierra con seguridad</div><div class="cap-card-text">Transmite convicción en la recomendación. No duda ni da demasiadas opciones.</div></div>
              <div class="cap-card"><div class="cap-card-title">✓ Completa la experiencia</div><div class="cap-card-text">Sugiere accesorios con argumento. Piensa en el ticket completo, no solo en la pala.</div></div>
              <div class="cap-card"><div class="cap-card-title">✓ Fideliza</div><div class="cap-card-text">El cliente se va sabiendo que puede volver a consultar. No solo compró — encontró su asesor.</div></div>
            </div>
            <div class="cap-highlight" style="margin-top:16px"><strong>El objetivo final:</strong> que el cliente no solo quede satisfecho con la compra, sino que recomiende la tienda por la calidad del asesoramiento. Ese es el diferencial que ninguna plataforma de e-commerce puede replicar.</div>
          </div>
        `
      }
    ]
  }
];


// -- PALAS_COMPETENCIA (RUN 15B) -- movido aqui sin cambios ------------

const PALAS_COMPETENCIA = [
  {
    id:"nox-at10-luxury-genius-18k-alum-2026", marca:"NOX", modelo:"AT10 Luxury Genius 18K Alum 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"AT10",
    forma:"Lágrima / Drop", balance:null, balanceNota:"ajustable por Weight Balance", peso:"360-375 g",
    nivel:"Profesional", estilo:"Polivalente",
    superficie:"Carbon Fiber 18K Alum", nucleo:"MLD Black EVA", tactoSensacion:"Intermedia",
    tecnologias:["Weight Balance", "Chromic Paint", "Dual Spin", "Carbon 18K Alum", "MLD Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador que busca una pala de alto rendimiento, polivalente, con balance configurable y buena generación de efecto.",
    fortalezas:["Polivalencia", "ajuste de balance", "efecto", "combinación potencia/control"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-at10-genius-18k-alum-2026-by-agustin-tapia",
    bullpadelEquivalente1:"Vertex 05",
    bullpadelEquivalente2:"Hack 04 Hybrid 26",
    bullpadelEquivalente3:"Neuron 02",
    motivoEquivalencia:"Equivalencia sugerida por perfil premium polivalente: Vertex 05 cubre potencia/control de alto rendimiento; Hack 04 Hybrid suma alternativa de contraataque con balance más manejable; Neuron 02 cubre el ángulo de control técnico PROLINE.",
    argumentoComercialNeutro:"Si el cliente llega mirando una AT10 polivalente premium, conviene mostrar primero Vertex 05 como opción completa PROLINE y luego abrir la comparación con Hack Hybrid o Neuron según si prioriza contraataque o control.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX. Equivalencias Bullpadel pendientes de validación interna."
  },
  {
    id:"nox-at10-luxury-genius-attack-18k-alum-2026", marca:"NOX", modelo:"AT10 Luxury Genius ATTACK 18K Alum 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"AT10",
    forma:"Diamante", balance:"Alto / ataque", balanceNota:null, peso:"360-375 g",
    nivel:"Profesional", estilo:"Ofensivo / agresivo",
    superficie:"Carbon Fiber 18K Alum", nucleo:"MLD Black EVA", tactoSensacion:"Intermedia",
    tecnologias:["Weight Balance", "Chromic Paint", "Dual Spin", "Carbon 18K Alum", "MLD Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador que prioriza potencia, pegada y juego agresivo, con precisión en golpes de definición.",
    fortalezas:["Potencia", "ataque", "balance alto", "precisión", "efecto"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-at10-genius-attack-18k-alum-2026-by-agustin-tapia",
    bullpadelEquivalente1:"XPLO 26",
    bullpadelEquivalente2:"Hack 04 26",
    bullpadelEquivalente3:"Vertex 05 Geo",
    motivoEquivalencia:"Equivalencia sugerida por ataque, formato diamante/balance alto y búsqueda de máxima prestación. XPLO 26 es la opción Bullpadel más orientada a potencia; Hack 04 26 cubre potencia dinámica; Vertex 05 Geo aporta potencia con mayor área de contacto.",
    argumentoComercialNeutro:"Para un jugador que pide una pala de ataque premium, la terna lógica en Bullpadel es XPLO, Hack y Vertex Geo: tres formas distintas de construir potencia dentro de PROLINE.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX. Equivalencias Bullpadel pendientes de validación interna."
  },
  {
    id:"nox-at10-luxury-genius-12k-alum-xtrem-2026", marca:"NOX", modelo:"AT10 Luxury Genius 12K Alum XTREM 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"AT10",
    forma:"Lágrima / Drop", balance:null, balanceNota:"ajustable por Weight Balance", peso:"360-375 g",
    nivel:"Profesional", estilo:"Polivalente",
    superficie:"Carbon Fiber 12K Alum XTREM", nucleo:"HR3 Black EVA", tactoSensacion:"Intermedia-dura",
    tecnologias:["Weight Balance", "Chromic Paint", "Dual Spin", "Carbon 12K Alum XTREM", "HR3 Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador que busca equilibrio entre potencia y control con una sensación más firme que la versión 18K.",
    fortalezas:["Potencia/control", "efecto", "sensación firme", "estabilidad"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-at10-genius-12k-alum-xtrem-2026-by-agustin-tapia",
    bullpadelEquivalente1:"Vertex 05",
    bullpadelEquivalente2:"Neuron 02 Edge",
    bullpadelEquivalente3:"Hack 04 Hybrid 26",
    motivoEquivalencia:"Equivalencia sugerida por pala premium polivalente de sensación firme. Vertex 05 es la alternativa completa; Neuron 02 Edge suma control técnico con potencia; Hack 04 Hybrid agrega una opción PROLINE más estable y manejable para contraataque.",
    argumentoComercialNeutro:"Si busca una AT10 12K firme y equilibrada, mostraría Vertex 05 como opción principal y después Neuron Edge o Hack Hybrid según si el cliente habla más de precisión o de defensa/contraataque.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media-Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX. Balance final a validar por sistema ajustable Weight Balance."
  },
  {
    id:"nox-at10-luxury-genius-12k-alum-xtrem-lite-2026", marca:"NOX", modelo:"AT10 Luxury Genius 12K Alum XTREM Lite 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"AT10",
    forma:"Lágrima / Drop", balance:null, balanceNota:"ajustable por Weight Balance", peso:"355-365 g",
    nivel:"Profesional", estilo:"Polivalente",
    superficie:"Carbon Fiber 12K Alum XTREM", nucleo:"HR3 White EVA", tactoSensacion:"Blanda / Soft",
    tecnologias:["Weight Balance", "Dual Spin", "Carbon 12K Alum XTREM", "HR3 White EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Versión más liviana orientada a balance potencia/control con mayor facilidad de manejo.",
    fortalezas:["Maniobrabilidad", "control", "potencia", "efecto", "peso más bajo"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-at10-genius-12k-alum-xtrem-lite-2026-by-agustin-tapia",
    bullpadelEquivalente1:"Vertex 05 W",
    bullpadelEquivalente2:"Wonder",
    bullpadelEquivalente3:"Pearl 26",
    motivoEquivalencia:"Equivalencia sugerida por peso más bajo, maniobrabilidad y perfil premium. Vertex 05 W y Wonder cubren rendimiento PROLINE liviano/polivalente; Pearl 26 suma una alternativa liviana con perfil más ofensivo.",
    argumentoComercialNeutro:"Para un cliente que quiere una pala premium más liviana, estas opciones Bullpadel permiten hablar de velocidad de mano, manejabilidad y rendimiento sin llevarlo a una pala pesada.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX. Equivalencias Bullpadel pendientes."
  },
  {
    id:"nox-ea10-ventus-hybrid-12k-xtrem-2026", marca:"NOX", modelo:"EA10 Ventus Hybrid 12K XTREM 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Ventus / EA10",
    forma:"Lágrima / Drop", balance:"Equilibrado", balanceNota:null, peso:"360-375 g",
    nivel:"Profesional", estilo:"Polivalente",
    superficie:"Carbon Fiber 12K XTREM", nucleo:"MLD Black EVA", tactoSensacion:"Intermedia-dura",
    tecnologias:["Dual Spin", "Carbon 12K XTREM", "MLD Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador versátil que busca equilibrio entre agilidad, potencia y control.",
    fortalezas:["Agilidad", "equilibrio", "potencia/control", "efecto"],
    fuenteOficialUrl:"https://noxsport.com/en/products/ea10-ventus-hybrid-12k-xtrem-by-edu-alonso",
    bullpadelEquivalente1:"Vertex 05 Hybrid",
    bullpadelEquivalente2:"Neuron 02",
    bullpadelEquivalente3:"Hack 04 Hybrid 26",
    motivoEquivalencia:"Equivalencia sugerida por perfil híbrido/polivalente de alta prestación. Vertex 05 Hybrid se acerca por balance más manejable y control; Neuron 02 por precisión; Hack 04 Hybrid por contraataque y estabilidad.",
    argumentoComercialNeutro:"Si el cliente busca una pala híbrida premium para adaptarse a distintas situaciones, conviene comparar Vertex Hybrid, Neuron y Hack Hybrid para mostrar tres lecturas de control/rendimiento.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX."
  },
  {
    id:"nox-ea10-ventus-attack-12k-xtrem-2026", marca:"NOX", modelo:"EA10 Ventus Attack 12K XTREM 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Ventus / EA10",
    forma:"Diamante", balance:"Alto / ataque", balanceNota:null, peso:"360-375 g",
    nivel:"Profesional", estilo:"Ofensivo / agresivo",
    superficie:"Carbon Fiber 12K XTREM", nucleo:"MLD Black EVA", tactoSensacion:"Intermedia-dura",
    tecnologias:["Dual Spin", "Carbon 12K XTREM", "MLD Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador de ataque que busca potencia y precisión con formato diamante y balance alto.",
    fortalezas:["Potencia", "ataque", "precisión", "efecto", "balance alto"],
    fuenteOficialUrl:"https://noxsport.com/en/products/ea10-ventus-attack-12k-xtrem-by-edu-alonso",
    bullpadelEquivalente1:"XPLO 26",
    bullpadelEquivalente2:"Hack 04 26",
    bullpadelEquivalente3:"Vertex 05 Geo",
    motivoEquivalencia:"Equivalencia sugerida por ataque de alta prestación, formato diamante y balance alto. XPLO 26 cubre máxima potencia; Hack 04 26 potencia dinámica; Vertex 05 Geo potencia con mayor zona de contacto.",
    argumentoComercialNeutro:"Para un jugador ofensivo que busca definir, Bullpadel tiene una escalera muy clara: XPLO si quiere explosividad, Hack si quiere potencia dinámica y Vertex Geo si quiere potencia con dirección.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX."
  },
  {
    id:"nox-ml10-ventus-control-3k-2026", marca:"NOX", modelo:"ML10 Ventus Control 3K 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Ventus / ML10",
    forma:"Redonda", balance:"Equilibrado", balanceNota:null, peso:"360-375 g",
    nivel:"Profesional", estilo:"Control / precisión",
    superficie:"Carbon Fiber 3K", nucleo:"HR3 Color EVA", tactoSensacion:"Intermedia",
    tecnologias:["Dual Spin", "Carbon 3K", "HR3 Color EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador que busca control, punto dulce amplio y una respuesta equilibrada.",
    fortalezas:["Control", "precisión", "punto dulce amplio", "estabilidad"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-ml10-ventus-3k-by-miguel-lamperti",
    bullpadelEquivalente1:"Neuron 02",
    bullpadelEquivalente2:"Vertex 05 Hybrid",
    bullpadelEquivalente3:"Ionic Control 26",
    motivoEquivalencia:"Equivalencia sugerida por control y punto dulce. Neuron 02 es la opción PROLINE más técnica de control; Vertex 05 Hybrid suma control/manejabilidad en gama alta; Ionic Control 26 funciona como alternativa NEXT más accesible para jugador intermedio.",
    argumentoComercialNeutro:"Si el cliente mira una ML10 de control, la conversación Bullpadel puede ir hacia Neuron si quiere PROLINE, Vertex Hybrid si quiere control con más prestación o Ionic Control si busca algo más accesible.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media-Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX."
  },
  {
    id:"nox-vk10-ventus-2026", marca:"NOX", modelo:"VK10 Ventus 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Ventus / VK10",
    forma:"Redonda", balance:"Equilibrado", balanceNota:null, peso:"360-375 g",
    nivel:"Profesional", estilo:"Control / precisión",
    superficie:"Carbon Fiber 12K", nucleo:"MLD Black EVA", tactoSensacion:"Intermedia-dura",
    tecnologias:["Dual Spin", "Carbon 12K", "MLD Black EVA", "Carbon Frame", "EOS Tunnel", "Smartstrap", "Custom Grip", "Pulse System", "DCS"],
    perfilJugador:"Jugador que busca control, punto dulce amplio y sensación firme/intermedia-dura.",
    fortalezas:["Control", "punto dulce amplio", "precisión", "estabilidad"],
    fuenteOficialUrl:"https://noxsport.com/en/products/pala-vk10-ventus-12k-by-aranzazu-osoro",
    bullpadelEquivalente1:"Neuron 02",
    bullpadelEquivalente2:"Vertex 05 Hybrid",
    bullpadelEquivalente3:"Hack 02 Advance",
    motivoEquivalencia:"Equivalencia sugerida por control firme y formato redondo/orientado a precisión. Neuron 02 cubre el segmento PROLINE técnico; Vertex 05 Hybrid cubre control de alta gama con forma híbrida; Hack 02 Advance ofrece lectura redonda y más accesible.",
    argumentoComercialNeutro:"Para un jugador que pide control premium, arrancaría por Neuron. Si busca algo más manejable en PROLINE, Vertex Hybrid; si quiere bajar exigencia, Hack 02 Advance.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos técnicos tomados de ficha oficial NOX."
  },
  {
    id:"adidas-metalbone-2026", marca:"Adidas", modelo:"Metalbone 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Metalbone",
    forma:"Diamante", balance:"Alto / Head Heavy", balanceNota:null, peso:"345-360 g + hasta 11,2 g ajustables",
    nivel:"PRO", estilo:"Ataque",
    superficie:"Carbon Aluminized 16K", nucleo:"Soft Performance EVA", tactoSensacion:null,
    tecnologias:["Weight & Balance System", "Power Groove", "Extra Power Grip", "Octagonal Structure", "Low Poly", "Spin Blade Decal", "Smart Holes Curve", "Structural Reinforcement"],
    perfilJugador:"Jugador ofensivo que busca personalización de peso/balance, potencia y rendimiento alto.",
    fortalezas:["Potencia", "personalización", "efecto", "rigidez estructural"],
    fuenteOficialUrl:"https://www.adidas.com/us/metalbone-2026/KL2612.html",
    bullpadelEquivalente1:"XPLO 26",
    bullpadelEquivalente2:"Hack 04 26",
    bullpadelEquivalente3:"Vertex 05 Geo",
    motivoEquivalencia:"Equivalencia sugerida por pala premium de ataque con posibilidad de ajuste/personalización. XPLO 26 es la referencia Bullpadel por potencia y Custom Weight; Hack 04 26 cubre potencia dinámica; Vertex 05 Geo suma potencia con área de impacto ampliada.",
    argumentoComercialNeutro:"Si el cliente viene por Metalbone, XPLO es la alternativa Bullpadel más directa por potencia y sistema de peso; Hack y Vertex Geo completan la comparación como opciones PROLINE de ataque.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"La web oficial Adidas confirma modelo; fuente secundaria All For Padel es licensee oficial y aporta ficha técnica completa."
  },
  {
    id:"adidas-metalbone-ctrl-2026", marca:"Adidas", modelo:"Metalbone CTRL 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Metalbone",
    forma:"Redonda", balance:"Equilibrado / Even", balanceNota:null, peso:"345-360 g + hasta 11,2 g ajustables",
    nivel:"PRO", estilo:"Control",
    superficie:"Carbon Aluminized 16K", nucleo:"Soft Performance EVA", tactoSensacion:null,
    tecnologias:["Weight & Balance System", "Power Groove", "Extra Power Grip", "Octagonal Structure", "Low Poly", "Spin Blade Decal", "Smart Holes Curve", "Structural Reinforcement"],
    perfilJugador:"Jugador que busca control, estabilidad y personalización del balance dentro de gama alta.",
    fortalezas:["Control", "estabilidad", "personalización", "precisión"],
    fuenteOficialUrl:"https://www.adidas.com/us/metalbone-ctrl-2026/KL2613.html",
    bullpadelEquivalente1:"Neuron 02",
    bullpadelEquivalente2:"Vertex 05 Hybrid",
    bullpadelEquivalente3:"Hack 04 Hybrid 26",
    motivoEquivalencia:"Equivalencia sugerida por control premium y personalización de peso/balance. Neuron 02 representa control técnico PROLINE; Vertex 05 Hybrid suma manejo y control; Hack 04 Hybrid abre una alternativa de mayor potencia con balance más manejable.",
    argumentoComercialNeutro:"Para una Metalbone CTRL, no vendería potencia pura: mostraría Neuron como referencia de control y luego Vertex Hybrid/Hack Hybrid según si el cliente quiere más manejo o más salida ofensiva.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"La web oficial Adidas confirma modelo; fuente secundaria licensee aporta ficha técnica completa."
  },
  {
    id:"adidas-metalbone-hrd-2026", marca:"Adidas", modelo:"Metalbone HRD+ 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Metalbone",
    forma:"Diamante", balance:"Alto / Head Heavy", balanceNota:null, peso:"345-360 g + hasta 11,2 g ajustables",
    nivel:"PRO", estilo:"Ataque",
    superficie:"Carbon Aluminized 16K (validar: descripción menciona 15K en una fuente)", nucleo:"High Memory EVA", tactoSensacion:"Dura / alta memoria",
    tecnologias:["Weight & Balance System", "Power Groove", "Extra Power Grip", "Octagonal Structure", "Low Poly", "Spin Blade Decal", "Smart Holes Curve", "Structural Reinforcement"],
    perfilJugador:"Jugador ofensivo que busca mayor rigidez, potencia y una respuesta más exigente.",
    fortalezas:["Potencia", "rigidez", "ataque", "personalización de peso/balance"],
    fuenteOficialUrl:"https://allforpadel.com/en/padel-rackets/7522-padel-racket-adidas-metalbone-hrd-2026-ale-galan-8435739405826.html",
    bullpadelEquivalente1:"Hack 04 26",
    bullpadelEquivalente2:"XPLO 26",
    bullpadelEquivalente3:"Icon 26",
    motivoEquivalencia:"Equivalencia sugerida por ataque premium, tacto firme y alta exigencia. Hack 04 26 encaja por potencia dinámica y sensación más técnica; XPLO 26 por máxima potencia; Icon 26 por perfil ofensivo PROLINE con identidad premium.",
    argumentoComercialNeutro:"Si el cliente busca una pala dura de ataque, Hack 04 26 es la primera comparación. XPLO e Icon permiten mostrar dos alternativas de potencia dentro de Bullpadel.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media-Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"A validar con ficha oficial Adidas si se requiere fuente 100% de dominio adidas. La ficha consultada muestra discrepancia 15K/16K entre descripción y detalle."
  },
  {
    id:"adidas-metalbone-team-2026", marca:"Adidas", modelo:"Metalbone Team 2026",
    temporada:"2026", gama:"Media / Alta", linea:"Metalbone",
    forma:"Diamante", balance:"Alto / High Balance", balanceNota:null, peso:"360-375 g",
    nivel:null, estilo:"Ataque",
    superficie:"Fiberglass", nucleo:"Low-density EVA", tactoSensacion:"Soft touch / salida de bola",
    tecnologias:["Extra Power Grip", "Low Poly", "Spin Blade Gritt", "Octagonal Structure"],
    perfilJugador:"Jugador que busca potencia en ataque con tacto más amable por fibra de vidrio y EVA de baja densidad.",
    fortalezas:["Potencia", "salida de bola", "tacto más suave", "uso frecuente"],
    fuenteOficialUrl:"https://www.adidas.com/om/en/metalbone-team-2026-padel-racket/KL2622.html",
    bullpadelEquivalente1:"Ionic Power 26",
    bullpadelEquivalente2:"Vertex Advance",
    bullpadelEquivalente3:"XPLO Comfort 26",
    motivoEquivalencia:"Equivalencia sugerida por pala de ataque más accesible y tacto amable. Ionic Power 26 cubre potencia NEXT para intermedio; Vertex Advance es alternativa ADVANCE con forma diamante; XPLO Comfort funciona como opción PROLINE aspiracional de mayor prestación pero más accesible que XPLO.",
    argumentoComercialNeutro:"Para un jugador que quiere potencia pero no necesariamente una pala ultra técnica, Ionic Power y Vertex Advance son opciones naturales; XPLO Comfort queda como salto premium.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de web oficial Adidas. Nivel exacto queda A COMPLETAR porque la fuente habla de high-level/frequent use."
  },
  {
    id:"adidas-cross-it-carbon-2026", marca:"Adidas", modelo:"Cross It Carbon 2026",
    temporada:"2026", gama:"Media / Alta", linea:"Cross It",
    forma:"Diamante oversize", balance:"Alto / High Balance", balanceNota:null, peso:"360-375 g",
    nivel:null, estilo:"Ataque / potencia",
    superficie:"Carbon 6K", nucleo:"Low-density EVA", tactoSensacion:null,
    tecnologias:["Dynamic Air Flow", "Extra Power Grip", "11 Thirteen", "Spin Blade Decal", "Smart Holes Curve", "Structural Reinforcement"],
    perfilJugador:"Jugador frecuente de alto nivel que busca potencia, rigidez y respuesta con construcción carbono 6K.",
    fortalezas:["Potencia", "rigidez", "efecto", "durabilidad", "alto rendimiento"],
    fuenteOficialUrl:"https://www.adidas.com/om/en/cross-it-carbon-2026-padel-racket/KL2617.html",
    bullpadelEquivalente1:"XPLO 26",
    bullpadelEquivalente2:"Vertex 05 Geo",
    bullpadelEquivalente3:"Hack 04 26",
    motivoEquivalencia:"Equivalencia sugerida por potencia, formato diamante/oversize y rendimiento alto. XPLO 26 cubre máxima explosividad; Vertex 05 Geo aporta área de contacto y lanzamiento; Hack 04 26 cubre potencia dinámica y rigidez.",
    argumentoComercialNeutro:"Para Cross It Carbon, iría con una comparación de potencia PROLINE: XPLO, Vertex Geo y Hack, explicando que cada una construye la potencia de manera distinta.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de web oficial Adidas. Algunos campos comerciales quedan pendientes de curaduría."
  },
  {
    id:"adidas-cross-it-team-2026", marca:"Adidas", modelo:"Cross It Team 2026",
    temporada:"2026", gama:"Media / Alta", linea:"Cross It",
    forma:"Diamante oversize", balance:"Alto / High Balance", balanceNota:null, peso:"360-375 g",
    nivel:null, estilo:"Ataque / potencia",
    superficie:"Fiberglass", nucleo:"Low-density EVA", tactoSensacion:null,
    tecnologias:["Dynamic Air Flow", "Extra Power Grip", "11 Thirteen", "Spin Blade Decal"],
    perfilJugador:"Jugador frecuente que busca potencia y salida de bola con construcción más amable en fibra de vidrio.",
    fortalezas:["Potencia", "salida de bola", "comodidad", "uso frecuente"],
    fuenteOficialUrl:"https://www.adidas.com/om/en/cross-it-team-2026-padel-racket/KL2624.html",
    bullpadelEquivalente1:"Ionic Power 26",
    bullpadelEquivalente2:"Vertex Advance",
    bullpadelEquivalente3:"XPLO Comfort 26",
    motivoEquivalencia:"Equivalencia sugerida por potencia con construcción más amable y uso frecuente. Ionic Power 26 es la alternativa NEXT; Vertex Advance cubre un perfil amateur con forma diamante; XPLO Comfort suma opción PROLINE de mayor prestación con enfoque más accesible.",
    argumentoComercialNeutro:"Para una Cross It Team, la conversación comercial es potencia usable: Ionic Power o Vertex Advance como opciones accesibles y XPLO Comfort como alternativa premium.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de web oficial Adidas. Nivel exacto pendiente."
  },
  {
    id:"babolat-technical-viper-30-2026", marca:"Babolat", modelo:"Technical Viper 3.0 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Viper / Technical",
    forma:"Diamante", balance:"270 mm", balanceNota:null, peso:"370 g +/- 10 g",
    nivel:null, estilo:"Ataque / potencia",
    superficie:"3K Carbon", nucleo:"Hard EVA", tactoSensacion:"Firme / alta respuesta",
    tecnologias:["Dynamic Stability System", "3K Carbon", "Hard EVA", "A COMPLETAR"],
    perfilJugador:"Jugador técnico-ofensivo que busca potencia, respuesta firme y precisión en golpes de definición.",
    fortalezas:["Potencia", "alta respuesta", "precisión", "estabilidad"],
    fuenteOficialUrl:"https://www.babolat.com/us/technical-viper-3.0/150175.html",
    bullpadelEquivalente1:"Hack 04 26",
    bullpadelEquivalente2:"XPLO 26",
    bullpadelEquivalente3:"Vertex 05 Geo",
    motivoEquivalencia:"Equivalencia sugerida por pala técnica-ofensiva, formato diamante y respuesta firme. Hack 04 26 se acerca por potencia dinámica y exigencia; XPLO 26 por potencia máxima; Vertex 05 Geo por potencia con mayor zona de impacto.",
    argumentoComercialNeutro:"Si el cliente mira Technical Viper, mostraría Hack 04 como comparación principal y luego XPLO/Vertex Geo si quiere más explosividad o más área útil de golpeo.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de ficha oficial Babolat. Balance indicado en mm por la marca."
  },
  {
    id:"babolat-viper-30-2026", marca:"Babolat", modelo:"Viper 3.0 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Viper",
    forma:"Diamante", balance:null, balanceNota:null, peso:"370 g",
    nivel:null, estilo:"Ataque / potencia",
    superficie:"3K Carbon + Added Carbon Power Layer", nucleo:"Hard EVA", tactoSensacion:"Firme / responsive",
    tecnologias:["Added Carbon Power Layer", "3K Carbon", "A COMPLETAR"],
    perfilJugador:"Jugador profesional/ofensivo que prioriza potencia máxima, estabilidad y respuesta sólida.",
    fortalezas:["Potencia", "estabilidad", "precisión", "respuesta sólida"],
    fuenteOficialUrl:"https://www.babolat.com/us/padel-technical-collection-2026.html",
    bullpadelEquivalente1:"XPLO 26",
    bullpadelEquivalente2:"Hack 04 26",
    bullpadelEquivalente3:"Vertex 05 Geo",
    motivoEquivalencia:"Equivalencia sugerida por perfil profesional/ofensivo de máxima potencia. XPLO 26 es la alternativa Bullpadel más directa por explosividad; Hack 04 26 por potencia dinámica; Vertex 05 Geo por potencia y geometría ofensiva.",
    argumentoComercialNeutro:"Para una Viper orientada a potencia, la terna Bullpadel debe ser 100% PROLINE ofensiva: XPLO, Hack y Vertex Geo.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"La colección oficial 2026 aporta la descripción técnica general; completar si se consigue ficha individual."
  },
  {
    id:"babolat-technical-viper-soft-30-2026", marca:"Babolat", modelo:"Technical Viper Soft 3.0 2026",
    temporada:"2026", gama:"Alta / Pro", linea:"Viper / Technical",
    forma:"Diamante", balance:null, balanceNota:null, peso:"365 g",
    nivel:null, estilo:"Ataque / potencia con confort",
    superficie:"3K Soft Carbon / Soft Carbon", nucleo:"Black EVA", tactoSensacion:"Más cómoda / reactiva",
    tecnologias:["Dynamic Stability System", "3K Soft Carbon", "Comfort Power Layer", "A COMPLETAR"],
    perfilJugador:"Jugador ofensivo que busca potencia y una sensación más cómoda que una pala de tacto duro.",
    fortalezas:["Potencia", "confort", "respuesta", "control en ataque"],
    fuenteOficialUrl:"https://www.babolat.com/us/technical-viper-soft-3.0/150179.html",
    bullpadelEquivalente1:"XPLO Comfort 26",
    bullpadelEquivalente2:"Hack 04 Comfort 26",
    bullpadelEquivalente3:"Vertex 05 Comfort",
    motivoEquivalencia:"Equivalencia sugerida por ataque premium con sensación menos exigente. XPLO Comfort y Hack Comfort mantienen perfil ofensivo con una respuesta más amable; Vertex 05 Comfort suma alternativa polivalente PROLINE con foco en confort/rendimiento.",
    argumentoComercialNeutro:"Si el cliente quiere potencia pero pide una sensación más cómoda, las versiones Comfort permiten comparar rendimiento PROLINE sin llevarlo directo a la opción más exigente.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media-Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de fuentes oficiales Babolat. No usar claims médicos en el portal."
  },
  {
    id:"babolat-veron-juan-lebrn-30-2026", marca:"Babolat", modelo:"Veron Juan Lebrón 3.0 2026",
    temporada:"2026", gama:"Alta", linea:"Veron / Juan Lebrón",
    forma:"Diamante", balance:null, balanceNota:null, peso:"360 g",
    nivel:null, estilo:"Ataque / potencia",
    superficie:"Carbon Flex", nucleo:"Black EVA", tactoSensacion:"Confort / jugabilidad",
    tecnologias:["Carbon Flex", "A COMPLETAR"],
    perfilJugador:"Jugador ofensivo que busca potencia, confort y efecto con construcción Carbon Flex.",
    fortalezas:["Potencia", "confort", "efecto", "jugabilidad"],
    fuenteOficialUrl:"https://www.babolat.com/us/padel/racquets.html",
    bullpadelEquivalente1:"Hack 04 Comfort 26",
    bullpadelEquivalente2:"XPLO Comfort 26",
    bullpadelEquivalente3:"Vertex 05 Comfort",
    motivoEquivalencia:"Equivalencia sugerida por pala ofensiva jugable con construcción Carbon Flex/Black EVA. Hack Comfort y XPLO Comfort cubren potencia con sensación más accesible; Vertex 05 Comfort suma equilibrio polivalente con foco en comodidad.",
    argumentoComercialNeutro:"Para una Veron de Juan Lebrón, no iría a la opción más dura: mostraría Comforts de Bullpadel para hablar de potencia, jugabilidad y mayor prestación con sensación más amable.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de página oficial Babolat racquets. Completar ficha individual si se requiere más detalle."
  },
  {
    id:"babolat-air-viper-26", marca:"Babolat", modelo:"Air Viper 2.6",
    temporada:"2026", gama:"Alta / Pro", linea:"Viper / Air",
    forma:"Lágrima / Teardrop", balance:"265 mm", balanceNota:null, peso:"355 g",
    nivel:null, estilo:"Maniobrabilidad / ataque",
    superficie:"16K Carbon", nucleo:"X-EVA", tactoSensacion:"Alta respuesta",
    tecnologias:["16K Carbon", "X-EVA", "A COMPLETAR"],
    perfilJugador:"Jugador rápido que busca maniobrabilidad, respuesta alta y capacidad de acelerar el juego.",
    fortalezas:["Maniobrabilidad", "respuesta", "velocidad", "confort"],
    fuenteOficialUrl:"https://www.babolat.com/us/air-viper-2.6/150176.html",
    bullpadelEquivalente1:"Pearl 26",
    bullpadelEquivalente2:"Vertex 05 W",
    bullpadelEquivalente3:"Flow Legend",
    motivoEquivalencia:"Equivalencia sugerida por maniobrabilidad, peso reducido y ataque rápido. Pearl 26 aporta potencia liviana; Vertex 05 W suma rendimiento PROLINE con peso optimizado; Flow Legend cubre potencia/ligereza en una pala ágil.",
    argumentoComercialNeutro:"Si el cliente busca velocidad de mano y ataque rápido, Pearl, Vertex W y Flow Legend permiten mostrar Bullpadel desde la agilidad y no solo desde la potencia bruta.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de ficha oficial Babolat y página de racquets."
  },
  {
    id:"babolat-air-veron-26", marca:"Babolat", modelo:"Air Veron 2.6",
    temporada:"2026", gama:"Alta", linea:"Veron / Air",
    forma:"Lágrima / Teardrop", balance:null, balanceNota:null, peso:"355 g",
    nivel:null, estilo:"Maniobrabilidad / polivalente ofensiva",
    superficie:"Carbon Flex", nucleo:"Black EVA", tactoSensacion:"Jugabilidad / confort",
    tecnologias:["Carbon Flex", "A COMPLETAR"],
    perfilJugador:"Jugador que busca maniobrabilidad, jugabilidad y sensación cómoda en una pala rápida.",
    fortalezas:["Maniobrabilidad", "jugabilidad", "confort", "velocidad"],
    fuenteOficialUrl:"https://www.babolat.com/us/padel/racquets.html",
    bullpadelEquivalente1:"Wonder",
    bullpadelEquivalente2:"Elite W",
    bullpadelEquivalente3:"Ionic Light 26",
    motivoEquivalencia:"Equivalencia sugerida por maniobrabilidad, jugabilidad y perfil polivalente. Wonder y Elite W cubren opciones PROLINE livianas y completas; Ionic Light 26 es alternativa NEXT versátil para jugador intermedio.",
    argumentoComercialNeutro:"Para una Air Veron, la conversación puede enfocarse en facilidad para acelerar y manejar la pala: Wonder/Elite como opciones premium y Ionic Light como alternativa más accesible.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de página oficial Babolat racquets. Completar ficha individual si se requiere."
  },
  {
    id:"babolat-counter-veron-26", marca:"Babolat", modelo:"Counter Veron 2.6",
    temporada:"2026", gama:"Alta", linea:"Veron / Counter",
    forma:"Redonda", balance:null, balanceNota:null, peso:"365 g",
    nivel:null, estilo:"Control / precisión",
    superficie:"Carbon Flex", nucleo:"Black EVA", tactoSensacion:"Jugabilidad / confort",
    tecnologias:["Carbon Flex", "A COMPLETAR"],
    perfilJugador:"Jugador que busca precisión, jugabilidad y confort en una pala de formato redondo.",
    fortalezas:["Precisión", "control", "jugabilidad", "confort"],
    fuenteOficialUrl:"https://www.babolat.com/us/padel/racquets.html",
    bullpadelEquivalente1:"Neuron 02 Cloud",
    bullpadelEquivalente2:"Vertex 05 Hybrid",
    bullpadelEquivalente3:"Ionic Control 26",
    motivoEquivalencia:"Equivalencia sugerida por control, precisión y sensación confortable. Neuron 02 Cloud representa control PROLINE con sensación más blanda; Vertex 05 Hybrid suma manejo y control de alta prestación; Ionic Control 26 es alternativa NEXT de control.",
    argumentoComercialNeutro:"Para un cliente que quiere control y jugabilidad, mostraría Neuron Cloud como opción premium, Vertex Hybrid como opción PROLINE más técnica y Ionic Control como alternativa más simple.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de página oficial Babolat racquets. Completar ficha individual si se requiere."
  },
  {
    id:"babolat-air-vertuo-26", marca:"Babolat", modelo:"Air Vertuo 2.6",
    temporada:"2026", gama:"Media", linea:"Vertuo / Air",
    forma:"Lágrima / Teardrop", balance:null, balanceNota:null, peso:"345 g",
    nivel:null, estilo:"Maniobrabilidad / confort",
    superficie:"Fiberglass", nucleo:"Black EVA", tactoSensacion:"Confort / salida de bola",
    tecnologias:[],
    perfilJugador:"Jugador que busca una pala liviana, manejable, cómoda y con buena salida de bola.",
    fortalezas:["Maniobrabilidad", "confort", "facilidad de uso", "salida de bola"],
    fuenteOficialUrl:"https://www.babolat.com/us/padel/racquets.html",
    bullpadelEquivalente1:"Ionic Light 26",
    bullpadelEquivalente2:"Indiga W 26",
    bullpadelEquivalente3:"Indiga CTR 26",
    motivoEquivalencia:"Equivalencia sugerida por facilidad de uso, peso bajo, manejabilidad y salida de bola. Ionic Light 26 cubre una opción NEXT versátil; Indiga W 26 e Indiga CTR 26 cubren alternativas TOUR de iniciación/control.",
    argumentoComercialNeutro:"Para una Air Vertuo, conviene mantener la comparación en facilidad: Ionic Light si quiere subir de gama, Indiga W o CTR si prioriza comodidad, control y manejo simple.",
    estadoEquivalenciaBullpadel:"Sugerida - pendiente validación comercial",
    confianzaSugerida:"Media-Alta",
    validadoPor:null,
    fechaValidacion:"2026-06-18",
    notasInternas:"Datos tomados de página oficial Babolat racquets. Completar tecnologías específicas."
  },
];


/* ── 9. MEDIA CENTER ───────────────────────────────────────────────────── */
// Índice de acceso a material de marketing y producto alojado en Google Drive.
// El portal no aloja estos archivos: cada card es un link externo que abre
// la carpeta de Drive correspondiente en una pestaña nueva.
// Datos generados a partir de media_links.json — no inventar categorías,
// subcarpetas ni URLs que no estén en esa fuente.

const MEDIA_CENTER = {
  "01 Imagenes de Marketing": {
    url: "https://drive.google.com/drive/folders/1PQfgUf897AL0dhLLeziTHAKNhLDpbI2N",
    subcarpetas: [
      { nombre: "01 Videos 26",             url: "https://drive.google.com/drive/folders/1MlPrE8KK49NSwLDwlMYsD3-FkAGNALK8" },
      { nombre: "02 Banners Web 26",         url: "https://drive.google.com/drive/folders/1hlfqR9pjeCFXzDLkGaQEhDvM0P4Dm3w3" },
      { nombre: "03 Alta resolución 26",     url: "https://drive.google.com/drive/folders/1bgGoYbKl4WJemYiq_7V3RLJIdaKSExCZ" },
      { nombre: "04 Jugadores 26",           url: "https://drive.google.com/drive/folders/1lwOlFZwABGdynm6YNVIzm6WwzKl1wxaz" },
      { nombre: "05 Premier padel 2026",     url: "https://drive.google.com/drive/folders/1zRf0GKr_93tQVFwXGZh14VO71rKYN3Ku" },
      { nombre: "06 Videos 25",              url: "https://drive.google.com/drive/folders/19-XdbkrmKhpwWN4YG0dTyqjGzIO4rMww" },
      { nombre: "07 Banners Web 25",         url: "https://drive.google.com/drive/folders/1UDME3ocBvRDOpmlmZNunI7ZjehGw5k8q" },
      { nombre: "08 Alta resolución 25",     url: "https://drive.google.com/drive/folders/1rhu0PCDJ4tuaY3O-YJafmuDpI1661HGR" }
    ]
  },
  "02 Imagenes de producto": {
    url: "https://drive.google.com/drive/folders/19gw7bCYI0uRBOqyKPQriTyX3zpSm9yNG",
    subcarpetas: [
      { nombre: "01 Palas 2026",             url: "https://drive.google.com/drive/folders/1pcs8zocfVJTVWXXCmJerED8_WFM8SXjs" },
      { nombre: "02 Textil 2026",            url: "https://drive.google.com/drive/folders/1d8s-x7Iy7GF9epGES8FH9i5Me5stbhjv" },
      { nombre: "03 Bolsos 2026",            url: "https://drive.google.com/drive/folders/1-TH7zR3j6JJyUCex1NvAVJ52a_9HFVKp" },
      { nombre: "04 Calzado 2026",           url: "https://drive.google.com/drive/folders/1zdQe4Mm3DA66Ghock-1cmXG_MBVvxBMB" },
      { nombre: "05 Palas ARG 2026",         url: "https://drive.google.com/drive/folders/1CI1mPYSn-tiBheT_47c0QFQjsLxcL4qW" },
      { nombre: "06 Palas Onyx 2.0",         url: "https://drive.google.com/drive/folders/1n3Yxe74fmUKQga8bGjapBn5UHE0ZQo5_" },
      { nombre: "07 Palas premier 2026",     url: "https://drive.google.com/drive/folders/1Z8hrXrT8m9-_vF6Vp3j1ofgmgkBsCo_z" },
      { nombre: "08 Palas Apache 32",        url: "https://drive.google.com/drive/folders/1nWMXK-vnXMMRej2CQgr6EgWb9G0yJ4L4" },
      { nombre: "09 Línea APA",              url: "https://drive.google.com/drive/folders/1UgHGmPUfGSRwCni4_tSuGVe-IhB8hGLs" },
      { nombre: "10 Pack Vertex 25",         url: "https://drive.google.com/drive/folders/1tJwWtYWGKzdLjKK54yByQLesGm0Ox8-g" },
      { nombre: "11 Remeras de jugadores",   url: "https://drive.google.com/drive/folders/1Ss_UjtwoLPSX2OXWZYJYAxE7MlUyoQKi" },
      { nombre: "12 Accesorios Atemporales", url: "https://drive.google.com/drive/folders/1s2doYjwqgmRiE16GAwLDer0nWX20ozfT" },
      { nombre: "13 Complementarios",        url: "https://drive.google.com/drive/folders/14xpDzCi1CWJZDDzrkR2hizPgg7Qx0Oma" }
    ]
  },
  "03 Archivo Historico": {
    url: "https://drive.google.com/drive/folders/11GiVIZsYNdxLaVyjx-pIASsDvHPavKLU",
    subcarpetas: [
      { nombre: "01 Palas 2025",             url: "https://drive.google.com/drive/folders/1c_p52AlWnN7CbvuNno0MkxQvHyMFWLo9" },
      { nombre: "02 Palas Tour Final 25",    url: "https://drive.google.com/drive/folders/1SOwEm25JRfIgnO_QWFgwYRHJNpxUdJuy" },
      { nombre: "03 Palas premier 2025",     url: "https://drive.google.com/drive/folders/19gEwxv4mQTGY14pCLCmuJnMiQVgzJDJf" },
      { nombre: "04 Calzado 2025",           url: "https://drive.google.com/drive/folders/1L3mJtuMR0SETi1A87YatUNcHXBO7_T-S" },
      { nombre: "05 Bolsos y mochilas 2025", url: "https://drive.google.com/drive/folders/1Q_5u6gH-0O0aSCRJzK0GYmX9xUWe3wt5" },
      { nombre: "06 Textil 2025",            url: "https://drive.google.com/drive/folders/1wZ7VsKCSAwwI3rlgwr45PS93AWzjiG9m" },
      { nombre: "07 2024",                   url: "https://drive.google.com/drive/folders/1muWa_YL3enIXOl0AODfx6cm49MaNj9xq" },
      { nombre: "08 2023",                   url: "https://drive.google.com/drive/folders/1xE3TGNNIJvotIVMgiyDvJIc6egAwFsgd" }
    ]
  }
};
