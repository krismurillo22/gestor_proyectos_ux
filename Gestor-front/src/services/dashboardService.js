// eslint-disable-next-line no-unused-vars -- queda listo para cuando se conecte el backend real (ver llamadas comentadas abajo)
import { apiClient } from './apiClient';
import { simulateNetwork } from './mockUtils';
import { kpiData, chartData, projectsNearDeadline } from '../mocks/dashboard';

/**
 * KPIs principales del dashboard (tarjetas superiores).
 *
 * Endpoint real: GET /api/dashboard/kpis
 * Respuesta esperada: { proyectosActivos, cotizacionesPendientes, nuevosClientes, ingresosMesActual, ...cambiosPorcentuales }
 */
export async function getKpis() {
  return simulateNetwork(kpiData);
  // return apiClient.get('/dashboard/kpis'); // TODO: backend
}

/**
 * Serie histórica de cotizaciones por mes (gráfica de barras
 * cotizadas vs aceptadas).
 *
 * Endpoint real: GET /api/dashboard/cotizaciones-por-mes
 * Query params sugeridos: ?meses=6
 */
export async function getChartData(months = 6) {
  return simulateNetwork(chartData.slice(-months));
  // return apiClient.get('/dashboard/cotizaciones-por-mes', { params: { meses: months } }); // TODO: backend
}

/**
 * Proyectos/órdenes próximas a vencer (panel de alertas del dashboard).
 *
 * Endpoint real: GET /api/dashboard/proyectos-proximos-vencer
 * Query params sugeridos: ?dias=7
 */
export async function getProjectsNearDeadline(daysAhead = 7) {
  const filtered = projectsNearDeadline.filter((p) => p.daysLeft <= daysAhead);
  return simulateNetwork(filtered);
  // return apiClient.get('/dashboard/proyectos-proximos-vencer', { params: { dias: daysAhead } }); // TODO: backend
}
