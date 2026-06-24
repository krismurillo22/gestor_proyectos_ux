/**
 * Conectado al backend real (Gestor). No existe un modelo `OrdenTrabajo`
 * separado: la entidad `Proyecto` cumple ese rol (1:1 con la `Cotizacion`
 * que la origina) — todo este archivo traduce entre el `Proyecto` del
 * backend y la forma "OrdenDeTrabajo" que ya esperan las páginas/modales
 * (WorkOrders.jsx, WorkOrderDetailModal.jsx, etc.), para que ningún
 * componente tenga que saber de esta diferencia de nombres.
 *
 * Mapeo de estados (decisión de Jorge, 2026-06-23):
 *   backend 'pendiente'    <-> front 'Pendiente'
 *   backend 'en_progreso'  <-> front 'En Progreso'
 *   backend 'completado'   <-> front 'Completada'
 *   backend 'cancelado'/'vencido' existen pero NO son columna del kanban
 *   (WORK_ORDER_COLUMNS solo tiene esas 3) — una orden en ese estado deja
 *   de listarse en el tablero sin que haya que filtrarla a mano aquí.
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - El backend no guarda un historial de cambios de estado. `statusHistory`
 *     se reconstruye con lo único que sí existe (fecha de creación + estado
 *     actual), no es un log completo.
 *   - `Evaluacion` no tiene columna de fecha propia; se usa su `createdAt`.
 *   - `supplierId`/`client` se buscan hoy en mocks (suppliersData/clientsData)
 *     en los componentes de detalle por nombre/id — eso seguirá sin calzar
 *     hasta que clientsService/suppliersService también se conecten
 *     (tareas aparte, ver ENDPOINTS_CHECKLIST.md).
 */
import { apiClient } from './apiClient';

// Exportados porque dashboardService.js también necesita traducir el estado
// de Proyecto a la etiqueta en español (panel "Próximos a vencer").
export const STATUS_TO_BACKEND = {
  Pendiente: 'pendiente',
  'En Progreso': 'en_progreso',
  Completada: 'completado',
};

export const STATUS_FROM_BACKEND = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completado: 'Completada',
  cancelado: 'Cancelada',
  vencido: 'Vencida',
};

function toDateStr(value) {
  if (!value) return null;
  const s = typeof value === 'string' ? value : value.toISOString();
  return s.slice(0, 10);
}

/**
 * Traduce un Proyecto del backend (con sus includes de cotizacion/proveedor/
 * solicitud->cliente/evaluacion, ver proyectosController.buildProyectoIncludes)
 * a la forma "OrdenDeTrabajo" que usan los componentes.
 */
function adaptProyecto(p) {
  const cotizacion = p.cotizacion || {};
  const proveedor = cotizacion.proveedor || {};
  const cliente = cotizacion.solicitud?.cliente || {};
  const evaluacion = p.evaluacion || null;
  const status = STATUS_FROM_BACKEND[p.estado] || p.estado;

  const statusHistory = [{ status: 'Pendiente', date: toDateStr(p.createdAt) || toDateStr(p.fecha_inicio), note: 'Orden creada' }];
  if (status !== 'Pendiente') {
    statusHistory.push({ status, date: toDateStr(p.updatedAt), note: 'Cambio de estado' });
  }

  return {
    id: p.id_proyecto,
    quoteId: cotizacion.id_cotizacion ?? p.id_cotizacion,
    clientId: cliente.id_cliente ?? null,
    client: cliente.nombre || '',
    supplierId: proveedor.id_proveedor ?? null,
    supplier: proveedor.nombre || '',
    description: p.descripcion || '',
    dueDate: toDateStr(p.fecha_vencimiento),
    status,
    statusHistory,
    evaluation: evaluacion ? { rating: evaluacion.rating, notes: evaluacion.descripcion, date: toDateStr(evaluacion.createdAt) } : null,
    quoteTotal: cotizacion.total ?? null,
  };
}

/**
 * Lista las órdenes de trabajo.
 * GET /api/proyectos?estado=&id_proveedor=&id_cliente=&incluirArchivados=true
 *
 * Por defecto NO incluye las órdenes archivadas (correcto para el kanban de
 * WorkOrders.jsx, que nunca debe mostrarlas). Para cálculos que sí deben
 * seguir contando una orden ya archivada — proyectos activos/ingresos y el
 * historial de proyectos en Clientes y Proveedores — pasar
 * `includeArchived: true` (ver clientsService.js/suppliersService.js).
 *
 * @param {{ status?: string, supplierId?: number|string, clientId?: number|string, includeArchived?: boolean }} [filters]
 */
