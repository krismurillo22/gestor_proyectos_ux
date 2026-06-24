/**
 * Conectado al backend real (Gestor).
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - contacto/correo/telefono/dirección se guardan como columnas directas
 *     en Proveedor (migración 20260623232200). La tabla TelefonoProveedor
 *     sigue existiendo (con sus endpoints propios) pero no se usa al crear/
 *     editar — se deja como fallback por si tiene datos legados.
 *   - No hay endpoint de búsqueda para proveedores (sí existe /clientes/
 *     buscar, pero no su equivalente de proveedores) — getSuppliers filtra
 *     en el front sobre la lista completa.
 *   - totalPurchased/activeOrders se calculan a partir de
 *     getWorkOrders({ supplierId }) (proyectos reales de este taller), no
 *     de /proveedores/:id/estadisticas — así client y supplier usan la
 *     misma fuente de verdad (proyectos completados = facturado).
 */
import { apiClient } from './apiClient';
import { getWorkOrders } from './workOrdersService';

function toDateStr(value) {
  if (!value) return null;
  const s = typeof value === 'string' ? value : value.toISOString();
  return s.slice(0, 10);
}

function adaptProveedor(p) {
  return {
    id: p.id_proveedor,
    name: p.nombre,
    rtn: p.rtn || '',
    contact: p.contacto || '',
    email: p.correo || '',
    phone: p.telefono || (p.telefonos || [])[0]?.telefono || '',
    address: p.direccion || '',
    totalPurchased: 0,
    activeOrders: 0,
    since: toDateStr(p.createdAt),
  };
}

// La vista previa de Clients.jsx (tarjetas de la lista de proveedores)
// muestra activeOrders/totalPurchased, que adaptProveedor deja en 0. En vez
// de pedir el detalle de cada proveedor (N+1 contra /proveedores/:id), se
// trae UNA sola vez todas las órdenes de trabajo y se agrupan por
// supplierId.
function withOrderStats(proveedoresAdaptados, orders) {
  return proveedoresAdaptados.map((proveedor) => {
    const propias = orders.filter((o) => o.supplierId === proveedor.id);
    return {
      ...proveedor,
      activeOrders: propias.filter((o) => o.status === 'Pendiente' || o.status === 'En Progreso').length,
      totalPurchased: propias
        .filter((o) => o.status === 'Completada')
        .reduce((sum, o) => sum + (o.quoteTotal || 0), 0),
    };
  });
}

/**
 * Lista los proveedores/talleres (a quienes se asignan las órdenes de trabajo).
 *
 * GET /api/proveedores
 *
 * El backend responde 204 sin cuerpo (no 200 con lista vacía) cuando no hay
 * proveedores registrados — apiClient.js resuelve un 204 como `null` (no lo
 * trata como error), así que hay que cubrir ese caso a mano o `null.map()`
 * revienta y deja la página de Clientes y Proveedores en "Cargando…" para
 * siempre (el Promise.all de Clients.jsx nunca llega a su .then).
 *
 * No existe un endpoint de búsqueda server-side para proveedores (a
 * diferencia de clientes, que sí tiene /clientes/buscar) — el filtro por
 * nombre se aplica aquí, sobre la lista completa.
 *
 * @param {string} [search]
 */
export async function getSuppliers(search = '') {
  const proveedores = await apiClient.get('/proveedores');
  const adapted = (proveedores || []).map(adaptProveedor);
  const filtered = search ? adapted.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) : adapted;
  // includeArchived: true — una orden archivada sigue siendo un proyecto
  // completado real, así que debe seguir contando en totalPurchased/
  // activeOrders. Archivar solo oculta del kanban (a pedido de Jorge,
  // 2026-06-24).
  const orders = await getWorkOrders({ includeArchived: true });
  return withOrderStats(filtered, orders);
}

/**
 * Detalle de un proveedor (vista de perfil). A diferencia de getSuppliers,
 * aquí sí se calculan totalPurchased/activeOrders reales, a partir de sus
 * proyectos (ver nota de huecos conocidos arriba).
 *
 * GET /api/proveedores/:id
 *
 * @param {string|number} id
 */
export async function getSupplierById(id) {
  let proveedor;
  try {
    proveedor = await apiClient.get(`/proveedores/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }

  const base = adaptProveedor(proveedor);
  const orders = await getWorkOrders({ supplierId: id, includeArchived: true });
  base.activeOrders = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En Progreso').length;
  base.totalPurchased = orders
    .filter((o) => o.status === 'Completada')
    .reduce((sum, o) => sum + (o.quoteTotal || 0), 0);

  return base;
}

/**
 * Crea un nuevo proveedor/taller.
 *
 * POST /api/proveedores  body: { nombre, rtn, contacto, correo, telefono, direccion }
 *
 * @param {{ name: string, rtn: string, contact?: string, email?: string, phone?: string, address?: string }} payload
 */
export async function updateSupplier(id, payload) {
  const { data } = await apiClient.put(`/proveedores/${id}`, {
    nombre: payload.name,
    rtn: payload.rtn,
    contacto: payload.contact,
    correo: payload.email,
    telefono: payload.phone,
    direccion: payload.address,
  });
  return adaptProveedor(data);
}

export async function createSupplier(payload) {
  const { data } = await apiClient.post('/proveedores', {
    nombre: payload.name,
    rtn: payload.rtn,
    contacto: payload.contact,
    correo: payload.email,
    telefono: payload.phone,
    direccion: payload.address,
  });
  return adaptProveedor(data);
}

/**
 * Calificación promedio de un taller, calculada por el backend a partir de
 * las evaluaciones finales de sus órdenes completadas.
 *
 * GET /evaluaciones/proveedor/:id_proveedor/promedio →
 * { id_proveedor, proveedor, rating_promedio, total_evaluaciones }
 *
 * Se traduce a { average, count } porque eso es lo que espera
 * <SupplierRating> en Clients.jsx. rating_promedio llega en 0 cuando no hay
 * evaluaciones (no null) — se traduce a `average: null` para que siga
 * mostrando "Sin evaluaciones todavía" en vez de "0.0 (0) estrellas".
 *
 * @param {string|number} supplierId
 */
export async function getSupplierAverageRating(supplierId) {
  try {
    const data = await apiClient.get(`/evaluaciones/proveedor/${supplierId}/promedio`);
    return { average: data.total_evaluaciones > 0 ? data.rating_promedio : null, count: data.total_evaluaciones || 0 };
  } catch (error) {
    if (error.status === 404) return { average: null, count: 0 };
    throw error;
  }
}

/**
 * Historial de órdenes de trabajo ejecutadas por este taller (sección
 * "Historial de proyectos" en su perfil, vista "Clientes y Proveedores").
 * Se apoya en workOrdersService.getWorkOrders (que ya hace el filtro
 * id_proveedor en el backend y trae cliente/proveedor/evaluación incluidos).
 *
 * GET /api/proyectos?id_proveedor=:id
 *
 * @param {string|number} supplierId
 */
export async function getSupplierProjectHistory(supplierId) {
  const orders = await getWorkOrders({ supplierId, includeArchived: true });
  return [...orders].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
}