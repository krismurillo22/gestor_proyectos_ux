/**
 * StatusBadge
 * -----------
 * Pastilla de color para mostrar el estado de una cotización, orden de
 * trabajo o nivel de stock. Es puramente visual (no llama servicios).
 *
 * @param {{ status: string, type?: 'quote' | 'stock' | 'order' }} props
 */

const VARIANTS_BY_TYPE = {
  quote: {
    borrador: 'badge-slate',
    draft: 'badge-slate',
    enviada: 'badge-sky',
    sent: 'badge-sky',
    aceptada: 'badge-emerald',
    accepted: 'badge-emerald',
    rechazada: 'badge-red',
    rejected: 'badge-red',
    archivada: 'badge-slate-dark',
    archived: 'badge-slate-dark',
  },
  stock: {
    ok: 'badge-emerald',
    normal: 'badge-emerald',
    bajo: 'badge-amber',
    low: 'badge-amber',
    'crítico': 'badge-red',
    critical: 'badge-red',
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
