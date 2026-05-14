'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Cotizaciones', [
      {
        id_solicitud: 1,
        id_proveedor: 1,
        total: 85000.00,
        estado: 'aprobada',
        descripcion: 'Incluye mano de obra, materiales y acabados de primera calidad',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_solicitud: 2,
        id_proveedor: 4,
        total: 32500.00,
        estado: 'aprobada',
        descripcion: 'Sistema eléctrico trifásico con tablero de distribución',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_solicitud: 3,
        id_proveedor: 6,
        total: 47200.00,
        estado: 'pendiente',
        descripcion: 'Mobiliario en madera sólida con tapizado de cuero',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_solicitud: 4,
        id_proveedor: 3,
        total: 18900.00,
        estado: 'aprobada',
        descripcion: 'Pintura epóxica en exteriores, látex en interiores',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_solicitud: 5,
        id_proveedor: 5,
        total: 9800.00,
        estado: 'rechazada',
        descripcion: 'Reparación de tuberías con cambio de llaves y válvulas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_solicitud: 6,
        id_proveedor: 1,
        total: 124000.00,
        estado: 'pendiente',
        descripcion: 'Muro de bloque repellado con portón metálico automático',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cotizaciones', null, {});
  },
};
