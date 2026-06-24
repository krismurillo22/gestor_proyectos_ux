/**
 * Conectado al backend real (Gestor).
 *
 * cotizacionesController.js usa un sobre de respuesta distinto al resto del
 * backend: { ok: true/false, cotizacion(es)/msg } en vez de { error } /
 * { message, data }. Todas las funciones de aquí abajo desempacan ese sobre
 * antes de devolver nada al resto del front, para que ningún componente
 * tenga que saber de esa diferencia.
 *
 * El backend ahora incluye proveedor y solicitud->cliente en
 * listarCotizaciones/obtenerCotizacionPorId/crearCotizacion/
 * modificarCotizacion/aprobarCotizacion/rechazarCotizacion/enviarACliente
 * (ver COTIZACION_INCLUDES en cotizacionesController.js), para que
 * adaptQuote pueda leer taller y cliente sin pedirlos aparte.
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - El modelo Cotizacion no guarda subtotal/tarifa de intermediación/ISV
 *     como columnas propias, solo el `total` ya calculado. Por eso
 *     adaptQuote no manda subtotal/tax/intermediationFee — se deja que
 *     quoteDocx.js use el fallback que ya tenía para esto (recalcula el
 *     ISV al vuelo a partir de `total`, ver buildQuoteDocument). El total
 *     sí es el real, eso no se pierde.
 *   - `sentToClient`/`discarded` (enviada_cliente/descartada) ya existen
 *     como columnas en el modelo, pero la migración que las agregó
 *     (tarea #58) hay que correrla en cada base nueva con
 *     `npx sequelize-cli db:migrate` antes de que sendQuoteToClient/
 *     discardQuote/restoreQuote funcionen.
 */
import { apiClient } from './apiClient';

function toDateStr(value) {
  if (!value) return null;
  const s = typeof value === 'string' ? value : value.toISOString();
  return s.slice(0, 10);
}

function adaptQuote(c) {
  const cliente = c.solicitud?.cliente || {};
  return {
    id: c.id_cotizacion,
    requestId: c.id_solicitud,
    supplierId: c.id_proveedor,
    supplier: c.proveedor?.nombre || '',
    client: cliente.nombre || '',
    clientId: cliente.id_cliente ?? c.solicitud?.id_cliente ?? '',
    date: toDateStr(c.createdAt),
    total: Number(c.total) || 0,
    estado: c.estado,
    sentToClient: Boolean(c.enviada_cliente),
    discarded: Boolean(c.descartada),
    intermediationFee: {
      value: Number(c.tarifa_intermediacion || 0),
      percent: Number(c.tarifa_porcentaje || 0),
    },
    notes: c.descripcion || '',
    items: (c.detalles || []).map((d) => ({
      title: d.nombre,
      description: d.descripcion || '',
      quantity: d.cantidad,
      unitPrice: Number(d.valor) || 0,
    })),
  };
}

function buildDetalles(items = []) {
  return items.map((it) => ({
    nombre: it.title,
    descripcion: it.description,
    cantidad: it.quantity,
    valor: it.unitPrice,
  }));
}

/**
 * Etiqueta de estado a mostrar para una cotización individual (la usa
 * <StatusBadge type="quote" />): combina `estado` con las banderas
 * sentToClient/discarded, que `estado` por sí solo no refleja.
 *
 * Helper puro (no hace ninguna llamada) — no tiene endpoint propio.
 */
export function getQuoteDisplayStatus(quote) {
  if (quote.discarded) return 'Descartada';
  if (!quote.sentToClient) return 'Pendiente';
  if (quote.estado === 'pendiente') return 'Enviada al cliente';
  if (quote.estado === 'aprobada') return 'Aprobada';
  return 'Rechazada';
}

/**
 * Lista las cotizaciones (vista global de todas las solicitudes).
 *
 * GET /api/cotizaciones?estado=&id_solicitud=&id_proveedor=
 *
 * @param {{ estado?: string, requestId?: string|number, supplierId?: string|number }} [filters]
 */
export async function getQuotes(filters = {}) {
  const { ok, cotizaciones } = await apiClient.get('/cotizaciones', {
    params: { estado: filters.estado, id_solicitud: filters.requestId, id_proveedor: filters.supplierId },
  });
  return ok ? cotizaciones.map(adaptQuote) : [];
}

