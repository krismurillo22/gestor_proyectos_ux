# Checklist de endpoints

Lista de los endpoints que el front necesita para dejar de usar datos mock. Marcar `[x]` cuando el backend (`Gestor`) lo tenga implementado y el service correspondiente ya esté conectado a él (no solo documentado).

> ¿Primera vez conectando uno de estos? Cada endpoint de aquí abajo ya tiene su propia función documentada en `services/*.js` (con método, ruta, body y respuesta esperada). El paso a paso de cómo conectar una función — con ejemplo completo — está en `GUIA_CONEXION_BACKEND.md`, en esta misma carpeta.

> Jorge: si ya tienen un contrato/Swagger del backend, péguenlo aquí o compártanlo para ajustar rutas, nombres de campos y métodos exactos — lo de abajo es una propuesta basada en lo que la UI necesita, no la fuente de verdad.

## Solicitudes (`requestsService.js`)

- [ ] `GET /api/solicitudes` — listar
- [ ] `GET /api/solicitudes/:id` — detalle
- [ ] `POST /api/solicitudes` — crear (cliente + descripción del trabajo)

Nota: el estado visible de una solicitud (Cotizando / Enviada al cliente / Aprobada / Rechazada) hoy se calcula en el front a partir de sus cotizaciones — no es un campo propio. Si el backend lo expone directo, mejor, pero el front no depende de que exista.

## Cotizaciones (`quotesService.js`)

- [ ] `GET /api/cotizaciones` — listar, con filtros `estado`, `requestId`/`id_solicitud`, `supplierId`/`id_proveedor`, paginación
- [ ] `GET /api/cotizaciones/:id` — detalle
- [ ] `GET /api/solicitudes/:id/cotizaciones` — cotizaciones de una sola solicitud (vista de comparación); alternativa: filtrar el listado general por `requestId`, decidir cuál expone el backend
- [ ] `POST /api/cotizaciones` — registrar la cotización de un taller para una solicitud. Body: `id_solicitud`, `id_proveedor`, líneas (`titulo`, `descripcion`, `cantidad`, `precio_unitario`), `notas`, tarifa de intermediación (`valor`, `porcentaje`), `subtotal`, `isv` (15%), `total`
- [ ] `PUT /api/cotizaciones/:id` — editar líneas/notas/tarifa (mismo body que el POST)
- [ ] `PUT /api/cotizaciones/:id/aprobar` — el cliente acepta
- [ ] `PUT /api/cotizaciones/:id/rechazar` — el cliente rechaza
- [ ] `PATCH /api/cotizaciones/:id/enviar-a-cliente` — marcar como la cotización elegida para mandar al cliente (hoy `sentToClient`/`discarded` son banderas solo de front, ver `mocks/quotes.js` — no existen en el modelo `Cotizacion` actual del backend). `discardQuote`/`restoreQuote` (descartar/restaurar una cotización en comparación) reusan este mismo PUT genérico solo para la bandera `discarded`, no necesitan endpoint propio.

Pendiente de decidir: el subtotal, ISV y total de una cotización hoy los calcula el front (`AddQuoteModal.jsx`) y se mandan ya calculados en el POST/PUT — decidir si el backend los recalcula y valida server-side (recomendado, evita que alguien mande un total manipulado) o confía en lo que manda el front.

## Órdenes de trabajo (`workOrdersService.js`)

- [ ] `GET /api/ordenes-trabajo` — listar, con filtros `status`, `supplierId`, `clientId`
- [ ] `GET /api/ordenes-trabajo/:id` — detalle (info general, historial de estado, evaluación). Ya no incluye archivos adjuntos: se quitó esa sección, no hay manejo de almacenamiento de archivos contemplado.
- [ ] `POST /api/ordenes-trabajo` — crear a partir de una cotización **aprobada** (`id_cotizacion`, descripción, fecha límite — no puede ser anterior a hoy); cliente y taller se derivan de la cotización, no se mandan desde el front
- [ ] `PATCH /api/ordenes-trabajo/:id/estado` — mover de columna en el kanban
- [ ] `POST /api/proyectos/:id/evaluacion` — registrar la evaluación final (rating 1-5 + observaciones) al entregar al cliente; corresponde a la entidad `Evaluacion` (1:1 con `Proyecto`) que ya existe en el backend pero no tiene endpoint expuesto todavía

Importante para el front: tanto el listado (tarjetas del kanban) como el detalle muestran el **total de la cotización origen** (y el detalle muestra además sus líneas y desglose financiero completo). Hoy el front lo junta en memoria buscando por `quoteId` en los mocks de cotizaciones. Para que esto funcione contra el backend real, lo más simple es que `GET /api/ordenes-trabajo` y `GET /api/ordenes-trabajo/:id` devuelvan también `quoteId` (ya está) — el front hace una segunda llamada a `GET /api/cotizaciones/:id` para traer el detalle completo de la cotización, así que no es estrictamente necesario anidarla en la respuesta de la orden, pero si el backend la puede incluir directo (al menos el `total`) en el listado, se ahorra esa llamada extra en el tablero kanban.

## Clientes (`clientsService.js`)

- [ ] `GET /api/clientes` — listar, con filtro `search`
- [ ] `GET /api/clientes/:id` — detalle / perfil
- [ ] `GET /api/clientes/:id/historial` — historial de proyectos del cliente, con el total de cada proyecto (de su cotización asociada). Alternativa: `GET /api/ordenes-trabajo?clientId=:id`, una vez que el backend agregue `clientId` a la Orden de Trabajo (hoy la orden solo guarda el nombre del cliente, no su id)
- [ ] `POST /api/clientes` — crear

## Proveedores / talleres (`suppliersService.js`)

- [ ] `GET /api/proveedores` — listar, con filtro `search`
- [ ] `GET /api/proveedores/:id` — detalle
- [ ] `GET /api/proveedores/:id/historial` — historial de órdenes de trabajo ejecutadas por el proveedor. Alternativa: `GET /api/ordenes-trabajo?supplierId=:id` (ese filtro ya existe en `workOrdersService.getWorkOrders`); decidir cuál expone el backend
- [ ] `POST /api/proveedores` — crear

## Dashboard (`dashboardService.js`)

- [ ] `GET /api/dashboard/kpis` — proyectos activos, cotizaciones pendientes, nuevos clientes, ingresos del mes
- [ ] `GET /api/dashboard/cotizaciones-por-mes` — serie histórica para la gráfica (cotizadas vs aceptadas)
- [ ] `GET /api/dashboard/proyectos-proximos-vencer` — alertas de vencimiento

## Pendiente de decidir (no tiene service todavía)

- [ ] Autenticación / login (hoy el usuario "Juan Díaz" está hardcodeado en `MainLayout.jsx`)
- [ ] `GET /evaluaciones/proveedor/:id_proveedor/promedio`, `GET /evaluaciones/ranking/proveedores`, `GET /proveedores/:id/estadisticas` ya existen en el backend pero el front todavía no los usa — hoy el promedio por proveedor se calcula en el front (`suppliersService.getSupplierAverageRating`) a partir de `evaluation` en las órdenes mock. Conectar estos cuando se integre de verdad.
