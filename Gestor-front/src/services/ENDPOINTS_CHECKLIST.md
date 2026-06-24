# Checklist de endpoints

Lista de los endpoints que el front necesita para dejar de usar datos mock. Marcar `[x]` cuando el backend (`Gestor`) lo tenga implementado y el service correspondiente ya esté conectado a él (no solo documentado).

> ¿Primera vez conectando uno de estos? Cada endpoint de aquí abajo ya tiene su propia función documentada en `services/*.js` (con método, ruta, body y respuesta esperada). El paso a paso de cómo conectar una función — con ejemplo completo — está en `GUIA_CONEXION_BACKEND.md`, en esta misma carpeta.

> Jorge: si ya tienen un contrato/Swagger del backend, péguenlo aquí o compártanlo para ajustar rutas, nombres de campos y métodos exactos — lo de abajo es una propuesta basada en lo que la UI necesita, no la fuente de verdad.

> **Actualización 2026-06-23:** se construyeron en `Gestor` todos los endpoints que faltaban de esta lista (marcados `✅ backend listo` abajo). Las casillas siguen sin marcar porque falta el lado del front (conectar los `services/*.js` reales). Detalle de lo nuevo y de las decisiones tomadas al final del archivo, en "Notas de la ronda 2026-06-23".

## Solicitudes (`requestsService.js`)

- [ ] `GET /api/solicitudes` — listar — ✅ backend listo (ya existía)
- [ ] `GET /api/solicitudes/:id` — detalle — ✅ backend listo (ya existía)
- [ ] `POST /api/solicitudes` — crear (cliente + descripción del trabajo) — ✅ backend listo (ya existía)

Nota: el estado visible de una solicitud (Cotizando / Enviada al cliente / Aprobada / Rechazada) hoy se calcula en el front a partir de sus cotizaciones — no es un campo propio. Si el backend lo expone directo, mejor, pero el front no depende de que exista.

## Cotizaciones (`quotesService.js`)

- [ ] `GET /api/cotizaciones` — listar, con filtros `estado`, `id_solicitud`, `id_proveedor` — ✅ backend listo (**nuevo**)
- [ ] `GET /api/cotizaciones/:id` — detalle — ✅ backend listo (ya existía)
- [ ] `GET /api/solicitudes/:id/cotizaciones` — cotizaciones de una sola solicitud (vista de comparación) — ✅ backend listo (**nuevo**)
- [ ] `POST /api/cotizaciones` — registrar la cotización de un taller para una solicitud. Body: `id_solicitud`, `id_proveedor`, líneas (`detalles`: cada una con `nombre`/`valor`/`cantidad`/`descripcion`, o `titulo`/`precio_unitario` como alias), `total`, `estado` — ✅ backend listo (ya existía; corregido para guardar los `detalles`)
- [ ] `PUT /api/cotizaciones/:id` — editar líneas/notas/tarifa (mismo body que el POST) — ✅ backend listo (ya existía)
- [ ] `PUT /api/cotizaciones/:id/aprobar` — el cliente acepta — ✅ backend listo (ya existía)
- [ ] `PUT /api/cotizaciones/:id/rechazar` — el cliente rechaza — ✅ backend listo (ya existía)
- [ ] `PATCH /api/cotizaciones/:id/enviar-a-cliente` — marcar como la cotización elegida para mandar al cliente — ✅ backend listo (**nuevo**, requiere migración pendiente — ver notas)
- [ ] `discardQuote`/`restoreQuote` — descartar/restaurar una cotización en comparación — ✅ backend listo (**nuevo**): usar `PUT /api/cotizaciones/:id` con body `{ descartada: true|false }`, no tiene endpoint propio

Pendiente de decidir: el subtotal, ISV y total de una cotización hoy los calcula el front (`AddQuoteModal.jsx`) y se mandan ya calculados en el POST/PUT — decidir si el backend los recalcula y valida server-side (recomendado, evita que alguien mande un total manipulado) o confía en lo que manda el front. **Sigue pendiente, no se tocó en esta ronda.**

## Órdenes de trabajo (`workOrdersService.js`)

No existe un modelo `OrdenTrabajo` separado: la entidad `Proyecto` del backend cumple ese rol (1:1 con la `Cotizacion` que la origina). Mapear `workOrdersService` contra `/api/proyectos`.

