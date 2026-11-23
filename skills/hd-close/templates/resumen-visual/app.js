/* ============================================================
   Resumen visual del cambio — datos y render
   ------------------------------------------------------------
   Este es el ÚNICO archivo que se edita al cerrar un trabajo.

   1. Reemplazá window.HD_RESUMEN por los datos reales.
   2. Poné demo: false (o borrá la clave) para que no aparezca el
      cartel de "datos de ejemplo".
   3. No hace falta tocar index.html ni styles.css.

   Campos (todos opcionales salvo titulo y flujo.pasos):
     trabajo           nombre del trabajo HD
     titulo            qué cambió, en una frase (el h1)
     entradilla        2-3 frases: qué problema resuelve
     meta.fecha        fecha del cierre (YYYY-MM-DD)
     meta.modo         Directo | Cambio chico | Mega cambio
     meta.rama         rama de trabajo
     meta.commit       SHA corto del commit de cierre
     meta.olas         cantidad de olas
     meta.repos        repos tocados
     metricas[]        { valor, etiqueta } (si falta, se calculan)
     antesDespues      { antes: {titulo,puntos[]}, despues: {titulo,puntos[]},
                         seConserva[] }
     flujo             { titulo, nota, pasos: [{
                          titulo, tipo: inicio|proceso|decision|resultado|error,
                          estado: nuevo|cambiado|igual, resumen, detalle,
                          entradas[], salidas[], caminos[{condicion,resultado}],
                          archivos[] }],
                        anterior: { titulo, pasos[{titulo,resumen}] } }
     arreglos[]        { sintoma, causa, arreglo, archivos[] }
     piezas[]          { repo, ruta, tipo: nuevo|modificado|eliminado, ola,
                         principal (false = lista plegable), queHace, porQue,
                         antes, ejemplo: { lenguaje, codigo } }
     comoProbar[]      { titulo, pasos[], resultado }
     decisiones[]      { ruling, costo }
     limites[]         textos
     artefactos[]      { nombre, ruta (relativa), descripcion }

   Reglas: datos reales del diff/spec/ledger; sin red, sin CDN, sin
   dependencias; los links son relativos a esta carpeta.
   ============================================================ */

