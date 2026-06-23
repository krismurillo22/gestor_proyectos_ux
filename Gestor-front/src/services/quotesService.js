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
 *
 * Es un helper puro (no llama a nada, ni mock ni real) — no tiene endpoint
 * propio, no hay nada que conectar aquí.
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
 *
 * No tiene endpoint propio: cuando se conecte el backend, esta función
 * sigue siendo síncrona y sigue leyendo del arreglo en memoria `mockQuotes`
 * (no se vuelve una llamada HTTP). Si requestsService necesitara datos
 * frescos del backend en algún punto, eso se resolvería ahí, no aquí.
 */
export function getQuotesByRequestSync(requestId) {
  return mockQuotes.filter((q) => q.requestId === requestId);
}

/**
 * Lista las cotizaciones (vista global, todas las solicitudes).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/cotizaciones
 * Query:     ?estado=  (opcional: pendiente|aprobada|rechazada)
 *            &requestId=  (opcional) &supplierId=  (opcional)
 *            &page=  &pageSize=  (paginación, opcional)
 * Body:      (no aplica)
 * Respuesta: { data: Cotizacion[], total: number }
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
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
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/solicitudes/:id/cotizaciones
 *            (alternativa: GET /api/cotizaciones?requestId=:id — decidir
 *            cuál de las dos expone el backend)
 * Query:     (no aplica si se usa la ruta de arriba)
 * Body:      (no aplica)
 * Respuesta: Cotizacion[]
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} requestId
 */
export async function getQuotesByRequest(requestId) {
  return simulateNetwork(getQuotesByRequestSync(requestId).map(withClient));
  // return apiClient.get(`/solicitudes/${requestId}/cotizaciones`); // TODO: backend
}

/**
 * Obtiene el detalle de una cotización por id.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/cotizaciones/:id
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: Cotizacion → ver el shape completo documentado en createQuote más abajo
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
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
 * ENDPOINT REAL
 * -------------
 * Método:    POST
 * Ruta:      /api/cotizaciones
 * Query:     (no aplica)
 * Body:      {
 *              id_solicitud, id_proveedor,
 *              items: [{ titulo, descripcion, cantidad, precio_unitario }],
 *              notas,
 *              tarifa_intermediacion: { valor, porcentaje },
 *              subtotal, isv, total
 *            }
 * Respuesta: Cotizacion → la cotización recién creada, con su id real
 *
 * NOTA: subtotal/isv/total los calcula hoy el front (ver AddQuoteModal.jsx)
 * y se mandan ya calculados — pendiente decidir si el backend los recalcula
 * y valida o confía en lo que manda el front (ver "Pendiente de decidir"
 * en ENDPOINTS_CHECKLIST.md).
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {{ requestId: string, supplierId: string, supplier: string, items: object[], notes?: string, intermediationFee?: { value: number, percent: number }, subtotal?: number, tax?: number }} payload
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
 * ENDPOINT REAL
 * -------------
 * Método:    PUT
 * Ruta:      /api/cotizaciones/:id
 * Query:     (no aplica)
 * Body:      mismo shape que el POST de createQuote, con los campos a cambiar
 * Respuesta: Cotizacion → ya actualizada
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
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
 * NOTA: `sentToClient`/`discarded` son banderas solo de front (ver
 * mocks/quotes.js). Hoy no existen en el modelo Cotizacion del backend —
 * habría que agregar algo equivalente cuando se conecte de verdad.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    PATCH
 * Ruta:      /api/cotizaciones/:id/enviar-a-cliente
 * Query:     (no aplica)
 * Body:      (no aplica, la acción la indica la ruta)
 * Respuesta: Cotizacion → ya marcada como enviada
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
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
  // return apiClient.patch(`/cotizaciones/${id}/enviar-a-cliente`); // TODO: backend
}

/**
 * El cliente acepta la cotización que se le mandó.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    PUT
 * Ruta:      /api/cotizaciones/:id/aprobar
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: Cotizacion → con estado 'aprobada'
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 */
export async function approveQuote(id) {
  return updateQuote(id, { estado: 'aprobada' });
  // return apiClient.put(`/cotizaciones/${id}/aprobar`); // TODO: backend
}

/**
 * El cliente rechaza la cotización que se le mandó.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    PUT
 * Ruta:      /api/cotizaciones/:id/rechazar
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: Cotizacion → con estado 'rechazada'
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 */
export async function rejectQuote(id) {
  return updateQuote(id, { estado: 'rechazada' });
  // return apiClient.put(`/cotizaciones/${id}/rechazar`); // TODO: backend
}

/**
 * Descarta manualmente la cotización de un taller (p. ej. perdió la
 * comparación contra otro). Solo aplica mientras no se haya mandado al cliente.
 *
 * No necesita su propio endpoint: reusa el PUT genérico de updateQuote
 * (arriba) solo para cambiar la bandera `discarded`. No hay nada que
 * conectar aparte de lo que ya se conecta en updateQuote.
 */
export async function discardQuote(id) {
  return updateQuote(id, { discarded: true });
}

/**
 * Revierte el descarte de una cotización, para volverla a considerar.
 *
 * Igual que discardQuote, reusa updateQuote — no tiene endpoint propio.
 */
export async function restoreQuote(id) {
  return updateQuote(id, { discarded: false });
}
