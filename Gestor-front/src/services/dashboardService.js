/**
 * Conectado al backend real (Gestor).
 *
 * Huecos conocidos (no se inventan datos, se degrada con gracia):
 *   - El backend no calcula variación vs. el período anterior (el mock tenía
 *     cosas como "+12% vs mes anterior"). Esa comparación no existe hoy en
 *     el backend, así que `change` queda vacío en vez de mostrar un número
 *     inventado.
 *   - El KPI de ingresos usa el mes actual real (antes el mock decía
 *     siempre "Ingresos Mayo", fijo). Ver también KPI_ICONS en Dashboard.jsx,
 *     que usa el id 'ingresos-mes' (ya no 'ingresos-mayo') para que el ícono
 *     siga apareciendo.
 */
import { apiClient } from './apiClient';
import { STATUS_FROM_BACKEND } from './workOrdersService';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatMoney(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * KPIs principales del dashboard (las 4 tarjetas de arriba).
 * GET /api/dashboard/kpis → { proyectosActivos, cotizacionesPendientes, nuevosClientes, ingresosMes }
 */
export async function getKpis() {
  const data = await apiClient.get('/dashboard/kpis');
  const mesActual = MESES[new Date().getMonth()];

  return [
    { id: 'proyectos-activos', label: 'Proyectos Activos', value: data.proyectosActivos, change: '', color: 'sky' },
    { id: 'cotizaciones-pendientes', label: 'Cotizaciones Pendientes', value: data.cotizacionesPendientes, change: '', color: 'amber' },
    { id: 'nuevos-clientes', label: 'Nuevos Clientes', value: data.nuevosClientes, change: '', color: 'emerald' },
    { id: 'ingresos-mes', label: `Ingresos ${mesActual}`, value: formatMoney(data.ingresosMes), change: '', color: 'primary' },
  ];
}

/**
 * Serie histórica de cotizaciones por mes (gráfica de barras
 * cotizadas vs aceptadas).
 * GET /api/dashboard/cotizaciones-por-mes?meses=6 → { mes, cotizadas, aprobadas }[]
 *
 * @param {number} [months] cuántos meses hacia atrás mostrar (default 6)
 */
export async function getChartData(months = 6) {
  const filas = await apiClient.get('/dashboard/cotizaciones-por-mes', { params: { meses: months } });
  return filas.map((f) => ({ month: f.mes, cotizadas: f.cotizadas, aceptadas: f.aprobadas }));
}

/**
 * Proyectos/órdenes próximas a vencer (panel de alertas del dashboard).
 * GET /api/dashboard/proyectos-proximos-vencer?dias=7 → Proyecto[] (con
 * include cotizacion->solicitud->cliente, ver dashboardController.js)
 *
 * @param {number} [daysAhead] umbral de días (default 7)
 */
export async function getProjectsNearDeadline(daysAhead = 30) {
  const proyectos = await apiClient.get('/dashboard/proyectos-proximos-vencer', { params: { dias: daysAhead } });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return proyectos.map((p) => {
    const vencimiento = new Date(p.fecha_vencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((vencimiento - hoy) / 86400000);
    const cliente = p.cotizacion?.solicitud?.cliente || {};

    return {
      id: p.id_proyecto,
      client: cliente.nombre || '',
      dueDate: p.fecha_vencimiento,
      status: STATUS_FROM_BACKEND[p.estado] || p.estado,
      daysLeft,
    };
  });
}