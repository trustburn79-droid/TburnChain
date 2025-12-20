const fs = require('fs');
const path = require('path');

const esTranslations = {
  "1": {
    "question": "¿Qué es TBURN?",
    "answer": "TBURN es una blockchain Layer 1 de próxima generación que procesa 520,000 TPS con un tiempo de bloque de 100ms. Utiliza un mecanismo de consenso BFT mejorado con IA para proporcionar alta seguridad y escalabilidad, con un modelo económico de token deflacionario orientado a la creación de valor sostenible."
  },
  "2": {
    "question": "¿Cómo empiezo con TBURN?",
    "answer": "1) Instala una billetera compatible (MetaMask, Rabby, Trust Wallet, etc.). 2) Conéctate a la mainnet de TBURN. 3) Compra o recibe tokens TB. 4) Gestiona tus activos y utiliza servicios DeFi desde el panel de la billetera."
  },
  "3": {
    "question": "¿Dónde puedo comprar tokens TB?",
    "answer": "Los tokens TB se pueden comprar en el DEX integrado de TBURN, exchanges asociados o a través de puentes cross-chain. Puedes intercambiar directamente en la página DEX o traer activos de otras cadenas a través del puente."
  },
  "4": {
    "question": "¿Cuál es el formato de dirección de billetera TBURN?",
    "answer": "TBURN utiliza direcciones en formato Bech32m. Todas las direcciones comienzan con \"tb1\" y constan de exactamente 41 caracteres (ej., tb1edmprvaftt65lkp2x6v8fmjvst5spfruj47kwm). Este formato sigue el estándar BIP-350 con detección de errores incorporada."
  },
  "5": {
    "question": "¿Cuáles son las tarifas de transacción?",
    "answer": "La tarifa base de red de TBURN es aproximadamente 0.0001 TB. Además, todas las transferencias tienen una tarifa de quema del 0.5% que quema tokens permanentemente. Este mecanismo deflacionario contribuye a mantener el valor del token."
  },
  "6": {
    "question": "¿Cuál es la diferencia entre mainnet y testnet de TBURN?",
    "answer": "Mainnet es la red de producción donde se usan tokens TB con valor real. Testnet se usa para desarrollo y pruebas, y los tokens de prueba no tienen valor. Los desarrolladores deben desplegar y probar contratos inteligentes en testnet antes de desplegar en mainnet."
  },
  "7": {
    "question": "¿Qué es TBURN Explorer?",
    "answer": "TBURN Explorer (Scan) es un explorador de blockchain donde puedes ver bloques, transacciones, billeteras y contratos inteligentes. Es una herramienta pública para verificar de forma transparente el estado de la red en tiempo real, información de validadores y movimientos de tokens."
  },
  "8": {
    "question": "¿Cuáles son los planes futuros en el roadmap?",
    "answer": "El roadmap de TBURN incluye expansión continua de la red, integración de nuevos protocolos DeFi, expansión de puentes cross-chain, mejora de funciones IA y crecimiento del ecosistema de juegos/NFT. Los hitos detallados se encuentran en la página del roadmap."
  },
  "9": {
    "question": "¿Dónde puedo leer el whitepaper de TBURN?",
    "answer": "Puedes descargar y ver el whitepaper de TBURN en la página del whitepaper. Cubre arquitectura técnica, tokenomics, mecanismo de consenso y roadmap."
  },
  "10": {
    "question": "¿Qué es el sistema de puntuación de confianza?",
    "answer": "El sistema de puntuación de confianza evalúa la confiabilidad de las billeteras basándose en historial de transacciones, actividad de staking, participación en gobernanza y más. Puntuaciones altas obtienen más recompensas y funciones."
  },
  "11": {
    "question": "¿Cómo hago staking?",
    "answer": "Selecciona un validador en la página de staking e ingresa la cantidad a hacer staking. El staking bloquea tus tokens TB por un período durante el cual recibirás recompensas. Dejar de hacer staking requiere esperar el período de desvinculación."
  },
  "12": {
    "question": "¿Qué son las recompensas de staking?",
    "answer": "Las recompensas de staking provienen de la inflación de la red y las tarifas de transacción. El rendimiento porcentual anual (APY) cambia dinámicamente según el staking total y el estado de la red. Puedes ver las tasas actuales en el panel de staking."
  },
  "13": {
    "question": "¿Qué es el staking líquido?",
    "answer": "El staking líquido te permite recibir tokens stTB mientras haces staking de TB. Los tokens stTB representan tu posición de staking y pueden usarse en protocolos DeFi mientras continúas ganando recompensas de staking."
  },
  "14": {
    "question": "¿Cómo elijo un validador?",
    "answer": "Considera el tiempo de actividad del validador, tasa de comisión, staking total y reputación. Revisa métricas detalladas en la página de validadores y elige validadores con rendimiento estable y comisiones razonables."
  },
  "15": {
    "question": "¿Qué es la delegación?",
    "answer": "La delegación es el proceso de hacer staking de tus tokens TB con un validador. Mantienes la propiedad de los tokens pero delegas el poder de validación al validador. Las recompensas generadas por el validador se distribuyen proporcionalmente a los delegadores."
  },
  "16": {
    "question": "¿Cómo veo mi historial de staking?",
    "answer": "Consulta tu historial completo de staking en el panel de staking, incluyendo registros de delegación, des-delegación y reclamación de recompensas. Cada operación se registra en la blockchain y puede verificarse en el explorador."
  },
  "17": {
    "question": "¿Qué es un pool de staking?",
    "answer": "Los pools de staking permiten a múltiples usuarios combinar fondos para hacer staking. Esto reduce la barrera de entrada y proporciona rendimientos más estables. Los operadores del pool cobran una pequeña tarifa como compensación por la gestión."
  },
  "18": {
    "question": "¿Cuánto dura el período de desvinculación?",
    "answer": "El período de desvinculación es de 21 días. Después de dejar de hacer staking, tus tokens quedan bloqueados durante 21 días sin generar recompensas. Esto está diseñado para la seguridad de la red."
  },
  "19": {
    "question": "¿Qué es la penalización por slashing?",
    "answer": "Si un validador se comporta mal (como doble firma o estar offline durante mucho tiempo), una parte de sus tokens en staking será recortada (quemada). Los tokens delegados a ese validador también se ven afectados proporcionalmente."
  },
  "20": {
    "question": "¿Cómo reclamo recompensas?",
    "answer": "Haz clic en el botón \"Reclamar Recompensas\" en el panel de staking. Las recompensas pueden reclamarse en cualquier momento con una pequeña tarifa de red. Las recompensas reclamadas se envían directamente a tu billetera."
  },
  "21": {
    "question": "¿Qué es el yield farming?",
    "answer": "El yield farming es una estrategia para ganar rendimientos adicionales proporcionando liquidez a protocolos DeFi. En la página de yield farming de TBURN, puedes depositar tokens LP para recibir recompensas TB adicionales."
  },
  "22": {
    "question": "¿Cómo funciona el DEX?",
    "answer": "TBURN DEX usa un modelo de Creador de Mercado Automatizado (AMM). Los proveedores de liquidez depositan pares de tokens en pools, los traders intercambian tokens del pool, pagando tarifas de trading a los proveedores de liquidez."
  },
  "23": {
    "question": "¿Cómo proporciono liquidez?",
    "answer": "Selecciona un par de tokens en la página DEX e ingresa cantidades iguales de ambos tokens. Después de proporcionar liquidez, recibirás tokens LP que representan tu parte del pool."
  },
  "24": {
    "question": "¿Qué es la pérdida impermanente?",
    "answer": "Cuando la proporción de precios de los tokens en un pool de liquidez cambia, el valor de los activos que retiras puede ser menor que el valor mientras los mantenías. Esta diferencia se llama pérdida impermanente, un riesgo inherente de proporcionar liquidez AMM."
  },
  "25": {
    "question": "¿Cómo intercambio tokens?",
    "answer": "Selecciona el par de tokens para intercambiar en la página DEX, ingresa la cantidad, confirma los detalles de la transacción y ejecuta el intercambio. El sistema muestra el deslizamiento estimado y la cantidad final a recibir."
  },
  "26": {
    "question": "¿Qué es el protocolo de préstamos?",
    "answer": "El protocolo de préstamos de TBURN permite a los usuarios depositar activos para ganar intereses o pedir prestados otros activos usando colateral. Las tasas de interés se ajustan dinámicamente según la oferta y demanda."
  },
  "27": {
    "question": "¿Cómo pido prestado?",
    "answer": "Primero deposita colateral, luego selecciona el activo y cantidad a pedir prestado. Los préstamos requieren sobre-colateralización, y los activos serán liquidados si la proporción de colateral cae por debajo del umbral de liquidación."
  },
  "28": {
    "question": "¿Qué es la liquidación?",
    "answer": "Cuando tu proporción de colateral cae por debajo del requisito mínimo, otros pueden pagar parte de tu deuda y recibir tu colateral como recompensa. Esto asegura la solvencia del protocolo."
  },
  "29": {
    "question": "¿Cómo gano intereses de préstamos?",
    "answer": "Deposita activos en el pool de préstamos para comenzar a ganar intereses. Las tasas de interés fluctúan según la demanda de préstamos, con tasas más altas durante alta demanda. Los intereses se acumulan en tiempo real."
  },
  "30": {
    "question": "¿Qué es el marketplace de NFT?",
    "answer": "El marketplace de NFT de TBURN es una plataforma para comprar y vender coleccionables digitales. Los creadores pueden mintear NFTs, los coleccionistas pueden comprar, vender o subastar NFTs. Soporta regalías y ventas secundarias."
  },
  "31": {
    "question": "¿Cómo minteo un NFT?",
    "answer": "Sube tu trabajo digital al marketplace de NFT, establece atributos como nombre, descripción y porcentaje de regalías. Después de pagar la tarifa de minteo, el NFT se crea en tu billetera."
  },
  "32": {
    "question": "¿Qué es el launchpad de NFT?",
    "answer": "El launchpad de NFT es donde nuevos proyectos lanzan colecciones de NFT. Los usuarios pueden participar en ventas públicas o sorteos para obtener NFTs a precios preferenciales en etapas tempranas."
  },
  "33": {
    "question": "¿Cómo funciona el puente cross-chain?",
    "answer": "Los puentes cross-chain permiten transferir activos entre diferentes blockchains. Bloquea activos en una cadena y mintea tokens envueltos equivalentes en otra cadena. El puente está asegurado por múltiples validadores."
  },
  "34": {
    "question": "¿Qué cadenas están soportadas?",
    "answer": "El puente TBURN actualmente soporta Ethereum, BNB Chain, Polygon, Avalanche y Solana. Se añadirán más cadenas en el futuro."
  },
  "35": {
    "question": "¿Cuánto tiempo toma el bridging?",
    "answer": "El tiempo de bridging depende de los requisitos de confirmación de las cadenas origen y destino. Típicamente toma 5-30 minutos dependiendo de la congestión de la red."
  },
  "36": {
    "question": "¿Qué es GameFi?",
    "answer": "GameFi combina juegos y DeFi, permitiendo a los jugadores ganar tokens y NFTs con valor real dentro de los juegos. La infraestructura GameFi de TBURN proporciona herramientas y servicios para desarrolladores de juegos."
  },
  "37": {
    "question": "¿Cómo participo en GameFi?",
    "answer": "Explora los juegos listados en la página GameFi, conecta tu billetera para comenzar a jugar. Puedes ganar tokens in-game, comerciar equipamiento NFT y unirte a gremios de juegos."
  },
  "38": {
    "question": "¿Qué es la gobernanza?",
    "answer": "La gobernanza permite a los holders de TB votar sobre actualizaciones de red, cambios de parámetros y gastos del tesoro. Los tokens TB en staking tienen poder de voto, proporcional a la cantidad en staking."
  },
  "39": {
    "question": "¿Cómo voto?",
    "answer": "Revisa las propuestas activas en la página de gobernanza, lee los detalles de la propuesta y emite tu voto. Votar requiere tokens TB en staking, los tokens permanecen bloqueados hasta que termine el período de votación."
  },
  "40": {
    "question": "¿Cómo envío una propuesta?",
    "answer": "Debes cumplir los requisitos mínimos de staking para enviar una propuesta. Completa el título de la propuesta, descripción y detalles de implementación, paga la tarifa de propuesta y envía para votación comunitaria."
  },
  "41": {
    "question": "¿Qué es el consenso BFT?",
    "answer": "El consenso Tolerante a Fallas Bizantinas (BFT) permite que la red opere normalmente incluso si hasta un tercio de los nodos fallan o actúan maliciosamente. El BFT mejorado con IA de TBURN optimiza aún más la producción y validación de bloques."
  },
  "42": {
    "question": "¿Cuál es el tiempo de bloque?",
    "answer": "El tiempo de bloque de TBURN es de 100 milisegundos, uno de los más rápidos de la industria. El tiempo de bloque rápido permite confirmaciones de transacción casi instantáneas."
  },
  "43": {
    "question": "¿Cuál es el TPS de la red?",
    "answer": "La red TBURN puede procesar 520,000 TPS (transacciones por segundo). Esto se logra a través de tecnología de sharding y ejecución paralela, superando con creces a la mayoría de blockchains."
  },
  "44": {
    "question": "¿Cómo me convierto en validador?",
    "answer": "Convertirse en validador requiere cumplir requisitos mínimos de staking (varían por nivel), ejecutar software de nodo validador y mantener alta disponibilidad. Consulta la documentación del validador para pasos detallados."
  },
  "45": {
    "question": "¿Cuáles son los niveles de validador?",
    "answer": "Los validadores se dividen en niveles Bronce (1,000 TB), Plata (10,000 TB), Oro (100,000 TB) y Platino. Los niveles más altos traen mayores multiplicadores de recompensa y más privilegios."
  },
  "46": {
    "question": "¿Qué es la finalidad?",
    "answer": "Finalidad es el estado donde las transacciones están confirmadas y no pueden ser revertidas. TBURN usa finalidad de confirmación única, una vez que se produce un bloque, las transacciones son inmediatamente finales."
  },
  "47": {
    "question": "¿Qué significa altura de bloque?",
    "answer": "La altura de bloque es el número de posición de un bloque en la cadena. El bloque génesis es 0, con cada nuevo bloque la altura aumenta en 1. La altura de bloque se usa para referenciar bloques específicos."
  },
  "48": {
    "question": "¿Qué es la recompensa de bloque?",
    "answer": "La recompensa de bloque son tokens TB ganados cuando un validador crea exitosamente un nuevo bloque. Las recompensas provienen de la inflación de la red y tarifas de transacción, y se distribuyen a validadores y sus delegadores."
  },
  "49": {
    "question": "¿Cómo se distribuyen las tarifas de red?",
    "answer": "Las tarifas de transacción se distribuyen así: parte va al productor del bloque, parte va al tesoro para desarrollo de la red, y parte se quema permanentemente para soportar la deflación."
  },
  "50": {
    "question": "¿Qué es el sharding?",
    "answer": "El sharding es una tecnología de escalado que divide la blockchain en múltiples shards para procesamiento paralelo. Cada shard procesa transacciones independientemente, aumentando el rendimiento general de la red."
  },
  "51": {
    "question": "¿Qué es la orquestación IA?",
    "answer": "La orquestación IA integra múltiples modelos de IA (Gemini, Claude, GPT-4o, Grok) para automatizar la optimización de red, ajuste de tasa de quema, detección de amenazas de seguridad y más."
  },
  "52": {
    "question": "¿Cuáles son los requisitos de validador?",
    "answer": "Los requisitos varían por nivel de validador: Bronce (1,000 TB), Plata (10,000 TB), Oro (100,000 TB). Se necesita infraestructura de servidor estable, alto tiempo de actividad y capacidad técnica."
  },
  "53": {
    "question": "¿Qué es una transacción cross-shard?",
    "answer": "Transacciones entre cuentas en diferentes shards. Coordinadas a través de la cadena beacon, pueden requerir un tiempo de finalización ligeramente mayor que las transacciones regulares."
  },
  "54": {
    "question": "¿Dónde puedo verificar el estado de la red?",
    "answer": "Verifica la altura de bloque actual, TPS, validadores activos, estado de shards y salud de la red en tiempo real en la página de Estado de Red."
  },
  "55": {
    "question": "¿Dónde puedo obtener RPC de testnet?",
    "answer": "Revisa la información de conexión de testnet en la página RPC de Testnet. Se proporcionan Chain ID, URL RPC, URL del explorador y enlaces de faucet."
  },
  "56": {
    "question": "¿Qué es la penalización de validador?",
    "answer": "Los validadores offline o que hacen doble firma enfrentarán penalizaciones como slashing (quemar parte del stake), degradación o eliminación del conjunto activo."
  },
  "57": {
    "question": "¿Cómo verifico el estado del validador?",
    "answer": "Revisa los detalles del validador en la página de validadores o explorador, incluyendo tiempo de actividad, tasa de comisión, delegación total, historial de rendimiento y más."
  },
  "58": {
    "question": "¿Qué es el monitoreo de salud del nodo validador?",
    "answer": "El monitoreo de salud del nodo rastrea el tiempo de actividad del validador, tiempo de respuesta, conexiones de pares y producción de bloques. Los sistemas de alerta notifican cuando se detectan problemas."
  },
  "59": {
    "question": "¿Qué es la cadena beacon?",
    "answer": "La cadena beacon es la cadena principal que coordina todos los shards. Gestiona el conjunto de validadores, comunicación cross-shard y consenso global."
  },
  "60": {
    "question": "¿Cómo ejecuto un nodo completo?",
    "answer": "Descarga el software de nodo TBURN, configura los ajustes según la documentación. Los nodos completos almacenan datos completos de la blockchain, validan todas las transacciones pero no participan en el consenso."
  },
  "61": {
    "question": "¿Qué es la tarifa de gas?",
    "answer": "Gas es la unidad de cómputo requerida para ejecutar transacciones y operaciones de contratos inteligentes. Tarifa de gas = Gas usado × Precio de gas. Las operaciones complejas requieren más gas."
  },
  "62": {
    "question": "¿Cómo estimo el gas?",
    "answer": "El simulador de transacciones o SDK puede estimar los requisitos de gas antes de la ejecución. Se recomienda mantener suficiente balance para cubrir las tarifas de gas y de quema."
  },
  "63": {
    "question": "¿Cómo despliego un contrato inteligente?",
    "answer": "Escribe contratos en Solidity o Rust y compila con el compilador TBURN. Despliega en la página de Contratos Inteligentes o programáticamente vía SDK/CLI."
  },
  "64": {
    "question": "¿Qué es el Simulador de Transacciones?",
    "answer": "El Simulador de Transacciones es una herramienta para previsualizar resultados de transacciones antes de la ejecución real. Puedes identificar tarifas de gas esperadas, cambios de estado y errores potenciales por adelantado."
  },
  "65": {
    "question": "¿Dónde puedo obtener claves API?",
    "answer": "Crea nuevas claves API en la página de Claves API. Puedes establecer permisos y límites de uso por clave, y monitorear el uso en el panel."
  },
  "66": {
    "question": "¿Qué opciones de SDK hay disponibles?",
    "answer": "Se proporcionan SDKs de JavaScript/TypeScript, Python, Rust y Go. Usa todas las funciones de blockchain programáticamente incluyendo conexión de billetera, envío de transacciones e interacción con contratos inteligentes."
  },
  "67": {
    "question": "¿Cómo uso las herramientas CLI?",
    "answer": "Instala TBURN CLI para realizar gestión de cuentas, envío de transacciones y despliegue de contratos inteligentes desde terminal. Consulta la guía de instalación y comandos en la documentación del desarrollador."
  },
  "68": {
    "question": "¿Cómo migro desde EVM?",
    "answer": "TBURN es compatible con EVM, por lo que los contratos Solidity existentes pueden desplegarse con modificaciones mínimas. Consulta los métodos paso a paso en la guía de Migración EVM."
  },
  "69": {
    "question": "¿Qué es la API WebSocket?",
    "answer": "La API WebSocket permite recibir bloques, transacciones y eventos en tiempo real en formato streaming. Se usa cuando las dApps necesitan actualizaciones en tiempo real."
  },
  "70": {
    "question": "¿Dónde está la documentación del desarrollador?",
    "answer": "Encuentra documentación completa, referencia de API, tutoriales y ejemplos de código en el Hub del Desarrollador. Comienza rápidamente con la guía de Inicio Rápido."
  },
  "71": {
    "question": "¿Dónde puedo encontrar ejemplos de código?",
    "answer": "Encuentra código de ejemplo para varios casos de uso incluyendo envío de transacciones, emisión de tokens, minteo de NFT e integración DeFi en la página de Ejemplos de Código."
  },
  "72": {
    "question": "¿Cuáles son los endpoints de la API REST?",
    "answer": "Consulta bloques, transacciones, cuentas e información de tokens vía API REST. Revisa la lista completa de endpoints y solicitudes de ejemplo en la documentación de API."
  },
  "73": {
    "question": "¿Qué es la verificación de contrato inteligente?",
    "answer": "La verificación de contrato inteligente demuestra que el bytecode desplegado coincide con el código fuente. Los contratos verificados tienen código fuente visible en el Explorador, aumentando la transparencia."
  },
  "74": {
    "question": "¿Cómo interactúo con contratos?",
    "answer": "Llama funciones directamente a través de las pestañas Leer/Escribir de contratos verificados en el Explorador. O interactúa programáticamente usando SDKs."
  },
  "75": {
    "question": "¿Qué son los estándares de token?",
    "answer": "TBURN soporta estándares de token fungible similares a ERC-20 y estándares NFT similares a ERC-721/1155. Las interfaces estandarizadas aseguran compatibilidad con billeteras y dApps."
  },
  "76": {
    "question": "¿Cómo creo un token?",
    "answer": "Despliega un contrato inteligente que cumpla con los estándares de token. Establece parámetros como nombre, símbolo, suministro total. Usa la página de Emisión de Token para crear tokens sin código."
  },
  "77": {
    "question": "¿Qué es un token envuelto?",
    "answer": "Los tokens envueltos representan activos bloqueados de otras cadenas. Por ejemplo, wBTC representa Bitcoin bloqueado en el puente TBURN. Los tokens envueltos pueden usarse en el ecosistema TBURN."
  },
  "78": {
    "question": "¿Cómo agrego un token personalizado?",
    "answer": "Ingresa la dirección del contrato del token en tu billetera para agregar tokens personalizados. La billetera obtendrá automáticamente la información del token y mostrará el balance."
  },
  "79": {
    "question": "¿Qué es DePIN?",
    "answer": "DePIN (Redes de Infraestructura Física Descentralizada) usa blockchain para coordinar infraestructura del mundo real. TBURN soporta redes de dispositivos IoT, almacenamiento descentralizado y mercados de cómputo."
  },
  "80": {
    "question": "¿Qué son las stablecoins?",
    "answer": "Las stablecoins son tokens vinculados a monedas fiat. El ecosistema TBURN incluye múltiples opciones de stablecoin para trading y DeFi sin riesgo de volatilidad de criptomonedas."
  },
  "81": {
    "question": "¿Qué opciones de billetera hay?",
    "answer": "Se soportan MetaMask, Rabby, Trust Wallet y otras billeteras compatibles con EVM. Las billeteras de hardware como Ledger también pueden conectarse para mayor seguridad."
  },
  "82": {
    "question": "¿Cómo creo una billetera?",
    "answer": "Descarga la app de billetera de fuentes oficiales, sigue el flujo de configuración. Respalda tu frase semilla de forma segura - perderla significa que no podrás recuperar tu billetera."
  },
  "83": {
    "question": "¿Qué es el panel de billetera?",
    "answer": "El panel de billetera muestra tus activos, historial de transacciones y posiciones DeFi. Puedes enviar/recibir tokens, hacer staking, conectar dApps y gestionar toda la actividad on-chain."
  },
  "84": {
    "question": "¿Cómo exporto mi clave privada?",
    "answer": "Exporta tu clave privada en las opciones de seguridad de los ajustes de la billetera. Nunca compartas tu clave privada - cualquiera con ella tiene control total de tus activos."
  },
  "85": {
    "question": "¿Qué son las soluciones de pago?",
    "answer": "Las soluciones de pago comercial de TBURN incluyen integración con comerciantes, liquidación rápida y entrada fiat. Las empresas pueden aceptar pagos crypto y convertir instantáneamente a stablecoins."
  },
  "86": {
    "question": "¿Qué son los Blinks (Enlaces Blockchain)?",
    "answer": "Los Blinks son enlaces compartibles de acciones blockchain. Los receptores pueden ejecutar transacciones, mintear NFTs o participar en eventos con un clic. Simplifica las interacciones blockchain."
  },
  "87": {
    "question": "¿Qué es BTCfi?",
    "answer": "BTCfi son soluciones que hacen Bitcoin utilizable en DeFi. A través del puente TBURN, puedes traer BTC a TBURN para préstamos, yield farming y otras actividades DeFi."
  },
  "88": {
    "question": "¿Qué son las extensiones de token?",
    "answer": "Las extensiones de token añaden funcionalidad programable a tokens estándar. Las características incluyen quema automática, restricciones de transferencia, regalías y transferencias condicionales."
  },
  "89": {
    "question": "¿Qué soluciones financieras hay disponibles?",
    "answer": "Proporciona soluciones de custodia, trading, pagos y gestión de activos para instituciones financieras. Las herramientas de cumplimiento y pistas de auditoría cumplen con los requisitos institucionales."
  },
  "90": {
    "question": "¿Qué características de IA hay disponibles?",
    "answer": "Proporciona optimización de quema basada en IA, análisis de gobernanza, evaluación de riesgos de puentes, detección de anomalías y programación de validadores. Se integran múltiples modelos de IA (Gemini, Claude, GPT-4o, Grok)."
  },
  "91": {
    "question": "¿Cuáles son los casos de uso empresarial?",
    "answer": "Proporciona casos de uso de blockchain empresarial incluyendo seguimiento de cadena de suministro, certificación digital, verificación de integridad de datos y sistemas de tokens internos. Se proporciona soporte dedicado y SLA."
  },
  "92": {
    "question": "¿Qué es la tokenización?",
    "answer": "Convertir activos reales (bienes raíces, arte, materias primas) en tokens blockchain. Permite propiedad fraccionada, mayor liquidez y trading 24/7."
  },
  "93": {
    "question": "¿Dónde puedo ver noticias y anuncios?",
    "answer": "Consulta la página de Noticias de la Comunidad para las últimas actualizaciones, anuncios de partnerships y mejoras técnicas. Suscríbete al newsletter para recibir actualizaciones por email."
  },
  "94": {
    "question": "¿Cómo participo en eventos?",
    "answer": "Consulta la página de Eventos de la Comunidad para airdrops en curso, campañas e información de meetups. Cumple los requisitos de participación y regístrate para recibir recompensas."
  },
  "95": {
    "question": "¿Cómo hago propuestas de gobernanza?",
    "answer": "Hacer staking de cierta cantidad de TB te permite crear propuestas de gobernanza. Escribe contenido según el formato de propuesta y envía para votación comunitaria."
  },
  "96": {
    "question": "¿Qué puedo hacer en el Hub de la Comunidad?",
    "answer": "En el Hub de la Comunidad, puedes discutir con otros usuarios, presentar proyectos y compartir feedback. También puedes ver anuncios oficiales y actualizaciones de desarrollo."
  },
  "97": {
    "question": "¿Cómo mantengo mis activos seguros?",
    "answer": "1) Usa billetera de hardware, 2) Nunca compartas clave privada/frase semilla, 3) Ten cuidado con sitios de phishing, 4) Usa solo URLs oficiales, 5) Habilita 2FA. Guarda activos grandes en billeteras frías."
  },
  "98": {
    "question": "¿Cómo identifico estafas?",
    "answer": "Confía solo en canales oficiales. Las solicitudes de claves privadas o frases semilla son 100% estafas. Ten cuidado con mensajes que crean urgencia como \"tokens gratis\" o \"actualización urgente\"."
  },
  "99": {
    "question": "¿Cuál es el suministro total de tokens TB?",
    "answer": "El suministro inicial y el suministro circulante actual de tokens TB se pueden verificar en la página de Tokenomics. Debido al mecanismo de quema, el suministro total disminuye continuamente."
  },
  "100": {
    "question": "¿Cómo funciona el mecanismo de quema?",
    "answer": "Una tarifa de quema del 0.5% se aplica a todas las transferencias, quemando permanentemente esa cantidad. Parte de las tarifas de red también se queman. Este modelo deflacionario soporta el valor del token."
  }
};

const filePath = path.join(__dirname, '../client/src/locales/es.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

if (data.qna && data.qna.content) {
  for (const [key, value] of Object.entries(esTranslations)) {
    if (data.qna.content[key]) {
      data.qna.content[key].question = value.question;
      data.qna.content[key].answer = value.answer;
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Spanish Q&A translations updated successfully!');
