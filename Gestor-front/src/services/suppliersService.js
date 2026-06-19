// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { suppliersData } from '../mocks/suppliers';
import { workOrders } from '../mocks/workOrders';

let mockSuppliers = [...suppliersData];

/**
 * Lista los proveedores/talleres (a quienes se asignan las órdenes de trabajo).
 *
 * Endpoint real: GET /api/proveedores
 * Query params sugeridos: ?search=
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
 * Endpoint real: GET /api/proveedores/:id
 */
export async function getSupplierById(id) {
  const supplier = mockSuppliers.find((s) => s.id === id) || null;
  return simulateNetwork(supplier);
  // return apiClient.get(`/proveedores/${id}`); // TODO: backend
}

/**
 * Crea un nuevo proveedor/taller.
 *
 * Endpoint real: POST /api/proveedores
 * Body esperado: { name, rtn, contact, email, phone, address } — el modelo
 * Proveedor del backend hoy solo tiene nombre/rtn (ver EntityFormModal.jsx).
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
 * Endpoint real: GET /evaluaciones/proveedor/:id_proveedor/promedio
 * (ya existe en el backend, solo falta consumirlo desde aquí)
 */
export async function getSupplierAverageRating(supplierId) {
  const ratings = workOrders
    .filter((o) => o.supplierId === supplierId && o.evaluation)
    .map((o) => o.evaluation.rating);
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : null;
  return simulateNetwork({ average, count: ratings.length });
  // return apiClient.get(`/evaluaciones/proveedor/${supplierId}/promedio`); // TODO: backend
}
