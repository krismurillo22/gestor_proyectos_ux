/**
 * Conectado al backend real (Gestor).
 *
 * El backend responde 404 (no 200 con lista vacía) cuando no hay clientes
 * que listar o cuando una búsqueda no encuentra nada (ver getClientes/
 * getClienteByNombre en clientesController.js) — se trata como lista
 * vacía, no como falla (ver status que apiClient.js adjunta al Error).
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - contacto/correo/telefono/dirección se guardan como columnas directas
 *     en Cliente (migración 20260623232200). La tabla TelefonoCliente sigue
 *     existiendo pero no se usa al crear/editar — se deja como fallback por
 *     si tiene datos legados.
 *   - totalBilled/activeProjects se calculan a partir de
 *     getWorkOrders({ clientId }) (proyectos reales de este cliente, ya
 *     trae taller/total incluidos) en vez de /clientes/:id/historial,
 *     porque ese endpoint no incluye el nombre del proveedor y el historial
 *     de la UI sí lo muestra (columna "Taller"). totalQuotes sí necesita
 *     /solicitudes/cliente/:id, porque cuenta TODAS las cotizaciones
 *     recibidas, no solo las que llegaron a convertirse en proyecto.
 */
import { apiClient } from './apiClient';
import { getWorkOrders } from './workOrdersService';

function toDateStr(value) {
  if (!value) return null;
  const s = typeof value === 'string' ? value : value.toISOString();
  return s.slice(0, 10);
}

function adaptCliente(c) {
  return {
    id: c.id_cliente,
    name: c.nombre,
    rtn: c.rtn || '',
    contact: c.contacto || '',
    email: c.correo || '',
    phone: c.telefono || (c.telefonos || [])[0]?.telefono || '',
    address: c.direccion || '',
    totalBilled: 0,
    activeProjects: 0,
    totalQuotes: 0,
    since: toDateStr(c.createdAt),
  };
}

/**
 * Lista los clientes (empresas que solicitan cotizaciones).
 *
 * GET /api/clientes
 * GET /api/clientes/buscar?nombre=  (si se pasa search)
 *
 * @param {string} [search]
 */
export async function getClients(search = '') {
  try {
    const clientes = search
      ? await apiClient.get('/clientes/buscar', { params: { nombre: search } })
      : await apiClient.get('/clientes');
    return clientes.map(adaptCliente);
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

/**
 * Detalle de un cliente (vista de perfil). A diferencia de getClients, aquí
 * sí se calculan totalBilled/activeProjects/totalQuotes reales (ver nota de
 * huecos conocidos arriba).
 *
 * GET /api/clientes/:id
 *
 * @param {string|number} id
 */
export async function getClientById(id) {
  let cliente;
  try {
    cliente = await apiClient.get(`/clientes/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }

  const base = adaptCliente(cliente);

  const [orders, solicitudes] = await Promise.all([
    getWorkOrders({ clientId: id }),
    apiClient.get(`/solicitudes/cliente/${id}`).catch((error) => {
      if (error.status === 404) return [];
      throw error;
    }),
  ]);

  base.activeProjects = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En Progreso').length;
  base.totalBilled = orders
    .filter((o) => o.status === 'Completada')
    .reduce((sum, o) => sum + (o.quoteTotal || 0), 0);
  base.totalQuotes = solicitudes.reduce((sum, s) => sum + (s.cotizaciones?.length || 0), 0);

  return base;
}

/**
 * Historial de proyectos de este cliente, mostrado en su perfil
 * ("Historial de proyectos", con columna Taller). Se apoya en
 * workOrdersService.getWorkOrders (ya hace el filtro id_cliente en el
 * backend y trae proveedor/cliente/evaluación incluidos) en vez de
 * /clientes/:id/historial, que no incluye el nombre del proveedor.
 *
 * GET /api/proyectos?id_cliente=:id
 *
 * @param {string|number} clientId
 */
export async function getClientProjectHistory(clientId) {
  const orders = await getWorkOrders({ clientId });
  return orders
    .map((o) => ({ ...o, total: o.quoteTotal }))
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
}

/**
 * Crea un nuevo cliente.
 *
 * POST /api/clientes  body: { nombre, rtn, contacto, correo, telefono, direccion }
 *
 * @param {{ name: string, rtn: string, contact?: string, email?: string, phone?: string, address?: string }} payload
 */
export async function createClient(payload) {
  const { data } = await apiClient.post('/clientes', {
    nombre: payload.name,
    rtn: payload.rtn,
    contacto: payload.contact,
    correo: payload.email,
    telefono: payload.phone,
    direccion: payload.address,
  });
  return adaptCliente(data);
}
