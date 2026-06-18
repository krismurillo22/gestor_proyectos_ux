// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { workOrders } from '../mocks/workOrders';

let mockWorkOrders = [...workOrders];

/**
 * Lista las órdenes de trabajo (para la vista kanban).
 *
 * Endpoint real: GET /api/ordenes-trabajo
 * Query params sugeridos: ?status=&operator=&clientId=
 * Respuesta esperada: { data: WorkOrder[], total: number }
 */
export async function getWorkOrders(filters = {}) {
  let filtered = mockWorkOrders;
  if (filters.status) filtered = filtered.filter((o) => o.status === filters.status);
  if (filters.operator) filtered = filtered.filter((o) => o.operator === filters.operator);
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
 * Crea una orden de trabajo a partir de una cotización aceptada.
 *
 * Endpoint real: POST /api/ordenes-trabajo
 * Body esperado: { quoteId, description, dueDate, priority, operator }
 * Nota: el backend debería devolver también `client`, derivado de la
 * cotización (quoteId), no se debería mandar desde el front.
 */
export async function createWorkOrder(payload) {
  const newOrder = {
    id: `OT-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    progress: 0,
    status: 'Pendiente',
    statusHistory: [{ status: 'Pendiente', date: new Date().toISOString().slice(0, 10), note: 'Orden creada' }],
    technicalSpecs: [],
    attachedFiles: [],
    ...payload,
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
