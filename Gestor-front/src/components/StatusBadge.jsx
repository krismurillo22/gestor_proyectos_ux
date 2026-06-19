/**
 * StatusBadge
 * -----------
 * Pastilla de color para mostrar el estado de una solicitud, cotización u
 * orden de trabajo. Es puramente visual (no llama servicios).
 *
 * @param {{ status: string, type?: 'request' | 'quote' | 'order' }} props
 */

const VARIANTS_BY_TYPE = {
  // Estado derivado de una Solicitud (ver services/requestsService.js)
  request: {
    cotizando: 'badge-slate',
    'enviada al cliente': 'badge-sky',
    aprobada: 'badge-emerald',
    rechazada: 'badge-red',
  },
  // Estado de una Cotización individual. 'pendiente' coincide con el ENUM
  // del backend; 'enviada al cliente' y 'descartada' son lectura del front
  // sobre las banderas sentToClient/discarded (ver mocks/quotes.js).
  quote: {
    pendiente: 'badge-slate',
    'enviada al cliente': 'badge-sky',
    aprobada: 'badge-emerald',
    rechazada: 'badge-red',
    descartada: 'badge-slate-dark',
  },
  order: {
    pendiente: 'badge-slate',
    pending: 'badge-slate',
    'en progreso': 'badge-sky',
    'in progress': 'badge-sky',
    'control de calidad': 'badge-amber',
    'quality check': 'badge-amber',
    completada: 'badge-emerald',
    completed: 'badge-emerald',
  },
};

export default function StatusBadge({ status, type = 'quote' }) {
  const variant = VARIANTS_BY_TYPE[type]?.[status?.toLowerCase()] || 'badge-slate';
  return <span className={`badge ${variant}`}>{status}</span>;
}
