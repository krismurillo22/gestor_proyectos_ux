// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { requestsData } from '../mocks/requests';
import { getQuotesByRequestSync } from './quotesService';

let mockRequests = [...requestsData];

/**
 * Estado visible de una solicitud, derivado de sus cotizaciones (no se
 * guarda en la solicitud para que nunca quede desincronizado):
 * - 'Cotizando': todavía no se elige cuál cotización mandar al cliente.
 * - 'Enviada al cliente': ya se eligió una y se espera respuesta.
 * - 'Aprobada' / 'Rechazada': el cliente ya respondió la que se le envió.
 *
 * NOTA: hoy "cuál se manda al cliente" (sentToClient) y "descartada"
 * (discarded) son banderas que solo existen en el front. Si quieren que
 * esto sobreviva un refresh de verdad/sea consultable por otros sistemas,
 * el backend necesitaría guardar algo equivalente en Cotizacion.
 */
export function deriveRequestStatus(quotesForRequest) {
  const sent = quotesForRequest.find((q) => q.sentToClient);
  if (!sent) return 'Cotizando';
  if (sent.estado === 'pendiente') return 'Enviada al cliente';
  if (sent.estado === 'aprobada') return 'Aprobada';
  return 'Rechazada';
}

/**
 * Lista las solicitudes, con su estado derivado y el número de
 * cotizaciones que tiene cada una (para la columna "Talleres cotizando").
 *
 * Endpoint real: GET /api/solicitudes
 * Query params sugeridos: ?clientId=&status=
 */
export async function getRequests(filters = {}) {
  let filtered = mockRequests;
  if (filters.clientId) filtered = filtered.filter((r) => r.clientId === filters.clientId);

  const withStatus = filtered.map((r) => {
    const quotes = getQuotesByRequestSync(r.id);
    return { ...r, status: deriveRequestStatus(quotes), quoteCount: quotes.length };
  });

  const result = filters.status ? withStatus.filter((r) => r.status === filters.status) : withStatus;
  return simulateNetwork(result);
  // return apiClient.get('/solicitudes', { params: filters }); // TODO: backend
}

/**
 * Detalle de una solicitud (para la vista de comparación de cotizaciones).
 *
 * Endpoint real: GET /api/solicitudes/:id
 */
export async function getRequestById(id) {
  const request = mockRequests.find((r) => r.id === id) || null;
  if (!request) return simulateNetwork(null);
  const quotes = getQuotesByRequestSync(id);
  return simulateNetwork({ ...request, status: deriveRequestStatus(quotes) });
  // return apiClient.get(`/solicitudes/${id}`); // TODO: backend
}

/**
 * Crea una nueva solicitud (punto de entrada del flujo: el cliente pide
 * un trabajo, todavía sin cotizar con ningún taller).
 *
 * Endpoint real: POST /api/solicitudes
 * Body esperado: { clientId, description }
 */
export async function createRequest(payload) {
  const newRequest = {
    id: `SOL-2024-${String(Math.floor(Math.random() * 900 + 100))}`,
    date: new Date().toISOString().slice(0, 10),
    activo: true,
    ...payload,
  };
  mockRequests = [newRequest, ...mockRequests];
  return simulateNetwork(newRequest);
  // return apiClient.post('/solicitudes', payload); // TODO: backend
}