export async function getWorkOrders(filters = {}) {
  const params = {};
  if (filters.status) params.estado = STATUS_TO_BACKEND[filters.status] || filters.status;
  if (filters.supplierId) params.id_proveedor = filters.supplierId;
  if (filters.clientId) params.id_cliente = filters.clientId;
  if (filters.includeArchived) params.incluirArchivados = 'true';

  const proyectos = await apiClient.get('/proyectos', { params });
  return proyectos.map(adaptProyecto);
}

/**
 * Obtiene el detalle de una orden de trabajo.
 * GET /api/proyectos/:id
 *
 * Devuelve null si no existe (mismo contrato que antes con el mock), en vez
 * de lanzar, porque algunos llamadores (Dashboard.jsx) no esperan un catch.
 *
 * @param {number|string} id
 */
export async function getWorkOrderById(id) {
  try {
    const proyecto = await apiClient.get(`/proyectos/${id}`);
    return adaptProyecto(proyecto);
  } catch (error) {
    console.error(`No se pudo obtener la orden de trabajo ${id}:`, error);
    return null;
  }
}

/**
 * Crea una orden de trabajo a partir de una cotización APROBADA por el
 * cliente. El taller y el cliente se derivan de la cotización en el
 * backend — no se mandan desde el front.
 * POST /api/proyectos  body: { id_cotizacion, descripcion, fecha_inicio, fecha_vencimiento }
 *
 * @param {{ quoteId: string|number, description?: string, dueDate: string }} payload
 */
export async function createWorkOrder({ quoteId, description, dueDate }) {
  const { data } = await apiClient.post('/proyectos', {
    id_cotizacion: quoteId,
    descripcion: description,
    fecha_inicio: toDateStr(new Date()),
    fecha_vencimiento: dueDate,
  });
  // La respuesta del POST no trae los includes (proveedor/cliente/evaluacion)
  // que sí trae el GET — se vuelve a pedir el detalle completo para que el
  // kanban tenga todo de una vez.
  return getWorkOrderById(data.id_proyecto);
}

/**
 * Cambia el estado de una orden (ej. al moverla de columna en el kanban).
 * PATCH /api/proyectos/:id/estado  body: { estado: 'pendiente'|'en_progreso'|'completado' }
 *
 * @param {number|string} id
 * @param {string} status  Uno de los valores en español del front (ver STATUS_TO_BACKEND)
 */
export async function updateWorkOrderStatus(id, status) {
  const estado = STATUS_TO_BACKEND[status] || status;
  await apiClient.patch(`/proyectos/${id}/estado`, { estado });
  return getWorkOrderById(id);
}

/**
 * Registra la evaluación final de calidad/desempeño al entregar la orden al
 * cliente, y la marca como 'Completada'. El backend no hace esto en un solo
 * paso: crear la Evaluacion y pasar el Proyecto a 'completado' son dos
 * llamadas separadas — se orquestan aquí para que el componente siga viendo
 * una sola operación.
 * POST /api/evaluaciones  body: { id_proyecto, rating, descripcion }
 * PATCH /api/proyectos/:id/estado  body: { estado: 'completado' }
 *
 * @param {number|string} id
 * @param {{ rating: number, notes: string }} evaluation
 */
export async function submitWorkOrderEvaluation(id, { rating, notes }) {
  await apiClient.post('/evaluaciones', { id_proyecto: id, rating, descripcion: notes });
  await apiClient.patch(`/proyectos/${id}/estado`, { estado: 'completado' });
  return getWorkOrderById(id);
}

export async function archiveWorkOrder(id) {
  await apiClient.patch(`/proyectos/${id}/archivar`);
}

export async function unarchiveWorkOrder(id) {
  await apiClient.patch(`/proyectos/${id}/desarchivar`);
}

export async function getArchivedWorkOrders() {
  const proyectos = await apiClient.get('/proyectos/archivados');
  return Array.isArray(proyectos) ? proyectos.map(adaptProyecto) : [];
}