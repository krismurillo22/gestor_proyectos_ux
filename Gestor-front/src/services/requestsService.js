/**
 * Conectado al backend real (Gestor).
 *
 * El backend responde 404 (no 200 con lista vacía) cuando no hay
 * solicitudes que listar (ver getSolicitudes/getSolicitudesByCliente en
 * solicitudesController.js). getRequests atrapa ese 404 puntual y lo trata
 * como "no hay solicitudes todavía" en vez de dejar que reviente (ver
 * status que apiClient.js adjunta al Error).
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - El backend no calcula el estado de la solicitud (Cotizando/Enviada al
 *     cliente/Aprobada/Rechazada) ni cuántas cotizaciones tiene — se sigue
 *     derivando aquí con deriveRequestStatus, a partir de sus cotizaciones
 *     reales (una llamada a getQuotesByRequest por cada solicitud listada;
 *     con pocos datos como ahora esto es rápido, pero son N+1 llamadas).
 *   - El filtro `status` de getRequests ya no se aplica en el servidor
 *     (nunca existió ahí, era una invención del mock); se sigue filtrando
 *     en el front, después de derivar el estado de cada solicitud.
 */
import { apiClient } from './apiClient';
import { getQuotesByRequest } from './quotesService';

function toDateStr(value) {
  if (!value) return null;
  const s = typeof value === 'string' ? value : value.toISOString();
  return s.slice(0, 10);
}

function adaptSolicitud(s) {
  return {
    id: s.id_solicitud,
    clientId: s.id_cliente,
    client: s.cliente?.nombre || '',
    description: s.descripcion || '',
    date: toDateStr(s.fecha),
    activo: s.activo,
  };
}

/**
 * Estado visible de una solicitud, derivado de sus cotizaciones (no se
 * guarda en la solicitud, así nunca queda desincronizado):
 *   - 'Cotizando': todavía no se elige cuál cotización mandar al cliente.
 *   - 'Enviada al cliente': ya se eligió una y se espera respuesta.
 *   - 'Aprobada' / 'Rechazada': el cliente ya respondió la que se le envió.
 *
 * Helper puro (no hace ninguna llamada) — no tiene endpoint propio.
 *
 * @param {object[]} quotesForRequest  cotizaciones ya adaptadas (ver quotesService.adaptQuote)
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
 * cotizaciones que tiene cada una (columna "Talleres cotizando").
 *
 * GET /api/solicitudes
 * GET /api/solicitudes/cliente/:id_cliente  (si se pasa filters.clientId)
 *
 * @param {{ clientId?: string|number, status?: string }} [filters]
 */
export async function getRequests(filters = {}) {
  let solicitudes;
  try {
    solicitudes = filters.clientId
      ? await apiClient.get(`/solicitudes/cliente/${filters.clientId}`)
      : await apiClient.get('/solicitudes');
  } catch (error) {
    if (error.status === 404) solicitudes = [];
    else throw error;
  }

  const withStatus = await Promise.all(
    solicitudes.map(async (s) => {
      const request = adaptSolicitud(s);
      const quotes = await getQuotesByRequest(request.id);
      return { ...request, status: deriveRequestStatus(quotes), quoteCount: quotes.length };
    })
  );

  return filters.status ? withStatus.filter((r) => r.status === filters.status) : withStatus;
}

/**
 * Detalle de una solicitud (vista de comparación de cotizaciones).
 *
 * GET /api/solicitudes/:id
 *
 * @param {string|number} id
 */
export async function getRequestById(id) {
  try {
    const solicitud = await apiClient.get(`/solicitudes/${id}`);
    const request = adaptSolicitud(solicitud);
    const quotes = await getQuotesByRequest(id);
    return { ...request, status: deriveRequestStatus(quotes) };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Crea una nueva solicitud (punto de entrada del flujo: el cliente pide un
 * trabajo, todavía sin cotizar con ningún taller).
 *
 * POST /api/solicitudes  body: { id_cliente, descripcion, fecha }
 *
 * @param {{ clientId: string|number, description: string }} payload
 */
export async function createRequest(payload) {
  const { data } = await apiClient.post('/solicitudes', {
    id_cliente: payload.clientId,
    descripcion: payload.description,
    fecha: toDateStr(new Date()),
  });
  return adaptSolicitud(data);
}
