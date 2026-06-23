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
import { suppliersData } from '../mocks/suppliers';
import { workOrders } from '../mocks/workOrders';
import { getWorkOrders } from './workOrdersService';

let mockSuppliers = [...suppliersData];

/**
 * Lista los proveedores/talleres (a quienes se asignan las órdenes de trabajo).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/proveedores
 * Query:     ?search=  (opcional, filtra por nombre)
 * Body:      (no aplica)
 * Respuesta: Proveedor[] → { id, name, rtn, contact, email, phone, address,
 *            totalPurchased, activeOrders, since }
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} [search]
 */
export async function getSuppliers(search = '') {
  const filtered = search
    ? mockSuppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : mockSuppliers;
  return simulateNetwork(filtered);
  // return apiClient.get('/proveedores', { params: { search } }); // TODO: backend
}

/**
 * Obtiene el detalle de un proveedor/taller.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/proveedores/:id
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: Proveedor → mismo shape que en getSuppliers, un solo objeto
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 */
export async function getSupplierById(id) {
  const supplier = mockSuppliers.find((s) => s.id === id) || null;
  return simulateNetwork(supplier);
  // return apiClient.get(`/proveedores/${id}`); // TODO: backend
}

/**
 * Crea un nuevo proveedor/taller.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    POST
 * Ruta:      /api/proveedores
 * Query:     (no aplica)
 * Body:      { name, rtn, contact, email, phone, address } — el modelo
 *            Proveedor del backend hoy solo tiene nombre/rtn (ver
 *            EntityFormModal.jsx); el resto de campos son solo del front
 *            por ahora.
 * Respuesta: Proveedor → el proveedor recién creado, con su id real
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {object} payload
 */
export async function createSupplier(payload) {
  const newSupplier = {
    id: `PRV-${String(mockSuppliers.length + 1).padStart(3, '0')}`,
    totalPurchased: 0,
    activeOrders: 0,
    since: new Date().toISOString().slice(0, 10),
    ...payload,
  };
  mockSuppliers = [...mockSuppliers, newSupplier];
  return simulateNetwork(newSupplier);
  // return apiClient.post('/proveedores', payload); // TODO: backend
}

/**
 * Calificación promedio de un taller, calculada a partir de las
 * evaluaciones finales de sus órdenes completadas.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /evaluaciones/proveedor/:id_proveedor/promedio
 *            (ya existe en el backend, solo falta consumirlo desde aquí)
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: { average: number|null, count: number }
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} supplierId
 */
export async function getSupplierAverageRating(supplierId) {
  const ratings = workOrders
    .filter((o) => o.supplierId === supplierId && o.evaluation)
    .map((o) => o.evaluation.rating);
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;
  return simulateNetwork({ average, count: ratings.length });
  // return apiClient.get(`/evaluaciones/proveedor/${supplierId}/promedio`); // TODO: backend
}

/**
 * Historial de órdenes de trabajo ejecutadas por este taller (sección
 * "Historial de proyectos" en su perfil, vista "Clientes y Proveedores").
 * Se apoya en workOrdersService.getWorkOrders (que sí mantiene el estado
 * mutable de las órdenes) en vez de leer el mock crudo, para que quede
 * al día con cambios hechos desde el kanban de Órdenes de Trabajo.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/proveedores/:id/historial
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: OrdenDeTrabajo[] → ordenadas por fecha límite, más reciente primero
 * Alternativa: GET /api/ordenes-trabajo?supplierId=:id — ya existe ese
 *            filtro en workOrdersService.getWorkOrders; decidir cuál
 *            expone el backend.
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} supplierId
 */
export async function getSupplierProjectHistory(supplierId) {
  const orders = await getWorkOrders({ supplierId });
  return [...orders].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
  // return apiClient.get(`/proveedores/${supplierId}/historial`); // TODO: backend
}