- [ ] `GET /api/ordenes-trabajo` → usar `GET /api/proyectos`, con filtros `estado`, `id_proveedor`, `id_cliente` — ✅ backend listo (`id_proveedor`/`id_cliente` son **nuevos**; nombres en snake_case, no `supplierId`/`clientId`)
- [ ] `GET /api/ordenes-trabajo/:id` → usar `GET /api/proyectos/:id` (incluye la cotización origen) — ✅ backend listo (ya existía)
- [ ] `POST /api/ordenes-trabajo` → usar `POST /api/proyectos` (`id_cotizacion`, `descripcion`, `fecha_inicio`, `fecha_vencimiento`) — ✅ backend listo (ya existía)
- [ ] `PATCH /api/ordenes-trabajo/:id/estado` → usar `PATCH /api/proyectos/:id/estado` — ✅ backend listo (ya existía; estados reales: `en_progreso`, `completado`, `cancelado`, `vencido` — sin `pendiente`)
- [ ] `POST /api/proyectos/:id/evaluacion` — registrar la evaluación final — pendiente, no se tocó en esta ronda (revisar rutas de `evaluaciones.js`, puede que ya cubra esto con otro verbo/ruta)

Importante para el front: tanto el listado como el detalle de `/api/proyectos` incluyen la `cotizacion` asociada completa (con `total`), así que no hace falta una segunda llamada para mostrar el total en el kanban.

## Clientes (`clientsService.js`)

- [ ] `GET /api/clientes` — listar, con filtro `search` (hoy es `GET /api/clientes/buscar?nombre=`) — ✅ backend listo (ya existía)
- [ ] `GET /api/clientes/:id` — detalle / perfil — ✅ backend listo (ya existía)
- [ ] `GET /api/clientes/:id/historial` — historial de proyectos del cliente, con el total de cada proyecto — ✅ backend listo (**nuevo**)
- [ ] `POST /api/clientes` — crear — ✅ backend listo (ya existía)

## Proveedores / talleres (`suppliersService.js`)

- [ ] `GET /api/proveedores` — listar, con filtro `search` — ✅ backend listo (ya existía)
- [ ] `GET /api/proveedores/:id` — detalle — ✅ backend listo (ya existía)
- [ ] `GET /api/proveedores/:id/historial` → ya existe como `GET /api/proveedores/:id/proyectos` — ✅ backend listo (ya existía; el front debe apuntar a esa ruta, no se creó una nueva)
- [ ] `POST /api/proveedores` — crear — ✅ backend listo (ya existía)

## Dashboard (`dashboardService.js`)

- [ ] `GET /api/dashboard/kpis` — proyectos activos, cotizaciones pendientes, nuevos clientes, ingresos del mes — ✅ backend listo (**nuevo** — ver definiciones exactas en notas)
- [ ] `GET /api/dashboard/cotizaciones-por-mes` — serie histórica para la gráfica (cotizadas vs aceptadas), parámetro opcional `?meses=` (default 6) — ✅ backend listo (**nuevo**)
- [ ] `GET /api/dashboard/proyectos-proximos-vencer` — alertas de vencimiento, parámetro opcional `?dias=` (default 7) — ✅ backend listo (**nuevo**)

## Pendiente de decidir (no tiene service todavía)

- [ ] Autenticación / login (hoy el usuario "Juan Díaz" está hardcodeado en `MainLayout.jsx`)
- [ ] `GET /evaluaciones/proveedor/:id_proveedor/promedio`, `GET /evaluaciones/ranking/proveedores`, `GET /proveedores/:id/estadisticas` ya existen en el backend pero el front todavía no los usa — hoy el promedio por proveedor se calcula en el front (`suppliersService.getSupplierAverageRating`) a partir de `evaluation` en las órdenes mock. Conectar estos cuando se integre de verdad.

## Notas de la ronda 2026-06-23

**Migración pendiente de correr:** se agregó `migrations/20260623213534-add-envio-cliente-to-cotizacion.js` (campos `enviada_cliente` y `descartada`, booleanos, default `false`, en la tabla `Cotizaciones`). No se pudo ejecutar desde este entorno por falta de conexión a la base real — correr `npx sequelize-cli db:migrate` antes de probar `enviar-a-cliente` o `descartar/restaurar`.

**Convención de query params:** los filtros nuevos (`id_cliente`, `id_proveedor` en `/api/proyectos` y `/api/cotizaciones`) usan snake_case para ser consistentes con el resto del backend, no camelCase (`clientId`/`supplierId`) como sugería este checklist originalmente. Ajustar los `services/*.js` del front a esos nombres.

**Definición de "ingresos del mes" (KPI):** suma de `total` de las `Cotizacion` con `estado = 'aprobada'` cuyo `updatedAt` cae en el mes actual. Es una aproximación: hoy no existe un campo `fecha_aprobacion` dedicado, así que se usa la fecha de última modificación como proxy. Si esto no es preciso para el negocio, decirme y agrego ese campo.

**Regla de "enviar a cliente":** solo puede haber una cotización con `enviada_cliente = true` por solicitud — al marcar una, el backend desmarca automáticamente las demás cotizaciones de esa misma solicitud. Confirmar que esa es la regla de negocio correcta.

**`cotizaciones-por-mes` usa SQL específico de Postgres** (`to_char` para agrupar por mes) — si en algún momento cambian de motor de base de datos, esa función habrá que reescribirla.
