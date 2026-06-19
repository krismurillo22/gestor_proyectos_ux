# Checklist de endpoints

Lista de los endpoints que el front necesita para dejar de usar datos mock. Marcar `[x]` cuando el backend (`Gestor`) lo tenga implementado y el service correspondiente ya esté conectado a él (no solo documentado).

> Jorge: si ya tienen un contrato/Swagger del backend, péguenlo aquí o compártanlo para ajustar rutas, nombres de campos y métodos exactos — lo de abajo es una propuesta basada en lo que la UI necesita, no la fuente de verdad.

## Solicitudes (`requestsService.js`)

- [ ] `GET /api/solicitudes` — listar
- [ ] `GET /api/solicitudes/:id` — detalle
- [ ] `POST /api/solicitudes` — crear (cliente + descripción del trabajo)

Nota: el estado visible de una solicitud (Cotizando / Enviada al cliente / Aprobada / Rechazada) hoy se calcula en el front a partir de sus cotizaciones — no es un campo propio. Si el backend lo expone directo, mejor, pero el front no depende de que exista.

## Cotizaciones (`quotesService.js`)

- [ ] `GET /api/cotizaciones` — listar, con filtros `estado`, `requestId`/`id_solicitud`, `supplierId`/`id_proveedor`, paginación
- [ ] `GET /api/cotizaciones/:id` — detalle
- [ ] `POST /api/cotizaciones` — registrar la cotización de un taller para una solicitud (`id_solicitud`, `id_proveedor`, líneas, notas)
- [ ] `PUT /api/cotizaciones/:id` — editar líneas/notas
- [ ] `PUT /api/cotizaciones/:id/aprobar` — el cliente acepta
- [ ] `PUT /api/cotizaciones/:id/rechazar` — el cliente rechaza
- [ ] `PATCH /api/cotizaciones/:id/enviar-a-cliente` — marcar como la cotización elegida para mandar al cliente (hoy `sentToClient`/`discarded` son banderas solo de front, ver `mocks/quotes.js` — no existen en el modelo `Cotizacion` actual del backend)

## Órdenes de trabajo (`workOrdersService.js`)

- [ ] `GET /api/ordenes-trabajo` — listar, con filtros `status`, `supplierId`, `clientId`
- [ ] `GET /api/ordenes-trabajo/:id` — detalle (specs técnicas, archivos, historial de estado)
- [ ] `POST /api/ordenes-trabajo` — crear a partir de una cotización **aprobada** (`id_cotizacion`, descripción, fecha límite, prioridad); cliente y taller se derivan de la cotización, no se mandan desde el front
- [ ] `PATCH /api/ordenes-trabajo/:id/estado` — mover de columna en el kanban
- [ ] `PATCH /api/ordenes-trabajo/:id/progreso` — actualizar % de avance
- [ ] `POST /api/proyectos/:id/evaluacion` — registrar la evaluación final (rating 1-5 + observaciones) al entregar al cliente; corresponde a la entidad `Evaluacion` (1:1 con `Proyecto`) que ya existe en el backend pero no tiene endpoint expuesto todavía

## Clientes (`clientsService.js`)

- [ ] `GET /api/clientes` — listar, con filtro `search`
- [ ] `GET /api/clientes/:id` — detalle / perfil
- [ ] `GET /api/clientes/:id/historial` — historial de proyectos del cliente
- [ ] `POST /api/clientes` — crear

## Proveedores / talleres (`suppliersService.js`)

- [ ] `GET /api/proveedores` — listar, con filtro `search`
- [ ] `GET /api/proveedores/:id` — detalle
- [ ] `POST /api/proveedores` — crear

## Dashboard (`dashboardService.js`)

- [ ] `GET /api/dashboard/kpis` — proyectos activos, cotizaciones pendientes, nuevos clientes, ingresos del mes
- [ ] `GET /api/dashboard/cotizaciones-por-mes` — serie histórica para la gráfica (cotizadas vs aceptadas)
- [ ] `GET /api/dashboard/proyectos-proximos-vencer` — alertas de vencimiento

## Pendiente de decidir (no tiene service todavía)

- [ ] Autenticación / login (hoy el usuario "Juan Díaz" está hardcodeado en `MainLayout.jsx`)
- [ ] Subida de archivos adjuntos en órdenes de trabajo (hoy son strings estáticos)
- [ ] `GET /evaluaciones/proveedor/:id_proveedor/promedio`, `GET /evaluaciones/ranking/proveedores`, `GET /proveedores/:id/estadisticas` ya existen en el backend pero el front todavía no los usa — hoy el promedio por proveedor se calcula en el front (`suppliersService.getSupplierAverageRating`) a partir de `evaluation` en las órdenes mock. Conectar estos cuando se integre de verdad.
