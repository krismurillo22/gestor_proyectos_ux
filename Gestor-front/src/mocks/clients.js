/**
 * Datos mock de clientes (empresas que solicitan cotizaciones).
 * Reemplazar por GET /api/clientes (ver src/services/clientsService.js).
 */
export const clientsData = [
  {
    id: 'CLI-001',
    name: 'Industrias Acero S.A.',
    contact: 'Roberto Salinas',
    email: 'contacto@industriasacero.com',
    phone: '+52 55 1234 5678',
    address: 'Av. Industrial 450, Monterrey, NL',
    totalBilled: 145600.0,
    activeProjects: 3,
    totalQuotes: 12,
    since: '2022-03-15',
  },
  {
    id: 'CLI-002',
    name: 'Metalúrgica del Valle',
    contact: 'Patricia Gómez',
    email: 'pgomez@metalurgicadelvalle.com',
    phone: '+52 81 2345 6789',
    address: 'Calle Forja 22, Guadalajara, JAL',
    totalBilled: 98300.0,
    activeProjects: 2,
    totalQuotes: 9,
    since: '2023-01-10',
  },
  {
    id: 'CLI-003',
    name: 'Construcciones Hernández',
    contact: 'Miguel Hernández',
    email: 'miguel@construccioneshernandez.com',
    phone: '+52 33 3456 7890',
    address: 'Blvd. de los Constructores 88, CDMX',
    totalBilled: 210750.0,
    activeProjects: 1,
    totalQuotes: 7,
    since: '2021-09-05',
  },
];

/**
 * Historial de proyectos mostrado en el perfil de un cliente.
 * NOTA: en el diseño original esto es estático (no filtra por cliente);
 * cuando exista el endpoint real debería filtrarse por clientId.
 */
export const projectHistory = [
  { id: 'OT-2024-150', description: 'Ensamble de estructuras metálicas', date: '2026-06-15', total: 6300.0 },
  { id: 'OT-2024-149', description: 'Fabricación de tornillería especial', date: '2026-06-12', total: 11200.0 },
];
