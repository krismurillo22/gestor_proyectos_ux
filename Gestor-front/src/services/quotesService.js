// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { quotesData } from '../mocks/quotes';
import { requestsData } from '../mocks/requests';

// Copia mutable en memoria para que crear/editar/aprobar/rechazar se
// reflejen durante la sesión mientras no hay backend real conectado.
let mockQuotes = [...quotesData];

function withClient(quote) {
  const request = requestsData.find((r) => r.id === quote.requestId);
  return { ...quote, client: request?.client ?? '', clientId: request?.clientId ?? '' };
}

/**
 * Etiqueta de estado a mostrar para una cotización individual (usada por
 * <StatusBadge type="quote" />). No es lo mismo que `estado` (el del
 * backend) porque también refleja las banderas de front sentToClient/discarded.
 */
export function getQuoteDisplayStatus(quote) {
  if (quote.discarded) return 'Descartada';
  if (!quote.sentToClient) return 'Pendiente';
  if (quote.estado === 'pendiente') return 'Enviada al cliente';
  if (quote.estado === 'aprobada') return 'Aprobada';
  return 'Rechazada';
}

/**
 * Acceso síncrono a las cotizaciones de una solicitud, usado internamente
 * por requestsService para derivar el estado de la solicitud sin tener que
 * encadenar promesas. No simula latencia porque no es una llamada "real".
 */
export function getQuotesByRequestSync(requestId) {
  return mockQuotes.filter((q) => q.requestId === requestId);
}

/**
 * Lista las cotizaciones (vista global, todas las solicitudes).
 *
 * Endpoint real: GET /api/cotizaciones
 * Query params sugeridos: ?estado=pendiente&requestId=SOL-2024-041&supplierId=PRV-001&page=1&pageSize=20
 * Respuesta esperada: { data: Quote[], total: number }
 *
 * @param {{ estado?: string, requestId?: string, supplierId?: string }} [filters]
 */
export async function getQuotes(filters = {}) {
  let filtered = mockQuotes;
  if (filters.estado) filtered = filtered.filter((q) => q.estado === filters.estado);
  if (filters.requestId) filtered = filtered.filter((q) => q.requestId === filters.requestId);
  if (filters.supplierId) filtered = filtered.filter((q) => q.supplierId === filters.supplierId);
  return simulateNetwork(filtered.map(withClient));
  // return apiClient.get('/cotizaciones', { params: filters }); // TODO: backend
}

/**
 * Cotizaciones de una sola solicitud, para la vista de comparación
 * (cuántos talleres cotizaron, cuál se mandó al cliente, etc).
 *
 * Endpoint real: GET /api/solicitudes/:id/cotizaciones (o filtrar
 * GET /api/cotizaciones?requestId=)
 */
export async function getQuotesByRequest(requestId) {
  return simulateNetwork(getQuotesByRequestSync(requestId).map(withClient));
  // return apiClient.get(`/solicitudes/${requestId}/cotizaciones`); // TODO: backend
}

/**
 * Obtiene el detalle de una cotización por id.
 *
 * Endpoint real: GET /api/cotizaciones/:id
 *
 * @param {string} id
 */
export async function getQuoteById(id) {
  const quote = mockQuotes.find((q) => q.id === id) || null;
  return simulateNetwork(quote ? withClient(quote) : null);
  // return apiClient.get(`/cotizaciones/${id}`); // TODO: backend
}

/**
 * Registra la cotización de un taller para una solicitud existente.
 *
 * Endpoint real: POST /api/cotizaciones
 * Body esperado: { id_solicitud, id_proveedor, total, descripcion,
 *                  detalles: {nombre, valor, cantidad, descripcion}[] }
 *
 * @param {{ requestId: string, supplierId: string, supplier: string, items: object[], notes?: string }} payload
 */
export async function createQuote(payload) {
  const newQuote = {
    id: `COT-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    date: new Date().toISOString().slice(0, 10),
    total: payload.items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) ?? 0,
    estado: 'pendiente',
    sentToClient: false,
    discarded: false,
    ...payload,
  };
  mockQuotes = [newQuote, ...mockQuotes];
  return simulateNetwork(withClient(newQuote));
  // return apiClient.post('/cotizaciones', payload); // TODO: backend
}

/**
 * Actualiza una cotización existente (líneas, notas o total).
 *
 * Endpoint real: PUT /api/cotizaciones/:id
 *
 * @param {string} id
 * @param {object} payload
 */
export async function updateQuote(id, payload) {
  mockQuotes = mockQuotes.map((q) => (q.id === id ? { ...q, ...payload } : q));
  const updated = mockQuotes.find((q) => q.id === id);
  return simulateNetwork(updated ? withClient(updated) : null);
  // return apiClient.put(`/cotizaciones/${id}`, payload); // TODO: backend
}

/**
 * Marca esta cotización como "la elegida" para mandar al cliente. Solo
 * puede haber una cotización activa (sentToClient) por solicitud a la vez,
 * así que se desmarca cualquier otra que lo estuviera (p. ej. si antes se
 * mandó la de un taller, lo rechazaron, y ahora se manda la de otro).
 *
 * NOTA: `sentToClient`/`discarded` son banderas solo de front (ver mocks/quotes.js).
 * Hoy no hay endpoint para esto en el backend — habría que agregar algo como
 * PATCH /api/cotizaciones/:id/enviar-a-cliente cuando se conecte de verdad.
 */
export async function sendQuoteToClient(id) {
  const target = mockQuotes.find((q) => q.id === id);
  if (!target) return simulateNetwork(null);
  mockQuotes = mockQuotes.map((q) => {
    if (q.id === id) return { ...q, sentToClient: true, estado: 'pendiente' };
    if (q.requestId === target.requestId) return { ...q, sentToClient: false };
    return q;
  });
  const updated = mockQuotes.find((q) => q.id === id);
  return simulateNetwork(withClient(updated));
}

/**
 * El cliente acepta la cotización que se le mandó.
 *
 * Endpoint real: PUT /api/cotizaciones/:id/aprobar
 */
export async function approveQuote(id) {
  return updateQuote(id, { estado: 'aprobada' });
  // return apiClient.put(`/cotizaciones/${id}/aprobar`); // TODO: backend
}

/**
 * El cliente rechaza la cotización que se le mandó.
 *
 * Endpoint real: PUT /api/cotizaciones/:id/rechazar
 */
export async function rejectQuote(id) {
  return updateQuote(id, { estado: 'rechazada' });
  // return apiClient.put(`/cotizaciones/${id}/rechazar`); // TODO: backend
}

/**
 * Descarta manualmente la cotización de un taller (p. ej. perdió la
 * comparación contra otro). Solo aplica mientras no se haya mandado al cliente.
 */
export async function discardQuote(id) {
  return updateQuote(id, { discarded: true });
}

/** Revierte el descarte de una cotización, para volverla a considerar. */
export async function restoreQuote(id) {
  return updateQuote(id, { discarded: false });
}
