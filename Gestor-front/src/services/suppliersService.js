// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { suppliersData } from '../mocks/suppliers';

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
 * Body esperado: { name, contact, email, phone, address }
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
