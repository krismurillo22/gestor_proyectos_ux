// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { quotesData } from '../mocks/quotes';

// Copia mutable en memoria para que crear/editar/archivar se reflejen
// durante la sesión mientras no hay backend real conectado.
let mockQuotes = [...quotesData];

/**
 * Lista las cotizaciones.
 *
 * Endpoint real: GET /api/cotizaciones
 * Query params sugeridos: ?status=Enviada&clientId=CLI-001&page=1&pageSize=20
 * Respuesta esperada: { data: Quote[], total: number }
 *
 * @param {{ status?: string, clientId?: string }} [filters]
 */
export async function getQuotes(filters = {}) {
  const filtered = filters.status ? mockQuotes.filter((q) => q.status === filters.status) : mockQuotes;
  return simulateNetwork(filtered);
  // return apiClient.get('/cotizaciones', { params: filters }); // TODO: backend
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
  return simulateNetwork(quote);
  // return apiClient.get(`/cotizaciones/${id}`); // TODO: backend
}

/**
 * Crea una nueva cotización (Guardar borrador o Enviar a cliente).
 *
 * Endpoint real: POST /api/cotizaciones
 * Body esperado: { clientId: string, items: {description, quantity, unitPrice}[], notes?: string, status: 'Borrador' | 'Enviada' }
 * Respuesta esperada: Quote (con id generado por el backend)
 *
 * @param {{ client: string, items: object[], notes?: string, status: string }} payload
 */
export async function createQuote(payload) {
  const newQuote = {
    id: `COT-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    date: new Date().toISOString().slice(0, 10),
    total: payload.items?.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) ?? 0,
    ...payload,
  };
  mockQuotes = [newQuote, ...mockQuotes];
  return simulateNetwork(newQuote);
  // return apiClient.post('/cotizaciones', payload); // TODO: backend
}

/**
 * Actualiza una cotización existente (líneas, notas o estado).
 *
 * Endpoint real: PUT /api/cotizaciones/:id
 *
 * @param {string} id
 * @param {object} payload
 */
export async function updateQuote(id, payload) {
  mockQuotes = mockQuotes.map((q) => (q.id === id ? { ...q, ...payload } : q));
  const updated = mockQuotes.find((q) => q.id === id);
  return simulateNetwork(updated);
  // return apiClient.put(`/cotizaciones/${id}`, payload); // TODO: backend
}

/**
 * Archiva una cotización.
 *
 * Endpoint real: PATCH /api/cotizaciones/:id/archivar
 *
 * @param {string} id
 */
export async function archiveQuote(id) {
  return updateQuote(id, { status: 'Archivada' });
  // return apiClient.patch(`/cotizaciones/${id}/archivar`); // TODO: backend
}
