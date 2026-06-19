/**
 * Datos mock de cotizaciones. Reemplazar por la respuesta real de
 * GET /api/cotizaciones cuando el backend esté conectado (ver
 * src/services/quotesService.js).
 *
 * Cada cotización pertenece a UNA solicitud (requestId, ver mocks/requests.js)
 * y a UN taller/proveedor (supplierId, ver mocks/suppliers.js) — así se puede
 * recibir más de una cotización por solicitud y compararlas antes de elegir
 * cuál se manda al cliente. Esto refleja 1:1 el modelo del backend
 * (Cotizacion belongsTo Solicitud + belongsTo Proveedor).
 *
 * Campos:
 * - estado: 'pendiente' | 'aprobada' | 'rechazada' — coincide con el ENUM
 *   real del backend y con las rutas PUT /cotizaciones/:id/aprobar|rechazar.
 *   Representa la respuesta del CLIENTE sobre la cotización que se le envió.
 * - sentToClient: (solo front, no existe en el backend todavía) true cuando
 *   el equipo ya eligió esta cotización como "la más atractiva" de la
 *   solicitud y se la mandó al cliente. Mientras sea false, es solo una
 *   cotización interna en comparación con las de otros talleres.
 * - discarded: (solo front) true si el equipo decidió no usar esta
 *   cotización (p. ej. perdió la comparación contra otro taller).
 */
export const quotesData = [
  // ---- SOL-2024-041: dos talleres cotizando el mismo trabajo (aún sin enviar al cliente) ----
  {
    id: 'COT-2024-089',
    requestId: 'SOL-2024-041',
    supplierId: 'PRV-001',
    supplier: 'Talleres Unidos S.R.L.',
    date: '2026-05-28',
    total: 12450.0,
    estado: 'pendiente',
    sentToClient: false,
    discarded: false,
    items: [
      { description: 'Soporte metálico reforzado', quantity: 50, unitPrice: 180.0 },
      { description: 'Placa base de acero inoxidable', quantity: 20, unitPrice: 95.0 },
      { description: 'Tornillería especial M10', quantity: 200, unitPrice: 4.25 },
    ],
    notes: 'Cliente solicita entrega en dos lotes.',
  },
  {
    id: 'COT-2024-089B',
    requestId: 'SOL-2024-041',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    date: '2026-05-29',
    total: 13800.0,
    estado: 'pendiente',
    sentToClient: false,
    discarded: false,
    items: [
      { description: 'Soporte metálico reforzado', quantity: 50, unitPrice: 195.0 },
      { description: 'Placa base de acero inoxidable', quantity: 20, unitPrice: 110.0 },
      { description: 'Tornillería especial M10', quantity: 200, unitPrice: 4.0 },
    ],
    notes: 'Incluye recubrimiento anticorrosivo de fábrica.',
  },

  // ---- SOL-2024-040: ya se eligió taller y se mandó al cliente, esperando respuesta ----
  {
    id: 'COT-2024-088',
    requestId: 'SOL-2024-040',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    date: '2026-05-25',
    total: 8200.0,
    estado: 'pendiente',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Lámina de acero calibre 14', quantity: 30, unitPrice: 210.0 },
      { description: 'Corte y doblado por unidad', quantity: 30, unitPrice: 60.0 },
    ],
    notes: '',
  },

  // ---- SOL-2024-039: cliente aceptó -> ya tiene orden de trabajo en curso ----
  {
    id: 'COT-2024-087',
    requestId: 'SOL-2024-039',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    date: '2026-05-22',
    total: 15780.0,
    estado: 'aprobada',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Estructura metálica modular', quantity: 4, unitPrice: 2800.0 },
      { description: 'Soldadura estructural', quantity: 4, unitPrice: 450.0 },
      { description: 'Pintura anticorrosiva', quantity: 4, unitPrice: 180.0 },
      { description: 'Transporte e instalación', quantity: 1, unitPrice: 1100.0 },
    ],
    notes: 'Incluye instalación en sitio.',
  },

  // ---- SOL-2024-038: cliente aceptó -> ya tiene orden de trabajo en curso ----
  {
    id: 'COT-2024-086',
    requestId: 'SOL-2024-038',
    supplierId: 'PRV-001',
    supplier: 'Talleres Unidos S.R.L.',
    date: '2026-05-18',
    total: 6300.0,
    estado: 'aprobada',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Mecanizado de piezas de aluminio', quantity: 60, unitPrice: 95.0 },
      { description: 'Acabado anodizado', quantity: 60, unitPrice: 10.0 },
    ],
    notes: '',
  },

  // ---- SOL-2024-037: cliente aceptó -> ya tiene orden de trabajo en curso ----
  {
    id: 'COT-2024-085',
    requestId: 'SOL-2024-037',
    supplierId: 'PRV-003',
    supplier: 'Soldaduras y Acabados Méndez',
    date: '2026-05-15',
    total: 22100.0,
    estado: 'aprobada',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Bisagra industrial reforzada', quantity: 150, unitPrice: 65.0 },
      { description: 'Tratamiento térmico', quantity: 150, unitPrice: 28.0 },
      { description: 'Empaque y embalaje', quantity: 150, unitPrice: 4.0 },
      { description: 'Inspección de calidad', quantity: 1, unitPrice: 1300.0 },
      { description: 'Transporte', quantity: 1, unitPrice: 900.0 },
    ],
    notes: 'Pedido recurrente trimestral.',
  },

  // ---- SOL-2024-036: cliente aceptó -> orden ya completada y entregada ----
  {
    id: 'COT-2024-084',
    requestId: 'SOL-2024-036',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    date: '2026-05-10',
    total: 4950.0,
    estado: 'aprobada',
    sentToClient: true,
    discarded: false,
    items: [{ description: 'Pulido y acabado de piezas (lote)', quantity: 1, unitPrice: 4950.0 }],
    notes: '',
  },

  // ---- SOL-2024-035: cliente rechazó por presupuesto ----
  {
    id: 'COT-2024-083',
    requestId: 'SOL-2024-035',
    supplierId: 'PRV-001',
    supplier: 'Talleres Unidos S.R.L.',
    date: '2026-05-05',
    total: 9870.0,
    estado: 'rechazada',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Viga de acero estructural', quantity: 12, unitPrice: 650.0 },
      { description: 'Placas de unión', quantity: 24, unitPrice: 65.0 },
      { description: 'Soldadura y montaje', quantity: 1, unitPrice: 1290.0 },
    ],
    notes: 'Cliente rechazó por presupuesto.',
  },

  // ---- SOL-2024-034: cliente aceptó -> orden ya completada y entregada ----
  {
    id: 'COT-2024-082',
    requestId: 'SOL-2024-034',
    supplierId: 'PRV-002',
    supplier: 'Taller Mecánico Ramírez',
    date: '2026-04-29',
    total: 11200.0,
    estado: 'aprobada',
    sentToClient: true,
    discarded: false,
    items: [
      { description: 'Tubería industrial de acero', quantity: 40, unitPrice: 220.0 },
      { description: 'Codos y conexiones', quantity: 60, unitPrice: 42.0 },
    ],
    notes: '',
  },
];
