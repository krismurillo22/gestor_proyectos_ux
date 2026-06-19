// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { workOrders } from '../mocks/workOrders';
import { getQuoteById } from './quotesService';

let mockWorkOrders = [...workOrders];

/**
 * Lista las órdenes de trabajo (para la vista kanban).
 *
 * Endpoint real: GET /api/ordenes-trabajo
 * Query params sugeridos: ?status=&supplierId=&clientId=
 * Respuesta esperada: { data: WorkOrder[], total: number }
 */
export async function getWorkOrders(filters = {}) {
  let filtered = mockWorkOrders;
  if (filters.status) filtered = filtered.filter((o) => o.status === filters.status);
  if (filters.supplierId) filtered = filtered.filter((o) => o.supplierId === filters.supplierId);
  return simulateNetwork(filtered);
  // return apiClient.get('/ordenes-trabajo', { params: filters }); // TODO: backend
}

/**
 * Obtiene el detalle de una orden de trabajo (modal de detalle:
 * info general, especificaciones técnicas, archivos adjuntos, historial).
 *
 * Endpoint real: GET /api/ordenes-trabajo/:id
 */
export async function getWorkOrderById(id) {
  const order = mockWorkOrders.find((o) => o.id === id) || null;
  return simulateNetwork(order);
  // return apiClient.get(`/ordenes-trabajo/${id}`); // TODO: backend
}

/**
 * Crea una orden de trabajo a partir de una cotización APROBADA por el
 * cliente. El taller (supplierId/supplier) y el cliente se derivan de la
 * cotización — no se eligen a mano, porque ya quedaron decididos cuando
 * el cliente aceptó esa cotización.
 *
 * Endpoint real: POST /api/ordenes-trabajo
 * Body esperado: { id_cotizacion, descripcion, fecha_vencimiento, priority }
 * Nota: el backend debería devolver también `client`/`supplier`, derivados
 * de la cotización, no se deberían mandar desde el front.
 */
export async function createWorkOrder({ quoteId, description, dueDate, priority }) {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error('Cotización no encontrada');
  if (quote.estado !== 'aprobada') throw new Error('Solo se puede crear una orden desde una cotización aprobada por el cliente');

  const newOrder = {
    id: `OT-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    quoteId,
    client: quote.client,
    supplierId: quote.supplierId,
    supplier: quote.supplier,
    description: description || quote.notes || '',
    dueDate,
    priority,
    progress: 0,
    status: 'Pendiente',
    statusHistory: [{ status: 'Pendiente', date: new Date().toISOString().slice(0, 10), note: 'Orden creada' }],
    technicalSpecs: [],
    attachedFiles: [],
    evaluation: null,
  };
  mockWorkOrders = [newOrder, ...mockWorkOrders];
  return simulateNetwork(newOrder);
  // return apiClient.post('/ordenes-trabajo', payload); // TODO: backend
}

/**
 * Cambia el estado de una orden (ej. al moverla de columna en el kanban).
 *
 * Endpoint real: PATCH /api/ordenes-trabajo/:id/estado
 * Body esperado: { status: 'Pendiente' | 'En Progreso' | 'Control de Calidad' | 'Completada' }
 */
export async function updateWorkOrderStatus(id, status) {
  mockWorkOrders = mockWorkOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          status,
          statusHistory: [...o.statusHistory, { status, date: new Date().toISOString().slice(0, 10), note: 'Cambio de estado' }],
        }
      : o
  );
  const updated = mockWorkOrders.find((o) => o.id === id);
  return simulateNetwork(updated);
  // return apiClient.patch(`/ordenes-trabajo/${id}/estado`, { status }); // TODO: backend
}

/**
 * Actualiza el porcentaje de avance de una orden.
 *
 * Endpoint real: PATCH /api/ordenes-trabajo/:id/progreso
 * Body esperado: { progress: number } (0-100)
 */
export async function updateWorkOrderProgress(id, progress) {
  mockWorkOrders = mockWorkOrders.map((o) => (o.id === id ? { ...o, progress } : o));
  const updated = mockWorkOrders.find((o) => o.id === id);
  return simulateNetwork(updated);
  // return apiClient.patch(`/ordenes-trabajo/${id}/progreso`, { progress }); // TODO: backend
}

/**
 * Registra la evaluación final de calidad/desempeño al entregar la orden
 * al cliente (equivale a la entidad Evaluacion del backend: 1-1 con
 * Proyecto, rating 1-5 + observaciones). Además marca la orden como
 * 'Completada'.
 *
 * Endpoint real: POST /api/proyectos/:id/evaluacion
 * Body esperado: { rating: number (1-5), descripcion: string }
 */
export async function submitWorkOrderEvaluation(id, { rating, notes }) {
  const evaluation = { rating, notes, date: new Date().toISOString().slice(0, 10) };
  mockWorkOrders = mockWorkOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          status: 'Completada',
          progress: 100,
          evaluation,
          statusHistory: [...o.statusHistory, { status: 'Completada', date: evaluation.date, note: 'Entregado al cliente' }],
        }
      : o
  );
  const updated = mockWorkOrders.find((o) => o.id === id);
  return simulateNetwork(updated);
  // return apiClient.post(`/proyectos/${id}/evaluacion`, { rating, descripcion: notes }); // TODO: backend
}
