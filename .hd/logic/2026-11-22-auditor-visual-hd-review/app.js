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
  "demo": false,
  "feature": "El auditor visual de hd-review (G3)",
  "resumen": "Cada trabajo HD cierra con dos lecturas independientes: primero los revisores leen el código y un fixer corrige; después un subagente auditor levanta el proyecto entero y prueba la feature como un humano, por la UI o contra la API. Si encuentra fallos, otro fixer los corrige y el mismo rol repite el recorrido completo. Es el único punto del framework donde un subagente ejecuta el producto, y su reporte es lo que permite cerrar sin tests.",
  "meta": {
    "fecha": "2026-11-22",
    "repo": "hiper-driven · skills HD",
    "rama": "main",
    "commit": "fc3449b",
    "alcance": "Fase 4 (hd-review), subfase 2: del disparo al reporte y la re-prueba",
    "lectura": "Lectura estática de skills y plantillas"
  },
  "mapa": {
    "capas": [
      {
        "nombre": "Entrada y disparo",
        "detalle": "Quién decide que hay que auditar y con qué material",
        "items": [
          {
            "nombre": "Cierre de la fase 3",
            "ruta": "skills/hd-implement/SKILL.md:323",
            "rol": "Al cerrar todas las olas, el orquestador carga hd-review; no hay pausa humana."
          },
          {
            "nombre": "Paso 0 — estado de cierre",
            "ruta": "skills/hd-review/SKILL.md:64-80",
            "rol": "Olas cerradas, worktrees borrados, rama limpia, artefactos al día y proyecto que se pueda levantar."
          },
          {
            "nombre": "Material por rutas",
            "ruta": "skills/hd-review/SKILL.md:76-80",
            "rol": "Prepara ola-N-diff.patch, cierre-diff.patch y logs de gate: el auditor lee por ruta, no por chat."
          },
          {
            "nombre": "Orquestador de la fase 4",
            "ruta": "skills/hd-review/SKILL.md:28-37",
            "rol": "Despacha, consolida, commitea, corre el gate y decide; no escribe código de producción."
          }
        ]
      },
      {
        "nombre": "Aplicación — el auditor",
        "detalle": "Cómo se despacha y qué hace con su tiempo",
        "items": [
          {
            "nombre": "auditor-visual (subagente)",
            "ruta": "skills/hd-review/SKILL.md:34",
            "rol": "Levanta el proyecto y lo prueba como un humano: UI, o API con curl/fetch. No edita el producto."
          },
          {
            "nombre": "Brief del auditor",
            "ruta": "skills/hd-review/SKILL.md:159-172",
            "rol": "Proyecto y arranque, flujos prometidos por el spec, UI vs API, modo API si el navegador no arranca, instalar lo necesario, no tocar producción."
          },
          {
            "nombre": "Presupuesto y recorrido",
            "ruta": "skills/hd-review/SKILL.md:174-179",
            "rol": "10 minutos por feature chica y 20 de techo; un script de recorrido por pasada; el script y su log quedan como evidencia."
          },
          {
            "nombre": "Qué prueba",
            "ruta": "skills/hd-review/SKILL.md:181-190",
            "rol": "Arranque, auth y permisos, camino principal, todos los controles, estados y errores, bordes, persistencia, consola, red y logs."
          },
          {
            "nombre": "hd-debug (transversal)",
            "ruta": "skills/hd-debug/SKILL.md:23",
            "rol": "Declara al auditor como única excepción a «los subagentes no ejecutan scripts»."
          }
        ]
      },
      {
        "nombre": "Dominio — el contrato de verificación",
        "detalle": "Qué significa «auditado» y qué no se puede declarar en falso",
        "items": [
          {
            "nombre": "G3 — auditoría visual",
            "ruta": "README.md:182",
            "rol": "Gate de comportamiento: la feature de punta a punta; una corrección con fixer y re-prueba entera."
          },
          {
            "nombre": "Modo UI o modo API",
            "ruta": "skills/hd-review/SKILL.md:163-167",
            "rol": "UI click por click; sin frontend, API como con Postman (auth, secuencias, códigos, permisos, persistencia). Navegador caído, modo API con residuales declarados."
          },
          {
            "nombre": "Residual no es verde",
            "ruta": "skills/hd-review/SKILL.md:172",
            "rol": "Lo que el entorno no permite probar se declara no verificable y no cuenta como aprobado."
          },
          {
            "nombre": "Catálogo de hd-e2e",
            "ruta": "skills/hd-e2e/SKILL.md:202",
            "rol": "El auditor anota qué casos ejercitó y qué caminos descubrió; el orquestador los incorpora al catálogo."
          },
          {
            "nombre": "Comportamiento esperado del plan",
            "ruta": "skills/hd-spec/templates/plan-template.md:45",
            "rol": "Lo que se va a auditar nace del plan: sin ese texto la auditoría no tiene contra qué comparar."
          }
        ]
      },
      {
        "nombre": "Datos — los artefactos que deja",
        "detalle": "Todo vive en .hd/<trabajo>/",
        "items": [
          {
            "nombre": "auditoria-visual.md",
            "ruta": ".hd/<trabajo>/reports/auditoria-visual.md",
            "rol": "Modo, veredicto, un fallo por línea con pasos, esperado, obtenido y evidencia; más no verificado, casos del catálogo y descubiertos."
          },
          {
            "nombre": "recorrido.<ext> y su log",
            "ruta": ".hd/<trabajo>/reports/evidencia/",
            "rol": "El script de una sola pasada (Playwright o CDP si es UI; curl o fetch si es API) y su salida: es la evidencia y lo que corre la re-prueba."
          },
          {
            "nombre": "auditoria-visual-reprueba.md",
            "ruta": ".hd/<trabajo>/reports/auditoria-visual-reprueba.md",
            "rol": "Segundo reporte, con el log del recorrido completo sobre el árbol corregido."
          },
          {
            "nombre": "review-progress.md",
            "ruta": "skills/hd-review/templates/review-progress-template.md:62-111",
            "rol": "Bloques de auditoría, corrección y re-prueba, más el veredicto global que el cierre exige."
          },
          {
            "nombre": "casos.md",
            "ruta": ".hd/e2e/casos.md",
            "rol": "Catálogo actualizado con los IDs nuevos en NUEVO y los ejercitados con fecha y resultado."
          }
        ]
      },
      {
        "nombre": "Externos — contra qué se prueba",
        "detalle": "El mundo real del proyecto, no el chat",
        "items": [
          {
            "nombre": "Proyecto levantado",
            "ruta": "skills/hd-review/SKILL.md:73",
            "rol": "Dependencias, variables de entorno, seeds y comando de arranque identificados antes de lanzar; si no se puede levantar, es rojo."
          },
          {
            "nombre": "Navegador automatizado",
            "ruta": "Playwright o CDP headless",
            "rol": "Recorrido de la UI; si el sandbox bloquea spawn o no hay display, se cae a modo API."
          },
          {
            "nombre": "curl y fetch",
            "ruta": "API del proyecto",
            "rol": "Secuencias completas con auth real; un endpoint suelto que responde 200 no es una feature."
          },
          {
            "nombre": "Base de prueba y seeds",
            "ruta": "skills/hd-review/SKILL.md:169",
            "rol": "Usuarios y datos se crean en la base de prueba o con seeds, nunca en el código de producción."
          },
          {
            "nombre": "Memoria del proyecto",
            "ruta": ".hd/memory.md",
            "rol": "El auditor la lee para no inventar datos de prueba ni reportar como error algo que el humano ya decidió."
          }
        ]
      },
      {
        "nombre": "Modelos y despacho",
        "detalle": "Quién audita y con qué criterio",
        "items": [
          {
            "nombre": "Estrategia en memoria",
            "ruta": "skills/hd-discovery/SKILL.md:70-72",
            "rol": "La auditoría va con el modelo de mayor calidad disponible y permitido; se aprueba en discovery y no se vuelve a preguntar."
          },
          {
            "nombre": "Catálogo del harness",
            "ruta": "skills/hd-review/SKILL.md:44",
            "rol": "list_subagent_models verifica disponibilidad y esfuerzo de razonamiento; no publica precios, se buscan en internet."
          },
          {
            "nombre": "Dispatch explícito",
            "ruta": "skills/hd-review/SKILL.md:47",
            "rol": "provider, model y reasoning_effort en cada subagent; el modelo usado queda anotado en el ledger."
          },
          {
            "nombre": "Premium de más de 5 USD/M",
            "ruta": "skills/hd-review/SKILL.md:46",
            "rol": "Solo con permiso ya registrado: esta fase no pregunta, usa el mejor dentro del presupuesto y anota el ruling."
          }
        ]
      }
    ],
    "dependencias": [
      {
        "desde": "Cierre de la fase 3",
        "hacia": "Paso 0",
        "tipo": "dispara",
        "nota": "No hay auditoría hasta que todas las olas tienen commit y gate verde."
      },
      {
        "desde": "Paso 0",
        "hacia": "Material por rutas",
        "tipo": "prepara",
        "nota": "Diffs y logs de gate en .hd/<trabajo>/logs/; el auditor los recibe como rutas."
      },
      {
        "desde": "Paso 0",
        "hacia": "Proyecto levantado",
        "tipo": "verifica",
        "nota": "Si el proyecto no arranca, se resuelve antes de lanzar: sería rojo garantizado."
      },
      {
        "desde": "Revisores y fixer de código",
        "hacia": "auditor-visual",
        "tipo": "precede",
        "nota": "En serie, nunca en paralelo: el auditor prueba el árbol ya corregido y commiteado."
      },
      {
        "desde": "Orquestador de la fase 4",
        "hacia": "auditor-visual",
        "tipo": "despacha",
        "nota": "Un subagent con provider, model y reasoning_effort de la estrategia."
      },
      {
        "desde": "auditor-visual",
        "hacia": "Navegador automatizado",
        "tipo": "recorre",
        "nota": "UI click por click cuando hay frontend."
      },
      {
        "desde": "auditor-visual",
        "hacia": "curl y fetch",
        "tipo": "consulta",
        "nota": "Cuando no hay frontend, o cuando el navegador no arranca."
      },
      {
        "desde": "auditor-visual",
        "hacia": "auditoria-visual.md",
        "tipo": "escribe",
        "nota": "Formato fijo; el orquestador lo consolida en review-progress.md sin pegarlo en el chat."
      },
      {
        "desde": "auditoria-visual.md",
        "hacia": "fixer-visual",
        "tipo": "dispara",
        "nota": "Solo con veredicto CON_FALLOS, y todos los fallos en una sola tanda."
      },
      {
        "desde": "fixer-visual",
        "hacia": "re-prueba visual",
        "tipo": "habilita",
        "nota": "Con el gate verde se corre el mismo recorrido completo otra vez."
      },
      {
        "desde": "re-prueba visual",
        "hacia": "hd-close",
        "tipo": "encadena",
        "nota": "OK encadena el cierre solo; CON_FALLOS es freno real con diagnóstico."
      }
    ]
  },
  "flujo": {
    "titulo": "Camino principal: de las olas cerradas al cierre con la feature probada",
    "pasos": [
      {
        "titulo": "Se cierra la fase 3 y arranca la revisión",
        "tipo": "entrada",
        "resumen": "Última ola cerrada con commit y gate: el orquestador carga hd-review.",
        "detalle": "Antes de cualquier auditoría corren los revisores de código, uno por ola, todos en una tanda. El auditor visual no sale hasta que esa tanda terminó y, si hubo hallazgos, un fixer los corrigió y el gate volvió a verde.",
        "archivos": [
          "skills/hd-implement/SKILL.md:323",
          "skills/hd-review/SKILL.md:10"
        ],
        "datos": [
          "waves.md con las olas cerradas",
          "commits por ola",
          "ledger.md"
        ]
      },
      {
        "titulo": "Paso 0: el trabajo tiene que poder auditarse",
        "tipo": "validacion",
        "resumen": "Olas cerradas, worktrees borrados, rama limpia, artefactos al día y proyecto que se levanta.",
        "detalle": "Si el proyecto no arranca, no se lanza: eso sería rojo garantizado. Se prepara el material por rutas y la memoria al día, porque el auditor la lee para no inventar datos de prueba.",
        "archivos": [
          "skills/hd-review/SKILL.md:64-80"
        ],
        "datos": [
          "ledger.md",
          "waves.md",
          "review-progress.md",
          ".hd/memory.md"
        ],
        "caminos": [
          {
            "condicion": "El proyecto no arranca o falta un seed",
            "resultado": "Se resuelve antes de lanzar: el auditor no adivina el entorno."
          },
          {
            "condicion": "Quedan cambios de código sin commitear",
            "resultado": "No es estado de cierre: se termina la fase 3 y no se audita."
          }
        ]
      },
      {
        "titulo": "Se elige el modelo del auditor",
        "tipo": "decision",
        "resumen": "El de mayor calidad disponible y permitido, según la estrategia aprobada en discovery.",
        "detalle": "El catálogo solo lista modelos y esfuerzos de razonamiento; los precios se buscan en internet. Un premium de más de 5 USD por millón sin permiso previo no se usa: se toma el mejor dentro del presupuesto y se anota el ruling en el ledger.",
        "archivos": [
          "skills/hd-review/SKILL.md:39-47",
          "skills/hd-discovery/SKILL.md:70-73"
        ],
        "datos": [
          "provider",
          "model",
          "reasoning_effort"
        ]
      },
      {
        "titulo": "Se despacha el auditor, un subagente independiente",
        "tipo": "externo",
        "resumen": "No participó de ninguna ola y no escribe código de producción.",
        "detalle": "Recibe por ruta el spec, el technical spec, los planes, el prototipo, la memoria, el catálogo de hd-e2e y cómo levantar el proyecto. Su independencia es parte del gate: el que implementa no audita.",
        "archivos": [
          "skills/hd-review/SKILL.md:34",
          "skills/hd-review/SKILL.md:159-172",
          "README.md:204"
        ]
      },
      {
        "titulo": "Decide cómo va a probar: UI o API",
        "tipo": "validacion",
        "resumen": "Con frontend, UI click por click; sin frontend, API como con Postman o APIdog.",
        "detalle": "Si el navegador no arranca por Docker ausente, spawn con EPERM del sandbox, falta de display o un crash al abrir, la auditoría no se declara imposible: pasa a modo API y lista qué flujos de UI quedaron sin probar.",
        "caminos": [
          {
            "condicion": "Hay frontend y el navegador arranca",
            "resultado": "Recorrido de UI completo, con capturas y consola del cliente."
          },
          {
            "condicion": "Hay frontend pero el navegador no arranca",
            "resultado": "Modo API con el motivo exacto y los flujos de UI como residuales declarados."
          },
          {
            "condicion": "No hay frontend",
            "resultado": "API con auth real y secuencias completas de punta a punta."
          },
          {
            "condicion": "No hay navegador ni API",
            "resultado": "Se reporta no verificable; residual total, nunca verde."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:163-167"
        ]
      },
      {
        "titulo": "Levanta el proyecto y escribe el recorrido",
        "tipo": "efecto",
        "resumen": "Un script hace todo el camino en una sola pasada; no se hace una captura por turno.",
        "detalle": "Login, flujos, estados, bordes, capturas y volcado de consola y red a un log. El script y el log se guardan en reports/evidencia/ porque son la evidencia y son lo que la re-prueba vuelve a ejecutar.",
        "archivos": [
          "skills/hd-review/SKILL.md:174-179"
        ],
        "datos": [
          "reports/evidencia/recorrido.<ext>",
          "reports/evidencia/log del recorrido"
        ]
      },
      {
        "titulo": "Prueba la feature completa, como un humano",
        "tipo": "decision",
        "resumen": "Arranque, auth y permisos, camino principal, cada control, estados y errores, bordes, persistencia, consola y logs.",
        "detalle": "En API eso significa secuencias completas: crear, leer, actualizar, borrar, y volver a consultar para ver la persistencia. Un endpoint suelto que responde 200 no verifica nada.",
        "archivos": [
          "skills/hd-review/SKILL.md:181-190"
        ],
        "datos": [
          "sesiones y tokens reales",
          "códigos 400, 401, 403, 404, 409, 422 y 5xx donde correspondan"
        ]
      },
      {
        "titulo": "Se corta por presupuesto",
        "tipo": "error",
        "resumen": "10 minutos de reloj para una feature chica; 20 es el techo.",
        "detalle": "Agotado el presupuesto se reporta lo probado y lo que faltó va a No verificado como residual declarado. Explorar es la excepción, no el método: un tramo no automatizable se hace a mano y se declara.",
        "caminos": [
          {
            "condicion": "Aparece un captcha o un OTP que no se puede automatizar",
            "resultado": "Se hace a mano y se declara en el reporte."
          },
          {
            "condicion": "Se acabó el tiempo",
            "resultado": "Se corta; lo faltante queda como residual y no como verde."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:174-179"
        ]
      },
      {
        "titulo": "Escribe el reporte con evidencia",
        "tipo": "efecto",
        "resumen": "Modo, veredicto y un fallo por línea, reproducible con los pasos escritos.",
        "detalle": "Incluye los casos del catálogo que ejercitó y los caminos DESCUBIERTOS que no estaban. El orquestador lo consolida en review-progress.md; no se pega en el chat.",
        "archivos": [
          ".hd/<trabajo>/reports/auditoria-visual.md",
          "skills/hd-review/SKILL.md:192-210"
        ],
        "datos": [
          "Modo",
          "Veredicto",
          "fallos con severidad",
          "No verificado",
          "Casos del catálogo ejercitados",
          "Descubierto"
        ]
      },
      {
        "titulo": "¿El veredicto es OK o CON_FALLOS?",
        "tipo": "decision",
        "resumen": "Con OK no hay nada que corregir; con CON_FALLOS empieza la única corrección permitida.",
        "detalle": "El veredicto no se discute por opinión: o el recorrido mostró fallos reproducibles o no los mostró. Un fallo sin pasos que se puedan repetir no sirve.",
        "caminos": [
          {
            "condicion": "OK",
            "resultado": "Salta directo al cierre: sin corrección no hay re-prueba."
          },
          {
            "condicion": "CON_FALLOS",
            "resultado": "Una sola corrección con fixer-visual y después la re-prueba completa."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:212-219"
        ]
      },
      {
        "titulo": "El fixer corrige y el orquestador commitea y corre el gate",
        "tipo": "efecto",
        "resumen": "Un fixer-visual con todos los fallos juntos; el orquestador integra, commitea y corre build, lint y estándares.",
        "detalle": "Misma mecánica que la corrección de revisión: worktree, revisar que cada fallo tenga su cambio y ninguno de más, cherry-pick -n, commit de corrección de auditoría visual, respaldo y gate. Rojo es freno real.",
        "archivos": [
          "skills/hd-review/SKILL.md:217-219"
        ],
        "datos": [
          "commit «corrección de auditoría visual»",
          "logs de gate en la rama"
        ]
      },
      {
        "titulo": "Re-prueba completa con el mismo recorrido",
        "tipo": "externo",
        "resumen": "El script entero se corre otra vez sobre el árbol corregido, no solo el tramo que falló.",
        "detalle": "Presupuesto: la mitad de la primera pasada, con techo de 10 minutos. Reporte nuevo en auditoria-visual-reprueba.md con el log como evidencia. No se re-explora: se re-ejecuta.",
        "archivos": [
          "skills/hd-review/SKILL.md:221-228"
        ]
      },
      {
        "titulo": "OK cierra, CON_FALLOS frena",
        "tipo": "error",
        "resumen": "Verde encadena hd-close sin humano; rojo es freno real con diagnóstico y sin segunda ronda.",
        "detalle": "El cierre actualiza review-progress.md y el ledger, incorpora los casos ejercitados y descubiertos al catálogo de hd-e2e y carga hd-close. Si la re-prueba vuelve a fallar, se reporta qué falló, qué se intentó y por qué no alcanzó.",
        "caminos": [
          {
            "condicion": "La re-prueba sale OK",
            "resultado": "Se anota el veredicto y hd-close arranca automáticamente."
          },
          {
            "condicion": "La re-prueba vuelve a fallar",
            "resultado": "Freno real: no hay segunda corrección ni segunda re-prueba automática."
          }
        ],
        "archivos": [
          "skills/hd-review/SKILL.md:230-240",
          "skills/hd-close/SKILL.md:8"
        ]
      }
    ]
  },
  "reglas": [
    {
      "regla": "La auditoría visual va en serie después de los revisores de código, nunca en paralelo: se audita el árbol ya corregido y commiteado.",
      "tipo": "Orden",
      "donde": "skills/hd-review/SKILL.md:24, :51",
      "consecuencia": "Si corre antes, prueba bugs que todavía se van a corregir y su reporte nace viejo."
    },
    {
      "regla": "El auditor no edita el producto: si toca el código, deja de ser auditor.",
      "tipo": "Separación",
      "donde": "skills/hd-review/SKILL.md:34, :169",
      "consecuencia": "La corrección la confirma el comportamiento, no el autor: un auditor que arregla certifica su propio sesgo."
    },
    {
      "regla": "El auditor es la única excepción a «los subagentes no ejecutan scripts»: ejecuta y navega porque su evidencia es el comportamiento.",
      "tipo": "Excepción",
      "donde": "skills/hd-debug/SKILL.md:23 · README.md:199",
      "consecuencia": "Sin esa excepción no habría ninguna prueba que no sea leer código."
    },
    {
      "regla": "Ningún veredicto sin evidencia fresca en el turno: el gate que corrió el orquestador y los archivos de prueba.",
      "tipo": "Evidencia",
      "donde": "skills/hd-review/SKILL.md:59",
      "consecuencia": "Un «debería andar» no cierra nada; un verde solo prueba el árbol donde corrió."
    },
    {
      "regla": "Lo que no se pudo probar se declara residual y no cuenta como verde.",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:167, :172, :201",
      "consecuencia": "El cierre hereda el residual: el humano sabe qué quedó sin probar en vez de creer que todo se probó."
    },
    {
      "regla": "Si el navegador no arranca, la auditoría sigue en modo API con el motivo exacto escrito y los flujos de UI listados.",
      "tipo": "Degradación",
      "donde": "skills/hd-review/SKILL.md:167",
      "consecuencia": "Un entorno sin display no cancela la verificación: la vuelve parcial y explícita."
    },
    {
      "regla": "Presupuesto de reloj: 10 minutos para una feature chica, 20 como techo; la re-prueba, la mitad con techo de 10.",
      "tipo": "Límite",
      "donde": "skills/hd-review/SKILL.md:176, :227",
      "consecuencia": "La auditoría es una inspección, no una exploración: el costo y la confiabilidad dejan de crecer juntos."
    },
    {
      "regla": "Un solo recorrido en un script hace todo el camino; no se hace una captura por turno.",
      "tipo": "Método",
      "donde": "skills/hd-review/SKILL.md:177",
      "consecuencia": "Cada turno cuesta cerca de un minuto: veinte capturas sueltas son veinte minutos de auditoría."
    },
    {
      "regla": "El script y su log se guardan en reports/evidencia/: son la evidencia y son lo que corre la re-prueba.",
      "tipo": "Persistencia",
      "donde": "skills/hd-review/SKILL.md:178, :225",
      "consecuencia": "Sin el script guardado, la re-prueba vuelve a explorar en vez de re-ejecutar."
    },
    {
      "regla": "Una sola corrección por tanda de fallos, con todos juntos: un fallo, un cambio, sin refactors colados.",
      "tipo": "Alcance",
      "donde": "skills/hd-review/SKILL.md:56, :217",
      "consecuencia": "Corregir en tandas mezcladas hace imposible atribuir qué cambio arregló qué."
    },
    {
      "regla": "Una sola re-prueba, y es completa: la misma feature entera, no solo el tramo corregido.",
      "tipo": "Orden",
      "donde": "skills/hd-review/SKILL.md:57-58, :223-226",
      "consecuencia": "Un cambio puede romper otra parte del flujo; una segunda ronda ya es problema estructural."
    },
    {
      "regla": "Cada trabajo usa el modelo de mayor calidad disponible y permitido para auditar; el premium, solo con permiso ya registrado.",
      "tipo": "Modelo",
      "donde": "skills/hd-review/SKILL.md:39-47 · skills/hd-discovery/SKILL.md:70",
      "consecuencia": "Sin tests, la lectura del auditor es la única garantía: abaratarla abarata la evidencia."
    },
    {
      "regla": "El auditor anota qué casos del catálogo de hd-e2e ejercitó y qué caminos descubrió, pero no edita el catálogo.",
      "tipo": "Catálogo",
      "donde": "skills/hd-review/SKILL.md:170 · skills/hd-e2e/SKILL.md:202",
      "consecuencia": "El catálogo se mantiene entre corridas en vez de envejecer hasta mentir."
    },
    {
      "regla": "Verde no es aprobación humana: si la revisión y la re-prueba salen bien, hd-close se carga solo.",
      "tipo": "Cierre",
      "donde": "skills/hd-review/SKILL.md:62, :240",
      "consecuencia": "La aprobación de producto ocurrió en discovery; el comportamiento lo validó el auditor."
    }
  ],
  "bordes": [
    {
      "caso": "El navegador no arranca en el sandbox",
      "esperado": "Que la auditoría lo declare imposible.",
      "actual": "Cae a modo API, declara el motivo exacto y lista los flujos de UI sin probar como residuales.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:167"
    },
    {
      "caso": "No hay frontend ni API que probar",
      "esperado": "Un veredicto explícito de no verificable.",
      "actual": "El brief lo contempla a nivel del auditor, pero el flujo solo define OK y CON_FALLOS: un reporte no verificable no tiene camino de veredicto escrito.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:167 · :230-231"
    },
    {
      "caso": "El repo no mantiene el catálogo de hd-e2e",
      "esperado": "Que la auditoría siga sin él.",
      "actual": "El brief lo hace condicional («si el repo lo tiene») y el cierre solo actualiza casos.md si existe.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:170 · :239"
    },
    {
      "caso": "El auditor se pasa del presupuesto de reloj",
      "esperado": "Cortar y declarar lo que faltó.",
      "actual": "La regla está escrita, pero no hay mecanismo que la fuerce en medio del script: el corte depende de que el agente lo respete.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:176"
    },
    {
      "caso": "Un fallo no se puede reproducir con los pasos escritos",
      "esperado": "Que ese fallo no llegue al fixer.",
      "actual": "El formato exige pasos y el texto dice que un «no anda» no sirve, pero no hay validación antes de mandarlo a corregir.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:198, :210, :217"
    },
    {
      "caso": "La primera auditoría sale OK, sin fallos",
      "esperado": "Que no haya re-prueba y se cierre.",
      "actual": "Salta directo al cierre; la re-prueba solo existe si hubo corrección visual.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:214, :235"
    },
    {
      "caso": "La re-prueba vuelve a fallar",
      "esperado": "Freno real con diagnóstico, sin segunda vuelta.",
      "actual": "El paso lo declara: no hay segunda corrección ni segunda re-prueba automática.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:231"
    },
    {
      "caso": "El fixer visual corrige y el gate queda rojo",
      "esperado": "No cerrar el trabajo.",
      "actual": "Rojo es freno real; el código corregido no se re-revisa, la confirmación es el gate y la re-prueba.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:219"
    },
    {
      "caso": "Un endpoint responde 200 en modo API",
      "esperado": "No confundir 200 con feature verificada.",
      "actual": "El brief exige secuencia completa, estados, permisos y persistencia; un 200 suelto no verifica nada.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:165, :264"
    },
    {
      "caso": "Hay UI pero la feature tiene partes que la UI no expone",
      "esperado": "Probar esas partes por API además de la UI.",
      "actual": "El brief lo pide explícitamente.",
      "estado": "cubierto",
      "evidencia": "skills/hd-review/SKILL.md:166"
    },
    {
      "caso": "El auditor deja dependencias o datos en el repo",
      "esperado": "Que se limpien y se anote qué se instaló.",
      "actual": "Se pide instalación efímera o fuera del repo, anotar y limpiar; no hay verificación de esa limpieza antes del commit de cierre.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:168"
    },
    {
      "caso": "La evidencia del recorrido tiene que viajar con el trabajo",
      "esperado": "Que script y log queden commiteados.",
      "actual": "hd-review no los commitea: viajan recién en el commit de cierre, que stagea los artefactos .hd/ que falten. Si el cierre no corre, quedan sin commit.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:178 · skills/hd-close/SKILL.md:104"
    },
    {
      "caso": "Severidad de un fallo visual",
      "esperado": "Una escala definida, como en los hallazgos de código (alta, media, baja).",
      "actual": "El formato pide «[severidad]» sin escala, y review-progress repite el campo sin definirla.",
      "estado": "dudoso",
      "evidencia": "skills/hd-review/SKILL.md:198 · skills/hd-review/templates/review-progress-template.md:68"
    },
    {
      "caso": "Un agente lanza el visual junto con los revisores",
      "esperado": "Que no pase: probaría un árbol viejo.",
      "actual": "hd-review lo prohíbe en dos lugares, pero hd-implement todavía dice «en paralelo con el auditor visual»: la instrucción se contradice entre fases.",
      "estado": "roto",
      "evidencia": "skills/hd-implement/SKILL.md:35 · skills/hd-review/SKILL.md:24, :51"
    }
  ],
  "hallazgos": [
    {
      "titulo": "Un reporte «no verificable» no tiene veredicto en el flujo",
      "tipo": "validacion",
      "severidad": "media",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:167 vs :230-231",
      "impacto": "Si el proyecto no se puede levantar y tampoco hay API, el auditor cumple declarando no verificable, pero el orquestador solo tiene OK y CON_FALLOS: o inventa un verde o frena sin camino escrito.",
      "sugerencia": "Agregar NO_VERIFICABLE al formato del reporte y una rama explícita: frena el cierre y se reporta al humano como residual total."
    },
    {
      "titulo": "hd-implement contradice a hd-review sobre cuándo corre el auditor",
      "tipo": "deuda",
      "severidad": "media",
      "confianza": "alta",
      "evidencia": "skills/hd-implement/SKILL.md:35 · skills/hd-review/SKILL.md:24, :51",
      "impacto": "Un orquestador que lee la fase 3 puede lanzar el visual en paralelo con los revisores, que es exactamente lo que la fase 4 prohíbe: se audita un árbol que va a cambiar.",
      "sugerencia": "Corregir esa línea de hd-implement para que diga «en serie, después de la revisión y sus correcciones»."
    },
    {
      "titulo": "Nada valida que un fallo sea reproducible antes de mandarlo al fixer",
      "tipo": "validacion",
      "severidad": "media",
      "confianza": "media",
      "evidencia": "skills/hd-review/SKILL.md:210, :217",
      "impacto": "El fixer no ejecuta nada: si el fallo llega con pasos vagos, investiga una causa que quizá no existe o pide la reproducción y pierde el turno.",
      "sugerencia": "Exigir en el paso de consolidación que cada fallo traiga el paso o comando exacto y el resultado observado; rechazar los que no lo tengan."
    },
    {
      "titulo": "La severidad de los fallos visuales no tiene escala",
      "tipo": "validacion",
      "severidad": "baja",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:198 · skills/hd-review/templates/review-progress-template.md:68",
      "impacto": "Sin escala, «alta» significa cosas distintas en cada corrida y el fixer prioriza a ojo cuando la tanda trae varios fallos.",
      "sugerencia": "Definir alta, media y baja con el mismo criterio que los hallazgos de código y repetirlo en la plantilla."
    },
    {
      "titulo": "El presupuesto de reloj no tiene mecanismo que lo haga cumplir",
      "tipo": "riesgo",
      "severidad": "baja",
      "confianza": "media",
      "evidencia": "skills/hd-review/SKILL.md:176",
      "impacto": "El tope depende de la voluntad del agente a mitad del recorrido: un script con veinte capturas puede pasarse sin que nadie lo corte.",
      "sugerencia": "Pedir que el script tenga timeout global y que el log registre el minuto en que se cortó."
    },
    {
      "titulo": "La evidencia del recorrido no se commitea hasta el cierre",
      "tipo": "riesgo",
      "severidad": "baja",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:178 · skills/hd-close/SKILL.md:104",
      "impacto": "Si el trabajo no llega al cierre, el script y el log quedan sin commit y la re-prueba de mañana ya no tiene la evidencia original.",
      "sugerencia": "Commitear script y log con la corrección visual, o en un commit propio desde hd-review."
    },
    {
      "titulo": "El auditor escribe en el mismo árbol que después vigila el cierre",
      "tipo": "riesgo",
      "severidad": "baja",
      "confianza": "media",
      "evidencia": "skills/hd-review/SKILL.md:70, :168, :178 · skills/hd-close/SKILL.md:40",
      "impacto": "Dependencias y artefactos del auditor pueden quedar en el árbol de trabajo; el cierre solo tolera artefactos .hd/ sin commitear y falla si hay otra cosa.",
      "sugerencia": "Declarar que todo lo efímero del auditor va fuera del repo o dentro de .hd/, y que el cierre lo verifica antes de limpiar."
    },
    {
      "titulo": "La re-prueba dice «el mismo auditor» pero se despacha un subagente nuevo",
      "tipo": "deuda",
      "severidad": "baja",
      "confianza": "alta",
      "evidencia": "skills/hd-review/SKILL.md:223",
      "impacto": "No rompe la independencia, pero el que re-ejecuta no tiene memoria de la primera pasada: toda la comparabilidad descansa en el script guardado.",
      "sugerencia": "Decirlo como «el mismo rol con el mismo script», que es lo que realmente garantiza comparar peras con peras."
    }
  ],
  "impacto": {
    "consumidores": [
      "hd-close: su precondición es la re-prueba visual en OK; sin ese veredicto no arranca la fase 5.",
      "review-progress.md: el bloque de auditoría, corrección y re-prueba arma el veredicto global del trabajo.",
      "hd-e2e: el catálogo recibe los casos ejercitados y los caminos descubiertos en cada trabajo.",
      "El humano: en el cierre recibe los residuales y las desviaciones que salieron de esta auditoría.",
      "El ledger: anota el modelo del auditor, el veredicto y la re-prueba como evidencia del trabajo."
    ],
    "siCambia": [
      "El orden en serie con la revisión de código: si se paraleliza, el reporte nace viejo.",
      "El formato del reporte: review-progress.md y hd-close leen esos bloques.",
      "La ruta de la evidencia (.hd/<trabajo>/reports/evidencia/recorrido.<ext>): la re-prueba la re-ejecuta.",
      "La regla de residuales: si se relaja, el cierre reporta verdes que no lo son.",
      "El presupuesto de tiempo: cambiarlo cambia cuánto se explora y cuánto queda como no verificado."
    ],
    "datos": [
      "Artefactos del trabajo en .hd/<trabajo>/: reportes, evidencia, review-progress y ledger.",
      "Catálogo .hd/e2e/casos.md: IDs, fecha y resultado de los casos ejercitados.",
      "Memoria .hd/memory.md: decisiones y permisos de modelos que el auditor no vuelve a preguntar.",
      "Datos de prueba: usuarios y seeds creados en la base de prueba, nunca en producción.",
      "Credenciales y tokens de sesión usados para probar: no se escriben en el reporte."
    ]
  },
  "archivos": [
    {
      "ruta": "skills/hd-review/SKILL.md",
      "capa": "Contrato",
      "rol": "La fase 4 completa: despacho, brief, presupuesto, formato, corrección y re-prueba del auditor."
    },
    {
      "ruta": "skills/hd-review/templates/review-progress-template.md",
      "capa": "Artefacto",
      "rol": "Dónde se consolida el veredicto de la auditoría, la corrección y la re-prueba."
    },
    {
      "ruta": "skills/hd-debug/SKILL.md",
      "capa": "Transversal",
      "rol": "Declara la excepción de ejecución del auditor y qué reproducción necesita el fixer."
    },
    {
      "ruta": "skills/hd-implement/SKILL.md",
      "capa": "Fase previa",
      "rol": "Cierra las olas, deja diffs y tableros por ola y encadena hd-review."
    },
    {
      "ruta": "skills/hd-spec/templates/plan-template.md",
      "capa": "Contrato",
      "rol": "«Comportamiento esperado»: el texto contra el que se audita el resultado."
    },
    {
      "ruta": "skills/hd-spec/templates/technical-spec-template.md",
      "capa": "Contrato",
      "rol": "Chequeos manuales que el auditor visual ejecuta al final."
    },
    {
      "ruta": "skills/hd-e2e/SKILL.md",
      "capa": "Catálogo",
      "rol": "Casos de uso prometidos; el auditor los usa como evidencia y reporta los que faltan."
    },
    {
      "ruta": "skills/hd-close/SKILL.md",
      "capa": "Fase siguiente",
      "rol": "Consume el veredicto verde y commitea la evidencia al cerrar."
    },
    {
      "ruta": "README.md",
      "capa": "Documento",
      "rol": "G3 y las reglas de oro: la auditoría es gate, nunca opcional."
    },
    {
      "ruta": ".hd/<trabajo>/reports/auditoria-visual.md",
      "capa": "Salida",
      "rol": "Reporte del auditor; no existe hasta que la auditoría corre."
    }
  ],
  "limites": [
    "Lectura estática: no se ejecutó ninguna auditoría ni se levantó ningún proyecto. Todo sale de las skills y sus plantillas en la rama main, commit fc3449b.",
    "El comportamiento real depende del modelo despachado y del entorno del harness (sandbox, display, Docker), que no se puede observar leyendo el repo.",
    "No se consultó el catálogo de modelos del harness ni sus precios: la página describe el criterio, no el modelo concreto que se usaría hoy.",
    "Los tiempos (10 y 20 minutos, la mitad en la re-prueba) son presupuesto declarado en la skill, no una medición.",
    "Quedaron fuera las fases 1, 2 y 3 salvo lo necesario para explicar de dónde viene el auditor y qué recibe.",
    "Las contradicciones marcadas como hallazgo son textuales entre archivos: no se corrigió ninguna, ni se verificó cómo se comporta hoy un orquestador real frente a ellas."
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
