/* ============================================================
   Mapa de lógica — datos y render
   ------------------------------------------------------------
   Editá SOLO este archivo. Reemplazá window.HD_MAPA por los
   datos reales del flujo que te pidieron entender y poné
   demo: false (o borrá la clave) antes de entregar.

   Campos (todos opcionales salvo feature y flujo.pasos):
     feature           qué se está explicando (el h1)
     resumen           2-3 frases: qué hace y por qué importa
     meta              { fecha, repo, rama, commit, alcance, lectura }
     metricas[]        { valor, etiqueta } (si falta, se calculan)
     mapa.capas[]      { nombre, detalle, items: [{ nombre, ruta, rol }] }
     mapa.dependencias[]{ desde, hacia, tipo, nota }
     flujo.pasos[]     { titulo, tipo: entrada|validacion|decision|efecto|externo|error,
                         resumen, detalle, archivos[], datos[], caminos[{condicion,resultado}] }
     reglas[]          { regla, tipo, donde (archivo:línea), consecuencia }
     bordes[]          { caso, esperado, actual, estado: cubierto|dudoso|roto|no-verificado,
                         evidencia (archivo:línea) }
     hallazgos[]       { titulo, tipo: bug|validacion|riesgo|deuda,
                         severidad: alta|media|baja, confianza: alta|media|baja,
                         evidencia, impacto, sugerencia }
     impacto           { consumidores[], siCambia[], datos[] }
     archivos[]        { ruta, capa, rol }
     limites[]         textos: qué no se leyó, qué es inferencia, qué no se verificó

   Reglas: cada afirmación sale del código y lleva archivo:línea;
   lo que no se verificó va en limites. Sin red, sin CDN, sin
   dependencias. Los links son relativos a esta carpeta.
   ============================================================ */

