# Checklist de endpoints

Lista de los endpoints que el front necesita para dejar de usar datos mock. Marcar `[x]` cuando el backend (`Gestor`) lo tenga implementado y el service correspondiente ya esté conectado a él (no solo documentado).

> Jorge: si ya tienen un contrato/Swagger del backend, péguenlo aquí o compártanlo para ajustar rutas, nombres de campos y métodos exactos — lo de abajo es una propuesta basada en lo que la UI necesita, no la fuente de verdad.

## Cotizaciones (`quotesService.js`)

- [ ] `GET /api/cotizaciones` — listar, con filtros `status`, `clientId`, paginación
- [ ] `GET /api/cotizaciones/:id` — detalle
- [ ] `POST /api/cotizaciones` — crear (borrador o enviar a cliente)
- [ ] `PUT /api/cotizaciones/:id` — editar líneas/notas/estado
- [ ] `PATCH /api/cotizaciones/:id/archivar` — archivar

## Órdenes de trabajo (`workOrdersService.js`)

- [ ] `GET /api/ordenes-trabajo` — listar, con filtros `status`, `operator`, `clientId`
- [ ] `GET /api/ordenes-trabajo/:id` — detalle (specs técnicas, archivos, historial de estado)
- [ ] `POST /api/ordenes-trabajo` — crear a partir de una cotización aceptada
- [ ] `PATCH /api/ordenes-trabajo/:id/estado` — mover de columna en el kanban
- [ ] `PATCH /api/ordenes-trabajo/:id/progreso` — actualizar % de avance

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
- [ ] Endpoint de operadores/personal de talleres (hoy `OPERATORS` es un arreglo fijo en `mocks/workOrders.js`)
- [ ] Subida de archivos adjuntos en órdenes de trabajo (hoy son strings estáticos)