window.HD_RESUMEN = {
  demo: true,
  trabajo: "2026-11-18-sesion-inactiva",
  titulo: "La sesión ahora se cierra sola después de 30 minutos sin actividad",
  entradilla: "Antes una pestaña abierta quedaba autenticada para siempre. Ahora el sistema avisa a los 28 minutos, cierra la sesión a los 30 y vuelve al login sin perder el trabajo que estabas haciendo.",
  meta: {
    fecha: "2026-11-20",
    modo: "Cambio chico",
    rama: "feat/sesion-inactiva",
    commit: "4f91d5d",
    olas: 2,
    repos: ["web", "api"],
    commits: 2
  },
  metricas: [
    { valor: "14", etiqueta: "archivos tocados" },
    { valor: "2", etiqueta: "olas" },
    { valor: "1", etiqueta: "arreglo" },
    { valor: "3", etiqueta: "decisiones" }
  ],
  antesDespues: {
    antes: {
      titulo: "Cómo funcionaba antes",
      puntos: [
        "El token de sesión se renovaba solo cada 15 minutos, hubiera o no actividad.",
        "Una pestaña olvidada seguía autenticada hasta cerrar sesión a mano.",
        "El usuario no veía ningún aviso antes de quedar afuera."
      ]
    },
    despues: {
      titulo: "Cómo funciona ahora",
      puntos: [
        "La actividad del usuario (clics, teclas, navegación) reinicia un contador de 30 minutos.",
        "A los 28 minutos aparece un aviso con la cuenta regresiva y un botón para seguir conectado.",
        "A los 30 minutos la sesión se cierra, se limpia el token y vuelve al login recordando la ruta.",
        "Si no hay actividad, el token deja de renovarse: la sesión vence de verdad en el servidor."
      ]
    },
    seConserva: [
      "El cierre de sesión manual sigue igual.",
      "Las sesiones de los procesos de fondo (jobs) no se ven afectadas.",
      "Se puede seguir conectado tocando el aviso; no hace falta volver a loguearse."
    ]
  },
  flujo: {
    titulo: "El camino de una sesión con inactividad",
    nota: "Tocá cada paso para ver qué entra, qué decide y qué sale.",
    pasos: [
      {
        titulo: "El usuario interactúa",
        tipo: "inicio",
        estado: "igual",
        resumen: "Un clic, una tecla o un cambio de pantalla.",
        detalle: "El detector escucha eventos de la ventana con un throttling de 5 segundos para no recalcular en cada movimiento del mouse.",
        entradas: ["Evento de usuario"],
        salidas: ["Marca de última actividad"],
        archivos: ["apps/web/src/session/activity.ts"]
      },
      {
        titulo: "Se reinicia el contador de 30 minutos",
        tipo: "proceso",
        estado: "nuevo",
        resumen: "Cada actividad vuelve el reloj a cero.",
        detalle: "El contador vive en un solo hook y lo consumen el aviso y el cierre: no hay dos relojes que se puedan desincronizar.",
        salidas: ["Timer activo", "Última actividad actualizada"]
      },
      {
        titulo: "A los 28 minutos aparece el aviso",
        tipo: "decision",
        estado: "nuevo",
        resumen: "Un modal con cuenta regresiva y dos opciones: seguir o salir.",
        detalle: "El aviso no bloquea la página: se puede seguir trabajando con él abierto. Si el usuario toca «Seguir conectado», el contador vuelve a cero y el aviso se cierra.",
        caminos: [
          { condicion: "Toca «Seguir conectado»", resultado: "Se reinicia el contador y el aviso se cierra." },
          { condicion: "No hace nada durante 2 minutos", resultado: "La sesión se cierra y vuelve al login." }
        ]
      },
      {
        titulo: "La sesión se cierra y se limpia el token",
        tipo: "resultado",
        estado: "nuevo",
        resumen: "El servidor invalidó la sesión; el cliente solo borra el rastro.",
        detalle: "El refresh deja de renovar a los 30 minutos de inactividad, así que el token muere en el servidor aunque el cliente siga abierto.",
        salidas: ["Token borrado", "Redirección al login"],
        archivos: ["apps/web/src/session/logout.ts", "apps/api/src/auth/session.ts"]
      },
      {
        titulo: "Si el servidor ya la había vencido",
        tipo: "error",
        estado: "cambiado",
        resumen: "La API responde 401 y el cliente va al login sin mostrar un error.",
        detalle: "Antes el 401 se mostraba como «Error inesperado» y dejaba la pantalla en blanco. Ahora es un cierre ordenado.",
        archivos: ["apps/web/src/api/interceptors.ts"]
      }
    ],
    anterior: {
      titulo: "Cómo era el camino antes",
      pasos: [
        { titulo: "El usuario interactúa", resumen: "No había detector de actividad." },
        { titulo: "El refresh renueva el token cada 15 minutos", resumen: "Aunque la pestaña estuviera abandonada." },
        { titulo: "La sesión sigue abierta", resumen: "Hasta cerrar sesión a mano o borrar el token." }
      ]
    }
  },
  arreglos: [
    {
      sintoma: "Un 401 en segundo plano mostraba «Error inesperado» y dejaba la pantalla en blanco.",
      causa: "El interceptor de la API trataba cualquier 401 como error de red.",
      arreglo: "El 401 de sesión vencida ahora dispara el cierre ordenado y la vuelta al login.",
      archivos: ["apps/web/src/api/interceptors.ts"]
    }
  ],
  piezas: [
    {
      repo: "web",
      ruta: "apps/web/src/session/activity.ts",
      tipo: "nuevo",
      ola: 1,
      principal: true,
      queHace: "Escucha la actividad del usuario y expone la última marca de tiempo.",
      porQue: "Es la única fuente que decide si la sesión está inactiva; el resto de las piezas la consume.",
      antes: "No existía: la sesión nunca miraba la actividad."
    },
    {
      repo: "web",
      ruta: "apps/web/src/session/InactivityDialog.tsx",
      tipo: "nuevo",
      ola: 1,
      principal: true,
      queHace: "Muestra el aviso de los 28 minutos con la cuenta regresiva y el botón «Seguir conectado».",
      porQue: "Sin aviso, el cierre sorprende al usuario y pierde lo que estaba escribiendo.",
      ejemplo: {
        lenguaje: "tsx",
        codigo: "<InactivityDialog\n  secondsLeft={120}\n  onStay={resetTimer}\n  onLeave={logout}\n/>"
      }
    },
    {
      repo: "api",
      ruta: "apps/api/src/auth/session.ts",
      tipo: "modificado",
      ola: 2,
      principal: true,
      queHace: "El endpoint de refresh rechaza sesiones sin actividad dentro de la ventana de 30 minutos.",
      porQue: "El cierre tiene que ser real en el servidor; si solo se limpia el cliente, el token sigue sirviendo.",
      antes: "El refresh no miraba la última actividad: el token no vencía nunca."
    },
    {
      repo: "web",
      ruta: "apps/web/src/session/logout.ts",
      tipo: "modificado",
      ola: 2,
      principal: false,
      queHace: "Centraliza el cierre y la redirección al login.",
      porQue: "Evita tres copias del mismo logout.",
      antes: "Cada pantalla tenía su propio cierre."
    },
    {
      repo: "web",
      ruta: "apps/web/src/api/interceptors.ts",
      tipo: "modificado",
      ola: 2,
      principal: false,
      queHace: "Trata el 401 como sesión vencida en vez de error inesperado.",
      porQue: "Es el arreglo del bug de la pantalla en blanco.",
      antes: "Mostraba un toast de error genérico."
    }
  ],
  comoProbar: [
    {
      titulo: "Cierre normal por inactividad",
      pasos: [
        "Entrá con un usuario de prueba en http://localhost:3000.",
        "Dejá la pestaña quieta 28 minutos (o bajá el umbral a 20 segundos en .env.local).",
        "Esperá el aviso y no toques nada durante 2 minutos."
      ],
      resultado: "Vuelve al login con la ruta anterior guardada; en la consola no queda ningún token."
    },
    {
      titulo: "Seguir conectado",
      pasos: [
        "Esperá el aviso de los 28 minutos.",
        "Tocá «Seguir conectado».",
        "Mirá el contador: se reinicia."
      ],
      resultado: "La sesión sigue activa y el aviso desaparece sin recargar la página."
    },
    {
      titulo: "Sesión ya vencida en el servidor",
      pasos: [
        "Abrí dos pestañas con la misma sesión.",
        "Cerrá sesión en una.",
        "En la otra, navegá a cualquier pantalla."
      ],
      resultado: "La pestaña va al login sin cartel de error ni pantalla en blanco."
    }
  ],
  decisiones: [
    {
      ruling: "El umbral queda en 30 minutos fijos; no se configura por usuario.",
      costo: "Si el negocio necesita umbrales por rol, hay que agregar una columna y un selector en el panel."
    },
    {
      ruling: "El aviso aparece a los 28 minutos y no es un modal bloqueante: se puede seguir trabajando.",
      costo: "Si se quería obligar a decidir, el comportamiento es más laxo de lo esperado."
    },
    {
      ruling: "Se ignora la actividad de las pestañas en segundo plano.",
      costo: "Un usuario mirando un video largo podría ser desconectado aunque esté atento."
    }
  ],
  limites: [
    "El cierre por inactividad no aplica a sesiones de servicio (tokens de jobs): se decidió dejarlas fuera.",
    "Quedó sin probar en Safari iOS: el navegador no estuvo disponible en la auditoría."
  ],
  artefactos: [
    { nombre: "Spec", ruta: "../spec.md", descripcion: "Qué se pidió y qué se acordó." },
    { nombre: "Technical spec", ruta: "../technical_spec.md", descripcion: "Cómo se resolvió, contratos y trampas." },
    { nombre: "Olas", ruta: "../waves.md", descripcion: "Cómo se repartió el trabajo." },
    { nombre: "Ledger", ruta: "../ledger.md", descripcion: "Evidencia, commits y rulings." },
    { nombre: "Revisión", ruta: "../review-progress.md", descripcion: "Revisores, auditoría visual y re-prueba." }
  ]
};

