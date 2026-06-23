/**
 * Datos mock de órdenes de trabajo. Reemplazar por la respuesta real de
 * GET /api/ordenes-trabajo (ver src/services/workOrdersService.js).
 *
 * Cada orden nace de una cotización APROBADA (quoteId) y el taller que la
 * ejecuta (supplierId/supplier) es siempre el proveedor de esa cotización —
 * no se elige a mano, porque ya se decidió al aceptar la cotización.
 *
 * `evaluation` representa el control de calidad final (equivale a la
 * entidad Evaluacion del backend: rating 1-5 + observaciones). Se llena
 * cuando la orden se entrega al cliente; mientras tanto queda en null.
 */
export const workOrders = [
  {
    id: 'OT-2024-156',
    quoteId: 'COT-2024-085',
    client: 'Industrias Acero S.A.',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    description: 'Fabricación de 50 soportes metálicos reforzados',
    dueDate: '2026-06-25',
    status: 'Pendiente',
    statusHistory: [{ status: 'Pendiente', date: '2026-06-15', note: 'Orden creada' }],
    evaluation: null,
  },
  {
    id: 'OT-2024-155',
    quoteId: 'COT-2024-086',
    client: 'Industrias Acero S.A.',
    supplierId: 'PRV-001',
    supplier: 'Talleres Unidos S.R.L.',
    description: 'Mecanizado de piezas de aluminio',
    dueDate: '2026-06-28',
    status: 'Pendiente',
    statusHistory: [{ status: 'Pendiente', date: '2026-06-16', note: 'Orden creada' }],
    evaluation: null,
  },
  {
    id: 'OT-2024-154',
    quoteId: 'COT-2024-082',
    client: 'Metalúrgica del Valle',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    description: 'Corte y doblado de láminas de acero',
    dueDate: '2026-06-22',
    status: 'En Progreso',
    statusHistory: [
      { status: 'Pendiente', date: '2026-06-10', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-06-14', note: 'Inicio de corte' },
    ],
    evaluation: null,
  },
  {
    id: 'OT-2024-153',
    quoteId: 'COT-2024-087',
    client: 'Construcciones Hernández',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    description: 'Soldadura de estructura metálica modular',
    dueDate: '2026-06-20',
    status: 'En Progreso',
    statusHistory: [
      { status: 'Pendiente', date: '2026-06-08', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-06-12', note: 'Inicio de soldadura' },
    ],
    evaluation: null,
  },
  {
    id: 'OT-2024-152',
    quoteId: 'COT-2024-085',
    client: 'Industrias Acero S.A.',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    description: 'Fabricación de bisagras industriales',
    dueDate: '2026-06-24',
    status: 'En Progreso',
    statusHistory: [
      { status: 'Pendiente', date: '2026-06-11', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-06-15', note: 'Inicio de fabricación' },
    ],
    evaluation: null,
  },
  {
    id: 'OT-2024-151',
    quoteId: 'COT-2024-084',
    client: 'Ferretería Central',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    description: 'Pulido y acabado de piezas',
    dueDate: '2026-06-19',
    status: 'Control de Calidad',
    statusHistory: [
      { status: 'Pendiente', date: '2026-06-05', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-06-09', note: 'Inicio de pulido' },
      { status: 'Control de Calidad', date: '2026-06-17', note: 'Pasa a inspección final' },
    ],
    evaluation: null,
  },
  {
    id: 'OT-2024-150',
    quoteId: 'COT-2024-086',
    client: 'Industrias Acero S.A.',
    supplierId: 'PRV-001',
    supplier: 'Talleres Unidos S.R.L.',
    description: 'Ensamble de estructuras metálicas',
    dueDate: '2026-06-15',
    status: 'Completada',
    statusHistory: [
      { status: 'Pendiente', date: '2026-05-28', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-06-02', note: 'Inicio de ensamble' },
      { status: 'Control de Calidad', date: '2026-06-10', note: 'Inspección final' },
      { status: 'Completada', date: '2026-06-15', note: 'Entregado al cliente' },
    ],
    evaluation: { rating: 5, notes: 'Excelente acabado, cumplió tolerancias y fecha de entrega.', date: '2026-06-15' },
  },
  {
    id: 'OT-2024-149',
    quoteId: 'COT-2024-082',
    client: 'Metalúrgica del Valle',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    description: 'Fabricación de tornillería especial',
    dueDate: '2026-06-12',
    status: 'Completada',
    statusHistory: [
      { status: 'Pendiente', date: '2026-05-25', note: 'Orden creada' },
      { status: 'En Progreso', date: '2026-05-29', note: 'Inicio de fabricación' },
      { status: 'Control de Calidad', date: '2026-06-08', note: 'Inspección final' },
      { status: 'Completada', date: '2026-06-12', note: 'Entregado al cliente' },
    ],
    evaluation: { rating: 4, notes: 'Buen trabajo, hubo un pequeño retraso en la entrega del lote.', date: '2026-06-12' },
  },
];

export const WORK_ORDER_COLUMNS = [
  { status: 'Pendiente', color: '#64748B' },
  { status: 'En Progreso', color: '#3B82F6' },
  { status: 'Control de Calidad', color: '#F59E0B' },
  { status: 'Completada', color: '#10B981' },
];
