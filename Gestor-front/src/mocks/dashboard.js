/**
 * Datos mock para el Dashboard. Reemplazar por:
 * - GET /api/dashboard/kpis
 * - GET /api/dashboard/cotizaciones-por-mes
 * - GET /api/dashboard/proyectos-proximos-vencer
 * (ver src/services/dashboardService.js)
 */

export const kpiData = [
  { id: 'proyectos-activos', label: 'Proyectos Activos', value: 24, change: '+12% vs mes anterior', color: 'sky' },
  { id: 'cotizaciones-pendientes', label: 'Cotizaciones Pendientes', value: 12, change: '+3 esta semana', color: 'amber' },
  { id: 'nuevos-clientes', label: 'Nuevos Clientes', value: 5, change: '+2 vs mes anterior', color: 'emerald' },
  { id: 'ingresos-mayo', label: 'Ingresos Mayo', value: '$485,320', change: '+8.5% vs abril', color: 'primary' },
];

export const chartData = [
  { month: 'Dic', cotizadas: 32, aceptadas: 24 },
  { month: 'Ene', cotizadas: 28, aceptadas: 19 },
  { month: 'Feb', cotizadas: 35, aceptadas: 27 },
  { month: 'Mar', cotizadas: 41, aceptadas: 30 },
  { month: 'Abr', cotizadas: 38, aceptadas: 33 },
  { month: 'May', cotizadas: 45, aceptadas: 36 },
];

export const projectsNearDeadline = [
  { id: 'OT-2024-151', client: 'Ferretería Central', dueDate: '2026-06-19', status: 'Control de Calidad', daysLeft: 1 },
  { id: 'OT-2024-153', client: 'Construcciones Hernández', dueDate: '2026-06-20', status: 'En Progreso', daysLeft: 2 },
  { id: 'OT-2024-154', client: 'Metalúrgica del Valle', dueDate: '2026-06-22', status: 'En Progreso', daysLeft: 4 },
  { id: 'OT-2024-152', client: 'Industrias Acero S.A.', dueDate: '2026-06-24', status: 'En Progreso', daysLeft: 6 },
  { id: 'OT-2024-156', client: 'Industrias Acero S.A.', dueDate: '2026-06-25', status: 'Pendiente', daysLeft: 7 },
];
