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
  demo: true,
  feature: "Checkout y pago con tarjeta",
  resumen: "Una compra con tarjeta pasa por el checkout, la reserva de stock, Stripe y un webhook que confirma la orden. El monto se calcula en el servidor: el cliente nunca decide cuánto se cobra.",
  meta: {
    fecha: "2026-11-20",
    repo: "acme-shop",
    rama: "main",
    commit: "a1b2c3d",
    alcance: "Checkout web + API de pagos",
    lectura: "Lectura estática"
  },
  metricas: [
    { valor: "5", etiqueta: "capas" },
    { valor: "8", etiqueta: "pasos" },
    { valor: "6", etiqueta: "reglas" },
    { valor: "7", etiqueta: "casos borde" },
    { valor: "4", etiqueta: "hallazgos" }
  ],
  mapa: {
    capas: [
      {
        nombre: "Entrada",
        detalle: "Dónde nace el flujo",
        items: [
          { nombre: "CheckoutPage", ruta: "apps/web/src/checkout/CheckoutPage.tsx", rol: "Formulario y botón de pago; arma el carrito." },
          { nombre: "POST /api/checkout", ruta: "apps/api/src/routes/checkout.ts", rol: "Único endpoint que inicia un pago." }
        ]
      },
      {
        nombre: "Aplicación",
        detalle: "Orquesta el caso de uso",
        items: [
          { nombre: "createOrder", ruta: "apps/api/src/checkout/createOrder.ts", rol: "Valida el carrito, reserva stock y crea la orden." },
          { nombre: "PaymentService.charge", ruta: "apps/api/src/payments/PaymentService.ts", rol: "Habla con Stripe y persiste el intento." }
        ]
      },
      {
        nombre: "Dominio",
        detalle: "Reglas y estados",
        items: [
          { nombre: "Order", ruta: "packages/domain/src/order/Order.ts", rol: "Máquina de estados: pending → paid | failed | expired." },
          { nombre: "Money", ruta: "packages/domain/src/money/Money.ts", rol: "Montos y moneda; rechaza monedas mezcladas." }
        ]
      },
      {
        nombre: "Datos",
        detalle: "Qué se guarda y dónde",
        items: [
          { nombre: "orders / order_items", ruta: "apps/api/migrations/0042_orders.sql", rol: "Orden, ítems, total y estado." },
          { nombre: "payments", ruta: "apps/api/migrations/0045_payments.sql", rol: "Intento de pago e id de Stripe." },
          { nombre: "outbox", ruta: "apps/api/src/outbox/outbox.ts", rol: "Eventos para emails y fulfillment." }
        ]
      },
      {
        nombre: "Externos",
        detalle: "Fuera de la app",
        items: [
          { nombre: "Stripe PaymentIntents", ruta: "api.stripe.com", rol: "Cobra la tarjeta y devuelve el estado." },
          { nombre: "Webhook de Stripe", ruta: "apps/api/src/webhooks/stripe.ts", rol: "Recibe payment_intent.* y cierra la orden." }
        ]
      }
    ],
    dependencias: [
      { desde: "CheckoutPage", hacia: "POST /api/checkout", tipo: "llama", nota: "Envía items, dirección y el token de tarjeta; nunca el monto." },
      { desde: "POST /api/checkout", hacia: "createOrder", tipo: "llama", nota: "Valida y crea la orden antes de cobrar." },
      { desde: "createOrder", hacia: "PaymentService.charge", tipo: "llama", nota: "Crea el PaymentIntent con idempotency key." },
      { desde: "PaymentService.charge", hacia: "Stripe PaymentIntents", tipo: "HTTP", nota: "Sincrónico; si falla, la orden queda pending." },
      { desde: "Webhook de Stripe", hacia: "Order", tipo: "evento", nota: "Transición a paid o failed según el evento firmado." },
      { desde: "Order", hacia: "outbox", tipo: "escribe", nota: "Dispara email y fulfillment al quedar paid." }
    ]
  },
  flujo: {
    titulo: "Camino principal: una compra con tarjeta",
    pasos: [
      {
        titulo: "El usuario confirma el pago",
        tipo: "entrada",
        resumen: "CheckoutPage envía el carrito y el token de la tarjeta.",
        detalle: "El cliente arma los items con id y cantidad, no con precios. El monto viaja recién en la respuesta del servidor.",
        archivos: ["apps/web/src/checkout/CheckoutPage.tsx"],
        datos: ["items", "dirección", "payment_method_token"]
      },
      {
        titulo: "Se validan carrito, stock y moneda",
        tipo: "validacion",
        resumen: "El servidor recalcula precios y descuenta stock disponible.",
        detalle: "Si un producto no tiene stock o la moneda del carrito no coincide con la del comercio, responde 409 sin crear orden.",
        archivos: ["apps/api/src/checkout/createOrder.ts"],
        datos: ["precios de DB", "stock", "currency"]
      },
      {
        titulo: "Se crea la orden y se reserva el stock",
        tipo: "efecto",
        resumen: "Orden en pending con vencimiento a 15 minutos.",
        detalle: "La reserva y la orden se escriben en la misma transacción; si falla una, no queda ninguna.",
        archivos: ["apps/api/src/checkout/createOrder.ts"],
        datos: ["orders", "order_items", "stock_reservations"]
      },
      {
        titulo: "Se crea el PaymentIntent en Stripe",
        tipo: "externo",
        resumen: "Monto y moneda salen de la orden, no del cliente.",
        detalle: "La idempotency key es el id de la orden: un reintento no genera un segundo cobro.",
        archivos: ["apps/api/src/payments/PaymentService.ts"],
        datos: ["payment_intent_id"]
      },
      {
        titulo: "¿Stripe pide 3DS?",
        tipo: "decision",
        resumen: "Si pide, redirige; si no, confirma y espera el webhook.",
        detalle: "El cliente vuelve a la app con el mismo order id. La orden sigue pending hasta que llegue el webhook.",
        caminos: [
          { condicion: "Stripe devuelve requires_action", resultado: "El usuario completa 3DS y vuelve al checkout." },
          { condicion: "Stripe devuelve processing", resultado: "La UI muestra «procesando» y espera el webhook." }
        ],
        archivos: ["apps/web/src/checkout/PaymentStatus.tsx"]
      },
      {
        titulo: "Llega el webhook payment_intent.succeeded",
        tipo: "externo",
        resumen: "Se verifica la firma y se marca la orden como paid.",
        detalle: "El handler busca la orden por metadata.order_id; el evento se guarda para no procesarlo dos veces.",
        archivos: ["apps/api/src/webhooks/stripe.ts"],
        datos: ["stripe_events", "orders.status"]
      },
      {
        titulo: "Se disparan email y fulfillment",
        tipo: "efecto",
        resumen: "El outbox publica order.paid y los consumidores reaccionan.",
        detalle: "Email y depósito trabajan desde el outbox, no desde el webhook: si uno falla, se reintenta sin re-cobrar.",
        archivos: ["apps/api/src/outbox/outbox.ts"],
        datos: ["outbox"]
      },
      {
        titulo: "Si el pago falla",
        tipo: "error",
        resumen: "payment_intent.payment_failed libera stock y marca failed.",
        detalle: "El usuario ve el motivo. La orden no se puede reintentar sin crear una nueva.",
        archivos: ["apps/api/src/webhooks/stripe.ts"],
        datos: ["orders.status", "stock_reservations"]
      }
    ]
  },
  reglas: [
    { regla: "El monto siempre se calcula en el servidor a partir de los ítems; el cliente no envía precios.", tipo: "Cálculo", donde: "apps/api/src/checkout/createOrder.ts:58", consecuencia: "Un precio manipulado en el cliente no cambia lo que se cobra." },
    { regla: "La moneda del carrito tiene que coincidir con la del comercio; no se mezclan monedas.", tipo: "Validación", donde: "apps/api/src/checkout/createOrder.ts:71", consecuencia: "Evita cobros en otra moneda y conversiones implícitas." },
    { regla: "El stock se reserva 15 minutos y se libera si la orden no se paga.", tipo: "Límite", donde: "apps/api/src/checkout/expireOrders.ts:22", consecuencia: "Una orden abandonada no bloquea stock para siempre." },
    { regla: "Cada intento de pago usa el id de la orden como idempotency key.", tipo: "Idempotencia", donde: "apps/api/src/payments/PaymentService.ts:44", consecuencia: "Un doble clic o un reintento no cobra dos veces." },
    { regla: "Un webhook sin firma válida se rechaza con 400 y no toca la orden.", tipo: "Seguridad", donde: "apps/api/src/webhooks/stripe.ts:31", consecuencia: "Nadie puede marcar una orden como pagada sin pasar por Stripe." },
    { regla: "Solo se permiten reembolsos totales desde el panel; los parciales no están implementados.", tipo: "Alcance", donde: "apps/api/src/payments/refunds.ts:12", consecuencia: "Un reembolso parcial hoy no tiene camino." }
  ],
  bordes: [
    { caso: "Doble clic en «Pagar»", esperado: "Un solo cobro.", actual: "La idempotency key reutiliza el mismo PaymentIntent.", estado: "cubierto", evidencia: "apps/api/src/payments/PaymentService.ts:44" },
    { caso: "Webhook duplicado de Stripe", esperado: "No duplicar email ni fulfillment.", actual: "stripe_events guarda el event id y corta el segundo.", estado: "cubierto", evidencia: "apps/api/src/webhooks/stripe.ts:52" },
    { caso: "Timeout contra Stripe después de crear el intent", esperado: "Saber si se cobró y reconciliar.", actual: "La orden queda pending y no hay reconciliación inmediata; el job de expiración la libera a los 15 min aunque el cobro pueda existir.", estado: "roto", evidencia: "apps/api/src/payments/PaymentService.ts:61" },
    { caso: "Stock agotado entre la reserva y el webhook", esperado: "Compensar o no cobrar.", actual: "El webhook marca paid y el fulfillment falla después; no hay compensación.", estado: "dudoso", evidencia: "apps/api/src/outbox/consumers/fulfillment.ts:38" },
    { caso: "Usuario abandona el 3DS", esperado: "La orden expira y libera stock.", actual: "El job de expiración la pasa a expired a los 15 min.", estado: "cubierto", evidencia: "apps/api/src/checkout/expireOrders.ts:22" },
    { caso: "Cupón que deja el total en 0", esperado: "No llamar a Stripe y marcar paid directo, o rechazar.", actual: "Se crea un PaymentIntent de 0 y Stripe responde error; la orden queda pending.", estado: "roto", evidencia: "apps/api/src/payments/PaymentService.ts:70" },
    { caso: "Moneda del carrito distinta a la del comercio", esperado: "Rechazar antes de crear la orden.", actual: "Se rechaza con 409 antes de tocar Stripe.", estado: "cubierto", evidencia: "apps/api/src/checkout/createOrder.ts:71" }
  ],
  hallazgos: [
    {
      titulo: "Un timeout de Stripe puede dejar un cobro sin orden pagada",
      tipo: "bug",
      severidad: "alta",
      confianza: "alta",
      evidencia: "apps/api/src/payments/PaymentService.ts:61 · apps/api/src/checkout/expireOrders.ts:22",
      impacto: "El usuario puede ver un error y, si el cobro se completó, quedar sin acceso a lo comprado. La expiración libera stock sin consultar el estado real en Stripe.",
      sugerencia: "Antes de expirar, consultar el PaymentIntent por id y reconciliar; si está succeeded, cerrar como paid."
    },
    {
      titulo: "El total en 0 se manda a Stripe en vez de resolverlo en la app",
      tipo: "validacion",
      severidad: "alta",
      confianza: "alta",
      evidencia: "apps/api/src/payments/PaymentService.ts:70",
      impacto: "Cupones del 100% fallan con un error opaco y dejan órdenes pending que ocupan stock 15 minutos.",
      sugerencia: "Si el total es 0, marcar la orden paid sin crear PaymentIntent y emitir el evento del outbox."
    },
    {
      titulo: "Fulfillment no compensa si el stock se agotó después del cobro",
      tipo: "riesgo",
      severidad: "media",
      confianza: "media",
      evidencia: "apps/api/src/outbox/consumers/fulfillment.ts:38",
      impacto: "Se cobra una orden que no se puede despachar; el reintento del outbox no resuelve la falta de stock.",
      sugerencia: "Definir una política (reembolso automático o backorder) y una alerta cuando fulfillment falla por stock."
    },
    {
      titulo: "orders.status y payments.status pueden desincronizarse",
      tipo: "deuda",
      severidad: "baja",
      confianza: "alta",
      evidencia: "apps/api/migrations/0042_orders.sql · apps/api/migrations/0045_payments.sql",
      impacto: "Dos fuentes de verdad para el mismo hecho; los reportes usan orders y el panel usa payments.",
      sugerencia: "Derivar el estado visible de una sola fuente o documentar cuál manda y por qué."
    }
  ],
  impacto: {
    consumidores: [
      "Panel de administración: lista órdenes y filtra por estado.",
      "Job de fulfillment: consume order.paid del outbox.",
      "Emails transaccionales: recibo y confirmación.",
      "Analytics: embudo checkout → paid.",
      "Soporte: busca por order id y por payment_intent id."
    ],
    siCambia: [
      "El contrato del webhook de Stripe (eventos y metadata.order_id).",
      "Los estados de Order y las transiciones permitidas.",
      "Las tablas orders, payments, stock_reservations y outbox.",
      "El flujo de 3DS y la pantalla de estado del checkout.",
      "Los reportes que leen orders.status como verdad."
    ],
    datos: [
      "PII: email y dirección de envío.",
      "Datos de tarjeta: nunca tocan la app; solo el token de Stripe.",
      "Datos financieros: monto, moneda, id de PaymentIntent y reembolsos.",
      "Stock: reservas con vencimiento y liberación."
    ]
  },
  archivos: [
    { ruta: "apps/web/src/checkout/CheckoutPage.tsx", capa: "Entrada", rol: "Formulario, carrito y llamada al endpoint." },
    { ruta: "apps/api/src/routes/checkout.ts", capa: "Entrada", rol: "Valida el request y llama a createOrder." },
    { ruta: "apps/api/src/checkout/createOrder.ts", capa: "Aplicación", rol: "Precios, stock, moneda y creación de la orden." },
    { ruta: "apps/api/src/payments/PaymentService.ts", capa: "Aplicación", rol: "PaymentIntent, idempotencia y persistencia del intento." },
    { ruta: "apps/api/src/webhooks/stripe.ts", capa: "Entrada", rol: "Firma, eventos e idempotencia del webhook." },
    { ruta: "packages/domain/src/order/Order.ts", capa: "Dominio", rol: "Máquina de estados y transiciones válidas." },
    { ruta: "apps/api/src/outbox/outbox.ts", capa: "Datos", rol: "Publicación de eventos y reintentos." },
    { ruta: "apps/api/src/checkout/expireOrders.ts", capa: "Aplicación", rol: "Expira órdenes y libera stock." }
  ],
  limites: [
    "Lectura estática: no se ejecutó la app ni se hicieron cobros de prueba.",
    "No se verificó la configuración real del webhook en el dashboard de Stripe.",
    "No se leyó el código interno de Stripe; se asume el contrato público de PaymentIntents.",
    "El caso de stock agotado después del cobro es una inferencia desde el consumidor de fulfillment, no una reproducción.",
    "Quedaron fuera los reembolsos parciales y las suscripciones: no forman parte de este flujo."
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
