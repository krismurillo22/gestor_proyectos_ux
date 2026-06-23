/**
 * Datos mock de proveedores / talleres (a quienes se les asignan órdenes
 * de trabajo). Reemplazar por GET /api/proveedores
 * (ver src/services/suppliersService.js).
 */
export const suppliersData = [
  {
    id: 'PRV-001',
    name: 'Talleres Unidos S.R.L.',
    rtn: '0801-1995-111222',
    contact: 'Ana Torres',
    email: 'ana.torres@talleresunidos.com',
    phone: '+52 55 4567 8901',
    address: 'Zona Industrial Norte 12, Monterrey, NL',
    totalPurchased: 87400.0,
    activeOrders: 2,
    since: '2022-06-20',
  },
  {
    id: 'PRV-002',
    name: 'Taller Mecánico Ramírez',
    rtn: '0801-1988-333444',
    contact: 'Luis Ramírez',
    email: 'luis@tallerramirez.com',
    phone: '+52 81 5678 9012',
    address: 'Calle del Torno 5, Guadalajara, JAL',
    totalPurchased: 63200.0,
    activeOrders: 2,
    since: '2023-02-14',
  },
  {
    id: 'PRV-003',
    name: 'Soldaduras y Acabados Méndez',
    rtn: '0801-1992-555666',
    contact: 'Carlos Méndez',
    email: 'carlos@soldadurasmendez.com',
    phone: '+52 33 6789 0123',
    address: 'Av. del Metal 99, Puebla, PUE',
    totalPurchased: 112900.0,
    activeOrders: 3,
    since: '2021-11-30',
  },
];
