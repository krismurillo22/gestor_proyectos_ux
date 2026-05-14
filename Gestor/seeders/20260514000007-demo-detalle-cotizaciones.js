'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('DetalleCotizaciones', [
      {
        id_cotizacion: 1,
        nombre: 'Mano de obra general',
        valor: 25000.00,
        cantidad: 1,
        descripcion: 'Cuadrilla de 5 trabajadores por 30 días',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 1,
        nombre: 'Cerámica para piso',
        valor: 450.00,
        cantidad: 120,
        descripcion: 'Cerámica importada 60x60cm',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 2,
        nombre: 'Tablero eléctrico trifásico',
        valor: 8500.00,
        cantidad: 1,
        descripcion: 'Tablero de 24 circuitos con breakers incluidos',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 2,
        nombre: 'Cable calibre 12',
        valor: 85.00,
        cantidad: 150,
        descripcion: 'Metros de cable THHN calibre 12',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 4,
        nombre: 'Pintura epóxica exterior',
        valor: 1200.00,
        cantidad: 8,
        descripcion: 'Galones de pintura epóxica blanca',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 4,
        nombre: 'Mano de obra pintura',
        valor: 5500.00,
        cantidad: 1,
        descripcion: 'Servicio completo de pintura interior y exterior',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DetalleCotizaciones', null, {});
  },
};
