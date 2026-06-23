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
import { clientsData } from '../mocks/clients';
import { quotesData } from '../mocks/quotes';
import { getWorkOrders } from './workOrdersService';

let mockClients = [...clientsData];

/**
 * Lista los clientes (empresas que solicitan cotizaciones).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/clientes
 * Query:     ?search=  (opcional, filtra por nombre)
 * Body:      (no aplica)
 * Respuesta: Cliente[] → { id, name, rtn, contact, email, phone, address,
 *            totalBilled, activeProjects, totalQuotes, since }
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} [search]
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
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/clientes/:id
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: Cliente → mismo shape que en getClients, un solo objeto
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} id
 */
export async function getClientById(id) {
  const client = mockClients.find((c) => c.id === id) || null;
  return simulateNetwork(client);
  // return apiClient.get(`/clientes/${id}`); // TODO: backend
}

/**
 * Historial de órdenes de trabajo (proyectos) de este cliente, mostrado en
 * su perfil ("Historial de proyectos"). Se apoya en workOrdersService
 * (mantiene el estado mutable real de las órdenes, igual que
 * getSupplierProjectHistory en suppliersService) y filtra por nombre de
 * cliente: la Orden de Trabajo todavía no guarda un clientId propio, solo
 * el nombre del cliente heredado de la cotización al crearla (ver
 * workOrdersService.createWorkOrder), así que no se puede filtrar por id
 * todavía. El total de cada proyecto se toma de su cotización asociada
 * (quoteId), porque la orden en sí no tiene precio.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/clientes/:id/historial
 * Query:     (no aplica)
 * Body:      (no aplica)
 * Respuesta: OrdenDeTrabajo[] → cada orden con su `total` (de la cotización
 *            asociada) ya incluido, para no tener que pedirlo aparte
 * Alternativa: GET /api/ordenes-trabajo?clientId=:id, una vez que el
 *            backend agregue ese campo a la Orden de Trabajo — decidir
 *            cuál de las dos expone el backend.
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {string} clientId
 */
export async function getClientProjectHistory(clientId) {
  const client = mockClients.find((c) => c.id === clientId);
  if (!client) return simulateNetwork([]);

  const orders = await getWorkOrders();
  const ownOrders = orders
    .filter((o) => o.client === client.name)
    .map((o) => ({ ...o, total: quotesData.find((q) => q.id === o.quoteId)?.total ?? null }));

  return ownOrders.sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));
  // return apiClient.get(`/clientes/${clientId}/historial`); // TODO: backend
}

/**
 * Crea un nuevo cliente.
 *
 * ENDPOINT REAL
 * -------------
 * Método:    POST
 * Ruta:      /api/clientes
 * Query:     (no aplica)
 * Body:      { name, rtn, contact, email, phone, address } — el modelo
 *            Cliente del backend hoy solo tiene nombre/rtn/activo (ver
 *            EntityFormModal.jsx); el resto de campos son solo del front
 *            por ahora.
 * Respuesta: Cliente → el cliente recién creado, con su id real
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {object} payload
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