(function () {
  "use strict";

  var D = window.HD_RESUMEN || {};

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
    return '<p class="vacio">' + esc(texto || "No aplica en este trabajo.") + "</p>";
  }

  function renderAvisoDemo() {
    if (D.demo !== true) return;
    var aviso = document.createElement("div");
    aviso.className = "aviso-demo";
    aviso.innerHTML = '<div class="aviso-demo__inner"><strong>Datos de ejemplo.</strong> ' +
      "Esta página es la plantilla de hd-close: reemplazá <code>window.HD_RESUMEN</code> por los datos del trabajo " +
      "y borrá <code>demo: true</code> antes de commitear.</div>";
    document.body.insertBefore(aviso, document.body.firstChild);
  }

  function renderHero() {
    var meta = D.meta || {};
    var titulo = str(D.titulo) || "Resumen del cambio";

    document.title = titulo + " · Resumen del cambio";
    byId("hero-titulo").textContent = titulo;
    byId("topbar-trabajo").textContent = str(D.trabajo);
    byId("topbar-fecha").textContent = str(meta.fecha);
    byId("footer-fecha").textContent = str(meta.fecha);

    var lead = byId("hero-entradilla");
    if (has(D.entradilla)) lead.textContent = D.entradilla;
    else lead.hidden = true;

    var chips = [];
    if (has(meta.modo)) chips.push('<li class="chip">' + esc(meta.modo) + "</li>");
    if (has(meta.rama)) chips.push('<li class="chip">rama <code>' + esc(meta.rama) + "</code></li>");
    if (has(meta.commit)) chips.push('<li class="chip">commit <code>' + esc(meta.commit) + "</code></li>");
    if (meta.olas) chips.push('<li class="chip">' + esc(meta.olas) + " olas</li>");
    if (lista(meta.repos).length) {
      var repos = lista(meta.repos).filter(has);
      if (repos.length) {
        chips.push('<li class="chip">' + esc(repos.join(" · ")) + "</li>");
      }
    }
    var chipsEl = byId("hero-chips");
    if (chips.length) chipsEl.innerHTML = chips.join("");
    else chipsEl.hidden = true;

    var metricas = lista(D.metricas).filter(function (m) { return m && has(String(m.valor)); });
    if (!metricas.length) {
      var auto = [];
      var piezas = lista(D.piezas).length;
      var arreglos = lista(D.arreglos).length;
      var pasos = lista((D.flujo || {}).pasos).length;
      if (piezas) auto.push({ valor: piezas, etiqueta: "piezas" });
      if (arreglos) auto.push({ valor: arreglos, etiqueta: "arreglos" });
      if (pasos) auto.push({ valor: pasos, etiqueta: "pasos del flujo" });
      if (meta.commits) auto.push({ valor: meta.commits, etiqueta: "commits" });
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

  function renderComparativa() {
    var a = D.antesDespues || {};
    var antes = a.antes || {};
    var despues = a.despues || {};
    var puntosAntes = lista(antes.puntos).filter(has);
    var puntosDespues = lista(despues.puntos).filter(has);

    if (!puntosAntes.length && !puntosDespues.length && !has(antes.titulo) && !has(despues.titulo)) {
      byId("comparativa").innerHTML = vacio();
      byId("conserva").innerHTML = "";
      return;
    }

    function tarjeta(datos, modificador, etiqueta, tituloDefecto, puntos) {
      var s = '<article class="comparativa__card comparativa__card--' + modificador + '">';
      s += '<p class="comparativa__etiqueta">' + esc(etiqueta) + "</p>";
      s += "<h3>" + esc(has(datos.titulo) ? datos.titulo : tituloDefecto) + "</h3>";
      s += "<ul>";
      s += puntos.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      s += "</ul></article>";
      return s;
    }

    byId("comparativa").innerHTML =
      tarjeta(antes, "antes", "Antes", "Cómo funcionaba", puntosAntes) +
      tarjeta(despues, "despues", "Ahora", "Cómo funciona ahora", puntosDespues);

    var conserva = lista(a.seConserva).filter(has);
    byId("conserva").innerHTML = conserva.length
      ? '<aside class="conserva"><p class="conserva__label">Qué se conserva</p><ul>' +
        conserva.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") +
        "</ul></aside>"
      : "";
  }

  var TIPOS = { inicio: "Inicio", proceso: "Paso", decision: "Decisión", resultado: "Resultado", error: "Error" };
  var ESTADOS = { nuevo: "Nuevo", cambiado: "Cambiado", igual: "Igual" };
  var vistaFlujo = "actual";

  function badgeEstado(estado) {
    var e = ESTADOS[estado] ? estado : "igual";
    return '<span class="badge badge--' + e + '">' + ESTADOS[e] + "</span>";
  }

  function badgeTipoPaso(tipo) {
    var t = TIPOS[tipo] ? tipo : "proceso";
    return '<span class="badge badge--tipo">' + TIPOS[t] + "</span>";
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

    var entradas = lista(p.entradas).filter(has);
    var salidas = lista(p.salidas).filter(has);
    if (entradas.length || salidas.length) {
      partes.push('<div class="paso__datos">' +
        bloqueDatos("Qué entra", entradas) +
        bloqueDatos("Qué sale", salidas) +
        "</div>");
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

    var archivos = lista(p.archivos).filter(has);
    if (archivos.length) {
      partes.push('<div class="archivos">' + archivos.map(function (a) {
        return '<span class="archivo">' + esc(a) + "</span>";
      }).join("") + "</div>");
    }

    if (!partes.length) return "";
    return '<div class="paso__panel" id="' + idPanel + '" hidden>' + partes.join("") + "</div>";
  }

  function renderPasos(pasos) {
    return '<ol class="pasos">' + pasos.map(function (p, i) {
      var estado = ESTADOS[p.estado] ? p.estado : "igual";
      var idPanel = "paso-panel-" + i;
      var panel = panelPaso(p, idPanel);
      var tienePanel = panel !== "";
      var abre = tienePanel
        ? ' type="button" class="paso__trigger" aria-expanded="false" aria-controls="' + idPanel + '"'
        : ' class="paso__trigger paso__trigger--estatico"';
      var etiquetaTag = tienePanel ? "button" : "div";
      var chevron = tienePanel ? '<span class="paso__chevron" aria-hidden="true"></span>' : "";

      var s = '<li class="paso paso--' + estado + '">';
      s += '<div class="paso__rail"><span class="paso__num">' + (i + 1) + '</span><span class="paso__linea"></span></div>';
      s += '<div class="paso__card">';
      s += "<" + etiquetaTag + abre + ">";
      s += '<span class="paso__meta">' + badgeEstado(estado) + badgeTipoPaso(p.tipo) + "</span>";
      s += '<span class="paso__titulo">' + esc(p.titulo) + "</span>";
      if (has(p.resumen)) s += '<span class="paso__resumen">' + esc(p.resumen) + "</span>";
      s += chevron;
      s += "</" + etiquetaTag + ">";
      s += panel;
      s += "</div></li>";
      return s;
    }).join("") + "</ol>";
  }

  function renderFlujo() {
    var f = D.flujo || {};
    var pasos = lista(f.pasos).filter(function (p) { return p && has(p.titulo); });
    var anterior = f.anterior && lista(f.anterior.pasos).length > 0;

    byId("leyenda").innerHTML =
      '<span class="leyenda__item"><span class="leyenda__punto leyenda__punto--nuevo"></span>Nuevo</span>' +
      '<span class="leyenda__item"><span class="leyenda__punto leyenda__punto--cambiado"></span>Cambiado</span>' +
      '<span class="leyenda__item"><span class="leyenda__punto leyenda__punto--igual"></span>Igual</span>';

    if (!pasos.length) {
      byId("flujo-actual").innerHTML = vacio();
    } else {
      var encabezado = "";
      if (has(f.titulo)) encabezado += '<p class="flujo__titulo">' + esc(f.titulo) + "</p>";
      if (has(f.nota)) encabezado += '<p class="flujo__nota">' + esc(f.nota) + "</p>";
      byId("flujo-actual").innerHTML = encabezado + renderPasos(pasos);
    }

    var toggle = byId("flujo-toggle");
    if (!anterior) {
      toggle.innerHTML = "";
      return;
    }

    toggle.innerHTML =
      '<div class="segmented" role="group" aria-label="Comparar el flujo actual con el anterior">' +
        '<button type="button" data-vista="actual" aria-pressed="true">Flujo actual</button>' +
        '<button type="button" data-vista="anterior" aria-pressed="false">Flujo anterior</button>' +
      "</div>";

    var previos = lista(f.anterior.pasos).filter(function (p) { return p && has(p.titulo); });
    byId("flujo-anterior").innerHTML =
      '<p class="flujo__nota">' + esc(has(f.anterior.titulo) ? f.anterior.titulo : "Cómo era el camino antes") + "</p>" +
      '<ol class="pasos-viejos">' + previos.map(function (p, i) {
        return '<li class="paso-viejo">' +
          '<span class="paso-viejo__num">' + (i + 1) + "</span>" +
          "<div>" +
            '<span class="paso-viejo__titulo">' + esc(p.titulo) + "</span>" +
            (has(p.resumen) ? '<span class="paso-viejo__resumen">' + esc(p.resumen) + "</span>" : "") +
          "</div></li>";
      }).join("") + "</ol>";
  }

  function cambiarVista(vista) {
    vistaFlujo = vista;
    byId("flujo-actual").hidden = vista !== "actual";
    byId("flujo-anterior").hidden = vista !== "anterior";
    var botones = byId("flujo-toggle").querySelectorAll("button[data-vista]");
    Array.prototype.forEach.call(botones, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-vista") === vista));
    });
  }

  function renderArreglos() {
    var arreglos = lista(D.arreglos).filter(function (a) {
      return a && (has(a.sintoma) || has(a.causa) || has(a.arreglo));
    });
    if (!arreglos.length) {
      byId("arreglos-lista").innerHTML = vacio();
      return;
    }
    byId("arreglos-lista").innerHTML = '<div class="arreglos">' + arreglos.map(function (a) {
      var s = '<article class="arreglo">';
      if (has(a.sintoma)) {
        s += '<div class="arreglo__bloque"><span class="arreglo__label">Síntoma</span><p>' + esc(a.sintoma) + "</p></div>";
      }
      if (has(a.causa)) {
        s += '<div class="arreglo__bloque"><span class="arreglo__label">Causa</span><p>' + esc(a.causa) + "</p></div>";
      }
      if (has(a.arreglo)) {
        s += '<div class="arreglo__bloque arreglo__bloque--arreglo"><span class="arreglo__label">Arreglo</span><p>' + esc(a.arreglo) + "</p></div>";
      }
      var archivos = lista(a.archivos).filter(has);
      if (archivos.length) {
        s += '<div class="archivos">' + archivos.map(function (x) {
          return '<span class="archivo">' + esc(x) + "</span>";
        }).join("") + "</div>";
      }
      return s + "</article>";
    }).join("") + "</div>";
  }

  function badgeTipo(tipo) {
    var t = str(tipo).toLowerCase();
    if (t === "nuevo") return '<span class="badge badge--nuevo">Nuevo</span>';
    if (t === "modificado") return '<span class="badge badge--cambiado">Modificado</span>';
    if (t === "eliminado") return '<span class="badge badge--eliminado">Eliminado</span>';
    return "";
  }

  function tarjetaPieza(p) {
    var s = '<article class="pieza">';
    s += '<div class="pieza__cabecera">';
    s += '<code class="pieza__ruta">' + esc(p.ruta) + "</code>";
    s += badgeTipo(p.tipo);
    if (p.ola) s += '<span class="badge badge--ola">Ola ' + esc(p.ola) + "</span>";
    s += "</div>";
    if (has(p.queHace)) s += '<p class="pieza__texto">' + esc(p.queHace) + "</p>";
    if (has(p.porQue)) s += '<p class="pieza__porque"><span class="etiqueta">Por qué</span>' + esc(p.porQue) + "</p>";
    if (has(p.antes)) s += '<p class="pieza__antes"><span class="etiqueta">Antes</span>' + esc(p.antes) + "</p>";
    if (p.ejemplo && has(p.ejemplo.codigo)) {
      s += '<details class="codigo"><summary>Ver ejemplo de uso' +
        (has(p.ejemplo.lenguaje) ? " (" + esc(p.ejemplo.lenguaje) + ")" : "") +
        "</summary><pre><code>" + esc(p.ejemplo.codigo) + "</code></pre></details>";
    }
    return s + "</article>";
  }

  function renderPiezas() {
    var piezas = lista(D.piezas).filter(function (p) { return p && has(p.ruta); });
    if (!piezas.length) {
      byId("piezas-lista").innerHTML = vacio();
      return;
    }

    var orden = [];
    var grupos = {};
    piezas.forEach(function (p) {
      var repo = str(p.repo);
      if (!Object.prototype.hasOwnProperty.call(grupos, repo)) {
        grupos[repo] = [];
        orden.push(repo);
      }
      grupos[repo].push(p);
    });

    byId("piezas-lista").innerHTML = orden.map(function (repo) {
      var items = grupos[repo];
      var principales = items.filter(function (p) { return p.principal !== false; });
      var otras = items.filter(function (p) { return p.principal === false; });

      var s = '<div class="piezas__grupo">';
      if (repo || orden.length > 1) {
        s += '<h3 class="piezas__grupo-titulo">' + esc(repo || "General") +
          "<span>" + items.length + (items.length === 1 ? " pieza" : " piezas") + "</span></h3>";
      }
      if (principales.length) {
        s += '<div class="piezas__principales">' + principales.map(tarjetaPieza).join("") + "</div>";
      }
      if (otras.length) {
        s += '<details class="otras"><summary>Otras piezas (' + otras.length + ")</summary><ul>" +
          otras.map(function (p) {
            return '<li class="pieza-mini">' +
              '<code class="pieza-mini__ruta">' + esc(p.ruta) + "</code>" +
              badgeTipo(p.tipo) +
              (has(p.queHace) ? '<span class="pieza-mini__texto">' + esc(p.queHace) + "</span>" : "") +
              "</li>";
          }).join("") + "</ul></details>";
      }
      return s + "</div>";
    }).join("");
  }

  function renderPruebas() {
    var pruebas = lista(D.comoProbar).filter(function (p) { return p && has(p.titulo); });
    if (!pruebas.length) {
      byId("pruebas").innerHTML = vacio();
      return;
    }
    byId("pruebas").innerHTML = '<div class="pruebas">' + pruebas.map(function (p, i) {
      var s = '<article class="prueba">';
      s += '<h3><span class="prueba__num">' + (i + 1) + "</span>" + esc(p.titulo) + "</h3>";
      var pasos = lista(p.pasos).filter(has);
      if (pasos.length) {
        s += "<ol>" + pasos.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>";
      }
      if (has(p.resultado)) {
        s += '<p class="resultado"><strong>Resultado esperado</strong>' + esc(p.resultado) + "</p>";
      }
      return s + "</article>";
    }).join("") + "</div>";
  }

  function renderDecisiones() {
    var rulings = lista(D.decisiones).filter(function (d) { return d && has(d.ruling); });
    var limites = lista(D.limites).filter(has);

    if (!rulings.length && !limites.length) {
      byId("decisiones-lista").innerHTML = vacio();
      return;
    }

    var s = '<div class="decisiones">';
    s += "<div><h3>Decisiones tomadas</h3>";
    s += rulings.length
      ? '<div class="rulings">' + rulings.map(function (d) {
          var r = '<article class="ruling"><p class="ruling__texto">' + esc(d.ruling) + "</p>";
          if (has(d.costo)) {
            r += '<p class="ruling__costo"><strong>Si estuvo mal</strong> ' + esc(d.costo) + "</p>";
          }
          return r + "</article>";
        }).join("") + "</div>"
      : vacio();
    s += "</div>";

    s += "<div><h3>Límites y pendientes</h3>";
    s += limites.length
      ? '<ul class="limites">' + limites.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>"
      : vacio();
    s += "</div></div>";

    byId("decisiones-lista").innerHTML = s;
  }

  function renderArtefactos() {
    var artefactos = lista(D.artefactos).filter(function (a) { return a && has(a.ruta); });
    if (!artefactos.length) {
      byId("artefactos-lista").innerHTML = vacio();
      return;
    }
    byId("artefactos-lista").innerHTML = '<div class="artefactos">' + artefactos.map(function (a) {
      return '<a class="artefacto" href="' + esc(a.ruta) + '" target="_blank" rel="noopener">' +
        '<span class="artefacto__nombre">' + esc(has(a.nombre) ? a.nombre : a.ruta) + "</span>" +
        '<span class="artefacto__desc">' + esc(a.descripcion) + "</span>" +
        '<span class="artefacto__flecha" aria-hidden="true">↗</span>' +
        "</a>";
    }).join("") + "</div>";
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

  function activarPaneles() {
    byId("flujo-actual").addEventListener("click", function (e) {
      var boton = e.target.closest(".paso__trigger[aria-expanded]");
      if (!boton) return;
      var panel = byId(boton.getAttribute("aria-controls"));
      if (!panel) return;
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      panel.hidden = abierto;
    });

    byId("flujo-toggle").addEventListener("click", function (e) {
      var boton = e.target.closest("button[data-vista]");
      if (!boton) return;
      cambiarVista(boton.getAttribute("data-vista"));
    });
  }

  renderAvisoDemo();
  renderHero();
  renderComparativa();
  renderFlujo();
  renderArreglos();
  renderPiezas();
  renderPruebas();
  renderDecisiones();
  renderArtefactos();
  activarPaneles();
  activarScrollspy();
})();
