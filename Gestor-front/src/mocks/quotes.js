/**
 * Datos mock de cotizaciones. Reemplazar por la respuesta real de
 * GET /api/cotizaciones cuando el backend esté conectado (ver
 * src/services/quotesService.js).
 */
export const quotesData = [
  {
    id: 'COT-2024-089',
    client: 'Industrias Acero S.A.',
    date: '2026-05-28',
    total: 12450.0,
    status: 'Borrador',
    items: [
      { description: 'Soporte metálico reforzado', quantity: 50, unitPrice: 180.0 },
      { description: 'Placa base de acero inoxidable', quantity: 20, unitPrice: 95.0 },
      { description: 'Tornillería especial M10', quantity: 200, unitPrice: 4.25 },
    ],
    notes: 'Cliente solicita entrega en dos lotes.',
  },
  {
    id: 'COT-2024-088',
    client: 'Metalúrgica del Valle',
    date: '2026-05-25',
    total: 8200.0,
    status: 'Enviada',
    items: [
      { description: 'Lámina de acero calibre 14', quantity: 30, unitPrice: 210.0 },
      { description: 'Corte y doblado por unidad', quantity: 30, unitPrice: 60.0 },
    ],
    notes: '',
  },
  {
    id: 'COT-2024-087',
    client: 'Construcciones Hernández',
    date: '2026-05-22',
    total: 15780.0,
    status: 'Enviada',
    items: [
      { description: 'Estructura metálica modular', quantity: 4, unitPrice: 2800.0 },
      { description: 'Soldadura estructural', quantity: 4, unitPrice: 450.0 },
      { description: 'Pintura anticorrosiva', quantity: 4, unitPrice: 180.0 },
      { description: 'Transporte e instalación', quantity: 1, unitPrice: 1100.0 },
    ],
    notes: 'Incluye instalación en sitio.',
  },
  {
    id: 'COT-2024-086',
    client: 'Talleres Unidos S.R.L.',
    date: '2026-05-18',
    total: 6300.0,
    status: 'Aceptada',
    items: [
      { description: 'Mecanizado de piezas de aluminio', quantity: 60, unitPrice: 95.0 },
      { description: 'Acabado anodizado', quantity: 60, unitPrice: 10.0 },
    ],
    notes: '',
  },
  {
    id: 'COT-2024-085',
    client: 'Industrias Acero S.A.',
    date: '2026-05-15',
    total: 22100.0,
    status: 'Aceptada',
    items: [
      { description: 'Bisagra industrial reforzada', quantity: 150, unitPrice: 65.0 },
      { description: 'Tratamiento térmico', quantity: 150, unitPrice: 28.0 },
      { description: 'Empaque y embalaje', quantity: 150, unitPrice: 4.0 },
      { description: 'Inspección de calidad', quantity: 1, unitPrice: 1300.0 },
      { description: 'Transporte', quantity: 1, unitPrice: 900.0 },
    ],
    notes: 'Pedido recurrente trimestral.',
  },
  {
    id: 'COT-2024-084',
    client: 'Ferretería Central',
    date: '2026-05-10',
    total: 4950.0,
    status: 'Aceptada',
    items: [{ description: 'Pulido y acabado de piezas (lote)', quantity: 1, unitPrice: 4950.0 }],
    notes: '',
  },
  {
    id: 'COT-2024-083',
    client: 'Construcciones Hernández',
    date: '2026-05-05',
    total: 9870.0,
    status: 'Rechazada',
    items: [
      { description: 'Viga de acero estructural', quantity: 12, unitPrice: 650.0 },
      { description: 'Placas de unión', quantity: 24, unitPrice: 65.0 },
      { description: 'Soldadura y montaje', quantity: 1, unitPrice: 1290.0 },
    ],
    notes: 'Cliente rechazó por presupuesto.',
  },
  {
    id: 'COT-2024-082',
    client: 'Metalúrgica del Valle',
    date: '2026-04-29',
    total: 11200.0,
    status: 'Archivada',
    items: [
      { description: 'Tubería industrial de acero', quantity: 40, unitPrice: 220.0 },
      { description: 'Codos y conexiones', quantity: 60, unitPrice: 42.0 },
    ],
    notes: 'Proyecto pospuesto por el cliente.',
  },
];