window.HD_MAPA = {
  "feature": "El auditor visual de hd-review: cómo se prueba la feature sin tests",
  "resumen": "En HD la confianza no la dan los tests: la dan dos lecturas del mismo trabajo. Primero, revisores independientes leen el código y un fixer lo corrige. Después, la auditoría visual levanta el proyecto entero y prueba el comportamiento como un humano —por la UI o contra la API— con 2 a 4 auditores por área en paralelo. Deja evidencia commiteada, un veredicto y, si hubo fallos, una sola corrección y una re-prueba completa. Un OK encadena el cierre solo.",
  "meta": {
    "fecha": "2026-11-26",
    "repo": "hiper-driven · skills HD",
    "rama": "main",
    "commit": "b260f0f + working tree",
    "alcance": "Fase 4 (hd-review), subfase 2: del cierre de la fase 3 al encadenado con hd-close",
    "lectura": "Lectura estática de skills, plantillas y README"
  },
  "mapa": {
    "capas": [
      {
        "nombre": "Entrada y disparo",
        "detalle": "Quién decide que hay que auditar, cuándo y con qué material",
        "items": [
          {
            "nombre": "Cierre de la implementación",
            "ruta": "skills/hd-implement/SKILL.md:325-327",
            "rol": "Con todas las olas cerradas y el gate verde, el orquestador carga hd-review él mismo: no hay pausa humana."
          },
          {
            "nombre": "Paso 0 — estado de revisión",
            "ruta": "skills/hd-review/SKILL.md:87-104",
            "rol": "Olas cerradas, worktrees borrados, rama limpia, artefactos al día, memoria leída y proyecto que se puede levantar."
          },
          {
            "nombre": "Sub1 — revisores de código",
            "ruta": "skills/hd-review/SKILL.md:105-175",
            "rol": "Un revisor por ola en una sola tanda; si hay hallazgos, un fixer los corrige y el gate vuelve a verde. La auditoría espera a que sub1 cierre."
          },
          {
            "nombre": "Material por rutas",
            "ruta": "skills/hd-review/SKILL.md:99-103",
            "rol": "Diff por ola, diff total y logs de gate en .hd/<trabajo>/logs/: el auditor los recibe por ruta, no por chat."
          }
        ]
      },
      {
        "nombre": "Orquestación — la pasada",
        "detalle": "El orquestador despacha, consolida, commitea y decide; no escribe código",
        "items": [
          {
            "nombre": "Orquestador de la fase 4",
            "ruta": "skills/hd-review/SKILL.md:37-41",
            "rol": "Levanta el server, despacha, consolida, commitea, corre el gate y decide; no escribe producción."
          },
          {
            "nombre": "Recon (3.0)",
            "ruta": "skills/hd-review/SKILL.md:184-198",
            "rol": "Verifica el entorno, consigue credenciales, siembra datos, decide el modo, deja el script base y propone las áreas. 5 min / 8 turnos."
          },
          {
            "nombre": "Áreas en paralelo (3.1)",
            "ruta": "skills/hd-review/SKILL.md:200-252",
            "rol": "2 a 4 auditores por superficie disjunta; cada uno prueba un camino completo y deja reporte y evidencia. 6 min / 8 turnos cada uno."
          },
          {
            "nombre": "Consolidación (3.2)",
            "ruta": "skills/hd-review/SKILL.md:254-274",
            "rol": "Un reporte único, el veredicto, la verificación del árbol y el commit de la evidencia. 2 min / 2 turnos."
          },
          {
            "nombre": "Corrección y re-prueba",
            "ruta": "skills/hd-review/SKILL.md:276-294",
            "rol": "Un fixer visual corrige todos los fallos juntos; el orquestador commitea y corre el gate; los mismos scripts se re-ejecutan completos."
          }
        ]
      },
      {
        "nombre": "Dominio — el contrato de verificación",
        "detalle": "Qué significa «auditado» y qué no se puede declarar en falso",
        "items": [
          {
            "nombre": "G3 — el gate de comportamiento",
            "ruta": "README.md:183-186",
            "rol": "La feature de punta a punta, por áreas; una corrección y re-prueba entera. Sin tests, es la única prueba de comportamiento."
          },
          {
            "nombre": "Severidad",
            "ruta": "skills/hd-review/SKILL.md:55-63",
            "rol": "Alta: el flujo no cierra o toca datos, dinero o seguridad; media: resultado visible incorrecto; baja: cosmético. La consolida el orquestador y solo puede subirla."
          },
          {
            "nombre": "Veredictos",
            "ruta": "skills/hd-review/SKILL.md:241, 257, 277",
            "rol": "Por área: OK o CON_FALLOS. Global: OK, CON_FALLOS o NO_VERIFICABLE. NO_VERIFICABLE frena el cierre."
          },
          {
            "nombre": "Residual no es verde",
            "ruta": "skills/hd-review/SKILL.md:71, 223, 245",
            "rol": "Lo que el entorno no permitió probar se declara no verificado y no cuenta como aprobado."
          },
          {
            "nombre": "Reglas duras de la fase",
            "ruta": "skills/hd-review/SKILL.md:65-86",
            "rol": "Serie sub1→sub2, un revisor por ola, evidencia con el veredicto, un script por recorrido, sin tests y sin cortar por contexto."
          }
        ]
      },
      {
        "nombre": "Datos — la evidencia que deja",
        "detalle": "Todo vive en .hd/<trabajo>/; las herramientas viven fuera del árbol",
        "items": [
          {
            "nombre": "entorno.md",
            "ruta": ".hd/<trabajo>/reports/auditoria/entorno.md",
            "rol": "Comando, puerto, URL base, usuarios y cómo se crearon, modo y motivo, ruta del script base y áreas. Sin este archivo no se despacha."
          },
          {
            "nombre": "Reporte de área",
            "ruta": ".hd/<trabajo>/reports/auditoria/<área>.md",
            "rol": "Modo, veredicto, fallos con pasos/esperado/obtenido/evidencia, no verificado, casos del catálogo y descubiertos."
          },
          {
            "nombre": "Recorrido y log",
            "ruta": ".hd/<trabajo>/reports/evidencia/<área>/recorrido.<ext>",
            "rol": "El script de una pasada y su salida: es la evidencia y lo que corre la re-prueba."
          },
          {
            "nombre": "Reporte consolidado",
            "ruta": ".hd/<trabajo>/reports/auditoria-visual.md",
            "rol": "Deduplicado por flujo, ordenado por severidad y con el área delante de cada fallo."
          },
          {
            "nombre": "Commit de evidencia",
            "ruta": "hd(<trabajo>): auditoría visual — reportes y evidencia",
            "rol": "Va con el veredicto y antes de corregir: si el trabajo se frena, lo que prueba por qué queda en el repo."
          },
          {
            "nombre": "review-progress.md",
            "ruta": "skills/hd-review/templates/review-progress-template.md:62-96",
            "rol": "Bloque de auditoría: recon, modo, entorno, presupuesto, tabla de áreas, fallos y no verificable."
          }
        ]
      },
      {
        "nombre": "Externos — contra qué se prueba",
        "detalle": "El mundo real del proyecto, no el chat",
        "items": [
          {
            "nombre": "Proyecto levantado",
            "ruta": "skills/hd-review/SKILL.md:96, 186",
            "rol": "El orquestador lo deja vivo como job en background antes del recon: un server de subagente muere con él."
          },
          {
            "nombre": "Navegador headless",
            "ruta": "Playwright o CDP",
            "rol": "Recorrido de UI cuando hay frontend y el navegador arranca; si no, modo API."
          },
          {
            "nombre": "curl / fetch",
            "ruta": "API del proyecto",
            "rol": "Auth real, secuencias completas y códigos de error: un 200 suelto no verifica nada."
          },
          {
            "nombre": "Base de prueba y seeds",
            "ruta": "skills/hd-review/SKILL.md:189, 221",
            "rol": "Usuarios y datos se crean en la base de prueba o con seeds; el auditor no toca producción."
          },
          {
            "nombre": "Memoria y catálogo",
            "ruta": ".hd/memory.md · .hd/e2e/casos.md",
            "rol": "La memoria evita inventar datos y reportar decisiones del humano como bugs; el catálogo dice qué comportamiento está prometido."
          }
        ]
      },
      {
        "nombre": "Modelos y despacho",
        "detalle": "Quién audita y con qué criterio",
        "items": [
          {
            "nombre": "Estrategia en memoria",
            "ruta": "skills/hd-review/SKILL.md:49",
            "rol": "La auditoría usa el modelo de mayor calidad disponible y permitido, aprobado en discovery."
          },
          {
            "nombre": "Catálogo del harness",
            "ruta": "skills/hd-review/SKILL.md:50",
            "rol": "list_subagent_models verifica modelos y esfuerzo; no publica precios: se buscan en internet."
          },
          {
            "nombre": "Dispatch explícito",
            "ruta": "skills/hd-review/SKILL.md:53",
            "rol": "provider, model y reasoning_effort en cada subagente, anotados en el ledger."
          },
          {
            "nombre": "Premium",
            "ruta": "skills/hd-review/SKILL.md:52",
            "rol": "Más de 5 USD/M solo con permiso previo; esta fase no pregunta y anota el ruling."
          }
        ]
      }
    ],
    "dependencias": [
      {
        "desde": "Cierre de la implementación",
        "hacia": "Paso 0",
        "tipo": "dispara",
        "nota": "Todas las olas cerradas con commit y gate; si falta una, no hay auditoría."
      },
      {
        "desde": "Paso 0",
        "hacia": "Recon",
        "tipo": "prepara",
        "nota": "Deja el proyecto vivo y el material por rutas antes de despachar."
      },
      {
        "desde": "Sub1 (revisores + fixer + gate)",
        "hacia": "Recon",
        "tipo": "precede",
        "nota": "En serie: el auditor prueba el árbol ya corregido, no uno que va a cambiar."
      },
      {
        "desde": "Orquestador",
        "hacia": "Recon",
        "tipo": "despacha",
        "nota": "Un recon-auditoria con el modelo de la estrategia, en un solo subagent."
      },
      {
        "desde": "Recon",
        "hacia": "entorno.md",
        "tipo": "escribe",
        "nota": "Sin ese archivo no se despacha la auditoría."
      },
      {
        "desde": "Recon",
        "hacia": "Áreas",
        "tipo": "entrega",
        "nota": "Script base, credenciales, modo decidido y áreas propuestas."
      },
      {
        "desde": "Áreas",
        "hacia": "Consolidación",
        "tipo": "reporta",
        "nota": "Un reporte por área más el recorrido y su log; se reusa el server del recon."
      },
      {
        "desde": "Consolidación",
        "hacia": "Commit de evidencia",
        "tipo": "commitea",
        "nota": "Con el veredicto y antes de decidir si hay corrección."
      },
      {
        "desde": "Consolidación",
        "hacia": "Fixer visual",
        "tipo": "deriva",
        "nota": "Solo con fallos reproducibles: un fallo sin pasos se devuelve una vez al área."
      },
      {
        "desde": "Fixer visual",
        "hacia": "Re-prueba",
        "tipo": "antecede",
        "nota": "El orquestador commitea la corrección y el gate vuelve a verde."
      },
      {
        "desde": "Re-prueba",
        "hacia": "hd-close",
        "tipo": "encadena",
        "nota": "Solo con veredicto OK; CON_FALLOS es freno real, no segunda ronda."
      }
    ]
  },
  "flujo": {
    "titulo": "Camino principal: de olas cerradas a la feature probada",
    "pasos": [
      {
        "titulo": "Se cierra la implementación",
        "tipo": "entrada",
        "resumen": "Todas las olas tienen commit y gate; el orquestador carga hd-review.",
        "detalle": "No hay pausa humana ni pausa por contexto: la fase 4 arranca en el mismo flujo.",
        "archivos": [
          "skills/hd-implement/SKILL.md:325-327",
          "skills/hd-review/SKILL.md:85, 180"
        ],
        "datos": [
          "commits por ola",
          "logs de gate"
        ]
      },
      {
        "titulo": "Paso 0: el trabajo se puede revisar",
        "tipo": "validacion",
        "resumen": "Se verifica el estado de cierre y que el proyecto se pueda levantar.",
        "detalle": "Worktrees borrados, rama limpia salvo .hd, artefactos al día y memoria leída. El server queda como job en background del orquestador.",
        "archivos": [
          "skills/hd-review/SKILL.md:87-104"
        ],
        "datos": [
          "git worktree list",
          "git status",
          "comando de arranque"
        ]
      },
      {
        "titulo": "Se prepara el material por rutas",
        "tipo": "efecto",
        "resumen": "Diffs por ola, diff total y logs de gate quedan en logs/.",
        "detalle": "El auditor los lee por ruta: el chat no es el contrato.",
        "archivos": [
          "skills/hd-review/SKILL.md:99-103"
        ],
        "datos": [
          "ola-<N>-diff.patch",
          "cierre-diff.patch"
        ]
      },
      {
        "titulo": "Sub1 cierra: código leído y corregido",
        "tipo": "validacion",
        "resumen": "Un revisor por ola lee el diff; si hay hallazgos, un fixer los corrige y el gate vuelve a verde.",
        "detalle": "La auditoría no arranca antes: probaría un árbol que todavía va a cambiar. Es la razón de la serie sub1 → sub2.",
        "archivos": [
          "skills/hd-review/SKILL.md:105-175",
          "skills/hd-review/SKILL.md:180"
        ],
        "datos": [
          "reports/revision-ola-<N>.md",
          "commit de corrección",
          "gate"
        ]
      },
      {
        "titulo": "Recon: se conquista el entorno",
        "tipo": "efecto",
        "resumen": "Un solo agente paga el costo fijo de levantar, autenticar y sembrar.",
        "detalle": "Confirma el proyecto vivo, consigue credenciales reales, siembra los datos del spec y deja el script base del recorrido. Nada se instala dentro del repo.",
        "archivos": [
          "skills/hd-review/SKILL.md:184-196"
        ],
        "datos": [
          "usuarios de prueba",
          "seeds",
          "script base"
        ]
      },
      {
        "titulo": "Se decide el modo y se firma el contrato de la pasada",
        "tipo": "decision",
        "resumen": "UI si hay frontend y el navegador arranca; si no, API con el motivo exacto.",
        "detalle": "La decisión se toma en el recon, no a mitad de la auditoría. entorno.md deja comando, puerto, usuarios, modo, áreas y la ruta de las herramientas.",
        "caminos": [
          {
            "condicion": "Hay frontend y el navegador arranca",
            "resultado": "Modo UI: clics, estados visuales, consola y red."
          },
          {
            "condicion": "No hay frontend",
            "resultado": "Modo API con curl/fetch: auth, secuencias y códigos."
          },
          {
            "condicion": "Hay frontend pero el navegador no arranca",
            "resultado": "Modo API con el motivo (Docker, EPERM, display) y los flujos de UI como residual declarado."
          },
          {
            "condicion": "Ni entorno ni API",
            "resultado": "NO_VERIFICABLE: frena el cierre y se reporta al humano."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:190-194"
        ],
        "datos": [
          "reports/auditoria/entorno.md"
        ]
      },
      {
        "titulo": "Se despachan 2 a 4 áreas en un solo mensaje",
        "tipo": "efecto",
        "resumen": "El corte es por superficies que no comparten estado, no por cantidad de casos.",
        "detalle": "Cada área recibe entorno.md, el script base, su alcance del spec, la memoria y el catálogo. Si la feature es una pantalla indivisible, va un solo auditor y el motivo queda escrito.",
        "archivos": [
          "skills/hd-review/SKILL.md:200-206"
        ],
        "datos": [
          "áreas propuestas",
          "spec.md",
          ".hd/e2e/casos.md"
        ]
      },
      {
        "titulo": "Cada área hace su recorrido",
        "tipo": "efecto",
        "resumen": "Un script por área corre todo el camino en una pasada y vuelca la evidencia.",
        "detalle": "Prueba el camino principal, los controles que toca, auth y permisos, estados y errores, bordes, persistencia y consola/red/logs. No se hace una captura por turno: el script y su log se guardan.",
        "archivos": [
          "skills/hd-review/SKILL.md:208-234"
        ],
        "datos": [
          "reports/auditoria/<área>.md",
          "reports/evidencia/<área>/recorrido.<ext>"
        ]
      },
      {
        "titulo": "Consolidación: un veredicto, una evidencia",
        "tipo": "validacion",
        "resumen": "Se deduplica por flujo, se ordena por severidad y se verifica el árbol.",
        "detalle": "El global es OK si ninguna área reportó fallos, CON_FALLOS si alguna lo hizo y NO_VERIFICABLE solo si el recon no consiguió entorno ni API. Se commitea script, log, capturas y reportes.",
        "archivos": [
          "skills/hd-review/SKILL.md:254-260"
        ],
        "datos": [
          "auditoria-visual.md",
          "arbol-antes.txt",
          "commit de evidencia"
        ]
      },
      {
        "titulo": "¿Qué dice el veredicto?",
        "tipo": "decision",
        "resumen": "OK sigue; CON_FALLOS pide una corrección; NO_VERIFICABLE frena.",
        "detalle": "Un fallo sin pasos reproducibles no llega al fixer: se devuelve una vez al área que lo reportó.",
        "caminos": [
          {
            "condicion": "OK",
            "resultado": "Se salta directo al cierre: no hay corrección que re-probar."
          },
          {
            "condicion": "CON_FALLOS",
            "resultado": "Un fixer visual recibe todos los fallos juntos."
          },
          {
            "condicion": "NO_VERIFICABLE",
            "resultado": "Freno real: se reporta qué no se pudo probar y por qué."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:256-277"
        ]
      },
      {
        "titulo": "Un solo fixer corrige todos los fallos",
        "tipo": "efecto",
        "resumen": "hd-debug obligatorio, guarda de alcance, sin scripts y sin commitear.",
        "detalle": "El orquestador revisa el diff, lo consolida con cherry-pick, commitea y corre build + lint + estándares. Rojo es freno real.",
        "archivos": [
          "skills/hd-review/SKILL.md:276-281"
        ],
        "datos": [
          "fixer-visual.md",
          "commit de corrección",
          "gate"
        ]
      },
      {
        "titulo": "La re-prueba corre los mismos scripts, completos",
        "tipo": "efecto",
        "resumen": "No se re-explora: se re-ejecuta el recorrido entero sobre el árbol corregido.",
        "detalle": "Primero los scripts originales; después los pasos de los fallos corregidos. Cada área deja su reporte de re-prueba y el orquestador consolida y commitea.",
        "archivos": [
          "skills/hd-review/SKILL.md:283-291"
        ],
        "datos": [
          "auditoria/<área>-reprueba.md",
          "auditoria-visual-reprueba.md"
        ]
      },
      {
        "titulo": "Cierre o freno",
        "tipo": "decision",
        "resumen": "OK anota el veredicto y carga hd-close; un segundo fallo es freno real.",
        "detalle": "No hay segunda corrección ni segunda re-prueba. El cierre no corre tests: se apoya en el gate y en el OK visual.",
        "archivos": [
          "skills/hd-review/SKILL.md:293-303",
          "skills/hd-close/SKILL.md:8, 21"
        ],
        "datos": [
          "review-progress.md",
          "ledger.md",
          "resumen-visual/"
        ]
      }
    ]
  },
  "reglas": [
    {
      "regla": "Sub1 y sub2 van en serie: primero todas las lecturas de código, después el comportamiento sobre el árbol corregido.",
      "tipo": "Alcance",
      "donde": "skills/hd-review/SKILL.md:67, 180",
      "consecuencia": "El auditor nunca prueba bugs que la corrección de código iba a arreglar."
    },
    {
      "regla": "La auditoría se dispara sola al cerrar la implementación, y tampoco se pausa por contexto: no hay un presupuesto del orquestador que la cancele.",
      "tipo": "Alcance",
      "donde": "skills/hd-review/SKILL.md:85, 180, 264",
      "consecuencia": "El trabajo no queda a mitad de camino entre sub1 y sub2."
    },
    {
      "regla": "Sin entorno.md no se despacha la auditoría: comando, puerto, usuarios, modo, motivo y áreas.",
      "tipo": "Validación",
      "donde": "skills/hd-review/SKILL.md:194",
      "consecuencia": "Sin entorno y sin credenciales, el auditor explora en vez de inspeccionar."
    },
    {
      "regla": "El modo (UI o API) se decide una sola vez, en el recon, no a mitad de la auditoría.",
      "tipo": "Validación",
      "donde": "skills/hd-review/SKILL.md:190",
      "consecuencia": "Todas las áreas prueban el mismo modo y la evidencia es comparable."
    },
    {
      "regla": "Nada se instala dentro del repo: navegador y utilidades viven fuera del árbol; lo del repo lo hace el orquestador.",
      "tipo": "Seguridad",
      "donde": "skills/hd-review/SKILL.md:196, 220",
      "consecuencia": "El repo no se ensucia con dependencias o binarios del auditor."
    },
    {
      "regla": "El corte es por 2 a 4 superficies disjuntas, nunca por cantidad de casos; una pantalla indivisible va con un solo auditor y el motivo escrito.",
      "tipo": "Alcance",
      "donde": "skills/hd-review/SKILL.md:202-204",
      "consecuencia": "Menos preparación duplicada y una consolidación que no pierde fallos."
    },
    {
      "regla": "Un recorrido, un script: corre el camino completo en una pasada y se guarda con su log.",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:227-228",
      "consecuencia": "La evidencia es reproducible y la re-prueba cuesta una fracción de la primera pasada."
    },
    {
      "regla": "La evidencia viaja con el veredicto: reportes, script, log y capturas se commitean antes de corregir.",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:83, 259",
      "consecuencia": "Un veredicto sin evidencia commiteada no existe, y un freno deja prueba en el repo."
    },
    {
      "regla": "Una sola corrección con todos los fallos juntos, con reloj propio (10 min / 10 turnos).",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:273-281",
      "consecuencia": "El fixer no se come el presupuesto del auditor ni hay refactors colados."
    },
    {
      "regla": "Una sola re-prueba y completa: mismos roles y mismos scripts, no solo lo que falló.",
      "tipo": "Idempotencia",
      "donde": "skills/hd-review/SKILL.md:73, 285-289",
      "consecuencia": "Un cambio que rompe otra parte del flujo se ve antes de cerrar."
    },
    {
      "regla": "Veredicto global OK, CON_FALLOS o NO_VERIFICABLE; NO_VERIFICABLE frena el cierre.",
      "tipo": "Validación",
      "donde": "skills/hd-review/SKILL.md:257, 277",
      "consecuencia": "No se cierra un trabajo que nunca se pudo probar."
    },
    {
      "regla": "Residual no es verde: lo que el entorno no permitió probar se declara y no cuenta como aprobado.",
      "tipo": "Validación",
      "donde": "skills/hd-review/SKILL.md:71, 223, 245",
      "consecuencia": "El cierre hereda el residual en vez de inventar un verde."
    },
    {
      "regla": "Los presupuestos son de los subagentes: el orquestador no tiene un tope de contexto que lo autorice a cortar la fase.",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:264",
      "consecuencia": "El encadenado sub1→sub2 no depende de cuánto contexto le quede al orquestador."
    }
  ],
  "bordes": [
    {
      "caso": "No hay frontend",
      "esperado": "Auditar la API como un humano con Postman.",
      "actual": "Modo API con curl/fetch: auth, secuencias, códigos, permisos y persistencia.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:190, 208-216"
    },
    {
      "caso": "Hay frontend pero el navegador no arranca",
      "esperado": "Auditar por API y declarar qué UI quedó sin probar.",
      "actual": "Modo API con el motivo y residuales de UI en el reporte.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:190, 240"
    },
    {
      "caso": "El navegador muere a mitad de un área",
      "esperado": "Terminar por API y declarar el cambio y el residual.",
      "actual": "El modo se decide en el recon y no se revisa a mitad; la caída por área no está prevista.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:190 vs 71"
    },
    {
      "caso": "El recon agota presupuesto sin entorno",
      "esperado": "Seguir en API con lo que haya o frenar como NO_VERIFICABLE.",
      "actual": "Modo API con lo que haya; si tampoco hay API, NO_VERIFICABLE.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:198, 270"
    },
    {
      "caso": "Dos áreas tocan las mismas filas o usuarios de prueba",
      "esperado": "Datos y sesiones aislados por área.",
      "actual": "Se exige que las superficies no compartan estado, pero nadie asigna usuarios ni registros distintos por área.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:189, 204"
    },
    {
      "caso": "Un fallo llega sin pasos reproducibles",
      "esperado": "Devolverlo al área, no mandarlo al fixer.",
      "actual": "Se devuelve una vez al área que lo reportó.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:260-262"
    },
    {
      "caso": "Un área agota su presupuesto a mitad del recorrido",
      "esperado": "Cortar y declarar residual de su área.",
      "actual": "Corta y declara; el reporte tiene sección No verificado.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:245, 271"
    },
    {
      "caso": "El entorno ensucia el repo durante la pasada",
      "esperado": "Detectarlo, revertirlo y anotarlo.",
      "actual": "git status contra arbol-antes.txt; diferencia fuera de .hd se revierte y se documenta.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:258"
    },
    {
      "caso": "La re-prueba vuelve a fallar",
      "esperado": "Freno real con diagnóstico, sin tercera ronda.",
      "actual": "No hay segunda corrección ni segunda re-prueba.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:294"
    },
    {
      "caso": "Todas las áreas declaran el camino principal no verificado, sin fallos",
      "esperado": "Que el global no sea verde.",
      "actual": "El global es OK: se calcula por ausencia de fallos, no por cobertura probada.",
      "estado": "roto",
      "evidencia": "skills/hd-review/SKILL.md:223, 241, 257"
    },
    {
      "caso": "La sesión no puede escribir (política read-only)",
      "esperado": "Pedir escritura o aplazar la pasada, nunca auditar sin evidencia.",
      "actual": "La evidencia exige commit; la skill no prevé el bloqueo de escritura.",
      "estado": "no-verificado",
      "evidencia": "skills/hd-review/SKILL.md:83, 259"
    }
  ],
  "hallazgos": [
    {
      "titulo": "El veredicto OK no descuenta los residuales de las áreas",
      "tipo": "validacion",
      "severidad": "alta",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:223, 241, 257",
      "impacto": "Un área puede declarar su camino principal «no verificado» y aun así no reportar fallos; el global queda OK y el trabajo cierra en verde con la pantalla sin probar. La definición de OK es ausencia de fallos, no cobertura.",
      "sugerencia": "Que el global baje a NO_VERIFICABLE (o un estado CON_RESIDUAL que no cierre) si el camino principal de un área quedó no verificado, y que el cierre exija al menos un PASA por cada camino prometido en el spec."
    },
    {
      "titulo": "Las áreas en paralelo no tienen datos de prueba aislados",
      "tipo": "riesgo",
      "severidad": "media",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:189, 192, 204, 206",
      "impacto": "Dos áreas pueden tocar la misma fila o el mismo usuario: una borra lo que la otra lee y la evidencia sale contaminada, con fallos que no existen o verdes que no prueban nada.",
      "sugerencia": "Que el recon asigne y declare en entorno.md un usuario y un conjunto de registros por área, o marque read-only las áreas que solo leen; el reporte debe decir con qué datos corrió cada una."
    },
    {
      "titulo": "NO_VERIFICABLE no tiene camino de salida",
      "tipo": "riesgo",
      "severidad": "media",
      "confianza": "media",
      "evidencia": "skills/hd-review/SKILL.md:198, 257, 277",
      "impacto": "Si el entorno falla por algo reparable (Docker apagado, variable faltante), el trabajo queda bloqueado sin una segunda pasada de recon aunque el entorno se arregle un minuto después. La única salida es que el humano vuelva a invocar todo.",
      "sugerencia": "Permitir un re-recon único con el entorno ya arreglado, sin contarlo como segunda ronda de auditoría, y dejar en el ledger el motivo del primer bloqueo."
    },
    {
      "titulo": "Lo que el área descubre se pierde si el trabajo se frena",
      "tipo": "deuda",
      "severidad": "media",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:247-250, 277, 294, 302",
      "impacto": "Los casos ejercitados y los caminos descubiertos se anotan en el reporte del área, pero el catálogo se actualiza recién en el cierre. Un CON_FALLOS o un NO_VERIFICABLE deja esos hallazgos solo en el reporte.",
      "sugerencia": "Actualizar .hd/e2e/casos.md en la consolidación, junto con el commit de evidencia, y no esperar al cierre."
    },
    {
      "titulo": "El fixer visual no hereda la regla de no comentarios",
      "tipo": "deuda",
      "severidad": "baja",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:86, 163, 279",
      "impacto": "El fixer de revisión tiene la instrucción explícita de no agregar comentarios y borrar los que el archivo traiga; el fixer visual no la recibe, aunque la regla 20 diga que un comentario es un hallazgo.",
      "sugerencia": "Sumar «sin comentarios» al brief del fixer-visual, igual que en la corrección de sub1."
    },
    {
      "titulo": "La caída a modo API no está prevista por área",
      "tipo": "riesgo",
      "severidad": "baja",
      "confianza": "media",
      "evidencia": "skills/hd-review/SKILL.md:71, 190, 240",
      "impacto": "El modo se decide en el recon «no a mitad de la auditoría», pero una regla general permite caer a API si el navegador no arranca. Si el browser muere dentro de un área, no está claro si termina en API, corta o cambia el modo.",
      "sugerencia": "Definir la caída por área: completar el script en API, declarar el cambio de modo y el residual de UI de esa área."
    }
  ],
  "impacto": {
    "consumidores": [
      "hd-close: la precondición del cierre es la re-prueba visual en OK.",
      "El humano: recibe el trabajo cerrado, el resumen visual y los residuales declarados.",
      "review-progress.md y el ledger: guardan el veredicto, los modelos y los rulings.",
      "El catálogo .hd/e2e/casos.md: se mantiene con lo que el auditor ejercitó y descubrió.",
      "La rama: cada pasada deja su commit de evidencia, y la corrección el suyo.",
      "Las auditorías siguientes: los scripts guardados son la base de la re-prueba."
    ],
    "siCambia": [
      "Los presupuestos en turnos y minutos de recon, áreas, consolidación, fixer y re-prueba.",
      "La definición de veredicto y el camino de cierre o freno.",
      "El contrato de evidencia: qué se commitea y cuándo.",
      "El criterio de corte por áreas y el modo UI/API.",
      "El costo en tokens y la elección de modelos para revisar y auditar.",
      "El formato de los reportes de área y del consolidado."
    ],
    "datos": [
      "Credenciales y usuarios de prueba: fuera del repo y declarados en entorno.md.",
      "Reportes Markdown por área y consolidado, con pasos y evidencia.",
      "Scripts de recorrido (Playwright/CDP o curl/fetch) y sus logs.",
      "Capturas y volcados de consola y red; video nunca.",
      "Commits de evidencia y de corrección en la rama del trabajo.",
      "El catálogo e2e y la memoria del proyecto, que el auditor lee pero no edita."
    ]
  },
  "archivos": [
    {
      "ruta": "skills/hd-review/SKILL.md",
      "capa": "Orquestación",
      "rol": "Define toda la fase 4: sub1, los tres tramos de sub2, la corrección, la re-prueba y el cierre."
    },
    {
      "ruta": "skills/hd-review/templates/review-progress-template.md",
      "capa": "Datos",
      "rol": "Bloque de auditoría: recon, modo, entorno, presupuesto, áreas, fallos y no verificable."
    },
    {
      "ruta": "skills/hd-implement/SKILL.md",
      "capa": "Entrada",
      "rol": "Cierra la fase 3 y encadena hd-review sin pausa humana ni por contexto."
    },
    {
      "ruta": "skills/hd-close/SKILL.md",
      "capa": "Orquestación",
      "rol": "Consume el OK visual como precondición del cierre y no corre tests salvo commits fast."
    },
    {
      "ruta": "skills/hd-debug/SKILL.md",
      "capa": "Dominio",
      "rol": "Declara al auditor visual como única excepción a «los subagentes no ejecutan scripts»."
    },
    {
      "ruta": "skills/hd-e2e/SKILL.md",
      "capa": "Dominio",
      "rol": "Separa la feature auditada por sub2 de la app entera, que corre solo el humano."
    },
    {
      "ruta": "skills/hd-spec/templates/plan-template.md",
      "capa": "Dominio",
      "rol": "El «comportamiento esperado» es la fuente contra la que el auditor compara."
    },
    {
      "ruta": "README.md",
      "capa": "Dominio",
      "rol": "Explica G3, la fase 4 y la regla de que la auditoría nunca es opcional."
    },
    {
      "ruta": ".hd/memory.md",
      "capa": "Datos",
      "rol": "Decisiones del humano y datos ya verificados: el auditor no los inventa ni los reporta como bugs."
    },
    {
      "ruta": ".hd/<trabajo>/ledger.md",
      "capa": "Datos",
      "rol": "Modelos usados, evidencia, rulings y el estado de la fase."
    },
    {
      "ruta": ".hd/e2e/casos.md",
      "capa": "Datos",
      "rol": "Catálogo de comportamiento prometido; el auditor anota lo ejercitado y lo descubierto."
    }
  ],
  "limites": [
    "Lectura estática: no se ejecutó ninguna auditoría, no se levantó ningún proyecto y no se corrió un solo script.",
    "El auditor no existe como código: es un procedimiento escrito en la skill. Los hallazgos son sobre la definición, no sobre una corrida real.",
    "La página describe el árbol de trabajo: HEAD b260f0f más los cambios sin commitear de la regla 19 y del presupuesto del orquestador.",
    "No se leyeron reportes reales de auditorías para contrastar el procedimiento con la práctica; en este repo no hay .hd/<trabajo>/reports/auditoria/.",
    "No se evaluó el comportamiento real de Playwright, CDP ni de los modelos: los tiempos son presupuestos declarados, no mediciones.",
    "No se verificó si cada instalación del harness permite 2 a 4 agentes simultáneos; la skill lo condiciona al máximo disponible.",
    "Quedaron fuera la fase 1 (discovery), la 2 (paquete) y el detalle de sub1 (revisores de código): se explican solo como precondición."
  ]
};

(function () {
  "use strict";

  var D = window.HD_MAPA || {};

  function byId(id) { return document.getElementById(id); }
  function str(v) { return typeof v === "string" ? v.trim() : ""; }
  function has(v) { return str(v) !== ""; }
  function lista(v) { return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : []; }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      if (c === "&") return "&amp;";
      if (c === "<") return "&lt;";
      if (c === ">") return "&gt;";
      if (c === '"') return "&quot;";
      return "&#39;";
    });
  }

  function vacio(texto) {
    return '<p class="vacio">' + esc(texto || "No aplica en este flujo.") + "</p>";
  }

  function renderHero() {
    var meta = D.meta || {};
    var titulo = str(D.feature) || "Mapa de lógica";

    document.title = titulo + " · Mapa de lógica";
    byId("hero-feature").textContent = titulo;
    byId("topbar-feature").textContent = str(meta.repo);
    byId("topbar-fecha").textContent = str(meta.fecha);
    byId("footer-fecha").textContent = str(meta.fecha);

    var lead = byId("hero-resumen");
    if (has(D.resumen)) lead.textContent = D.resumen;
    else lead.hidden = true;

    var chips = [];
    if (has(meta.alcance)) chips.push('<li class="chip">' + esc(meta.alcance) + "</li>");
    if (has(meta.rama)) chips.push('<li class="chip">rama <code>' + esc(meta.rama) + "</code></li>");
    if (has(meta.commit)) chips.push('<li class="chip">commit <code>' + esc(meta.commit) + "</code></li>");
    if (has(meta.lectura)) chips.push('<li class="chip">' + esc(meta.lectura) + "</li>");
    var chipsEl = byId("hero-chips");
    if (chips.length) chipsEl.innerHTML = chips.join("");
    else chipsEl.hidden = true;

    var metricas = lista(D.metricas).filter(function (m) { return m && has(String(m.valor)); });
    if (!metricas.length) {
      var auto = [];
      var capas = lista((D.mapa || {}).capas).length;
      var pasos = lista((D.flujo || {}).pasos).length;
      var reglas = lista(D.reglas).length;
      var bordes = lista(D.bordes).length;
      var hallazgos = lista(D.hallazgos).length;
      if (capas) auto.push({ valor: capas, etiqueta: "capas" });
      if (pasos) auto.push({ valor: pasos, etiqueta: "pasos" });
      if (reglas) auto.push({ valor: reglas, etiqueta: "reglas" });
      if (bordes) auto.push({ valor: bordes, etiqueta: "casos borde" });
      if (hallazgos) auto.push({ valor: hallazgos, etiqueta: "hallazgos" });
      metricas = auto;
    }
    var metricasEl = byId("metricas");
    if (metricas.length) {
      metricasEl.innerHTML = metricas.map(function (m) {
        return '<div class="metrica"><span class="metrica__valor">' + esc(m.valor) +
          '</span><span class="metrica__label">' + esc(m.etiqueta) + "</span></div>";
      }).join("");
    } else {
      metricasEl.hidden = true;
    }
  }

  function renderMapa() {
    var mapa = D.mapa || {};
    var capas = lista(mapa.capas).filter(function (c) { return c && has(c.nombre); });
    var deps = lista(mapa.dependencias).filter(function (d) {
      return d && (has(d.desde) || has(d.hacia));
    });
    if (!capas.length && !deps.length) {
      byId("mapa-lista").innerHTML = vacio();
      return;
    }

    var html = '<div class="mapa">' + capas.map(function (c, i) {
      var items = lista(c.items).filter(function (it) { return it && (has(it.nombre) || has(it.ruta)); });
      var s = '<article class="capa">';
      s += '<div class="capa__lado">';
      s += '<span class="capa__num">' + String(i + 1).padStart(2, "0") + "</span>";
      s += '<span class="capa__nombre">' + esc(c.nombre) + "</span>";
      if (has(c.detalle)) s += '<p class="capa__detalle">' + esc(c.detalle) + "</p>";
      s += "</div>";
      s += '<div class="capa__items">';
      s += items.length ? items.map(function (it) {
        var item = '<div class="capa__item">';
        item += '<span class="capa__item-nombre">' + esc(it.nombre || it.ruta) + "</span>";
        if (has(it.ruta) && has(it.nombre)) item += '<code class="capa__ruta">' + esc(it.ruta) + "</code>";
        if (has(it.rol)) item += '<p class="capa__rol">' + esc(it.rol) + "</p>";
        return item + "</div>";
      }).join("") : vacio("No aplica: esta capa no participa del flujo.");
      s += "</div></article>";
      return s;
    }).join("") + "</div>";

    if (deps.length) {
      html += '<div class="deps"><p class="deps__titulo">Conexiones clave</p>' + deps.map(function (d) {
        var s = '<div class="dep">';
        s += '<code class="dep__nodo">' + esc(d.desde || "—") + "</code>";
        s += '<span class="dep__flecha" aria-hidden="true">→</span>';
        s += '<code class="dep__nodo">' + esc(d.hacia || "—") + "</code>";
        if (has(d.tipo)) s += '<span class="badge badge--tipo">' + esc(d.tipo) + "</span>";
        if (has(d.nota)) s += '<p class="dep__nota">' + esc(d.nota) + "</p>";
        return s + "</div>";
      }).join("") + "</div>";
    }

    byId("mapa-lista").innerHTML = html;
  }

  var TIPOS = {
    entrada: "Entrada",
    validacion: "Validación",
    decision: "Decisión",
    efecto: "Efecto",
    externo: "Externo",
    error: "Error"
  };

  function renderFlujo() {
    var f = D.flujo || {};
    var pasos = lista(f.pasos).filter(function (p) { return p && has(p.titulo); });

    byId("leyenda").innerHTML = Object.keys(TIPOS).map(function (t) {
      return '<span class="leyenda__item"><span class="leyenda__punto leyenda__punto--' + t + '"></span>' +
        TIPOS[t] + "</span>";
    }).join("");

    if (!pasos.length) {
      byId("flujo-lista").innerHTML = vacio();
      return;
    }

    var html = "";
    if (has(f.titulo)) html += '<p class="flujo__titulo">' + esc(f.titulo) + "</p>";

    html += '<ol class="pasos">' + pasos.map(function (p, i) {
      var tipo = TIPOS[p.tipo] ? p.tipo : "efecto";
      var idPanel = "paso-panel-" + i;
      var panel = panelPaso(p, idPanel);
      var tienePanel = panel !== "";
      var abre = tienePanel
        ? ' type="button" class="paso__trigger" aria-expanded="false" aria-controls="' + idPanel + '"'
        : ' class="paso__trigger paso__trigger--estatico"';
      var etiqueta = tienePanel ? "button" : "div";
      var chevron = tienePanel ? '<span class="paso__chevron" aria-hidden="true"></span>' : "";

      var s = '<li class="paso paso--' + tipo + '">';
      s += '<div class="paso__rail"><span class="paso__num">' + (i + 1) + '</span><span class="paso__linea"></span></div>';
      s += '<div class="paso__card">';
      s += "<" + etiqueta + abre + ">";
      s += '<span class="paso__meta"><span class="badge badge--tipo">' + TIPOS[tipo] + "</span></span>";
      s += '<span class="paso__titulo">' + esc(p.titulo) + "</span>";
      if (has(p.resumen)) s += '<span class="paso__resumen">' + esc(p.resumen) + "</span>";
      s += chevron;
      s += "</" + etiqueta + ">";
      s += panel;
      s += "</div></li>";
      return s;
    }).join("") + "</ol>";

    byId("flujo-lista").innerHTML = html;
  }

  function bloqueDatos(titulo, items) {
    if (!items.length) return "";
    return '<div class="paso__dato"><p class="paso__dato-titulo">' + esc(titulo) + "</p><ul>" +
      items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      "</ul></div>";
  }

  function panelPaso(p, idPanel) {
    var partes = [];
    if (has(p.detalle)) partes.push('<p class="paso__detalle">' + esc(p.detalle) + "</p>");

    var datos = lista(p.datos).filter(has);
    var archivos = lista(p.archivos).filter(has);
    if (datos.length) {
      partes.push('<div class="paso__datos">' + bloqueDatos("Datos que toca", datos) + "</div>");
    }

    var caminos = lista(p.caminos).filter(function (c) {
      return c && (has(c.condicion) || has(c.resultado));
    });
    if (caminos.length) {
      partes.push('<ul class="caminos">' + caminos.map(function (c) {
        return '<li class="camino">' +
          '<span class="camino__si">' + esc(c.condicion) + "</span>" +
          '<span class="camino__entonces">' + esc(c.resultado) + "</span>" +
          "</li>";
      }).join("") + "</ul>");
    }

    if (archivos.length) {
      partes.push('<div class="archivos">' + archivos.map(function (a) {
        return '<span class="archivo">' + esc(a) + "</span>";
      }).join("") + "</div>");
    }

    if (!partes.length) return "";
    return '<div class="paso__panel" id="' + idPanel + '" hidden>' + partes.join("") + "</div>";
  }

  function renderReglas() {
    var reglas = lista(D.reglas).filter(function (r) { return r && has(r.regla); });
    if (!reglas.length) {
      byId("reglas-lista").innerHTML = vacio();
      return;
    }
    byId("reglas-lista").innerHTML = '<div class="reglas">' + reglas.map(function (r) {
      var s = '<article class="regla">';
      s += '<div class="regla__cabecera">';
      if (has(r.tipo)) s += '<span class="badge badge--tipo">' + esc(r.tipo) + "</span>";
      s += "</div>";
      s += '<p class="regla__texto">' + esc(r.regla) + "</p>";
      if (has(r.donde)) s += '<p class="regla__donde">' + esc(r.donde) + "</p>";
      if (has(r.consecuencia)) {
        s += '<p class="regla__consecuencia"><span class="etiqueta">Si se rompe</span>' + esc(r.consecuencia) + "</p>";
      }
      return s + "</article>";
    }).join("") + "</div>";
  }

  var ESTADOS_BORDE = {
    cubierto: { etiqueta: "Cubierto", badge: "ok", clase: "cubierto" },
    dudoso: { etiqueta: "Dudoso", badge: "dudoso", clase: "dudoso" },
    roto: { etiqueta: "Roto", badge: "roto", clase: "roto" },
    "no-verificado": { etiqueta: "No verificado", badge: "sinverificar", clase: "no-verificado" }
  };

  function renderBordes() {
    var bordes = lista(D.bordes).filter(function (b) { return b && has(b.caso); });
    if (!bordes.length) {
      byId("bordes-lista").innerHTML = vacio();
      return;
    }
    byId("bordes-lista").innerHTML = '<div class="bordes">' + bordes.map(function (b) {
      var estado = ESTADOS_BORDE[b.estado] ? b.estado : "no-verificado";
      var e = ESTADOS_BORDE[estado];
      var s = '<article class="borde borde--' + e.clase + '">';
      s += '<div class="borde__cabecera">';
      s += '<span class="borde__caso">' + esc(b.caso) + "</span>";
      s += '<span class="badge badge--' + e.badge + '">' + e.etiqueta + "</span>";
      s += "</div>";
      if (has(b.esperado)) {
        s += '<div class="borde__par"><span class="borde__label">Esperado</span><span>' + esc(b.esperado) + "</span></div>";
      }
      if (has(b.actual)) {
        s += '<div class="borde__par"><span class="borde__label">Actual</span><span>' + esc(b.actual) + "</span></div>";
      }
      if (has(b.evidencia)) {
        s += '<p class="borde__evidencia">' + esc(b.evidencia) + "</p>";
      }
      return s + "</article>";
    }).join("") + "</div>";
  }

  var TIPOS_HALLAZGO = {
    bug: "Bug",
    validacion: "Validación faltante",
    riesgo: "Riesgo",
    deuda: "Deuda"
  };

  function renderHallazgos() {
    var hallazgos = lista(D.hallazgos).filter(function (h) { return h && has(h.titulo); });
    var filtros = byId("filtros");
    var cont = byId("hallazgos-lista");

    if (!hallazgos.length) {
      filtros.innerHTML = "";
      cont.innerHTML = vacio("No se encontraron bugs, validaciones faltantes ni riesgos en este flujo con la evidencia leída.");
      return;
    }

    var conteo = { todos: hallazgos.length, bug: 0, validacion: 0, riesgo: 0, deuda: 0 };
    hallazgos.forEach(function (h) {
      if (conteo[h.tipo] != null) conteo[h.tipo] += 1;
    });

    var botones = [{ id: "todos", label: "Todos" }].concat(Object.keys(TIPOS_HALLAZGO).map(function (t) {
      return { id: t, label: TIPOS_HALLAZGO[t] };
    }));

    filtros.innerHTML = botones.map(function (b) {
      return '<button type="button" class="filtro" data-filtro="' + b.id + '" aria-pressed="' +
        (b.id === "todos" ? "true" : "false") + '">' + b.label + " (" + (conteo[b.id] || 0) + ")</button>";
    }).join("");

    cont.innerHTML = '<div class="hallazgos">' + hallazgos.map(function (h) {
      var tipo = TIPOS_HALLAZGO[h.tipo] ? h.tipo : "deuda";
      var sev = h.severidad === "alta" || h.severidad === "media" || h.severidad === "baja" ? h.severidad : "baja";
      var conf = has(h.confianza) ? "Confianza " + esc(h.confianza) : "";

      var s = '<article class="hallazgo hallazgo--' + sev + '" data-tipo="' + tipo + '">';
      s += '<div class="hallazgo__cabecera">';
      s += '<span class="badge badge--' + sev + '">' + (sev === "alta" ? "Alta" : sev === "media" ? "Media" : "Baja") + "</span>";
      s += '<span class="badge badge--tipo">' + TIPOS_HALLAZGO[tipo] + "</span>";
      if (conf) s += '<span class="badge badge--tipo">' + conf + "</span>";
      s += "</div>";
      s += '<h3 class="hallazgo__titulo">' + esc(h.titulo) + "</h3>";
      if (has(h.evidencia)) s += '<p class="hallazgo__evidencia">' + esc(h.evidencia) + "</p>";
      if (has(h.impacto)) {
        s += '<div class="hallazgo__bloque"><span class="hallazgo__label">Impacto</span><p>' + esc(h.impacto) + "</p></div>";
      }
      if (has(h.sugerencia)) {
        s += '<div class="hallazgo__sugerencia"><strong>Sugerencia</strong>' + esc(h.sugerencia) + "</div>";
      }
      return s + "</article>";
    }).join("") + "</div>";
  }

  function renderImpacto() {
    var impacto = D.impacto || {};
    var consumidores = lista(impacto.consumidores).filter(has);
    var siCambia = lista(impacto.siCambia).filter(has);
    var datos = lista(impacto.datos).filter(has);

    if (!consumidores.length && !siCambia.length && !datos.length) {
      byId("impacto-lista").innerHTML = vacio();
      return;
    }

    function bloque(titulo, items) {
      return '<div class="impacto__bloque"><h3>' + esc(titulo) + "</h3>" +
        (items.length
          ? '<ul class="impacto__lista">' + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
          : vacio("No aplica.")) +
        "</div>";
    }

    byId("impacto-lista").innerHTML = '<div class="impacto">' +
      bloque("Quién depende de esto", consumidores) +
      bloque("Qué se rompe si cambia", siCambia) +
      bloque("Datos que toca", datos) +
      "</div>";
  }

  function renderArchivos() {
    var archivos = lista(D.archivos).filter(function (a) { return a && has(a.ruta); });
    if (!archivos.length) {
      byId("archivos-lista").innerHTML = vacio();
      return;
    }
    byId("archivos-lista").innerHTML = '<div class="archivos-lista">' + archivos.map(function (a) {
      return '<div class="archivo-fila">' +
        '<code class="archivo-fila__ruta">' + esc(a.ruta) + "</code>" +
        '<span class="archivo-fila__capa">' + esc(a.capa) + "</span>" +
        '<span class="archivo-fila__rol">' + esc(a.rol) + "</span>" +
        "</div>";
    }).join("") + "</div>";
  }

  function renderLimites() {
    var limites = lista(D.limites).filter(has);
    byId("limites-lista").innerHTML = limites.length
      ? '<ul class="limites">' + limites.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>"
      : vacio("No se declararon límites: revisar si la lectura fue completa.");
  }

  function renderAvisoDemo() {
    if (D.demo !== true) return;
    var aviso = document.createElement("div");
    aviso.className = "aviso-demo";
    aviso.innerHTML = '<div class="aviso-demo__inner"><strong>Datos de ejemplo.</strong> ' +
      "Esta página es la plantilla de hd-logic-comprehension: reemplazá <code>window.HD_MAPA</code> por el flujo real, " +
      "poné <code>demo: false</code> y traducí los textos fijos si el trabajo no es en español.</div>";
    document.body.insertBefore(aviso, document.body.firstChild);
  }

  function activarPaneles() {
    byId("flujo-lista").addEventListener("click", function (e) {
      var boton = e.target.closest(".paso__trigger[aria-expanded]");
      if (!boton) return;
      var panel = byId(boton.getAttribute("aria-controls"));
      if (!panel) return;
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      panel.hidden = abierto;
    });
  }

  function activarFiltros() {
    byId("filtros").addEventListener("click", function (e) {
      var boton = e.target.closest("button[data-filtro]");
      if (!boton) return;
      var filtro = boton.getAttribute("data-filtro");
      byId("filtros").querySelectorAll("button[data-filtro]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === boton));
      });
      byId("hallazgos-lista").querySelectorAll(".hallazgo").forEach(function (h) {
        h.hidden = filtro !== "todos" && h.getAttribute("data-tipo") !== filtro;
      });
      void filtro;
    });
  }

  function activarScrollspy() {
    var enlaces = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!enlaces.length || !("IntersectionObserver" in window)) return;

    var secciones = enlaces.map(function (a) {
      var id = a.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.getElementById(id.slice(1)) : null;
    });
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlaces.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    secciones.forEach(function (s) { if (s) observador.observe(s); });
    enlaces[0].classList.add("is-active");
  }

  renderAvisoDemo();
  renderHero();
  renderMapa();
  renderFlujo();
  renderReglas();
  renderBordes();
  renderHallazgos();
  renderImpacto();
  renderArchivos();
  renderLimites();
  activarPaneles();
  activarFiltros();
  activarScrollspy();
})();
