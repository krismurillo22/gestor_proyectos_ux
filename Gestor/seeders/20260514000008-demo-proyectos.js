'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Proyectos', [
      {
        id_cotizacion: 1,
        descripcion: 'Remodelación de oficinas – Constructora Hernández',
        fecha_inicio: new Date('2026-01-20'),
        fecha_vencimiento: new Date('2026-03-20'),
        fecha_fin_real: new Date('2026-03-18'),
        estado: 'completado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 2,
        descripcion: 'Sistema eléctrico bodega – Grupo Torres',
        fecha_inicio: new Date('2026-02-03'),
        fecha_vencimiento: new Date('2026-03-03'),
        fecha_fin_real: new Date('2026-03-10'),
        estado: 'completado',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 4,
        descripcion: 'Pintura edificio corporativo – Tecnología Rivera',
        fecha_inicio: new Date('2026-03-01'),
        fecha_vencimiento: new Date('2026-04-01'),
        fecha_fin_real: null,
        estado: 'en_progreso',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cotizacion: 6,
        descripcion: 'Muro perimetral – Inmobiliaria del Norte',
        fecha_inicio: new Date('2026-04-01'),
        fecha_vencimiento: new Date('2026-05-01'),
        fecha_fin_real: null,
        estado: 'vencido',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Proyectos', null, {});
  },
};
