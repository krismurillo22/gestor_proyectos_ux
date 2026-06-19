/**
 * Datos mock de solicitudes (la petición inicial de un cliente, antes de
 * cotizar con los talleres). Reemplazar por GET /api/solicitudes cuando
 * el backend esté conectado (ver src/services/requestsService.js).
 *
 * Una solicitud puede tener varias cotizaciones (una por taller, ver
 * mocks/quotes.js -> requestId). El estado visible en la UI (Cotizando /
 * Enviada al cliente / Aprobada / Rechazada) NO se guarda aquí: se deriva
 * en services/requestsService.js a partir de las cotizaciones asociadas,
 * para que nunca queden desincronizados.
 */
export const requestsData = [
  {
    id: 'SOL-2024-041',
    clientId: 'CLI-001',
    client: 'Industrias Acero S.A.',
    description: 'Fabricación de 50 soportes metálicos reforzados',
    date: '2026-05-28',
    activo: true,
  },
  {
    id: 'SOL-2024-040',
    clientId: 'CLI-002',
    client: 'Metalúrgica del Valle',
    description: 'Corte y doblado de láminas de acero calibre 14',
    date: '2026-05-25',
    activo: true,
  },
  {
    id: 'SOL-2024-039',
    clientId: 'CLI-003',
    client: 'Construcciones Hernández',
    description: 'Fabricación de estructura metálica modular con instalación en sitio',
    date: '2026-05-22',
    activo: true,
  },
  {
    id: 'SOL-2024-038',
    clientId: 'CLI-001',
    client: 'Industrias Acero S.A.',
    description: 'Mecanizado de piezas de aluminio para ensamble',
    date: '2026-05-18',
    activo: true,
  },
  {
    id: 'SOL-2024-037',
    clientId: 'CLI-001',
    client: 'Industrias Acero S.A.',
    description: 'Fabricación de bisagras industriales con tratamiento térmico',
    date: '2026-05-15',
    activo: true,
  },
  {
    id: 'SOL-2024-036',
    clientId: 'CLI-004',
    client: 'Ferretería Central',
    description: 'Pulido y acabado de piezas (lote)',
    date: '2026-05-10',
    activo: true,
  },
  {
    id: 'SOL-2024-035',
    clientId: 'CLI-003',
    client: 'Construcciones Hernández',
    description: 'Fabricación de viga de acero estructural con montaje',
    date: '2026-05-05',
    activo: true,
  },
  {
    id: 'SOL-2024-034',
    clientId: 'CLI-002',
    client: 'Metalúrgica del Valle',
    description: 'Tubería industrial de acero con conexiones',
    date: '2026-04-29',
    activo: true,
  },
];
