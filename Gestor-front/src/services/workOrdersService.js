/**
 * NOTA PARA QUIEN CONECTE EL BACKEND:
 * Cada función abajo tiene un bloque "ENDPOINT REAL" con método, ruta,
 * query/body y la forma de la respuesta esperada, además de una línea
 * `apiClient...` ya escrita (comentada) lista para descomentar.
 * Guía paso a paso con un ejemplo completo: ver GUIA_CONEXION_BACKEND.md
 * en esta misma carpeta.
 */
// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { workOrders } from '../mocks/workOrders';
import { quotesData } from '../mocks/quotes';
import { getQuoteById } from './quotesService';

let mockWorkOrders = [...workOrders];

/**
 * Agrega el total de la cotización origen (quoteTotal) a una orden, para
 * mostrarlo de un vistazo en la tarjeta del kanban sin tener que abrir el
 * detalle. Se busca directo en el mock de cotizaciones (síncrono) porque es
 * solo un dato de previsualización, igual que withClient en quotesService.
 *
 * Es un helper interno (no se exporta), no tiene endpoint propio. Si el
 * backend devuelve `quoteId` en la orden (ver getWorkOrders/getWorkOrderById
 * abajo), esta función sigue funcionando igual sin cambios.
 */
function withQuoteTotal(order) {
  const quote = quotesData.find((q) => q.id === order.quoteId);
  return { ...order, quoteTotal: quote?.total ?? null };
}

/**
 * Lista las órdenes de trabajo (para la vista kanban).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/ordenes-trabajo
 * Query:     ?status=  (opcional) &supplierId=  (opcional) &clientId=  (opcional, aún sin usar en el front)
 * Body:      (no aplica)
 * Respuesta: OrdenDeTrabajo[] → { id, quoteId, client, supplierId, supplier,
 *            description, dueDate, status, statusHistory, evaluation }
 *            Importante: debe incluir `quoteId` — el front lo usa para
 *            buscar el total de la cotización origen (ver withQuoteTotal
 *            arriba) y para abrir el detalle de esa cotización.
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {{ status?: string, supplierId?: string }} [filters]
 */
export async function getWorkOrders(filters = {}) {
  let filtered = mockWorkOrders;
  if (filters.status) filtered = filtered.filter((o) => o.status === filters.status);
  if (filters.supplierId) filtered = filtered.filter((o) => o.supplierId === filters.supplierId);
  return simulateNetwork(filtered.map(withQuoteTotal));
  // return apiClient.get('/ordenes-trabajo', { params: filters }); // TODO: backend
}

/**
 * Obtiene el detalle de una orden de trabajo (modal de detalle:
 * info general, cotización utilizada, historial de estado).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/ordenes-trabajo/:id
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: OrdenDeTrabajo → mismo shape que en getWorkOrders, un solo objeto
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 */
export async function getWorkOrderById(id) {
  const order = mockWorkOrders.find((o) => o.id === id) || null;
  return simulateNetwork(order ? withQuoteTotal(order) : null);
  // return apiClient.get(`/ordenes-trabajo/${id}`); // TODO: backend
}

/**
 * Crea una orden de trabajo a partir de una cotización APROBADA por el
 * cliente. El taller (supplierId/supplier) y el cliente se derivan de la
 * cotización — no se eligen a mano, porque ya quedaron decididos cuando
 * el cliente aceptó esa cotización.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    POST
 * Ruta:      /api/ordenes-trabajo
 * Query:     (no aplica)
 * Body:      { id_cotizacion, descripcion, fecha_vencimiento }
 * Respuesta: OrdenDeTrabajo → la orden recién creada; el backend debería
 *            devolver `client`/`supplier` ya derivados de la cotización,
 *            no se deberían mandar desde el front.
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {{ quoteId: string, description?: string, dueDate: string }} payload
 */
export async function createWorkOrder({ quoteId, description, dueDate }) {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw new Error('Cotización no encontrada');
  if (quote.estado !== 'aprobada') throw new Error('Solo se puede crear una orden desde una cotización aprobada por el cliente');
  if (dueDate < new Date().toISOString().slice(0, 10)) throw new Error('La fecha límite no puede ser anterior a hoy');

  const newOrder = {
    id: `OT-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    quoteId,
    client: quote.client,
    supplierId: quote.supplierId,
    supplier: quote.supplier,
    description: description || quote.notes || '',
    dueDate,
    status: 'Pendiente',
    statusHistory: [{ status: 'Pendiente', date: new Date().toISOString().slice(0, 10), note: 'Orden creada' }],
    evaluation: null,
  };
  mockWorkOrders = [newOrder, ...mockWorkOrders];
  return simulateNetwork(newOrder);
  // return apiClient.post('/ordenes-trabajo', payload); // TODO: backend
}

/**
 * Cambia el estado de una orden (ej. al moverla de columna en el kanban).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    PATCH
 * Ruta:      /api/ordenes-trabajo/:id/estado
 * Query:     (no aplica)
 * Body:      { status: 'Pendiente' | 'En Progreso' | 'Control de Calidad' | 'Completada' }
 * Respuesta: OrdenDeTrabajo → la orden ya actualizada
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 * @param {string} status
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
 * Registra la evaluación final de calidad/desempeño al entregar la orden
 * al cliente (equivale a la entidad Evaluacion del backend: 1-1 con
 * Proyecto, rating 1-5 + observaciones). Además marca la orden como
 * 'Completada'.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    POST
 * Ruta:      /api/proyectos/:id/evaluacion
 * Query:     (no aplica)
 * Body:      { rating: number (1-5), descripcion: string }
 * Respuesta: OrdenDeTrabajo → la orden ya con status 'Completada' y su evaluation
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 * @param {{ rating: number, notes: string }} evaluation
 */
export async function submitWorkOrderEvaluation(id, { rating, notes }) {
  const evaluation = { rating, notes, date: new Date().toISOString().slice(0, 10) };
  mockWorkOrders = mockWorkOrders.map((o) =>
    o.id === id
      ? {
          ...o,
          status: 'Completada',
          evaluation,
          statusHistory: [...o.statusHistory, { status: 'Completada', date: evaluation.date, note: 'Entregado al cliente' }],
        }
      : o
  );
  const updated = mockWorkOrders.find((o) => o.id === id);
  return simulateNetwork(updated);
  // return apiClient.post(`/proyectos/${id}/evaluacion`, { rating, descripcion: notes }); // TODO: backend
}
