// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { clientsData, projectHistory } from '../mocks/clients';

let mockClients = [...clientsData];

/**
 * Lista los clientes (empresas que solicitan cotizaciones).
 *
 * Endpoint real: GET /api/clientes
 * Query params sugeridos: ?search=
 */
export async function getClients(search = '') {
  const filtered = search
    ? mockClients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : mockClients;
  return simulateNetwork(filtered);
  // return apiClient.get('/clientes', { params: { search } }); // TODO: backend
}

/**
 * Obtiene el detalle de un cliente (vista de perfil con drill-in).
 *
 * Endpoint real: GET /api/clientes/:id
 */
export async function getClientById(id) {
  const client = mockClients.find((c) => c.id === id) || null;
  return simulateNetwork(client);
  // return apiClient.get(`/clientes/${id}`); // TODO: backend
}

/**
 * Historial de proyectos/órdenes de un cliente, mostrado en su perfil.
 *
 * Endpoint real: GET /api/clientes/:id/historial
 * NOTA: hoy es un mock estático compartido por todos los clientes;
 * cuando el backend exista debe filtrar por clientId.
 */
// eslint-disable-next-line no-unused-vars -- "id" no se usa todavía porque el mock no filtra por cliente (ver nota arriba)
export async function getClientProjectHistory(id) {
  return simulateNetwork(projectHistory);
  // return apiClient.get(`/clientes/${id}/historial`); // TODO: backend
}

/**
 * Crea un nuevo cliente.
 *
 * Endpoint real: POST /api/clientes
 * Body esperado: { name, rtn, contact, email, phone, address } — el modelo
 * Cliente del backend hoy solo tiene nombre/rtn/activo (ver EntityFormModal.jsx).
 */
export async function createClient(payload) {
  const newClient = {
    id: `CLI-${String(mockClients.length + 1).padStart(3, '0')}`,
    totalBilled: 0,
    activeProjects: 0,
    totalQuotes: 0,
    since: new Date().toISOString().slice(0, 10),
    ...payload,
  };
  mockClients = [...mockClients, newClient];
  return simulateNetwork(newClient);
  // return apiClient.post('/clientes', payload); // TODO: backend
}