/**
 * Cotizaciones de una sola solicitud (vista de comparación).
 *
 * GET /api/solicitudes/:id/cotizaciones — responde 404 con { error } si la
 * solicitud todavía no tiene ninguna; se trata como lista vacía, no como
 * falla (ver status que apiClient.js adjunta al Error).
 *
 * @param {string|number} requestId
 */
export async function getQuotesByRequest(requestId) {
  try {
    const cotizaciones = await apiClient.get(`/solicitudes/${requestId}/cotizaciones`);
    return cotizaciones.map(adaptQuote);
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

/**
 * Detalle de una cotización por id.
 *
 * GET /api/cotizaciones/:id
 *
 * @param {string|number} id
 */
export async function getQuoteById(id) {
  try {
    const { cotizacion } = await apiClient.get(`/cotizaciones/${id}`);
    return adaptQuote(cotizacion);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Registra la cotización de un proveedor para una solicitud existente.
 *
 * POST /api/cotizaciones  body: { id_solicitud, id_proveedor, total, estado, descripcion, detalles }
 *
 * @param {{ requestId: string|number, supplierId: string|number, items: object[], notes?: string, total: number }} payload
 */
export async function createQuote(payload) {
  const { cotizacion } = await apiClient.post('/cotizaciones', {
    id_solicitud: payload.requestId,
    id_proveedor: payload.supplierId,
    total: payload.total,
    estado: 'pendiente',
    descripcion: payload.notes,
    tarifa_intermediacion: payload.intermediationFee?.value ?? 0,
    tarifa_porcentaje: payload.intermediationFee?.percent ?? 0,
    detalles: buildDetalles(payload.items),
  });
  return adaptQuote(cotizacion);
}

/**
 * Actualiza una cotización existente (líneas, notas, total, o solo la
 * bandera `descartada` al descartar/restaurar desde la comparación).
 *
 * PUT /api/cotizaciones/:id  body: subconjunto de { id_solicitud, id_proveedor, total, estado, descripcion, detalles, descartada }
 *
 * @param {string|number} id
 * @param {object} payload
 */
export async function updateQuote(id, payload) {
  const body = {};
  if (payload.requestId !== undefined) body.id_solicitud = payload.requestId;
  if (payload.supplierId !== undefined) body.id_proveedor = payload.supplierId;
  if (payload.total !== undefined) body.total = payload.total;
  if (payload.estado !== undefined) body.estado = payload.estado;
  if (payload.notes !== undefined) body.descripcion = payload.notes;
  if (payload.discarded !== undefined) body.descartada = payload.discarded;
  if (payload.sentToClient !== undefined) body.enviada_cliente = payload.sentToClient;
  if (payload.items !== undefined) body.detalles = buildDetalles(payload.items);

  const { cotizacion } = await apiClient.put(`/cotizaciones/${id}`, body);
  return adaptQuote(cotizacion);
}

/**
 * Marca esta cotización como "la elegida" para mandar al cliente (el
 * backend desmarca cualquier otra de la misma solicitud).
 *
 * PATCH /api/cotizaciones/:id/enviar-a-cliente
 *
 * @param {string|number} id
 */
export async function sendQuoteToClient(id) {
  const { cotizacion } = await apiClient.patch(`/cotizaciones/${id}/enviar-a-cliente`);
  return adaptQuote(cotizacion);
}

/**
 * El cliente acepta la cotización que se le mandó.
 *
 * PUT /api/cotizaciones/:id/aprobar
 *
 * @param {string|number} id
 */
export async function approveQuote(id) {
  const { cotizacion } = await apiClient.put(`/cotizaciones/${id}/aprobar`);
  return adaptQuote(cotizacion);
}

/**
 * El cliente rechaza la cotización que se le mandó.
 *
 * PUT /api/cotizaciones/:id/rechazar
 *
 * @param {string|number} id
 */
export async function rejectQuote(id) {
  const { cotizacion } = await apiClient.put(`/cotizaciones/${id}/rechazar`);
  return adaptQuote(cotizacion);
}

/**
 * Descarta manualmente la cotización de un proveedor en la vista de
 * comparación. Reusa el PUT genérico de updateQuote, solo cambia la
 * bandera `descartada`.
 *
 * @param {string|number} id
 */
export async function discardQuote(id) {
  return updateQuote(id, { discarded: true });
}

/**
 * Revierte el descarte de una cotización.
 *
 * @param {string|number} id
 */
export async function restoreQuote(id) {
  return updateQuote(id, { discarded: false });
}