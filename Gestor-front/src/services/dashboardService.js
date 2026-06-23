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
import { kpiData, chartData, projectsNearDeadline } from '../mocks/dashboard';

/**
 * KPIs principales del dashboard (las 4 tarjetas de arriba).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/dashboard/kpis
 * Query:     (no aplica)
 * Body:      (no aplica — GET no lleva body)
 * Respuesta: Kpi[] → cada tarjeta como
 *            { id, label, value, change, color }
 *            (4 tarjetas: proyectos activos, cotizaciones pendientes,
 *            nuevos clientes, ingresos del mes)
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 */
export async function getKpis() {
  return simulateNetwork(kpiData);
  // return apiClient.get('/dashboard/kpis'); // TODO: backend
}

/**
 * Serie histórica de cotizaciones por mes (gráfica de barras
 * cotizadas vs aceptadas).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/dashboard/cotizaciones-por-mes
 * Query:     ?meses=6  (opcional, cuántos meses hacia atrás devolver)
 * Body:      (no aplica)
 * Respuesta: { month, cotizadas, aceptadas }[]
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {number} [months] cuántos meses hacia atrás mostrar (default 6)
 */
export async function getChartData(months = 6) {
  return simulateNetwork(chartData.slice(-months));
  // return apiClient.get('/dashboard/cotizaciones-por-mes', { params: { meses: months } }); // TODO: backend
}

/**
 * Proyectos/órdenes próximas a vencer (panel de alertas del dashboard).
 *
 * ENDPOINT REAL
 * -------------
 * Método:    GET
 * Ruta:      /api/dashboard/proyectos-proximos-vencer
 * Query:     ?dias=7  (opcional, umbral de días para considerar "próximo a vencer")
 * Body:      (no aplica)
 * Respuesta: { id, client, dueDate, status, daysLeft }[]
 *
 * Cómo conectarlo: ver GUIA_CONEXION_BACKEND.md
 *
 * @param {number} [daysAhead] umbral de días (default 7)
 */
export async function getProjectsNearDeadline(daysAhead = 7) {
  const filtered = projectsNearDeadline.filter((p) => p.daysLeft <= daysAhead);
  return simulateNetwork(filtered);
  // return apiClient.get('/dashboard/proyectos-proximos-vencer', { params: { dias: daysAhead } }); // TODO: backend
}
